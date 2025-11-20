package com.example.careerbot.models

import com.google.gson.annotations.SerializedName

data class ResourceItem(
    @SerializedName("_id")
    val id: String = "",
    val title: String,
    val description: String,
    val category: String,
    val url: String,
    val imageUrl: String? = null,
    val tags: List<String>? = null,
    val difficulty: String? = "Beginner",
    val duration: String? = null,
    val isPremium: Boolean = false,
    val isActive: Boolean = true,
    val viewCount: Int = 0,
    val rating: Double = 0.0,
    val createdAt: String? = null,
    val updatedAt: String? = null
)





