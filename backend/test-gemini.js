require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiEmbedding() {
    try {
        // Initialisation du modèle d'embedding
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const text = "Développeur Fullstack passionné par l'IA.";

        // Génération du vecteur
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        console.log("🚀 Gemini est prêt !");
        console.log(`📏 Taille du vecteur : ${embedding.length} dimensions`);
        console.log("🔢 Aperçu du vecteur :", embedding.slice(0, 5), "...");

        return embedding;
    } catch (error) {
        console.error("❌ Erreur Gemini :", error.message);
    }
}

testGeminiEmbedding();