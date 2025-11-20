package com.example.careerbot.activities

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import com.example.careerbot.R
import androidx.appcompat.app.AppCompatActivity
import com.example.careerbot.databinding.ActivityDashboardBinding
import com.google.android.material.bottomnavigation.BottomNavigationView

class DashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDashboardBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        setupBottomNavigation()
        setupQuickAccessCards()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_dashboard, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_settings -> {
                startActivity(Intent(this, SettingsActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_chatbot -> {
                    startActivity(Intent(this, ChatActivity::class.java))
                    true
                }
                R.id.nav_career_tips -> {
                    startActivity(Intent(this, CareerTipsActivity::class.java))
                    true
                }
                R.id.nav_resources -> {
                    startActivity(Intent(this, ResourcesActivity::class.java))
                    true
                }
                R.id.nav_progress -> {
                    startActivity(Intent(this, ProgressTrackerActivity::class.java))
                    true
                }
                R.id.nav_quiz -> {
                    startActivity(Intent(this, QuizActivity::class.java))
                    true
                }

                else -> false
            }
        }
    }

    private fun setupQuickAccessCards() {
        // Chatbot card
        binding.cardChatbot.setOnClickListener {
            startActivity(Intent(this, ChatActivity::class.java))
        }

        // Career Tips card
        binding.cardCareerTips.setOnClickListener {
            startActivity(Intent(this, CareerTipsActivity::class.java))
        }

        // Resources card
        binding.cardResources.setOnClickListener {
            startActivity(Intent(this, ResourcesActivity::class.java))
        }

        // Progress card
        binding.cardProgress.setOnClickListener {
            startActivity(Intent(this, ProgressTrackerActivity::class.java))
        }

        // Quiz card
        binding.cardQuiz.setOnClickListener {
            startActivity(Intent(this, QuizActivity::class.java))
        }
    }
}

