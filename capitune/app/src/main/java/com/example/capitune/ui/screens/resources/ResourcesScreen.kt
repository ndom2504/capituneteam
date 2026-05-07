package com.example.capitune.ui.screens.resources

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ResourcesScreen() {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Ressources", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Programmes, services de consultation et vision Capitune.")
        }
        item { ResourceCard("Entrée Express", "Accompagnement pour les profils travailleurs qualifiés et le projet de résidence permanente.", Icons.Default.Work) }
        item { ResourceCard("Permis d’études", "Orientation pour choisir un programme, préparer le dossier et comprendre les exigences canadiennes.", Icons.Default.School) }
        item { ResourceCard("Affaires", "Conseils pour entrepreneurs, investisseurs et opportunités professionnelles au Canada.", Icons.Default.Business) }
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Notre vision", fontWeight = FontWeight.Bold)
                    Text("Apporter des conseils et consultations fiables sur le projet Canada selon une expérience vécue, avec un accompagnement clair et humain.")
                }
            }
        }
    }
}

@Composable
fun ResourceCard(title: String, description: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Column {
                Text(title, fontWeight = FontWeight.Bold)
                Text(description)
            }
        }
    }
}
