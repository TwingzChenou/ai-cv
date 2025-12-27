require('dotenv').config();
const { Octokit } = require("@octokit/rest");

console.log("--- Début du script ---");
console.log("Token présent dans .env :", process.env.GITHUB_TOKEN ? "OUI" : "NON");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

octokit.rest.users.getAuthenticated()
    .then(({ data }) => {
        console.log("✅ Connecté en tant que :", data.login);
    })
    .catch(err => {
        console.error("❌ Erreur :", err.message);
    })
    .finally(() => {
        console.log("--- Fin du script ---");
    });