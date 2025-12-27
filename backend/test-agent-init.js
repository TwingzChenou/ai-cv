require('dotenv').config();
const { initAgent } = require('./services/iaService');

async function testAgent() {
    try {
        console.log("Initializing Agent...");
        const agent = await initAgent();
        console.log("Agent initialized successfully.");

        // Optional: We could try to invoke it, but that might consume quotas or require more setup.
        // Just checking initialization confirms the syntax and MongoDB connection setup are likely correct.
    } catch (error) {
        console.error("Failed to initialize agent:", error);
        process.exit(1);
    }
}

testAgent();
