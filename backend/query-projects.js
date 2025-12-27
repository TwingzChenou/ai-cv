require('dotenv').config();
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration
const DB_NAME = "sample_mflix";
const COLLECTION_NAME = "projects";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function searchProjects(queryText) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        console.log(`🔍 Recherche pour : "${queryText}"...`);

        // 1. Transformer la QUESTION en vecteur avec Gemini
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(queryText);
        const queryVector = result.embedding.values;

        // 2. Lancer la recherche vectorielle dans MongoDB
        const results = await collection.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 10,
                    "limit": 2 // On veut les 2 meilleurs résultats
                }
            },
            {
                // On choisit ce qu'on veut afficher
                "$project": {
                    "_id": 0,
                    "name": 1,
                    "description": 1,
                    "language": 1,
                    "score": { "$meta": "vectorSearchScore" } // Pour voir la pertinence
                }
            }
        ]).toArray();

        // 3. Afficher les résultats
        console.log("\n✨ Résultats trouvés :");
        if (results.length === 0) {
            console.log("Aucun projet ne semble correspondre.");
        } else {
            results.forEach((project, i) => {
                console.log(`${i + 1}. [${project.name}] - Pertinence: ${(project.score * 100).toFixed(2)}%`);
                console.log(`   Description: ${project.description}`);
                console.log(`   Langage: ${project.language}\n`);
            });
        }

    } catch (error) {
        console.error("❌ Erreur de recherche :", error.message);
    } finally {
        await mongoClient.close();
    }
}

// Récupère l'argument tapé dans le terminal
const userQuery = process.argv.slice(2).join(" ") || "projets sur la finance et le trading";
searchProjects(userQuery);