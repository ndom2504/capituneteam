package com.example.capitune

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.capitune.ui.screens.auth.AuthViewModel
import com.example.capitune.ui.screens.auth.LoginScreen
import com.example.capitune.ui.screens.auth.RegisterScreen
import com.example.capitune.ui.screens.community.CommunityScreen
import com.example.capitune.ui.screens.home.HomeScreen
import com.example.capitune.ui.screens.resources.ResourcesScreen
import com.example.capitune.ui.theme.CapituneTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CapituneTheme {
                CapituneApp()
            }
        }
    }
}

@Composable
fun CapituneApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    val context = LocalContext.current

    // Tenter de charger la session au démarrage
    LaunchedEffect(Unit) {
        authViewModel.loadSession(context)
    }

    NavHost(
        navController = navController,
        startDestination = "login"
    ) {
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate("register")
                },
                viewModel = authViewModel
            )
            
            // Redirection automatique si la session est chargée avec succès
            LaunchedEffect(authViewModel.currentUser) {
                authViewModel.currentUser.value?.let {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            }
        }
        composable("register") {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }
        composable("home") {
            HomeScreen(
                onNavigateToResources = {
                    navController.navigate("resources")
                },
                onNavigateToCommunity = {
                    navController.navigate("community")
                },
                onLogout = {
                    navController.navigate("login") {
                        popUpTo("home") { inclusive = true }
                    }
                },
                authViewModel = authViewModel
            )
        }
        composable("resources") {
            ResourcesScreen()
        }
        composable("community") {
            CommunityScreen(context = context)
        }
    }
}
