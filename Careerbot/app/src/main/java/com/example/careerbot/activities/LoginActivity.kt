// File: app/src/main/java/com/example/careerbot/activities/LoginActivity.kt
package com.example.careerbot.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.careerbot.databinding.ActivityLoginBinding
import com.example.careerbot.network.AuthRequest
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.utils.BackendHelper
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize BackendHelper
        BackendHelper.init(this)
        
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // If already logged in, go to Dashboard
        if (BackendHelper.isLoggedIn()) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val pass = binding.etPassword.text.toString().trim()
            if (email.isEmpty() || pass.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            performLogin(email, pass)
        }

        binding.tvGoSignup.setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }
    
    private fun performLogin(email: String, password: String) {
        binding.btnLogin.isEnabled = false
        
        lifecycleScope.launch {
            try {
                val response = BackendApiClient.backendService.login(
                    AuthRequest(email, password)
                )
                
                binding.btnLogin.isEnabled = true
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()?.data
                    if (authData != null) {
                        // Save authentication data
                        BackendHelper.saveAuthData(
                            authData.token,
                            authData.user.id,
                            authData.user.email
                        )
                        
                        Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                        finish()
                    }
                } else {
                    val errorMessage = response.body()?.message ?: "Login failed"
                    Toast.makeText(this@LoginActivity, errorMessage, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.btnLogin.isEnabled = true
                Toast.makeText(
                    this@LoginActivity, 
                    "Network error: ${e.message}", 
                    Toast.LENGTH_SHORT
                ).show()
                e.printStackTrace()
            }
        }
    }
}
