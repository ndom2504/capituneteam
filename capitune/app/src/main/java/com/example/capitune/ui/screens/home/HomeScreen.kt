package com.example.capitune.ui.screens.home

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.capitune.data.remote.DossierDto
import com.example.capitune.ui.screens.auth.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToResources: () -> Unit,
    onNavigateToCommunity: () -> Unit,
    onLogout: () -> Unit,
    authViewModel: AuthViewModel = viewModel(),
    homeViewModel: HomeViewModel = viewModel()
) {
    val user by authViewModel.currentUser.collectAsState()
    val dossierState by homeViewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        homeViewModel.fetchDossiers(context)
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("CAPITUNE", fontWeight = FontWeight.ExtraBold) },
                actions = {
                    TextButton(onClick = { authViewModel.logout(context, onLogout) }) {
                        Text("Déconnexion")
                    }
                }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                user?.let { currentUser ->
                    Spacer(modifier = Modifier.height(16.dp))
                    AsyncImage(
                        model = currentUser.profilePhotoUrl,
                        contentDescription = "Photo",
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .border(2.dp, MaterialTheme.colorScheme.primary, CircleShape),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = currentUser.displayName ?: "Utilisateur",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = currentUser.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    
                    Surface(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = MaterialTheme.shapes.small,
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Text(
                            text = currentUser.role.uppercase(),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(onClick = onNavigateToResources, modifier = Modifier.weight(1f)) {
                        Text("Ressources")
                    }
                    OutlinedButton(onClick = onNavigateToCommunity, modifier = Modifier.weight(1f)) {
                        Text("Communauté")
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Mes Dossiers",
                    modifier = Modifier.fillMaxWidth(),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            when (val state = dossierState) {
                is HomeUiState.Success -> {
                    if (state.dossiers.isEmpty()) {
                        item { Text("Aucun dossier pour le moment.", modifier = Modifier.padding(top = 16.dp)) }
                    } else {
                        items(state.dossiers) { dossier ->
                            DossierCard(dossier)
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                }
                is HomeUiState.Loading -> item { CircularProgressIndicator() }
                is HomeUiState.Error -> item { Text("Erreur: ${state.message}", color = MaterialTheme.colorScheme.error) }
            }
        }
    }
}

@Composable
fun DossierCard(dossier: DossierDto) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Description, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(text = dossier.displayTitle, fontWeight = FontWeight.Bold)
                Text(text = "Statut: ${dossier.displayStatus}", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
