package com.example.capitune.data.remote

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

object RetrofitClient {
    // Restauration du préfixe /api/ qui est utilisé par le routeur Express
    private const val BASE_URL = "https://api.capitune.com/api/"

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    val authApi: AuthApi by lazy {
        retrofit.create(AuthApi::class.java)
    }

    val dossierApi: DossierApi by lazy {
        retrofit.create(DossierApi::class.java)
    }

    val communityApi: CommunityApi by lazy {
        retrofit.create(CommunityApi::class.java)
    }
}
