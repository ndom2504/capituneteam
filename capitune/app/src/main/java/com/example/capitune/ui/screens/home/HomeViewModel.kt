package com.example.capitune.ui.screens.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.capitune.data.local.SessionManager
import com.example.capitune.data.remote.DossierDto
import com.example.capitune.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val uiState = _uiState.asStateFlow()

    fun fetchDossiers(context: Context) {
        val sessionManager = SessionManager(context)
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading
            try {
                val token = sessionManager.userToken.first()
                if (token != null) {
                    val dossiers = RetrofitClient.dossierApi.getDossiers("Bearer $token")
                    _uiState.value = HomeUiState.Success(dossiers)
                } else {
                    _uiState.value = HomeUiState.Error("Session expirée")
                }
            } catch (e: Exception) {
                _uiState.value = HomeUiState.Error("Erreur lors de la récupération des dossiers: ${e.message}")
            }
        }
    }
}

sealed class HomeUiState {
    data object Loading : HomeUiState()
    data class Success(val dossiers: List<DossierDto>) : HomeUiState()
    data class Error(val message: String) : HomeUiState()
}
