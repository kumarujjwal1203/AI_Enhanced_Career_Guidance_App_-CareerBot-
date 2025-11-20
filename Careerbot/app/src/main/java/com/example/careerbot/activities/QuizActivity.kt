package com.example.careerbot.activities

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.util.Log
import android.view.View
import android.widget.RadioButton
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.careerbot.databinding.ActivityQuizBinding
import com.example.careerbot.models.*
import com.example.careerbot.network.ApiClient
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.network.GeminiContent
import com.example.careerbot.network.GeminiPart
import com.example.careerbot.network.GeminiRequest
import com.example.careerbot.network.GeminiResponse
import com.example.careerbot.network.GeminiService
import com.example.careerbot.utils.BackendHelper
import com.example.careerbot.utils.Constants
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class QuizActivity : AppCompatActivity() {
    private lateinit var binding: ActivityQuizBinding
    private var currentQuestions: MutableList<QuizQuestion> = mutableListOf()
    private var currentQuestionIndex = 0
    private var timer: CountDownTimer? = null
    private var timeLeft: Long = 5 * 60 * 1000 // 5 minutes
    private var isGenerating = false
    private var quizTopic = ""

    companion object {
        private const val TAG = "QuizActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQuizBinding.inflate(layoutInflater)
        setContentView(binding.root)

        BackendHelper.init(this)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "AI Quiz"

        binding.toolbar.setNavigationOnClickListener {
            finish()
        }

        binding.btnStartQuiz.setOnClickListener {
            val topic = binding.etTopic.text.toString().trim()
            if (topic.isEmpty()) {
                Toast.makeText(this, "Please enter a topic", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            generateQuizWithAI(topic)
        }

        binding.btnViewHistory.setOnClickListener {
            startActivity(Intent(this, QuizHistoryActivity::class.java))
        }
    }

    private fun generateQuizWithAI(topic: String) {
        if (isGenerating) {
            Toast.makeText(this, "Already generating quiz...", Toast.LENGTH_SHORT).show()
            return
        }

        quizTopic = topic
        Log.d(TAG, "Generating quiz for topic: $topic")

        // Check API key
        if (Constants.GEMINI_API_KEY.isBlank() || Constants.GEMINI_API_KEY == "YOUR_API_KEY_HERE") {
            Toast.makeText(this, "API key not configured", Toast.LENGTH_SHORT).show()
            return
        }

        // Show loading
        isGenerating = true
        binding.llQuizSetup.visibility = View.GONE
        binding.llQuizContent.visibility = View.VISIBLE
        binding.tvQuestion.text = "🤖 Generating quiz questions...\nPlease wait..."
        binding.radioGroupOptions.visibility = View.GONE
        binding.btnNext.isEnabled = false
        binding.btnSubmit.isEnabled = false
        binding.tvTimer.text = "--:--"

        // Create AI prompt
        val prompt = """
Generate exactly 5 multiple choice questions about: $topic

For each question provide:
1. The question text (clear and concise)
2. Exactly 4 options
3. The correct answer index (0 for first option, 1 for second, 2 for third, 3 for fourth)
4. A brief explanation of why the answer is correct (1-2 sentences)

Format the response as a valid JSON array like this:
[
  {
    "question": "What is the question?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "explanation": "This is the explanation."
  }
]

Rules:
- Questions should be educational and appropriate
- Make questions challenging but fair
- Options should be plausible
- Explanations should be informative
- Return ONLY the JSON array, no markdown formatting, no other text

Topic: $topic
        """.trimIndent()

        val service = ApiClient.retrofit.create(GeminiService::class.java)
        val request = GeminiRequest(
            contents = listOf(
                GeminiContent(parts = listOf(GeminiPart(prompt)))
            )
        )

        val call = service.generate(apiKey = Constants.GEMINI_API_KEY, req = request)

        call.enqueue(object : Callback<GeminiResponse> {
            override fun onResponse(call: Call<GeminiResponse>, response: Response<GeminiResponse>) {
                runOnUiThread {
                    isGenerating = false

                    if (response.isSuccessful && response.body() != null) {
                        try {
                            val body = response.body()

                            if (body?.error != null) {
                                showError("API Error: ${body.error.message}")
                                return@runOnUiThread
                            }

                            val candidates = body?.candidates
                            if (candidates.isNullOrEmpty()) {
                                showError("No questions generated. Try again.")
                                return@runOnUiThread
                            }

                            val textContent = candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text
                            if (textContent.isNullOrBlank()) {
                                showError("Empty response. Try again.")
                                return@runOnUiThread
                            }

                            // Parse JSON response
                            parseQuestions(textContent)

                        } catch (e: Exception) {
                            Log.e(TAG, "Error parsing AI response", e)
                            showError("Error processing questions: ${e.message}")
                        }
                    } else {
                        val code = response.code()
                        Log.e(TAG, "API Error: $code")
                        showError("Failed to generate quiz (Error $code)")
                    }
                }
            }

            override fun onFailure(call: Call<GeminiResponse>, t: Throwable) {
                runOnUiThread {
                    isGenerating = false
                    Log.e(TAG, "Network failure", t)
                    showError("Network error: ${t.message}")
                }
            }
        })
    }

    private fun parseQuestions(jsonText: String) {
        try {
            // Clean the response
            val cleanJson = jsonText
                .replace("```json", "")
                .replace("```", "")
                .trim()

            Log.d(TAG, "Parsing JSON: ${cleanJson.take(200)}...")

            val gson = Gson()
            val type = object : TypeToken<List<QuizQuestion>>() {}.type
            val questions: List<QuizQuestion> = gson.fromJson(cleanJson, type)

            if (questions.isEmpty()) {
                showError("No questions generated")
                return
            }

            currentQuestions = questions.toMutableList()
            Log.d(TAG, "Successfully parsed ${currentQuestions.size} questions")

            // Start quiz
            startQuiz()

        } catch (e: Exception) {
            Log.e(TAG, "Error parsing questions", e)
            showError("Failed to parse questions: ${e.message}")
        }
    }

    private fun startQuiz() {
        currentQuestionIndex = 0
        timeLeft = 5 * 60 * 1000

        binding.radioGroupOptions.visibility = View.VISIBLE
        binding.btnNext.isEnabled = true
        binding.btnSubmit.isEnabled = true

        showQuestion()
        startTimer()
    }

    private fun showQuestion() {
        if (currentQuestionIndex >= currentQuestions.size) {
            finishQuiz()
            return
        }

        val question = currentQuestions[currentQuestionIndex]
        binding.tvQuestion.text = "${currentQuestionIndex + 1}. ${question.question}"
        binding.tvQuestionNumber.text = "Question ${currentQuestionIndex + 1} of ${currentQuestions.size}"

        binding.radioGroupOptions.clearCheck()
        binding.radioGroupOptions.removeAllViews()

        question.options.forEachIndexed { optionIndex, option ->
            val radioButton = RadioButton(this)
            radioButton.id = View.generateViewId()
            radioButton.text = option
            radioButton.textSize = 16f
            radioButton.setPadding(20, 20, 20, 20)
            radioButton.setPaddingRelative(56, 20, 20, 20)
            radioButton.minHeight = 64
            binding.radioGroupOptions.addView(radioButton)

            val layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            )
            layoutParams.setMargins(0, 8, 0, 8)
            radioButton.layoutParams = layoutParams
        }
    }

    private fun startTimer() {
        timer?.cancel()
        timer = object : CountDownTimer(timeLeft, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                timeLeft = millisUntilFinished
                val minutes = (millisUntilFinished / 1000) / 60
                val seconds = (millisUntilFinished / 1000) % 60
                binding.tvTimer.text = String.format("%02d:%02d", minutes, seconds)
            }

            override fun onFinish() {
                binding.tvTimer.text = "00:00"
                finishQuiz()
            }
        }.start()
    }

    private fun finishQuiz() {
        timer?.cancel()

        // Save current answer if any
        val selectedId = binding.radioGroupOptions.checkedRadioButtonId
        if (selectedId != -1 && currentQuestionIndex < currentQuestions.size) {
            val selectedIndex = binding.radioGroupOptions.indexOfChild(
                binding.radioGroupOptions.findViewById(selectedId)
            )
            currentQuestions[currentQuestionIndex].userAnswer = selectedIndex
            currentQuestions[currentQuestionIndex].isCorrect = 
                selectedIndex == currentQuestions[currentQuestionIndex].correctAnswer
        }

        calculateResults()
    }

    private fun calculateResults() {
        var correctCount = 0
        currentQuestions.forEach { question ->
            if (question.userAnswer == question.correctAnswer) {
                correctCount++
                question.isCorrect = true
            }
        }

        val score = (correctCount * 100) / currentQuestions.size
        val timeTaken = ((5 * 60) - (timeLeft / 1000)).toInt()

        // Save to backend
        saveQuizAttempt(score, correctCount, timeTaken)

        // Show results
        showResults(score, correctCount, timeTaken)
    }

    private fun saveQuizAttempt(score: Int, correctCount: Int, timeTaken: Int) {
        if (!BackendHelper.isLoggedIn()) {
            Log.w(TAG, "User not logged in, cannot save quiz")
            return
        }

        lifecycleScope.launch {
            try {
                val request = QuizSaveRequest(
                    topic = quizTopic,
                    questions = currentQuestions,
                    score = score,
                    totalQuestions = currentQuestions.size,
                    correctAnswers = correctCount,
                    timeTaken = timeTaken
                )

                val token = "Bearer ${BackendHelper.getToken()}"
                val response = BackendApiClient.backendService.saveQuizAttempt(token, request)

                if (response.isSuccessful && response.body()?.success == true) {
                    Log.d(TAG, "Quiz saved successfully")
                } else {
                    Log.w(TAG, "Failed to save quiz: ${response.message()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error saving quiz", e)
            }
        }
    }

    private fun showResults(score: Int, correctCount: Int, timeTaken: Int) {
        val minutes = timeTaken / 60
        val seconds = timeTaken % 60
        val timeStr = String.format("%dm %ds", minutes, seconds)

        val analysis = when {
            score >= 80 -> "🎉 Excellent! You have a strong understanding."
            score >= 60 -> "👍 Good job! Keep practicing to improve."
            score >= 40 -> "📚 Not bad, but there's room for improvement."
            else -> "💪 Keep learning! Review and try again."
        }

        // Build detailed results
        val results = StringBuilder()
        currentQuestions.forEachIndexed { index, question ->
            results.append("\n━━━━━━━━━━━━━━━━━━━━━━\n")
            results.append("Q${index + 1}: ${question.question}\n\n")
            
            question.options.forEachIndexed { optIndex, option ->
                val prefix = when {
                    optIndex == question.correctAnswer -> "✓ "
                    optIndex == question.userAnswer && question.userAnswer != question.correctAnswer -> "✗ "
                    else -> "  "
                }
                results.append("$prefix$option\n")
            }
            
            results.append("\n💡 ${question.explanation}\n")
        }

        AlertDialog.Builder(this)
            .setTitle("Quiz Complete!")
            .setMessage("Score: $correctCount/${currentQuestions.size} ($score%)\nTime: $timeStr\n\n$analysis\n\nDetailed Results:$results")
            .setPositiveButton("View History") { _, _ ->
                startActivity(Intent(this, QuizHistoryActivity::class.java))
                finish()
            }
            .setNegativeButton("Take Another") { _, _ ->
                resetQuiz()
            }
            .setCancelable(false)
            .show()
    }

    private fun showError(message: String) {
        binding.llQuizContent.visibility = View.GONE
        binding.llQuizSetup.visibility = View.VISIBLE
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        Log.e(TAG, message)
    }

    private fun resetQuiz() {
        binding.llQuizContent.visibility = View.GONE
        binding.llQuizSetup.visibility = View.VISIBLE
        binding.etTopic.setText("")
        currentQuestions.clear()
        currentQuestionIndex = 0
        timeLeft = 5 * 60 * 1000
    }

    fun onNextQuestion(view: View) {
        val selectedId = binding.radioGroupOptions.checkedRadioButtonId
        if (selectedId == -1) {
            Toast.makeText(this, "Please select an answer", Toast.LENGTH_SHORT).show()
            return
        }

        val selectedIndex = binding.radioGroupOptions.indexOfChild(
            binding.radioGroupOptions.findViewById(selectedId)
        )

        currentQuestions[currentQuestionIndex].userAnswer = selectedIndex
        currentQuestions[currentQuestionIndex].isCorrect = 
            selectedIndex == currentQuestions[currentQuestionIndex].correctAnswer

        currentQuestionIndex++
        showQuestion()
    }

    fun onSubmitQuiz(view: View) {
        finishQuiz()
    }

    override fun onDestroy() {
        super.onDestroy()
        timer?.cancel()
    }
}

