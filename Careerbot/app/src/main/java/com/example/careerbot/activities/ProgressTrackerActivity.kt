package com.example.careerbot.activities

import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Toast
import com.example.careerbot.R
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.preference.PreferenceManager
import com.example.careerbot.adapters.GoalAdapter
import com.example.careerbot.databinding.ActivityProgressTrackerBinding
import com.example.careerbot.models.LearningGoal
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class ProgressTrackerActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProgressTrackerBinding
    private lateinit var adapter: GoalAdapter
    private lateinit var sharedPreferences: SharedPreferences
    private val goalsList = mutableListOf<LearningGoal>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProgressTrackerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Progress Tracker"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }

        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)

        setupRecyclerView()
        loadGoals()

        binding.btnAddGoal.setOnClickListener {
            showAddGoalDialog()
        }

        binding.btnResetAll.setOnClickListener {
            showResetDialog()
        }
    }

    private fun setupRecyclerView() {
        adapter = GoalAdapter(goalsList) { goal ->
            showEditGoalDialog(goal)
        }
        binding.rvGoals.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(this)
        binding.rvGoals.adapter = adapter
    }

    private fun showAddGoalDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_goal, null)
        val etGoal = dialogView.findViewById<android.widget.EditText>(R.id.etGoal)
        val seekBar = dialogView.findViewById<android.widget.SeekBar>(R.id.seekBarProgress)
        val tvProgress = dialogView.findViewById<android.widget.TextView>(R.id.tvProgress)

        seekBar.setOnSeekBarChangeListener(object : android.widget.SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: android.widget.SeekBar?, progress: Int, fromUser: Boolean) {
                tvProgress.text = "$progress%"
            }
            override fun onStartTrackingTouch(seekBar: android.widget.SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: android.widget.SeekBar?) {}
        })

        AlertDialog.Builder(this)
            .setTitle("Add Learning Goal")
            .setView(dialogView)
            .setPositiveButton("Add") { _, _ ->
                val goalText = etGoal.text.toString().trim()
                if (goalText.isNotEmpty()) {
                    val goal = LearningGoal(
                        id = System.currentTimeMillis(),
                        goal = goalText,
                        progress = seekBar.progress
                    )
                    goalsList.add(goal)
                    saveGoals()
                    adapter.notifyItemInserted(goalsList.size - 1)
                } else {
                    Toast.makeText(this, "Please enter a goal", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showEditGoalDialog(goal: LearningGoal) {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_goal, null)
        val etGoal = dialogView.findViewById<android.widget.EditText>(R.id.etGoal)
        val seekBar = dialogView.findViewById<android.widget.SeekBar>(R.id.seekBarProgress)
        val tvProgress = dialogView.findViewById<android.widget.TextView>(R.id.tvProgress)

        etGoal.setText(goal.goal)
        seekBar.progress = goal.progress
        tvProgress.text = "${goal.progress}%"

        seekBar.setOnSeekBarChangeListener(object : android.widget.SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: android.widget.SeekBar?, progress: Int, fromUser: Boolean) {
                tvProgress.text = "$progress%"
            }
            override fun onStartTrackingTouch(seekBar: android.widget.SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: android.widget.SeekBar?) {}
        })

        AlertDialog.Builder(this)
            .setTitle("Edit Goal")
            .setView(dialogView)
            .setPositiveButton("Update") { _, _ ->
                val goalText = etGoal.text.toString().trim()
                if (goalText.isNotEmpty()) {
                    val index = goalsList.indexOfFirst { it.id == goal.id }
                    if (index != -1) {
                        goalsList[index] = goal.copy(goal = goalText, progress = seekBar.progress)
                        saveGoals()
                        adapter.notifyItemChanged(index)
                    }
                }
            }
            .setNegativeButton("Delete") { _, _ ->
                val index = goalsList.indexOfFirst { it.id == goal.id }
                if (index != -1) {
                    goalsList.removeAt(index)
                    saveGoals()
                    adapter.notifyItemRemoved(index)
                }
            }
            .setNeutralButton("Cancel", null)
            .show()
    }

    private fun showResetDialog() {
        AlertDialog.Builder(this)
            .setTitle("Reset All Goals")
            .setMessage("Are you sure you want to delete all goals?")
            .setPositiveButton("Reset") { _, _ ->
                goalsList.clear()
                saveGoals()
                adapter.notifyDataSetChanged()
                Toast.makeText(this, "All goals reset", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun saveGoals() {
        val json = Gson().toJson(goalsList)
        sharedPreferences.edit().putString("learning_goals", json).apply()
    }

    private fun loadGoals() {
        val json = sharedPreferences.getString("learning_goals", null)
        if (json != null) {
            val type = object : TypeToken<List<LearningGoal>>() {}.type
            val loadedGoals: List<LearningGoal> = Gson().fromJson(json, type)
            goalsList.clear()
            goalsList.addAll(loadedGoals)
            adapter.notifyDataSetChanged()
        }
    }
}





