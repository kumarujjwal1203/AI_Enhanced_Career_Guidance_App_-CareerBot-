package com.example.careerbot.models

data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctAnswer: Int,
    val explanation: String = "",
    var userAnswer: Int = -1,
    var isCorrect: Boolean = false
)

data class QuizAttempt(
    val id: String = "",
    val userId: String = "",
    val topic: String,
    val questions: List<QuizQuestion>,
    val score: Int = 0,
    val totalQuestions: Int,
    val correctAnswers: Int = 0,
    val timeTaken: Int = 0,
    val completedAt: String = ""
)

data class QuizSaveRequest(
    val topic: String,
    val questions: List<QuizQuestion>,
    val score: Int,
    val totalQuestions: Int,
    val correctAnswers: Int,
    val timeTaken: Int
)

data class QuizResponse(
    val success: Boolean,
    val message: String? = null,
    val data: QuizAttempt? = null
)

data class QuizListResponse(
    val success: Boolean,
    val message: String? = null,
    val data: List<QuizAttempt>? = null
)

data class TopicStats(
    val attempts: Int,
    val totalScore: Int,
    val averageScore: Int
)

data class QuizStatistics(
    val totalAttempts: Int,
    val totalQuestionsAnswered: Int,
    val totalCorrectAnswers: Int,
    val averageScore: Int,
    val topicStats: Map<String, TopicStats>
)

data class QuizStatsResponse(
    val success: Boolean,
    val message: String? = null,
    val data: QuizStatistics? = null
)
