# 🤖 AI-CV : Assistant de Recrutement Intelligent

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Status](https://img.shields.io/badge/Status-Active-success) ![Version](https://img.shields.io/badge/Version-1.0.0-purple)

> **Une expérience candidat réinventée grâce à l'Intelligence Artificielle Générative.**
> Ce projet transforme le CV statique en un agent conversationnel dynamique, utilisant le **RAG (Retrieval Augmented Generation)** et **Google Gemini** pour répondre aux recruteurs de manière contextuelle et personnalisée.

---

## 🚀 Caractéristiques Principales

-   **🧠 RAG Avancé** : Indexation vectorielle du parcours professionnel sur **MongoDB Atlas** pour une précision factuelle maximale.
-   **🕵️ Agent Autonome** : Capacité d'exécuter des outils (via LangChain) pour récupérer des données en temps réel (ex: GitHub).
-   **🎨 UI Premium** : Interface "Glassmorphism" moderne, responsive et immersive développée avec **TailwindCSS**.
-   **⚡ Performance & Sécurité** : Réponses rapides, **Rate-limiting** strict pour protéger l'API, et headers sécurisés (Helmet).
-   **💬 Expérience Fluide** : Mode chat interactif optimisé pour des interactions naturelles.

## 🛠 Stack Technique

Une architecture moderne, robuste et scalable :

| Composant | Technologies Clés | Rôle |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Interface utilisateur réactive et esthétique. |
| **Backend** | ![NodeLS](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) | Serveur API REST sécurisé et performant. |
| **IA / LLM** | ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white) ![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white) | Orchestration de l'agent et génération de réponses. |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) | Stockage vectoriel (Vector Search) et historique. |

## 🏗 Architecture

Le flux de données est conçu pour garantir pertinence et rapidité :

1.  **User Inquiry** : Le recruteur pose une question via l'interface React.
2.  **API Gateway** : Express.js reçoit la requête, applique le rate-limiting et valide l'input.
3.  **Agent Orchestration** : LangChain analyse l'intention.
4.  **Retrieval (RAG)** : Si nécessaire, recherche sémantique dans **MongoDB Vector Search** pour trouver les expériences pertinentes.
5.  **Generation** : **Gemini 2.5 Flash** synthétise les informations trouvées pour formuler une réponse professionnelle.
6.  **Response** : La réponse est renvoyée au frontend (format JSON optimisé).

## ⚙️ Installation & Configuration

### Pré-requis

-   Node.js (v18+)
-   Clé API Google Gemini
-   Cluster MongoDB Atlas (avec Vector Search activé)
-   Token GitHub (optionnel, pour les outils live)

### 1. Clonage

```bash
git clone https://github.com/votre-username/project-cv-ia.git
cd project-cv-ia
```

### 2. Configuration (`.env`)

Copiez le fichier d'exemple et remplissez vos clés :

```bash
cp backend/.env.example backend/.env
```

Editez ensuite `backend/.env` :

```env
PORT=3000
MONGODB_URI=votre_mongodb_atlas_uri
GEMINI_API_KEY=votre_cle_gemini
GITHUB_TOKEN=votre_token_github (facultatif, pour l'outil d'activité)
NODE_ENV=development
```

### 3. Installation des dépendances

Le projet utilise un script de commodité à la racine pour tout installer :

```bash
# Installation globale (Root, Backend, Frontend)
npm install

# Ou manuellement :
cd backend && npm install
cd ../frontend && npm install
```

### 4. Lancement

```bash
# Lancer Backend + Frontend en parallèle (depuis la racine)
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## 📸 Aperçu

![Interface Utilisateur AI-CV](/assets/preview-placeholder.png)
*(Ajoutez ici une capture d'écran de votre interface Glassmorphism)*

## 📫 Contact

Créé par **Quentin Forget** - Data Scientist & ML Engineer.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/quentin-forget)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/votre-github)

---
*Ce projet est une vitrine technologique démontrant l'intégration de l'IA Générative dans des cas d'usage réels.*
