package com.example.capitune.ui.screens.community

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Message
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.capitune.data.local.SessionManager
import com.example.capitune.data.remote.CommunityPostDto
import com.example.capitune.data.remote.CreateCommentRequest
import com.example.capitune.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@Composable
fun CommunityScreen(context: Context, viewModel: CommunityViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsState()
    var commentText by remember { mutableStateOf("") }
    var selectedPostId by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) { viewModel.fetchPosts(context) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Communauté", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Publications, images et vidéos sur les thématiques du Canada.")
        }
        when (val current = state) {
            is CommunityUiState.Loading -> item { CircularProgressIndicator() }
            is CommunityUiState.Error -> item { Text(current.message, color = MaterialTheme.colorScheme.error) }
            is CommunityUiState.Success -> items(current.posts) { post ->
                CommunityPostCard(
                    post = post,
                    onLike = { viewModel.toggleLike(context, post.id) },
                    onComment = { selectedPostId = post.id }
                )
                if (selectedPostId == post.id) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = commentText,
                            onValueChange = { commentText = it },
                            modifier = Modifier.weight(1f),
                            label = { Text("Commentaire") }
                        )
                        Button(onClick = {
                            viewModel.addComment(context, post.id, commentText)
                            commentText = ""
                            selectedPostId = null
                        }) { Text("Envoyer") }
                    }
                }
            }
        }
    }
}

@Composable
fun CommunityPostCard(post: CommunityPostDto, onLike: () -> Unit, onComment: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(post.authorName ?: "Conseiller", fontWeight = FontWeight.Bold)
            post.title?.takeIf { it.isNotBlank() }?.let { Text(it, style = MaterialTheme.typography.titleMedium) }
            post.content?.takeIf { it.isNotBlank() }?.let { Text(it) }
            post.mediaUrl?.let { AsyncImage(model = it, contentDescription = post.title, modifier = Modifier.fillMaxWidth().heightIn(max = 260.dp)) }
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                TextButton(onClick = onLike) {
                    Icon(if (post.likedByMe) Icons.Default.Favorite else Icons.Default.FavoriteBorder, contentDescription = null)
                    Spacer(Modifier.width(4.dp))
                    Text(post.likesCount.toString())
                }
                TextButton(onClick = onComment) {
                    Icon(Icons.Default.Message, contentDescription = null)
                    Spacer(Modifier.width(4.dp))
                    Text(post.commentsCount.toString())
                }
            }
        }
    }
}

class CommunityViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<CommunityUiState>(CommunityUiState.Loading)
    val uiState = _uiState.asStateFlow()

    fun fetchPosts(context: Context) {
        viewModelScope.launch {
            try {
                val token = SessionManager(context).userToken.first() ?: throw Exception("Session expirée")
                _uiState.value = CommunityUiState.Success(RetrofitClient.communityApi.getPosts("Bearer $token"))
            } catch (e: Exception) {
                _uiState.value = CommunityUiState.Error(e.message ?: "Erreur de chargement")
            }
        }
    }

    fun toggleLike(context: Context, postId: Int) {
        viewModelScope.launch {
            val token = SessionManager(context).userToken.first() ?: return@launch
            RetrofitClient.communityApi.toggleLike("Bearer $token", postId)
            fetchPosts(context)
        }
    }

    fun addComment(context: Context, postId: Int, content: String) {
        if (content.isBlank()) return
        viewModelScope.launch {
            val token = SessionManager(context).userToken.first() ?: return@launch
            RetrofitClient.communityApi.addComment("Bearer $token", postId, CreateCommentRequest(content))
            fetchPosts(context)
        }
    }
}

sealed class CommunityUiState {
    data object Loading : CommunityUiState()
    data class Success(val posts: List<CommunityPostDto>) : CommunityUiState()
    data class Error(val message: String) : CommunityUiState()
}
