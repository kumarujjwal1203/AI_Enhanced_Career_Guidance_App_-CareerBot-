package com.example.careerbot.activities

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.careerbot.databinding.ActivityCareerTipsBinding
import com.example.careerbot.network.ApiClient
import com.example.careerbot.network.GeminiContent
import com.example.careerbot.network.GeminiPart
import com.example.careerbot.network.GeminiRequest
import com.example.careerbot.network.GeminiResponse
import com.example.careerbot.network.GeminiService
import com.example.careerbot.utils.Constants
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*

class CareerTipsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCareerTipsBinding
    private var isGenerating = false
    private val dateFormat = SimpleDateFormat("MMM dd, yyyy 'at' hh:mm a", Locale.getDefault())

    companion object {
        private const val TAG = "CareerTipsActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCareerTipsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Career Tips"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }

        setupCategorySelection()
        
        binding.fabGenerateTip.setOnClickListener {
            generateAITip()
        }
    }

    private fun setupCategorySelection() {
        binding.chipGroupCategories.setOnCheckedStateChangeListener { _, checkedIds ->
            // Automatically generate new tip when category changes
            if (checkedIds.isNotEmpty() && !isGenerating) {
                generateAITip()
            }
        }
    }

    private fun getSelectedCategory(): String {
        return when (binding.chipGroupCategories.checkedChipId) {
            binding.chipCareerPlanning.id -> "Career Planning"
            binding.chipJobSearch.id -> "Job Search"
            binding.chipInterview.id -> "Interview Tips"
            binding.chipSkills.id -> "Skills Development"
            binding.chipNetworking.id -> "Networking"
            binding.chipEducation.id -> "Education"
            else -> "Career Planning"
        }
    }

    private fun generateAITip() {
        if (isGenerating) {
            Toast.makeText(this, "Please wait, generating tip...", Toast.LENGTH_SHORT).show()
            return
        }

        val category = getSelectedCategory()
        Log.d(TAG, "Generating AI tip for category: $category")

        // Show loading
        isGenerating = true
        binding.loadingLayout.visibility = View.VISIBLE
        binding.contentLayout.visibility = View.GONE
        binding.fabGenerateTip.isEnabled = false

        // Check API key
        if (Constants.GEMINI_API_KEY.isBlank() || Constants.GEMINI_API_KEY == "YOUR_API_KEY_HERE") {
            showError("API key not configured. Please set GEMINI_API_KEY in Constants.kt")
            return
        }

        // Create prompt for Gemini
        val prompt = """
            You are a professional career counselor and advisor. 
            Generate a comprehensive and actionable career tip about: $category
            
            The tip should:
            - Be practical and immediately actionable
            - Include specific steps or strategies
            - Be between 150-250 words
            - Be encouraging and professional
            - Focus on real-world application
            
            Format the response as plain text without any markdown, HTML, or special formatting.
            Make it conversational and easy to understand.
        """.trimIndent()

        val service = ApiClient.retrofit.create(GeminiService::class.java)
        val request = GeminiRequest(
            contents = listOf(
                GeminiContent(
                    parts = listOf(GeminiPart(prompt))
                )
            )
        )

        Log.d(TAG, "Making API call to Gemini")
        val call = service.generate(apiKey = Constants.GEMINI_API_KEY, req = request)

        call.enqueue(object : Callback<GeminiResponse> {
            override fun onResponse(call: Call<GeminiResponse>, response: Response<GeminiResponse>) {
                runOnUiThread {
                    isGenerating = false
                    binding.fabGenerateTip.isEnabled = true

                    if (response.isSuccessful && response.body() != null) {
                        try {
                            val body = response.body()
                            Log.d(TAG, "Response received: $body")

                            // Check for error in response
                            if (body?.error != null) {
                                val error = body.error
                                Log.e(TAG, "API error: ${error.message} (code: ${error.code})")
                                showError("API Error: ${error.message ?: "Unknown error"}")
                                return@runOnUiThread
                            }

                            // Extract text from response
                            val candidates = body?.candidates
                            if (candidates.isNullOrEmpty()) {
                                Log.w(TAG, "No candidates in response")
                                showError("No tip generated. Please try again.")
                                return@runOnUiThread
                            }

                            val firstCandidate = candidates.firstOrNull()
                            val content = firstCandidate?.content
                            val parts = content?.parts
                            val textPart = parts?.firstOrNull()
                            val tipText = textPart?.text

                            if (tipText.isNullOrBlank()) {
                                Log.w(TAG, "Empty tip text")
                                showError("Failed to generate tip. Please try again.")
                                return@runOnUiThread
                            }

                            // Clean the text
                            val cleanedTip = tipText
                                .replace(Regex("<[^>]*>"), "")
                                .replace("&nbsp;", " ")
                                .replace("&amp;", "&")
                                .replace("&lt;", "<")
                                .replace("&gt;", ">")
                                .replace("**", "")
                                .replace("##", "")
                                .trim()

                            Log.d(TAG, "Successfully generated tip: ${cleanedTip.take(50)}...")
                            displayTip(category, cleanedTip)

                        } catch (e: Exception) {
                            Log.e(TAG, "Error parsing response", e)
                            showError("Error processing response: ${e.message}")
                        }
                    } else {
                        val code = response.code()
                        val errorBody = try {
                            response.errorBody()?.string() ?: "Unknown error"
                        } catch (e: Exception) {
                            "Unable to read error"
                        }
                        Log.e(TAG, "API Error: $code - $errorBody")
                        
                        val errorMessage = when (code) {
                            400 -> "Invalid request. Please try again."
                            401, 403 -> "Authentication failed. Please check API key."
                            404 -> "API endpoint not found."
                            429 -> "Rate limit exceeded. Please try again later."
                            else -> "Failed to generate tip. Please try again."
                        }
                        showError(errorMessage)
                    }
                }
            }

            override fun onFailure(call: Call<GeminiResponse>, t: Throwable) {
                runOnUiThread {
                    isGenerating = false
                    binding.fabGenerateTip.isEnabled = true
                    
                    Log.e(TAG, "Network failure", t)
                    val errorMessage = when (t) {
                        is java.net.UnknownHostException -> "No internet connection"
                        is java.net.SocketTimeoutException -> "Request timed out"
                        else -> "Network error: ${t.message}"
                    }
                    showError(errorMessage)
                }
            }
        })
    }

    private fun displayTip(category: String, content: String) {
        binding.loadingLayout.visibility = View.GONE
        binding.contentLayout.visibility = View.VISIBLE
        
        binding.chipCategory.text = category
        binding.tvTipContent.text = content
        
        // Show timestamp
        val timestamp = dateFormat.format(Date())
        binding.tvTimestamp.text = "Generated on $timestamp"
        binding.tvTimestamp.visibility = View.VISIBLE
        
        Log.d(TAG, "Tip displayed successfully")
    }

    private fun showError(message: String) {
        binding.loadingLayout.visibility = View.GONE
        binding.contentLayout.visibility = View.VISIBLE
        
        binding.chipCategory.text = "Error"
        binding.tvTipContent.text = "⚠️ $message"
        binding.tvTimestamp.visibility = View.GONE
        
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        Log.e(TAG, "Error: $message")
    }
}

