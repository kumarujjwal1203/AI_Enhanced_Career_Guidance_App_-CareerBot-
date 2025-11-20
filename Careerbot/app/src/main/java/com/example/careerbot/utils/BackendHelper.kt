package com.example.careerbot.utils

import android.content.Context
import android.content.SharedPreferences
import com.example.careerbot.models.ChatMessage
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.network.SaveMessageRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object BackendHelper {
    private const val PREFS_NAME = "CareerBotPrefs"
    private const val KEY_TOKEN = "jwt_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_EMAIL = "user_email"
    
    private lateinit var prefs: SharedPreferences
    
    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    // Authentication methods
    fun saveAuthData(token: String, userId: String, email: String) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_USER_ID, userId)
            putString(KEY_EMAIL, email)
            apply()
        }
    }
    
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)
    
    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)
    
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    
    fun isLoggedIn(): Boolean = getToken() != null
    
    fun logout() {
        prefs.edit().clear().apply()
    }
    
    private fun getAuthHeader(): String {
        val token = getToken() ?: throw IllegalStateException("User not authenticated")
        return "Bearer $token"
    }
    
    // Chat message methods
    suspend fun saveMessage(chatMessage: ChatMessage, onComplete: (Boolean) -> Unit) {
        withContext(Dispatchers.IO) {
            try {
                val request = SaveMessageRequest(
                    sender = chatMessage.sender,
                    message = chatMessage.message,
                    meta = chatMessage.meta
                )
                
                val response = BackendApiClient.backendService.saveMessage(
                    getAuthHeader(),
                    request
                )
                
                withContext(Dispatchers.Main) {
                    onComplete(response.isSuccessful && response.body()?.success == true)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    onComplete(false)
                }
            }
        }
    }
    
    suspend fun fetchLastMessages(onResult: (List<ChatMessage>) -> Unit) {
        withContext(Dispatchers.IO) {
            try {
                val response = BackendApiClient.backendService.getMessages(
                    getAuthHeader(),
                    limit = Constants.MAX_HISTORY
                )
                
                val messages = if (response.isSuccessful && response.body()?.success == true) {
                    response.body()?.data ?: emptyList()
                } else {
                    emptyList()
                }
                
                withContext(Dispatchers.Main) {
                    onResult(messages)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    onResult(emptyList())
                }
            }
        }
    }
    
    suspend fun clearAllMessages(onComplete: (Boolean) -> Unit) {
        withContext(Dispatchers.IO) {
            try {
                val response = BackendApiClient.backendService.clearAllMessages(
                    getAuthHeader()
                )
                
                withContext(Dispatchers.Main) {
                    onComplete(response.isSuccessful && response.body()?.success == true)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    onComplete(false)
                }
            }
        }
    }
    
    suspend fun deleteMessage(messageId: String, onComplete: (Boolean) -> Unit) {
        withContext(Dispatchers.IO) {
            try {
                val response = BackendApiClient.backendService.deleteMessage(
                    getAuthHeader(),
                    messageId
                )
                
                withContext(Dispatchers.Main) {
                    onComplete(response.isSuccessful && response.body()?.success == true)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    onComplete(false)
                }
            }
        }
    }
}
