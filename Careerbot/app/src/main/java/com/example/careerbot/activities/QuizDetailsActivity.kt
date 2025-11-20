package com.example.careerbot.activities

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.careerbot.R
import com.example.careerbot.databinding.ActivityQuizDetailsBinding
import com.example.careerbot.models.QuizAttempt
import com.example.careerbot.models.QuizQuestion
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.utils.BackendHelper
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class QuizDetailsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityQuizDetailsBinding
    private val dateFormat = SimpleDateFormat("MMM dd, yyyy 'at' hh:mm a", Locale.getDefault())

    companion object {
        private const val TAG = "QuizDetailsActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQuizDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        BackendHelper.init(this)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Quiz Details"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }

        val attemptId = intent.getStringExtra("attemptId")
        if (attemptId.isNullOrBlank()) {
            Toast.makeText(this, "Invalid quiz attempt", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadQuizDetails(attemptId)
    }

    private fun loadQuizDetails(attemptId: String) {
        if (!BackendHelper.isLoggedIn()) {
            Toast.makeText(this, "Please log in", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        binding.progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                val token = "Bearer ${BackendHelper.getToken()}"
                val response = BackendApiClient.backendService.getQuizAttempt(token, attemptId)

                if (response.isSuccessful && response.body()?.success == true) {
                    val attempt = response.body()?.data
                    if (attempt != null) {
                        displayQuizDetails(attempt)
                    } else {
                        showError("Quiz attempt not found")
                    }
                } else {
                    Log.e(TAG, "Failed to load quiz details: ${response.message()}")
                    showError("Failed to load quiz details")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error loading quiz details", e)
                showError("Error: ${e.message}")
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun displayQuizDetails(attempt: QuizAttempt) {
        // Display summary
        binding.tvTopic.text = attempt.topic
        binding.tvScore.text = "${attempt.score}%"
        binding.tvCorrect.text = "${attempt.correctAnswers}/${attempt.totalQuestions}"
        
        val minutes = attempt.timeTaken / 60
        val seconds = attempt.timeTaken % 60
        binding.tvTime.text = if (minutes > 0) "${minutes}m ${seconds}s" else "${seconds}s"

        try {
            val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.parse(attempt.completedAt)
            binding.tvDate.text = date?.let { dateFormat.format(it) } ?: attempt.completedAt
        } catch (e: Exception) {
            binding.tvDate.text = attempt.completedAt
        }

        // Color code score
        val scoreColor = when {
            attempt.score >= 80 -> Color.parseColor("#4CAF50")
            attempt.score >= 60 -> Color.parseColor("#FF9800")
            else -> Color.parseColor("#F44336")
        }
        binding.tvScore.setTextColor(scoreColor)

        // Display questions
        displayQuestions(attempt.questions)
    }

    private fun displayQuestions(questions: List<QuizQuestion>) {
        binding.llQuestions.removeAllViews()

        questions.forEachIndexed { index, question ->
            val questionCard = createQuestionCard(index + 1, question)
            binding.llQuestions.addView(questionCard)
            
            // Add margin
            val layoutParams = questionCard.layoutParams as LinearLayout.LayoutParams
            layoutParams.bottomMargin = 24
            questionCard.layoutParams = layoutParams
        }
    }

    private fun createQuestionCard(questionNumber: Int, question: QuizQuestion): MaterialCardView {
        val card = MaterialCardView(this)
        card.radius = 48f
        card.cardElevation = 12f
        card.setCardBackgroundColor(Color.WHITE)

        val padding = (16 * resources.displayMetrics.density).toInt()
        
        val contentLayout = LinearLayout(this)
        contentLayout.orientation = LinearLayout.VERTICAL
        contentLayout.setPadding(padding, padding, padding, padding)

        // Question text
        val questionText = TextView(this)
        questionText.text = "Q$questionNumber: ${question.question}"
        questionText.textSize = 18f
        questionText.setTextColor(Color.parseColor("#1E1E1E"))
        questionText.setTypeface(null, android.graphics.Typeface.BOLD)
        contentLayout.addView(questionText)

        // Spacing
        val spacer1 = View(this)
        spacer1.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            (16 * resources.displayMetrics.density).toInt()
        )
        contentLayout.addView(spacer1)

        // Options
        question.options.forEachIndexed { optionIndex, option ->
            val optionLayout = createOptionView(optionIndex, option, question)
            contentLayout.addView(optionLayout)
            
            val spacer = View(this)
            spacer.layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                (8 * resources.displayMetrics.density).toInt()
            )
            contentLayout.addView(spacer)
        }

        // Explanation
        val spacer2 = View(this)
        spacer2.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            (8 * resources.displayMetrics.density).toInt()
        )
        contentLayout.addView(spacer2)

        val explanationCard = MaterialCardView(this)
        explanationCard.radius = 12f
        explanationCard.setCardBackgroundColor(Color.parseColor("#F5F5F5"))
        explanationCard.cardElevation = 0f

        val explanationLayout = LinearLayout(this)
        explanationLayout.orientation = LinearLayout.VERTICAL
        val explPadding = (12 * resources.displayMetrics.density).toInt()
        explanationLayout.setPadding(explPadding, explPadding, explPadding, explPadding)

        val explanationLabel = TextView(this)
        explanationLabel.text = "💡 Explanation"
        explanationLabel.textSize = 14f
        explanationLabel.setTextColor(Color.parseColor("#6750A4"))
        explanationLabel.setTypeface(null, android.graphics.Typeface.BOLD)
        explanationLayout.addView(explanationLabel)

        val explanationText = TextView(this)
        explanationText.text = question.explanation
        explanationText.textSize = 14f
        explanationText.setTextColor(Color.parseColor("#424242"))
        val explMargin = (4 * resources.displayMetrics.density).toInt()
        val explParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        explParams.topMargin = explMargin
        explanationText.layoutParams = explParams
        explanationLayout.addView(explanationText)

        explanationCard.addView(explanationLayout)
        contentLayout.addView(explanationCard)

        card.addView(contentLayout)
        return card
    }

    private fun createOptionView(optionIndex: Int, option: String, question: QuizQuestion): LinearLayout {
        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.HORIZONTAL
        
        val padding = (12 * resources.displayMetrics.density).toInt()
        layout.setPadding(padding, padding, padding, padding)
        
        // Determine background and icon based on correctness
        val isCorrect = optionIndex == question.correctAnswer
        val isUserAnswer = optionIndex == question.userAnswer
        
        when {
            isCorrect -> {
                layout.setBackgroundColor(Color.parseColor("#E8F5E9"))
                layout.background.alpha = 180
            }
            isUserAnswer && !isCorrect -> {
                layout.setBackgroundColor(Color.parseColor("#FFEBEE"))
                layout.background.alpha = 180
            }
            else -> {
                layout.setBackgroundColor(Color.TRANSPARENT)
            }
        }

        // Icon
        val icon = TextView(this)
        icon.textSize = 20f
        icon.text = when {
            isCorrect -> "✓"
            isUserAnswer && !isCorrect -> "✗"
            else -> "○"
        }
        icon.setTextColor(when {
            isCorrect -> Color.parseColor("#4CAF50")
            isUserAnswer && !isCorrect -> Color.parseColor("#F44336")
            else -> Color.parseColor("#9E9E9E")
        })
        icon.layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        layout.addView(icon)

        // Option text
        val optionText = TextView(this)
        optionText.text = option
        optionText.textSize = 16f
        optionText.setTextColor(Color.parseColor("#1E1E1E"))
        val textParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
        textParams.leftMargin = (12 * resources.displayMetrics.density).toInt()
        optionText.layoutParams = textParams
        layout.addView(optionText)

        return layout
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        finish()
    }
}
