package com.example.careerbot.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.careerbot.R
import com.example.careerbot.databinding.ActivityQuizHistoryBinding
import com.example.careerbot.models.QuizAttempt
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.utils.BackendHelper
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class QuizHistoryActivity : AppCompatActivity() {
    private lateinit var binding: ActivityQuizHistoryBinding
    private val quizAttempts = mutableListOf<QuizAttempt>()
    private lateinit var adapter: QuizHistoryAdapter

    companion object {
        private const val TAG = "QuizHistoryActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQuizHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        BackendHelper.init(this)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Quiz History"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }

        setupRecyclerView()
        loadQuizHistory()
    }

    private fun setupRecyclerView() {
        adapter = QuizHistoryAdapter(quizAttempts) { attempt ->
            // Open detail view
            val intent = Intent(this, QuizDetailsActivity::class.java)
            intent.putExtra("attemptId", attempt.id)
            startActivity(intent)
        }
        binding.rvQuizHistory.layoutManager = LinearLayoutManager(this)
        binding.rvQuizHistory.adapter = adapter
    }

    private fun loadQuizHistory() {
        if (!BackendHelper.isLoggedIn()) {
            Toast.makeText(this, "Please log in to view history", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.tvEmptyState.visibility = View.GONE
        binding.rvQuizHistory.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val token = "Bearer ${BackendHelper.getToken()}"
                
                // Load quiz attempts
                val attemptsResponse = BackendApiClient.backendService.getQuizAttempts(token)
                
                if (attemptsResponse.isSuccessful && attemptsResponse.body()?.success == true) {
                    val attempts = attemptsResponse.body()?.data ?: emptyList()
                    
                    if (attempts.isEmpty()) {
                        showEmptyState()
                    } else {
                        quizAttempts.clear()
                        quizAttempts.addAll(attempts)
                        adapter.notifyDataSetChanged()
                        
                        binding.rvQuizHistory.visibility = View.VISIBLE
                        binding.progressBar.visibility = View.GONE
                        
                        // Load statistics
                        loadStatistics()
                    }
                } else {
                    Log.e(TAG, "Failed to load quiz history: ${attemptsResponse.message()}")
                    showError("Failed to load quiz history")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Error loading quiz history", e)
                showError("Error: ${e.message}")
            }
        }
    }

    private fun loadStatistics() {
        lifecycleScope.launch {
            try {
                val token = "Bearer ${BackendHelper.getToken()}"
                val statsResponse = BackendApiClient.backendService.getQuizStatistics(token)
                
                if (statsResponse.isSuccessful && statsResponse.body()?.success == true) {
                    val stats = statsResponse.body()?.data
                    stats?.let {
                        binding.tvTotalAttempts.text = it.totalAttempts.toString()
                        binding.tvAverageScore.text = "${it.averageScore}%"
                        binding.tvTotalQuestions.text = it.totalQuestionsAnswered.toString()
                        
                        binding.llStatistics.visibility = View.VISIBLE
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error loading statistics", e)
                // Don't show error for stats, just hide the section
                binding.llStatistics.visibility = View.GONE
            }
        }
    }

    private fun showEmptyState() {
        binding.progressBar.visibility = View.GONE
        binding.rvQuizHistory.visibility = View.GONE
        binding.tvEmptyState.visibility = View.VISIBLE
        binding.llStatistics.visibility = View.GONE
    }

    private fun showError(message: String) {
        binding.progressBar.visibility = View.GONE
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}

class QuizHistoryAdapter(
    private val attempts: List<QuizAttempt>,
    private val onItemClick: (QuizAttempt) -> Unit
) : RecyclerView.Adapter<QuizHistoryAdapter.ViewHolder>() {

    private val dateFormat = SimpleDateFormat("MMM dd, yyyy 'at' hh:mm a", Locale.getDefault())

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val card: MaterialCardView = view.findViewById(R.id.cardQuizAttempt)
        val tvTopic: TextView = view.findViewById(R.id.tvTopic)
        val tvScore: TextView = view.findViewById(R.id.tvScore)
        val tvResults: TextView = view.findViewById(R.id.tvResults)
        val tvDate: TextView = view.findViewById(R.id.tvDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_quiz_attempt, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val attempt = attempts[position]
        
        holder.tvTopic.text = attempt.topic
        holder.tvScore.text = "${attempt.score}%"
        holder.tvResults.text = "${attempt.correctAnswers}/${attempt.totalQuestions} correct"
        
        try {
            val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.parse(attempt.completedAt)
            holder.tvDate.text = date?.let { dateFormat.format(it) } ?: attempt.completedAt
        } catch (e: Exception) {
            holder.tvDate.text = attempt.completedAt
        }
        
        // Color code based on score
        val scoreColor = when {
            attempt.score >= 80 -> android.graphics.Color.parseColor("#4CAF50")
            attempt.score >= 60 -> android.graphics.Color.parseColor("#FF9800")
            else -> android.graphics.Color.parseColor("#F44336")
        }
        holder.tvScore.setTextColor(scoreColor)
        
        holder.card.setOnClickListener {
            onItemClick(attempt)
        }
    }

    override fun getItemCount() = attempts.size
}
