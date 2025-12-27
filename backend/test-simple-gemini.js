const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const llm = new ChatGoogleGenerativeAI({
    apiKey: "AIzaSyAMxdwSsyX_e2ZVBbi8OIg_yhfT1CldskM",
    model: "gemini-2.5-flash", // <--- On essaie le nom générique "gemini-pro"
});

async function test() {
    try {
        console.log("⏳ Appel à Gemini avec gemini-2.5-flash...");
        const res = await llm.invoke("Coucou, tu m'entends ?");
        console.log("✅ RÉPONSE GEMINI :", res.content);
    } catch (e) {
        console.error("❌ ERREUR :", e.message);
    }
}
test();