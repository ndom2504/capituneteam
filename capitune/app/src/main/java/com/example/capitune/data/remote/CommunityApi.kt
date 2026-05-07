package com.example.capitune.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

@Serializable
data class CommunityPostDto(
    val id: Int,
    @SerialName("author_id") val authorId: Int? = null,
    val title: String? = null,
    val content: String? = null,
    @SerialName("media_url") val mediaUrl: String? = null,
    @SerialName("media_type") val mediaType: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("author_name") val authorName: String? = null,
    @SerialName("author_photo_url") val authorPhotoUrl: String? = null,
    @SerialName("likes_count") val likesCount: Int = 0,
    @SerialName("comments_count") val commentsCount: Int = 0,
    @SerialName("liked_by_me") val likedByMe: Boolean = false
)

@Serializable
data class CommunityCommentDto(
    val id: Int,
    @SerialName("post_id") val postId: Int,
    @SerialName("user_id") val userId: Int? = null,
    val content: String,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("user_name") val userName: String? = null,
    @SerialName("user_photo_url") val userPhotoUrl: String? = null
)

@Serializable
data class CreateCommentRequest(val content: String)

interface CommunityApi {
    @GET("community")
    suspend fun getPosts(@Header("Authorization") token: String): List<CommunityPostDto>

    @POST("community/{postId}/like")
    suspend fun toggleLike(
        @Header("Authorization") token: String,
        @Path("postId") postId: Int
    )

    @GET("community/{postId}/comments")
    suspend fun getComments(
        @Header("Authorization") token: String,
        @Path("postId") postId: Int
    ): List<CommunityCommentDto>

    @POST("community/{postId}/comments")
    suspend fun addComment(
        @Header("Authorization") token: String,
        @Path("postId") postId: Int,
        @Body request: CreateCommentRequest
    ): CommunityCommentDto
}
