package com.example.capitune.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class DossierType {
    @SerialName("express_entry") EXPRESS_ENTRY,
    @SerialName("study_permit") STUDY_PERMIT,
    @SerialName("business_opportunity") BUSINESS_OPPORTUNITY
}

@Serializable
enum class DossierStatus {
    @SerialName("pending") PENDING,
    @SerialName("accepted") ACCEPTED,
    @SerialName("rejected") REJECTED,
    @SerialName("in_progress") IN_PROGRESS,
    @SerialName("completed") COMPLETED
}

@Serializable
data class DossierDto(
    val id: Int,
    @SerialName("client_id") val clientId: Int? = null,
    @SerialName("conseiller_id") val conseillerId: Int? = null,
    val type: DossierType? = null,
    @SerialName("titre") val titre: String? = null,
    val title: String? = null,
    val programme: String? = null,
    val description: String?,
    @SerialName("statut") val statut: String? = null,
    val status: DossierStatus? = null,
    @SerialName("created_at") val createdAt: String? = null
) {
    val displayTitle: String
        get() = titre ?: title ?: programme ?: "Dossier #$id"

    val displayStatus: String
        get() = statut ?: status?.name ?: "brouillon"
}
