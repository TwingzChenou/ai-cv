require('dotenv').config();
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

// --- CONFIGURATION ---
const GITHUB_USERNAME = "TwingzChenou"; // 👈 REMPLACE PAR TON PSEUDO GITHUB
const DB_NAME = "sample_mflix";
const COLLECTION_NAME = "projects";
const INDEX_NAME = "vector_index";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function syncGithubToMongo() {
    try {
        console.log("🚀 Démarrage de la synchronisation...");
        await mongoClient.connect();
        const db = mongoClient.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // 1. Récupération des dépôts depuis GitHub
        console.log(`📂 Lecture des projets de ${GITHUB_USERNAME}...`);
        const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });

        const repos = response.data;
        console.log(`📦 ${repos.length} projets trouvés.`);

        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        // 2. Traitement de chaque projet
        for (const repo of repos) {
            // On ignore les forks pour ne garder que tes créations
            if (repo.fork) continue;

            const description = repo.description || "Pas de description fournie.";
            const language = repo.language || "Non spécifié";

            // On crée un texte riche pour que l'IA comprenne bien le contexte
            const textToEmbed = `Nom du projet: ${repo.name}. Description: ${description}. Langage principal: ${language}. Tags: ${repo.topics ? repo.topics.join(', ') : 'aucun'}`;

            console.log(`🧠 IA : Analyse du projet [${repo.name}]...`);

            // Génération de l'embedding (vecteur 768)
            const result = await model.embedContent(textToEmbed);
            const embedding = result.embedding.values;

            // 3. Insertion ou Mise à jour dans MongoDB
            await collection.updateOne(
                { github_id: repo.id }, // Critère de recherche (ID unique GitHub)
                {
                    $set: {
                        github_id: repo.id,
                        name: repo.name,
                        full_name: repo.full_name,
                        description: description,
                        html_url: repo.html_url,
                        language: language,
                        topics: repo.topics,
                        stars: repo.stargazers_count,
                        embedding: embedding, // Le vecteur pour la recherche future
                        last_sync: new Date()
                    }
                },
                { upsert: true } // Crée le document s'il n'existe pas, le met à jour sinon
            );
        }

        console.log("\n✅ Synchronisation réussie ! Tes projets sont maintenant indexés avec Gemini.");

    } catch (error) {
        console.error("❌ Erreur lors de la synchronisation :");
        if (error.response) {
            console.error(`Statut GitHub: ${error.response.status}`);
        } else {
            console.error(error.message);
        }
    } finally {
        await mongoClient.close();
    }
}

syncGithubToMongo();