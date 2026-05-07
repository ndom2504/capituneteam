package com.example.capitune.ui.screens.auth

import android.content.Context
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialException
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.capitune.data.local.SessionManager
import com.example.capitune.data.remote.RegisterRequest
import com.example.capitune.data.remote.RetrofitClient
import com.example.capitune.data.remote.UserDto
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class AuthViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState = _uiState.asStateFlow()

    private val _currentUser = MutableStateFlow<UserDto?>(null)
    val currentUser = _currentUser.asStateFlow()

    private val auth = FirebaseAuth.getInstance()
    private val webClientId = "837356366256-l32fm3mjsadotbgfo32bht980ihjc78c.apps.googleusercontent.com"

    init {
        checkBackendConnection()
    }

    fun checkBackendConnection() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.authApi.checkHealth()
                Log.d("BackendCheck", "Code réponse: ${response.code()}")
            } catch (e: Exception) {
                Log.e("BackendCheck", "Erreur: ${e.message}")
            }
        }
    }

    fun loadSession(context: Context) {
        val sessionManager = SessionManager(context)
        viewModelScope.launch {
            try {
                val user = sessionManager.currentUser.first()
                if (user != null) {
                    _currentUser.value = user
                    _uiState.value = AuthUiState.Success
                }
            } catch (e: Exception) { }
        }
    }

    fun signInWithGoogle(context: Context, onLoginSuccess: () -> Unit) {
        val sessionManager = SessionManager(context)
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            
            val credentialManager = CredentialManager.create(context)
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(true)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            try {
                val result = credentialManager.getCredential(context, request)
                handleFirebaseAndBackend(result, sessionManager, onLoginSuccess)
            } catch (e: Exception) {
                _uiState.value = AuthUiState.Error(e.message ?: "Erreur d'authentification")
            }
        }
    }

    private suspend fun handleFirebaseAndBackend(
        result: GetCredentialResponse, 
        sessionManager: SessionManager,
        onLoginSuccess: () -> Unit
    ) {
        try {
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(result.credential.data)
            val googleToken = googleIdTokenCredential.idToken
            
            // 1. Échanger le token Google contre un token Firebase
            val credential = GoogleAuthProvider.getCredential(googleToken, null)
            val authResult = auth.signInWithCredential(credential).await()
            val firebaseUser = authResult.user ?: throw Exception("Échec Firebase Auth")
            
            // 2. Obtenir le Firebase ID Token (celui attendu par votre middleware verifyToken)
            val firebaseToken = firebaseUser.getIdToken(true).await().token ?: throw Exception("Token Firebase vide")
            
            // 3. Envoyer au backend
            val userResponse = RetrofitClient.authApi.registerWithFirebase(
                token = "Bearer $firebaseToken",
                request = RegisterRequest(
                    displayName = firebaseUser.displayName,
                    role = "client"
                )
            )
            
            sessionManager.saveSession(firebaseToken, userResponse)
            _currentUser.value = userResponse
            _uiState.value = AuthUiState.Success
            onLoginSuccess()
            
        } catch (e: Exception) {
            Log.e("Auth", "Détail erreur: ${e.message}", e)
            _uiState.value = AuthUiState.Error("Erreur: ${e.message}")
        }
    }

    fun logout(context: Context, onLogoutComplete: () -> Unit) {
        val sessionManager = SessionManager(context)
        viewModelScope.launch {
            auth.signOut()
            sessionManager.clearSession()
            _currentUser.value = null
            _uiState.value = AuthUiState.Idle
            onLogoutComplete()
        }
    }
}

sealed class AuthUiState {
    data object Idle : AuthUiState()
    data object Loading : AuthUiState()
    data object Success : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}
