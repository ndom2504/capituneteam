package com.example.capitune.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class UserRole {
    CLIENT,
    CONSEILLER,
    ADMIN
}

@Serializable
data class User(
    val id: String = "",
    val email: String = "",
    val fullName: String = "",
    val role: UserRole = UserRole.CLIENT,
    val profileImageUrl: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)
