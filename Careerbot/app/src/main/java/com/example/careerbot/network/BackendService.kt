package com.example.careerbot.network

import com.example.careerbot.models.ChatMessage
import com.example.careerbot.models.*
import retrofit2.Response
import retrofit2.http.*

// Request/Response models for authentication
data class AuthRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val data: AuthData?
)

data class AuthData(
    val token: String,
    val user: UserData
)

data class UserData(
    val id: String,
    val email: String,
    val createdAt: String
)

// Request/Response models for chat messages
data class SaveMessageRequest(
    val sender: String,
    val message: String,
    val meta: Map<String, String>? = null
)

data class MessageResponse(
    val success: Boolean,
    val message: String,
    val data: ChatMessage?
)

data class MessagesResponse(
    val success: Boolean,
    val message: String,
    val data: List<ChatMessage>
)

data class DeleteResponse(
    val success: Boolean,
    val message: String,
    val data: DeleteData?
)

data class DeleteData(
    val deletedCount: Int
)

// Resource response models
data class ResourcesResponse(
    val success: Boolean,
    val message: String? = null,
    val data: ResourcesData
)

data class ResourcesData(
    val resources: List<ResourceItem>,
    val pagination: Pagination
)

data class Pagination(
    val currentPage: Int,
    val totalPages: Int,
    val totalResources: Int,
    val limit: Int
)

data class SingleResourceResponse(
    val success: Boolean,
    val message: String? = null,
    val data: ResourceItem
)

interface BackendService {
    
    // Authentication endpoints
    @POST("auth/signup")
    suspend fun signup(@Body request: AuthRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>
    
    // Chat message endpoints
    @POST("chat/messages")
    suspend fun saveMessage(
        @Header("Authorization") token: String,
        @Body request: SaveMessageRequest
    ): Response<MessageResponse>
    
    @GET("chat/messages")
    suspend fun getMessages(
        @Header("Authorization") token: String,
        @Query("limit") limit: Int? = null
    ): Response<MessagesResponse>
    
    @DELETE("chat/messages")
    suspend fun clearAllMessages(
        @Header("Authorization") token: String
    ): Response<DeleteResponse>
    
    @DELETE("chat/messages/{id}")
    suspend fun deleteMessage(
        @Header("Authorization") token: String,
        @Path("id") messageId: String
    ): Response<DeleteResponse>
    
    // Quiz endpoints
    @POST("quiz/save-attempt")
    suspend fun saveQuizAttempt(
        @Header("Authorization") token: String,
        @Body request: QuizSaveRequest
    ): Response<QuizResponse>
    
    @GET("quiz/attempts")
    suspend fun getQuizAttempts(
        @Header("Authorization") token: String
    ): Response<QuizListResponse>
    
    @GET("quiz/attempts/{id}")
    suspend fun getQuizAttempt(
        @Header("Authorization") token: String,
        @Path("id") attemptId: String
    ): Response<QuizResponse>
    
    @GET("quiz/statistics")
    suspend fun getQuizStatistics(
        @Header("Authorization") token: String
    ): Response<QuizStatsResponse>
    
    // Resource endpoints
    @GET("resources")
    suspend fun getResources(
        @Header("Authorization") token: String,
        @Query("page") page: Int? = 1,
        @Query("limit") limit: Int? = 20,
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("difficulty") difficulty: String? = null
    ): Response<ResourcesResponse>
    
    @GET("resources/{id}")
    suspend fun getResource(
        @Header("Authorization") token: String,
        @Path("id") resourceId: String
    ): Response<SingleResourceResponse>
    
    @GET("resources/categories/list")
    suspend fun getCategories(
        @Header("Authorization") token: String
    ): Response<CategoriesResponse>
}

data class CategoriesResponse(
    val success: Boolean,
    val data: List<String>
)
