package com.example.careerbot.activities

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.preference.PreferenceManager
import com.example.careerbot.databinding.ActivitySettingsBinding
import com.example.careerbot.utils.BackendHelper

class SettingsActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySettingsBinding
    private lateinit var sharedPreferences: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize BackendHelper
        BackendHelper.init(this)
        
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Settings"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }

        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)

        setupProfileInfo()
        setupThemeSwitch()
        setupLogout()
    }

    private fun setupProfileInfo() {
        if (BackendHelper.isLoggedIn()) {
            val email = BackendHelper.getEmail() ?: "No email"
            binding.tvUserName.setText(email.substringBefore("@"))
            binding.tvUserEmail.setText(email)
        } else {
            binding.tvUserName.setText("Not logged in")
            binding.tvUserEmail.setText("")
        }
    }

    private fun setupThemeSwitch() {
        val currentTheme = sharedPreferences.getInt("theme_mode", AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        
        when (currentTheme) {
            AppCompatDelegate.MODE_NIGHT_YES -> {
                binding.switchTheme.isChecked = true
                binding.tvThemeStatus.text = "Dark Mode"
            }
            AppCompatDelegate.MODE_NIGHT_NO -> {
                binding.switchTheme.isChecked = false
                binding.tvThemeStatus.text = "Light Mode"
            }
            else -> {
                binding.switchTheme.isChecked = false
                binding.tvThemeStatus.text = "System Default"
            }
        }

        binding.switchTheme.setOnCheckedChangeListener { _, isChecked ->
            val mode = if (isChecked) {
                AppCompatDelegate.MODE_NIGHT_YES
            } else {
                AppCompatDelegate.MODE_NIGHT_NO
            }
            
            AppCompatDelegate.setDefaultNightMode(mode)
            sharedPreferences.edit().putInt("theme_mode", mode).apply()
            
            binding.tvThemeStatus.text = if (isChecked) "Dark Mode" else "Light Mode"
        }
    }

    private fun setupLogout() {
        binding.btnLogout.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Logout") { _, _ ->
                    BackendHelper.logout()
                    Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()
                    
                    val intent = Intent(this, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }
}





