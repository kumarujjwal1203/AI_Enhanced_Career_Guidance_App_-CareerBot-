// In file: app/src/main/java/com/example/careerbot/models/ChatMessage.kt

package com.example.careerbot.models

data class
ChatMessage(
    val id: String = "",
    val sender: String = "",
    val message: String = "",
    val timestamp: String? = null, // ISO 8601 date string from backend
    val meta: Map<String, String>? = null
) {
    // No-argument constructor for Gson deserialization
    constructor() : this("", "", "", null, null)
}
