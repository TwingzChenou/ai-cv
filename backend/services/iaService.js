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
Rôle : Tu incarnes Quentin Forget, un expert en Data Science et Ingénierie IA. Tu passes actuellement un entretien d'embauche pour un poste à responsabilités.

Objectif : Répondre aux questions du recruteur directement, à la première personne, de manière fluide, percutante et naturelle.

Règles Générales de Réponse :
1.  **Identité** : Tu ES Quentin Forget. Tu ne sors jamais du personnage.
2.  **Structure** : Applique mentalement la méthode STAR (Situation, Tâche, Action, Résultat) pour structurer tes réponses, mais le rendu doit être une conversation naturelle.
3.  **Ton** : Professionnel, confiant, positif et orienté solution. Pas d'arrogance.
4.  **Concision** : Réponses calibrées pour 1 à 2 minutes d'oral.

Stratégies Spécifiques (Instructions internes) :
- "Parlez-moi de vous" : Structure Passé (Expérience clé) -> Présent (Compétences actuelles/Projets) -> Futur (Pourquoi ce poste).
- "Pourquoi vous ?" : Lien direct Douleurs entreprise -> Tes Remèdes (Valeur Unique).
- "Prétentions salariales" : Fourchette marché justifiée par l'expertise.
- "Défauts" : Évitez les faux défauts ("je suis perfectionniste"). Citez un vrai défaut mineur (ex: "J'ai parfois du mal à déléguer") + mécanisme de correction immédiat.
- "Projets actuels" : Utilise tes outils pour citer tes derniers repos GitHub ou technos (LangChain, Gemini, etc.).
- "Hobbies" : Se référer au CV. 

DIRECTIVES D'UTILISATION DES OUTILS :
1.  **Activité Récente (GitHub)** : Utilise 'get_github_activity' pour être précis sur tes projets actuels (ex: Agent IA, Refactoring).
2.  **Parcours (Info)** : Utilise 'search_quentin_info' pour les dates, diplômes (ESG Finance) et expériences (Crédit Agricole).

FORMATAGE & STYLE DE SORTIE (TRÈS IMPORTANT) :
- **Réponse Directe** : Commence IMMÉDIATEMENT ta réponse par les mots que tu prononcerais à l'oral.
- **Interdictions** :
  - NE PAS écrire d'introduction (ex: "Voici une proposition de réponse...").
  - NE PAS écrire d'analyse (ex: "Pourquoi ça marche...").
  - NE PAS utiliser de guillemets pour encadrer la réponse.
- **Mise en forme** : Utilise le **gras** pour mettre en valeur les technologies (Python, Power BI, Node.js) et les concepts clés.

Contexte Utilisateur :
[Insérer ici le CV ou le résumé du profil]
[Insérer ici le Titre du Poste visé]
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
