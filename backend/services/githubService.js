const { Octokit } = require("@octokit/rest");
require('dotenv').config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Récupère l'activité récente (commits et langages) de l'utilisateur TwingzChenou.
 * @returns {Promise<string>} Résumé formaté de l'activité.
 */
async function getLatestActivity() {
    try {
        const username = "TwingzChenou";
        // console.log(`🐙 [GitHub] Récupération de l'activité pour ${username}`);

        // 1. Récupérer les événements récents (Commits)
        const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
            username,
            per_page: 20
        });

        const pushEvents = events.filter(event => event.type === 'PushEvent');
        let recentCommits = [];

        for (const event of pushEvents) {
            const repoName = event.repo.name;
            const date = new Date(event.created_at).toLocaleDateString('fr-FR');

            // Les commits sont dans l'ordre chronologique dans le payload, on les inverse pour avoir les plus récents
            const commits = event.payload.commits ? [...event.payload.commits].reverse() : [];

            for (const commit of commits) {
                if (recentCommits.length >= 5) break;
                recentCommits.push({
                    repo: repoName,
                    message: commit.message,
                    date: date
                });
            }
            if (recentCommits.length >= 5) break;
        }

        // 2. Récupérer les langages des répos récemment mis à jour
        const { data: repos } = await octokit.rest.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 5
        });

        const distinctLanguages = [...new Set(repos.map(r => r.language).filter(l => l))];

        // Formatage de la réponse
        let output = `📅 **Activité Récente de Quentin (${username})**\n\n`;

        output += `💻 **Langages principaux récents** : ${distinctLanguages.join(', ')}\n\n`;

        output += `🚀 **Derniers Commits** :\n`;
        if (recentCommits.length === 0) {
            output += "Aucun commit public récent trouvé.\n\n";
        } else {
            recentCommits.forEach(c => {
                output += `- [${c.date}] **${c.repo}** : "${c.message}"\n`;
            });
            output += "\n";
        }

        // Ajout explicite des projets récents
        output += `📂 **Projets Récents (Repositories)** :\n`;
        if (repos.length === 0) {
            output += "Aucun dépôt public trouvé.\n";
        } else {
            repos.forEach(repo => {
                const description = repo.description ? repo.description : "Pas de description";
                output += `- **${repo.name}** (${repo.language || 'N/A'}) : ${description}\n`;
                output += `  🔗 [Voir le code](${repo.html_url})\n`;
            });
        }

        return output;

    } catch (error) {
        console.error("❌ Erreur GitHub:", error.message);
        return `Erreur lors de la récupération de l'activité GitHub : ${error.message}`;
    }
}

module.exports = { getLatestActivity };
