package com.example.careerbot.network

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query

data class GeminiPart(val text: String? = null)
data class GeminiContent(val parts: List<GeminiPart>? = null)
data class GeminiRequest(val contents: List<GeminiContent>)

data class GeminiResponse(
    val candidates: List<Candidate>? = null,
    val error: GeminiError? = null
) {
    data class Candidate(
        val content: GeminiContent? = null,
        val finishReason: String? = null
    )
    
    data class GeminiError(
        val code: Int? = null,
        val message: String? = null,
        val status: String? = null
    )
}

interface GeminiService {
    // Use the query param "key" for API key if you use API key. Otherwise use Authorization bearer token if required.
    // Using gemini-pro as it's the most stable and widely available model
    @POST("v1/models/gemini-2.5-flash:generateContent")
    fun generate(
        @Query("key") apiKey: String,
        @Body req: GeminiRequest
    ): Call<GeminiResponse>
}
