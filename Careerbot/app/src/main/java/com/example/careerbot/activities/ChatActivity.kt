package com.example.careerbot.activities

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.careerbot.adapters.ChatAdapter
import com.example.careerbot.databinding.ActivityChatBinding
import com.example.careerbot.models.ChatMessage
import com.example.careerbot.network.ApiClient
import com.example.careerbot.network.GeminiContent
import com.example.careerbot.network.GeminiPart
import com.example.careerbot.network.GeminiRequest
import com.example.careerbot.network.GeminiResponse
import com.example.careerbot.network.GeminiService
import com.example.careerbot.utils.Constants
import com.example.careerbot.utils.BackendHelper
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

class ChatActivity : AppCompatActivity() {

    private lateinit var binding: ActivityChatBinding
    private lateinit var adapter: ChatAdapter
    private var isSending = false // Prevent multiple simultaneous sends

    companion object {
        private const val TAG = "ChatActivity"
        private const val FALLBACK_ERROR_MESSAGE = "Sorry — I'm having trouble replying right now. Please check your connection or try again."
    }

    // menu (logout)
    override fun onCreateOptionsMenu(menu: android.view.Menu?): Boolean {
        menuInflater.inflate(com.example.careerbot.R.menu.menu_chat, menu)
        return true
    }

    override fun onOptionsItemSelected(item: android.view.MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                // Handle back button
                onBackPressed()
                true
            }
            com.example.careerbot.R.id.action_logout -> {
                BackendHelper.logout()
                Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        super.onBackPressed()
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize BackendHelper
        BackendHelper.init(this)
        
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // Initialize adapter with empty list
        adapter = ChatAdapter(mutableListOf())
        
        // Setup RecyclerView
        val layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true // Keep bottom aligned
            reverseLayout = false
        }
        binding.rvChat.layoutManager = layoutManager
        binding.rvChat.adapter = adapter
        binding.rvChat.setHasFixedSize(false) // Allow variable item heights
        binding.rvChat.clipToPadding = false
        binding.rvChat.isNestedScrollingEnabled = true

        // Ensure button state
        binding.btnSend.isEnabled = true
        isSending = false

        if (!BackendHelper.isLoggedIn()) {
            Log.e(TAG, "User not logged in")
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        Log.d(TAG, "ChatActivity created for user: ${BackendHelper.getUserId()}")
        Log.d(TAG, "RecyclerView initialized with adapter: ${adapter.itemCount} items")

        // Load last messages (safe callback)
        lifecycleScope.launch {
            BackendHelper.fetchLastMessages { list ->
                runOnUiThread {
                    Log.d(TAG, "Loaded ${list.size} messages from backend")
                    if (list.isNotEmpty()) {
                        adapter.setMessages(list)
                        Log.d(TAG, "Adapter now has ${adapter.itemCount} items")
                        // Force UI refresh and scroll
                        adapter.notifyDataSetChanged()
                        binding.rvChat.scrollToPosition(adapter.itemCount - 1)
                    } else {
                        // Add welcome message if no messages
                        val welcomeMsg = ChatMessage(
                            sender = "ai",
                            message = "👋 Hello! I'm CareerBot. Ask me anything about careers, education, or job guidance. For example, try asking 'after 12th grade' to get career suggestions!"
                        )
                        adapter.addMessage(welcomeMsg)
                        Log.d(TAG, "Added welcome message, adapter now has ${adapter.itemCount} items")
                        adapter.notifyDataSetChanged()
                        binding.rvChat.scrollToPosition(adapter.itemCount - 1)
                    }
                }
            }
        }

        binding.btnSend.setOnClickListener { sendMessage() }
        binding.etMessage.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendMessage()
                true
            } else false
        }
    }

    private fun sendMessage() {
        // Prevent multiple simultaneous sends
        if (isSending) {
            Log.d(TAG, "Message send already in progress, ignoring")
            return
        }

        val raw = binding.etMessage.text?.toString() ?: ""
        val text = raw.trim()
        if (text.isEmpty()) {
            Toast.makeText(this, "Please type a message", Toast.LENGTH_SHORT).show()
            return
        }

        Log.d(TAG, "Sending message: $text")

        // Disable send while in-flight to avoid duplicate sends
        isSending = true
        binding.btnSend.isEnabled = false

        // Check career-related (if you want weaker filter, adjust keywords)
        if (!isCareerRelated(text)) {
            val msg = ChatMessage(
                sender = "ai",
                message = "🚫 This is a Career Guidance App. Please ask only career-related questions."
            )
            runOnUiThread {
                adapter.addMessage(msg)
                binding.etMessage.setText("")
                scrollToBottomSmooth()
            }
            isSending = false
            binding.btnSend.isEnabled = true
            return
        }

        val userMsg = ChatMessage(sender = "user", message = text)
        runOnUiThread {
            Log.d(TAG, "Adding user message to adapter. Current count: ${adapter.itemCount}")
            adapter.addMessage(userMsg)
            Log.d(TAG, "User message added. New count: ${adapter.itemCount}")
            binding.etMessage.setText("")
            // Ensure UI updates immediately
            adapter.notifyDataSetChanged()
            binding.rvChat.scrollToPosition(adapter.itemCount - 1)
        }

        if (!BackendHelper.isLoggedIn()) {
            Log.e(TAG, "User not logged in during send")
            runOnUiThread {
                Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
                isSending = false
                binding.btnSend.isEnabled = true
            }
            return
        }

        // Save user message (asynchronous)
        lifecycleScope.launch {
            BackendHelper.saveMessage(userMsg) { success ->
                if (!success) {
                    Log.w(TAG, "Failed to save user message to backend")
                }
            }
        }

        // Show typing indicator
        runOnUiThread {
            binding.typingIndicator.visibility = View.VISIBLE
            scrollToBottomSmooth()
        }

        // Check API key present
        if (Constants.GEMINI_API_KEY.isBlank() || Constants.GEMINI_API_KEY == "YOUR_API_KEY_HERE") {
            Log.e(TAG, "API key not configured")
            runOnUiThread {
                adapter.removeLastIf { it.sender == "ai" && it.meta?.get("typing") == "1" }
                val aiMsg = ChatMessage(sender = "ai", message = "⚠️ API key not set. Please configure GEMINI_API_KEY in Constants.kt")
                adapter.addMessage(aiMsg)
                lifecycleScope.launch {
                    BackendHelper.saveMessage(aiMsg) { /* ignore */ }
                }
                scrollToBottomSmooth()
            }
            isSending = false
            binding.btnSend.isEnabled = true
            return
        }

        // Build request with enhanced prompt for career guidance
        val service = ApiClient.retrofit.create(GeminiService::class.java)
        
        // Enhance the prompt to be more career-focused
        val enhancedPrompt = """
            You are CareerBot, a helpful career guidance assistant. 
            Provide clear, concise, and practical career advice.
            Focus on educational paths, job opportunities, skills development, and career planning.
            
            User question: $text
            
            Please provide a helpful response about career guidance, education options, or job-related advice.
        """.trimIndent()
        
        val req = GeminiRequest(contents = listOf(GeminiContent(parts = listOf(GeminiPart(enhancedPrompt)))))

        Log.d(TAG, "Making API call to Gemini with prompt: ${text.take(50)}...")
        val call = service.generate(apiKey = Constants.GEMINI_API_KEY, req = req)

        // Enqueue async
        call.enqueue(object : Callback<GeminiResponse> {
            override fun onResponse(call: Call<GeminiResponse>, response: Response<GeminiResponse>) {
                runOnUiThread {
                    try {
                        // Hide typing indicator
                        binding.typingIndicator.visibility = View.GONE

                        if (response.isSuccessful && response.body() != null) {
                            val reply: String = try {
                                val body = response.body()
                                Log.d(TAG, "Response body: $body")
                                
                                // Check for error in response
                                if (body?.error != null) {
                                    val error = body.error
                                    Log.e(TAG, "API returned error: ${error.message} (code: ${error.code})")
                                    "Sorry, I encountered an error: ${error.message ?: "Unknown error"}"
                                } else {
                                    val candidates = body?.candidates
                                    Log.d(TAG, "Candidates count: ${candidates?.size ?: 0}")
                                    
                                    if (candidates.isNullOrEmpty()) {
                                        Log.w(TAG, "No candidates in response")
                                        "Sorry, I couldn't generate a reply. Please try again."
                                    } else {
                                        val firstCandidate = candidates.firstOrNull()
                                        val content = firstCandidate?.content
                                        val parts = content?.parts
                                        val textPart = parts?.firstOrNull()
                                        val replyText = textPart?.text

                                        if (replyText.isNullOrBlank()) {
                                            Log.w(TAG, "Empty reply text in candidate")
                                            "Sorry, I couldn't generate a reply. Please try again."
                                        } else {
                                            Log.d(TAG, "Successfully parsed reply: ${replyText.take(100)}...")
                                            replyText
                                        }
                                    }
                                }
                            } catch (ex: Exception) {
                                Log.e(TAG, "Error parsing API response", ex)
                                ex.printStackTrace()
                                FALLBACK_ERROR_MESSAGE
                            }

                            // Ensure we have a valid reply and add it to chat
                            val finalReply = if (reply.isNotBlank()) reply else FALLBACK_ERROR_MESSAGE
                            
                            // Clean up any HTML tags or formatting issues
                            val cleanedReply = finalReply
                                .replace(Regex("<[^>]*>"), "") // Remove HTML tags
                                .replace("&nbsp;", " ")
                                .replace("&amp;", "&")
                                .replace("&lt;", "<")
                                .replace("&gt;", ">")
                                .trim()
                            
                            Log.d(TAG, "Adding bot reply. Current count: ${adapter.itemCount}")
                            val aiMsg = ChatMessage(sender = "ai", message = cleanedReply)
                            adapter.addMessage(aiMsg)
                            Log.d(TAG, "Bot reply added. New count: ${adapter.itemCount}")
                            adapter.notifyDataSetChanged()
                            binding.rvChat.scrollToPosition(adapter.itemCount - 1)
                            lifecycleScope.launch {
                                BackendHelper.saveMessage(aiMsg) { success ->
                                    if (!success) {
                                        Log.w(TAG, "Failed to save bot message to backend")
                                    }
                                }
                            }

                        } else {
                            // Handle HTTP error responses
                            val code = response.code()
                            val msg = response.message()
                            val errorBody = try {
                                response.errorBody()?.string() ?: "Unknown error"
                            } catch (e: Exception) {
                                "Unable to read error body"
                            }

                            Log.e(TAG, "API Error: $code $msg - body=$errorBody")

                            val errorMessage = when (code) {
                                400 -> "Invalid request. Please check your message."
                                401, 403 -> "Authentication failed. Please check API key."
                                404 -> "API endpoint not found. The model might not be available. Please check the API endpoint in GeminiService.kt"
                                429 -> "Rate limit exceeded. Please try again later."
                                500, 502, 503, 504 -> FALLBACK_ERROR_MESSAGE
                                else -> FALLBACK_ERROR_MESSAGE
                            }
                            
                            Log.e(TAG, "HTTP Error $code: $msg")
                            if (code == 404) {
                                Log.e(TAG, "If you see 404, try changing the endpoint in GeminiService.kt to: v1/models/gemini-pro:generateContent")
                            }

                            val aiMsg = ChatMessage(sender = "ai", message = errorMessage)
                            adapter.addMessage(aiMsg)
                            adapter.notifyDataSetChanged()
                            binding.rvChat.scrollToPosition(adapter.itemCount - 1)
                            lifecycleScope.launch {
                                BackendHelper.saveMessage(aiMsg) { /* ignore */ }
                            }
                        }
                    } catch (t: Throwable) {
                        Log.e(TAG, "Unexpected error in onResponse", t)
                        val aiMsg = ChatMessage(sender = "ai", message = FALLBACK_ERROR_MESSAGE)
                        adapter.addMessage(aiMsg)
                        adapter.notifyDataSetChanged()
                        binding.rvChat.scrollToPosition(adapter.itemCount - 1)
                        lifecycleScope.launch {
                            BackendHelper.saveMessage(aiMsg) { /* ignore */ }
                        }
                    } finally {
                        isSending = false
                        binding.btnSend.isEnabled = true
                    }
                }
            }

            override fun onFailure(call: Call<GeminiResponse>, t: Throwable) {
                runOnUiThread {
                    try {
                        // Hide typing indicator
                        binding.typingIndicator.visibility = View.GONE

                        val errorMessage = when (t) {
                            is UnknownHostException -> "No internet connection. Please check your network."
                            is SocketTimeoutException -> "Request timed out. Please try again."
                            is IOException -> FALLBACK_ERROR_MESSAGE
                            else -> FALLBACK_ERROR_MESSAGE
                        }

                        Log.e(TAG, "Network failure: ${t.javaClass.simpleName} - ${t.message}", t)

                        val err = ChatMessage(sender = "ai", message = errorMessage)
                        adapter.addMessage(err)
                        adapter.notifyDataSetChanged()
                        binding.rvChat.scrollToPosition(adapter.itemCount - 1)
                        lifecycleScope.launch {
                            BackendHelper.saveMessage(err) { /* ignore */ }
                        }
                    } finally {
                        isSending = false
                        binding.btnSend.isEnabled = true
                    }
                }
            }
        })
    }

    private fun scrollToBottomSmooth() {
        binding.rvChat.post {
            val last = adapter.itemCount - 1
            if (last >= 0) {
                try {
                    binding.rvChat.smoothScrollToPosition(last)
                    Log.d(TAG, "Smooth scroll to position $last (total: ${adapter.itemCount})")
                } catch (e: Exception) {
                    Log.e(TAG, "Error scrolling smoothly", e)
                    // Fallback to instant scroll
                    binding.rvChat.scrollToPosition(last)
                }
            } else {
                Log.w(TAG, "Cannot scroll: adapter is empty")
            }
        }
    }

    private fun scrollToBottom() {
        binding.rvChat.post {
            val last = adapter.itemCount - 1
            if (last >= 0) {
                try {
                    binding.rvChat.scrollToPosition(last)
                    Log.d(TAG, "Instant scroll to position $last (total: ${adapter.itemCount})")
                } catch (e: Exception) {
                    Log.e(TAG, "Error scrolling", e)
                }
            }
        }
    }

    private fun isCareerRelated(prompt: String): Boolean {
        // Much more lenient filter - allow almost any educational or career-related question
        val keywords = listOf(
            // Career keywords
            "career", "job", "resume", "cv", "college", "course", "degree",
            "skills", "study", "studying", "learning", "internship", "intern", 
            "placements", "placement", "portfolio", "interview", "interviews",
            "career path", "salary", "role", "company", "hiring", "employment",
            "profession", "work", "workplace", "guidance", "advice", "help",
            
            // Education keywords
            "education", "educational", "school", "university", "university",
            "college", "graduate", "graduation", "diploma", "certificate",
            "12th", "11th", "10th", "9th", "grade", "grades", "class",
            "after", "before", "next", "future", "option", "options",
            "subject", "subjects", "stream", "streams", "field", "fields",
            "engineering", "medical", "commerce", "arts", "science",
            "bachelor", "master", "phd", "doctorate", "mba",
            
            // Common question words (very lenient)
            "what", "which", "how", "when", "where", "why", "who",
            "should", "can", "could", "would", "will", "may",
            "best", "better", "good", "better", "top", "popular",
            "suggest", "suggestion", "recommend", "recommendation",
            "career", "path", "way", "route", "direction",
            
            // Greetings (always allow)
            "hello", "hi", "hey", "greetings", "thanks", "thank you"
        )
        val lowerPrompt = prompt.lowercase()
        val isRelated = keywords.any { keyword -> lowerPrompt.contains(keyword, ignoreCase = false) }
        
        // If message is very short and doesn't match, still allow it (might be a question)
        if (prompt.length <= 50 && !isRelated) {
            // Allow short messages that might be questions
            return prompt.contains("?") || 
                   prompt.contains("what") || 
                   prompt.contains("which") || 
                   prompt.contains("how") ||
                   prompt.contains("after") ||
                   prompt.contains("before") ||
                   prompt.contains("next")
        }
        
        Log.d(TAG, "Career filter check: '$prompt' -> $isRelated")
        return isRelated
    }
}
