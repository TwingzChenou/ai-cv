require('dotenv').config();
const express = require('express');
const cors = require('cors');


const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const iaRoutes = require('./routes/iaRoutes');

// Sécurité : Headers HTTP sécurisés
app.use(helmet());

// Sécurité : Rate Limiting (30 requêtes / heure par IP sur l'API IA)
const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 30, // Limite à 30 requêtes par IP
    message: { "error": "Trop de requêtes. Quentin n'est pas une machine (enfin, presque) ! Réessayez plus tard." },
    standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

// Appliquer le rate limit uniquement aux routes API IA
app.use('/api/ia', apiLimiter);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());

// Routes
app.use('/api/ia', iaRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
