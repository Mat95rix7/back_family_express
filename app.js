require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const path = require('path');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 8000;
const EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const personRoutes = require('./routes/personRoutes');
const familleRoutes = require('./routes/familleRoutes');

const app = express();

app.use(corsMiddleware);

app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin, Access-Control-Request-Headers');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/personnes', personRoutes);
app.use('/api/familles', familleRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    let displayUrl;
    let environmentDescription;
    if (process.env.NODE_ENV === 'production' && EXTERNAL_URL) {
      displayUrl = EXTERNAL_URL;
      environmentDescription = 'en production (Render)';
    } else {
      displayUrl = `http://localhost:${PORT}`;
      environmentDescription = 'en développement local';
    }
    console.log(`API Express + MySQL ${environmentDescription} disponible sur : ${displayUrl}`);
  });
}).catch(err => {
  console.error('Erreur lors de la synchronisation Sequelize ou du démarrage du serveur :', err);
});
