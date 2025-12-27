// test-activity.js
require('dotenv').config(); // Charge le token depuis .env

// IMPORTANT : Vérifie que le chemin pointe bien vers ton fichier
// Si ton fichier est dans le même dossier, mets './githubService'
const { getLatestActivity } = require('./services/githubService');

async function runTest() {
    console.log("🛠️ Démarrage du test de getLatestActivity()...");

    // 1. Vérification du Token
    if (!process.env.GITHUB_TOKEN) {
        console.error("❌ ERREUR : Aucun GITHUB_TOKEN trouvé dans le fichier .env");
        return;
    }
    console.log("✅ Token détecté (début : " + process.env.GITHUB_TOKEN.substring(0, 4) + "...)");

    try {
        const startTime = Date.now();

        // 2. Appel de la fonction
        const result = await getLatestActivity();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // 3. Affichage du résultat
        console.log("\n---------------- RÉSULTAT REÇU ----------------");
        console.log(result);
        console.log("-----------------------------------------------");
        console.log(`✅ Test terminé avec succès en ${duration} secondes.\n`);

    } catch (error) {
        console.error("\n❌ LE TEST A ÉCHOUÉ :");
        console.error(error);
    }
}

runTest();