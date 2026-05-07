package com.example.capitune.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

@Serializable
data class RegisterRequest(
    val displayName: String?,
    val role: String = "client"
)

@Serializable
data class UserDto(
    val id: Int = 0,
    @SerialName("firebase_uid")
    val firebaseUid: String = "",
    val email: String = "",
    @SerialName("display_name")
    val displayName: String? = null,
    @SerialName("first_name")
    val firstName: String? = null,
    @SerialName("last_name")
    val lastName: String? = null,
    @SerialName("profile_photo_url")
    val profilePhotoUrl: String? = null,
    val role: String = "client"
)

interface AuthApi {
    @GET(".")
    suspend fun checkHealth(): Response<Unit>

    @POST("auth/register")
    suspend fun registerWithFirebase(
        @Header("Authorization") token: String,
        @Body request: RegisterRequest
    ): UserDto
}
