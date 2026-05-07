package com.example.capitune.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class DossierType {
    ENTREE_EXPRESS,
    PERMIS_ETUDE,
    OPPORTUNITES_AFFAIRES
}

@Serializable
enum class DossierStatus {
    PENDING,
    ACCEPTED,
    REFUSED
}

@Serializable
data class Dossier(
    val id: String = "",
    val clientId: String = "",
    val conseillerId: String? = null,
    val type: DossierType = DossierType.ENTREE_EXPRESS,
    val status: DossierStatus = DossierStatus.PENDING,
    val description: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
