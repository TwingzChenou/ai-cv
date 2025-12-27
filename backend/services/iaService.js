require('dotenv').config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { DynamicTool } = require("@langchain/core/tools");
const { unifiedSearch } = require("./searchService");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");

// 1. Définition du modèle Chat (Gemini Pro)
const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.5-flash",
    maxOutputTokens: 2048,
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
    streaming: true // Important pour le streaming
});

// 2. Définition des outils (Tools)
const searchTool = new DynamicTool({
    name: "search_quentin_info",
    description: "Recherche des informations spécifiques sur Quentin Forget (CV, parcours, projets, compétences). Utile quand l'utilisateur pose une question factuelle sur Quentin.",
    func: async (query) => {
        try {
            console.log(`🔎 [Tool] Recherche pour : "${query}"`);
            const results = await unifiedSearch(query);

            if (!results || results.length === 0) {
                return "Aucune information trouvée.";
            }

            return JSON.stringify(results.map(r => ({
                source: r.source,
                title: r.title,
                content: r.content
            })));
        } catch (error) {
            console.error("❌ Erreur outil search:", error);
            return "Erreur lors de la recherche.";
        }
    },
});

const tools = [searchTool];

// 3. Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
    ["system", `Tu es l'assistant virtuel de Quentin Forget.
Ton but est de répondre aux recruteurs et visiteurs sur son parcours, ses compétences et ses projets.
RÈGLES :
- Utilise l'outil 'search_quentin_info' pour les questions sur Quentin.
- Ne pas inventer d'informations.
- Sois professionnel et sympathique.`],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
]);

// 4. Initialisation de l'Agent
let agentExecutor = null;

async function initAgent() {
    if (agentExecutor) return agentExecutor;

    const agent = await createToolCallingAgent({
        llm: model,
        tools,
        prompt,
    });

    agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
    });

    return agentExecutor;
}

/**
 * Générateur asynchrone pour le streaming de la réponse de l'agent.
 * @param {string} userMessage 
 * @param {Array} history 
 */
/**
 * Fonction asynchrone pour interroger l'agent (réponse complète)
 * @param {string} userMessage 
 * @param {Array} history 
 */
async function askAgent(userMessage, history = []) {
    try {
        const executor = await initAgent();

        // Conversion de l'historique
        const chatHistory = history.map(msg =>
            msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        );

        console.log(`🤖 [Agent] Début traitement : "${userMessage}"`);

        const result = await executor.invoke({
            input: userMessage,
            chat_history: chatHistory
        });

        // result.output contient la réponse finale
        return result.output;

    } catch (error) {
        console.error("❌ Erreur Agent:", error);
        return "Désolé, une erreur est survenue lors du traitement de votre demande.";
    }
}

module.exports = { askAgent };
