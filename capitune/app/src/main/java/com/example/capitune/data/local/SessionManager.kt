package com.example.capitune.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.capitune.data.remote.UserDto
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_session")

class SessionManager(private val context: Context) {

    companion object {
        private val KEY_TOKEN = stringPreferencesKey("user_token")
        private val KEY_UID = stringPreferencesKey("firebase_uid")
        private val KEY_EMAIL = stringPreferencesKey("user_email")
        private val KEY_NAME = stringPreferencesKey("user_name")
        private val KEY_PHOTO = stringPreferencesKey("user_photo")
        private val KEY_ROLE = stringPreferencesKey("user_role")
    }

    suspend fun saveSession(token: String, user: UserDto) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = token
            prefs[KEY_UID] = user.firebaseUid
            prefs[KEY_EMAIL] = user.email
            prefs[KEY_NAME] = user.displayName ?: ""
            prefs[KEY_PHOTO] = user.profilePhotoUrl ?: ""
            prefs[KEY_ROLE] = user.role
        }
    }

    val userToken: Flow<String?> = context.dataStore.data.map { it[KEY_TOKEN] }

    val currentUser: Flow<UserDto?> = context.dataStore.data.map { prefs ->
        val email = prefs[KEY_EMAIL] ?: return@map null
        UserDto(
            id = 0,
            firebaseUid = prefs[KEY_UID] ?: "",
            email = email,
            displayName = prefs[KEY_NAME],
            profilePhotoUrl = prefs[KEY_PHOTO],
            role = prefs[KEY_ROLE] ?: "client"
        )
    }

    suspend fun clearSession() {
        context.dataStore.edit { it.clear() }
    }
}
