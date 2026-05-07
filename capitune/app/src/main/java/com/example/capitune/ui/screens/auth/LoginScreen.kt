package com.example.capitune.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.capitune.ui.components.CapituneButton

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.Start,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Capitune",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 40.sp,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        Text(
            text = "Se connecter",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Mot de passe") },
            modifier = Modifier.fillMaxWidth(),
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(24.dp))

        if (uiState is AuthUiState.Error) {
            Text(
                text = (uiState as AuthUiState.Error).message,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        CapituneButton(
            text = "Connexion",
            onClick = { /* Auth email/pass */ }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // --- Bouton Google ---
        OutlinedButton(
            onClick = { viewModel.signInWithGoogle(context, onLoginSuccess) },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            enabled = uiState !is AuthUiState.Loading
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (uiState is AuthUiState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text("Continuer avec Google")
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        TextButton(
            onClick = onNavigateToRegister,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text(
                "Pas encore de compte ? S'inscrire",
                color = MaterialTheme.colorScheme.secondary
            )
        }
    }
}
