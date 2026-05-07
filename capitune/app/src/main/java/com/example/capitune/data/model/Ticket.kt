package com.example.capitune.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Ticket(
    val id: String = "",
    val dossierId: String = "",
    val serviceName: String = "",
    val amount: Double = 0.0,
    val currency: String = "CAD",
    val deadline: Long = 0,
    val isPaid: Boolean = false,
    val stripePaymentIntentId: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)
