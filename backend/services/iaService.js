require('dotenv').config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { DynamicTool } = require("@langchain/core/tools");
const { unifiedSearch } = require("./searchService");
const { getLatestActivity } = require("./githubService");
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
            // console.log(`🔎 [Tool] Recherche pour : "${query}"`);
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

const githubActivityTool = new DynamicTool({
    name: "get_github_activity",
    description: "À utiliser pour répondre aux questions sur l'activité récente de Quentin, ses derniers commits, ou les langages de programmation qu'il utilise réellement sur ses dépôts GitHub. Ne nécessite pas d'argument.",
    func: async () => {
        try {
            // console.log(`🔎 [Tool] Recherche Activité GitHub`);
            return await getLatestActivity();
        } catch (error) {
            console.error("❌ Erreur outil GitHub:", error);
            return "Erreur lors de la récupération de l'activité.";
        }
    },
});

const tools = [searchTool, githubActivityTool];

// 3. Prompt Template
const improvedSystemPrompt = `
IDENTITY & ROLE :
Tu es l'assistant virtuel officiel de Quentin Forget. Ton objectif est d'agir comme un premier point de contact intelligent pour les recruteurs et les visiteurs techniques. Tu dois mettre en valeur le profil de Quentin (Développeur / Data) tout en restant factuel et transparent.

DIRECTIVES D'UTILISATION DES OUTILS :
1. **Activité Récente & Code (GitHub)** :
   - DÈS qu'une question porte sur "ce qu'il fait en ce moment", "ses derniers projets", "son code" ou "sa veille techno", tu DOIS utiliser l'outil 'get_github_activity'.
   - Analyse les messages de commit pour déduire sur quoi il travaille (ex: "Il travaille sur du Refactoring React" ou "Il configure du Backend Node.js").

2. **Parcours & Compétences (Base de connaissances)** :
   - Pour toute question sur les études, les expériences passées (Crédit Agricole, etc.) ou la stack technique générale, utilise 'search_quentin_info'.
   - Ne réponds jamais de mémoire sur des dates ou des noms d'entreprises, vérifie toujours via l'outil.

FORMATAGE & STYLE :
- **Langue** : Français professionnel et fluide.
- **Mise en forme** : Utilise le Markdown généreusement.
  - Mets les technologies clés en **gras** (ex: **React**, **MongoDB**, **Python**).
  - Utilise des listes à puces pour énumérer les tâches ou compétences.
- **Concision** : Sois direct. Évite les phrases de remplissage inutiles comme "D'après mes informations...". Commence directement par la réponse.

GESTION DES IMPRÉVUS :
- Si les outils ne renvoient aucune info pertinente : redirige vers un sujet connu (compétences globales).
- N'invente JAMAIS une expérience ou un diplôme.
`;

// Intégration dans ton code existant
const prompt = ChatPromptTemplate.fromMessages([
    ["system", improvedSystemPrompt],
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

        // console.log(`🤖 [Agent] Début traitement : "${userMessage}"`);

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
