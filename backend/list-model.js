const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ta clé API
const genAI = new GoogleGenerativeAI("AIzaSyAMxdwSsyX_e2ZVBbi8OIg_yhfT1CldskM");

async function diagnostic() {
    try {
        console.log("🔍 Interrogation de la liste des modèles disponibles...");

        // On utilise la méthode officielle pour lister les modèles
        // Note: Le SDK utilise souvent v1beta en interne pour lister
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${genAI.apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Erreur Google :", data.error.message);
            return;
        }

        console.log("\n✅ MODÈLES DISPONIBLES POUR TA CLÉ :");
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supporte : ${m.supportedGenerationMethods.join(', ')})`);
        });

    } catch (e) {
        console.error("❌ Erreur lors du diagnostic :", e.message);
    }
}

diagnostic();