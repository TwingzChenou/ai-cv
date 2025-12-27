const { unifiedSearch } = require('./services/searchService');

async function test() {
    const query = "machine learning and python projects";
    console.log(`🔍 Testing Unified Search.... Query: "${query}"`);
    console.log("---------------------------------------------------");

    try {
        const start = Date.now();
        const results = await unifiedSearch(query);
        const duration = Date.now() - start;

        console.log(`✅ Search completed in ${duration}ms`);
        console.log(`📊 Found ${results.length} results:`);

        results.forEach((res, i) => {
            console.log(`\n[${i + 1}] [${res.source.toUpperCase()}] Score: ${res.score.toFixed(4)}`);
            console.log(`    Title: ${res.title}`);
            console.log(`    Content: ${res.content.substring(0, 100)}...`); // Truncate for display
            if (res.meta) {
                console.log(`    Meta: ${JSON.stringify(res.meta)}`);
            }
        });

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        // We forcibly exit because the service keeps the MongoDB connection open
        console.log("\n---------------------------------------------------");
        console.log("Test finished.");
        process.exit(0);
    }
}

test();
