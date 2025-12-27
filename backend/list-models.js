const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log(`Listing models for API Key...`);
        // Using REST because SDK might hide the list method on the instance
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Available Models:");
        data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));

    } catch (error) {
        console.error("Error listing/testing models:", error.message);
    }
}

listModels();
