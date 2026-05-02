# CAPITUNE

Application web de gestion de communauté d'immigration au Canada.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons + Firebase Auth
- **Backend**: Node.js + Express + PostgreSQL + Firebase Admin + Stripe + Multer

## Structure

```
capitune/
├── backend/
│   ├── config/          # DB & Firebase
│   ├── middleware/      # Auth
│   ├── routes/           # API endpoints
│   ├── schema.sql        # PostgreSQL schema
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
└── package.json
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Remplir DATABASE_URL, FIREBASE_PROJECT_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
npm install
# Créer les tables dans PostgreSQL avec schema.sql
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Remplir les variables Firebase
npm install
npm run dev
```

### 3. Variables Firebase

Créer `backend/config/serviceAccountKey.json` avec la clé service account Firebase.

## Fonctionnalités

- Authentification Firebase (client/conseiller/admin)
- Création de dossiers (Entrée Express, Permis d'étude, Opportunités d'affaires)
- Acceptation/refus de dossiers par conseillers
- Tickets de service avec prix et délai
- Paiement Stripe
- Messagerie avec transfert de fichiers
- Gestion de profil

## Scripts

- `npm run dev` — lance backend + frontend en parallèle
