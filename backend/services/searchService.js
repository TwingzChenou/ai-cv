require('dotenv').config();
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let client;

/**
 * Ensures a connection to the MongoDB database.
 * Auto-connects if the client is not initialized.
 * @returns {Promise<import("mongodb").Db>} The MongoDB database instance.
 */
async function getDb() {
    if (!client) {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        console.log("🔌 Connected to MongoDB for Search Service");
    }
    return client.db("sample_mflix");
}

/**
 * Searches both the 'cv_content' and 'projects' collections for the given query.
 * Uses Gemini 'text-embedding-004' to vectorise the query and performs parallel searches.
 * 
 * @param {string} query - The user's search query.
 * @returns {Promise<Array>} - Merged and sorted list of results.
 */
async function unifiedSearch(query) {
    try {
        const db = await getDb();
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        // 1. Generate Embedding for the query
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;

        // 2. Define Pipelines for Parallel Vector Search

        // Pipeline for CV Collection
        const pipelineCV = [
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: embedding,
                    numCandidates: 20, // Fetch more candidates for better accuracy
                    limit: 3 // Return top 3 from CV
                }
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    content: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ];

        // Pipeline for Projects Collection
        const pipelineProjects = [
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: embedding,
                    numCandidates: 20,
                    limit: 3 // Return top 3 from Projects
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    description: 1,
                    technologies: 1, // Assuming this field exists or similar
                    language: 1,
                    html_url: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ];

        // Execute searches in parallel
        const [cvResults, projectResults] = await Promise.all([
            db.collection("cv_content").aggregate(pipelineCV).toArray(),
            db.collection("projects").aggregate(pipelineProjects).toArray()
        ]);

        // 3. Merge and Format Results
        const formattedCvResults = cvResults.map(doc => ({
            source: 'cv',
            title: doc.title,
            content: doc.content,
            score: doc.score
        }));

        const formattedProjectResults = projectResults.map(doc => ({
            source: 'project',
            title: doc.name,
            content: doc.description,
            meta: {
                language: doc.language,
                url: doc.html_url
            },
            score: doc.score
        }));

        // Combine and Sort by Score (descending)
        const combinedResults = [...formattedCvResults, ...formattedProjectResults]
            .sort((a, b) => b.score - a.score);

        return combinedResults;

    } catch (error) {
        console.error("❌ Error in unifiedSearch:", error);
        throw error;
    }
}

module.exports = { unifiedSearch };
