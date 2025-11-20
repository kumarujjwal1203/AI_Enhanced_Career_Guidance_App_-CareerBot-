// File: app/src/main/java/com/example/careerbot/activities/SignupActivity.kt
package com.example.careerbot.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.careerbot.databinding.ActivitySignupBinding
import com.example.careerbot.network.AuthRequest
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.utils.BackendHelper
import kotlinx.coroutines.launch

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize BackendHelper
        BackendHelper.init(this)
        
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSignup.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val pass = binding.etPassword.text.toString().trim()
            val conf = binding.etConfirmPassword.text.toString().trim()
            
            if (email.isEmpty() || pass.isEmpty() || conf.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (pass != conf) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (pass.length < 6) {
                Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            performSignup(email, pass)
        }

        binding.tvGoLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
    
    private fun performSignup(email: String, password: String) {
        binding.btnSignup.isEnabled = false
        
        lifecycleScope.launch {
            try {
                val response = BackendApiClient.backendService.signup(
                    AuthRequest(email, password)
                )
                
                binding.btnSignup.isEnabled = true
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val authData = response.body()?.data
                    if (authData != null) {
                        // Save authentication data
                        BackendHelper.saveAuthData(
                            authData.token,
                            authData.user.id,
                            authData.user.email
                        )
                        
                        Toast.makeText(this@SignupActivity, "Signup successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@SignupActivity, DashboardActivity::class.java))
                        finish()
                    }
                } else {
                    val errorMessage = response.body()?.message ?: "Signup failed"
                    Toast.makeText(this@SignupActivity, errorMessage, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                binding.btnSignup.isEnabled = true
                Toast.makeText(
                    this@SignupActivity, 
                    "Network error: ${e.message}", 
                    Toast.LENGTH_SHORT
                ).show()
                e.printStackTrace()
            }
        }
    }
}
