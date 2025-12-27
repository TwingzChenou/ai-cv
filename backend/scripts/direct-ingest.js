require('dotenv').config();
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
const DB_NAME = "sample_mflix";
const COLLECTION_NAME = "cv_content";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoClient = new MongoClient(process.env.MONGODB_URI);

const CV_TEXT = `
Quentin Forget - Data Scientist – Machine Learning Engineer
Profil: Data Scientist, alliant rigueur analytique et créativité. Deux ans d’expérience en alternance dans le secteur bancaire (Crédit Agricole CIB),  j’ai développé des solutions de modélisation prédictive et d’automatisation à fort impact. Curieux et passionné par l’intelligence artificielle, je cherche à relever de nouveaux défis dans des projets Data innovants.
Expérience: Data Scientist chez Credit Agricole CIB. Conception et automatisation de reporting (Python, Power BI). Analyse des données d’occupation calculs de taux, tendances et segmentations. Recommandations d’optimisation pour typologies et capacités selon besoins.
Formation: 2022-2024 Mastère Big Data et Data Science en finance (ESG Finance), 2021-2022 Licence Mathématiques et Informatiques (UVSQ).
Compétences: Python, R, SQL, HTML, CSS, Node.js, LangChain.js, Pandas, Numpy, Scikit-learn, TensorFlow, PyTorch, PostgreSQL, MySQL, MongoDB, Jupyter, VS Code, Excel, Git, Docker, MLOps, AWS (notions).
Projets: Conception d'un Agent IA de Recrutement. Architecture d'un agent autonome avec LangChain.js et le modèle LLM Google Gemini 1.5 Flash. RAG: Mise en place d'une recherche sémantique avancée utilisant MongoDB. Atlas Vector Search et les Google Generative AI Embeddings pour une analyse précise du parcours professionnel. Développement d'outils: Intégration de l'API GitHub (Octokit) pour permettre à l'agent de récupérer et d'analyser dynamiquement les dépôts et commits en temps réel. Architecture MERN & API : Backend avec Node.js/Express et intégration de la mémoire conversationnelle (BufferMemory).
Soft Skills: Goût pour le travail en équipe pluridisciplinaire, esprit analytique fort, autonomie et proactif, compétence en communication, souci du détail et de la rigueur.
Hobbies: Tennis, Running, Padel, Livres
Langues: English: B2, Certification EF 2025 Espagnol: A2
Contact: Ile de France, quentin-forget@hotmail.fr, 06 40 12 47 83, Permis B et véhiculé, https://www.linkedin.com/in/quentin-forget-197705230, https://github.com/TwingzChenou
`;

async function directIngest() {
    try {
        console.log("🧠 Demande de l'embedding à Gemini...");
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        // Génération du vecteur (les 768 chiffres)
        const result = await model.embedContent(CV_TEXT);
        const embedding = result.embedding.values;

        console.log("📡 Connexion à MongoDB Atlas...");
        await mongoClient.connect();
        const db = mongoClient.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // On nettoie l'ancienne version s'il y en a une
        await collection.deleteMany({ type: "cv_main" });

        console.log("💾 Insertion du CV et de son vecteur...");
        await collection.insertOne({
            title: "CV Quentin Forget (Direct)",
            content: CV_TEXT,
            embedding: embedding, // Les chiffres magiques sont ici
            type: "cv_main",
            updated_at: new Date()
        });

        console.log("\n✅ Félicitations ! Ton CV est maintenant 'intelligent' dans MongoDB.");
        console.log(`📏 Vecteur inséré avec ${embedding.length} dimensions.`);

    } catch (error) {
        console.error("❌ Erreur :", error.message);
    } finally {
        await mongoClient.close();
    }
}

directIngest();
