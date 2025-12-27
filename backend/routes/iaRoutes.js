const express = require('express');
const router = express.Router();
const { askAgent } = require('../services/iaService');

router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: "Aucun message reçu" });
        }

        const lastMessage = messages[messages.length - 1].content;

        // SÉCURITÉ : Validation de la longueur du message
        if (lastMessage.length > 500) {
            return res.status(400).json({ error: "Message trop long (max 500 caractères)." });
        }

        const history = messages.slice(0, -1);

        console.log(`[Chat] Début génération pour: "${lastMessage}"`);

        // Appel standard (non-streaming)
        const response = await askAgent(lastMessage, history);

        res.json({ response });

    } catch (error) {
        console.error("Erreur route /chat:", error);

        // SÉCURITÉ : Pas de stacktrace en production
        if (process.env.NODE_ENV === 'production') {
            res.status(500).json({ error: "Une erreur est survenue." });
        } else {
            res.status(500).json({ error: error.message || "Erreur interne du serveur" });
        }
    }
});

module.exports = router;
