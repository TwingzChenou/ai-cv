require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testVectorSearch() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log("📡 Connecté à MongoDB.");

        const db = client.db("sample_mflix"); // Remplacez par votre nom de DB
        const collection = db.collection("users"); // Remplacez

        // 1. Insertion d'un document "bidon" avec un vecteur de test
        // On crée un vecteur de 1536 dimensions (toutes à 0 sauf une)
        const mockVector = new Array(768).fill(0);
        mockVector[0] = 1;

        await collection.insertOne({
            text: "Ceci est un test de recherche vectorielle",
            embedding: mockVector,
            email: `test-${Date.now()}@example.com`, // Utilise le timestamp pour être unique
            test: true
        });
        console.log("📝 Document de test inséré.");

        // 2. Test de la requête vectorielle ($vectorSearch)
        const results = await collection.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index", // Nom exact de l'index créé sur Atlas
                    "path": "embedding",
                    "queryVector": mockVector,
                    "numCandidates": 10,
                    "limit": 1
                }
            }
        ]).toArray();

        if (results.length > 0) {
            console.log("✅ Succès ! Le moteur vectoriel a retrouvé le document.");
        } else {
            console.log("⚠️ Le document n'a pas été trouvé. L'index est peut-être encore en cours de construction sur Atlas.");
        }

    } catch (error) {
        console.error("❌ Erreur lors du test vectoriel :");
        console.error(error.message);
    } finally {
        await client.close();
    }
}

console.log("🚀 Lancement du test...");

testVectorSearch()
    .then(() => console.log("--- Fin de l'exécution ---"))
    .catch(err => console.error("💥 Erreur fatale :", err));