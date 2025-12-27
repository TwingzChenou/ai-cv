const langchain = require('langchain');
console.log('Keys in langchain:', Object.keys(langchain));
try {
    const agents = require('langchain/agents');
    console.log('Agents loaded:', Object.keys(agents));
} catch (e) {
    console.error('Error loading langchain/agents directly:', e.message);
}
