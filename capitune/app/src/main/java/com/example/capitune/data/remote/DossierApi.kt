package com.example.capitune.data.remote

import retrofit2.http.GET
import retrofit2.http.Header

interface DossierApi {
    @GET("dossiers")
    suspend fun getDossiers(
        @Header("Authorization") token: String
    ): List<DossierDto>
}
