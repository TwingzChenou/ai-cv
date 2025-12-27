const { askAgent } = require("./services/iaService"); // Ajuste le chemin si besoin

async function runTest() {
    console.log("--- 🤖 Test de l'Agent Quentin ---");

    // Test 1: Question sur le CV
    const res1 = await askAgent("Quelles sont les expériences de Quentin en finance ?");
    console.log("\n👤 Utilisateur: Quelles sont les expériences de Quentin en finance ?");
    console.log("🤖 Agent:", res1);

    // Test 2: Question sur les projets GitHub (Mémoire de session)
    const res2 = await askAgent("Et a-t-il des projets codés en Python ?");
    console.log("\n👤 Utilisateur: Et a-t-il des projets codés en Python ?");
    console.log("🤖 Agent:", res2);
}

runTest();
