require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const path = require('path');
const sequelize = require('./config/db');

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
app.use('/uploads/photos', express.static(path.join(__dirname, '../uploads/photos')));
app.use('/api/personnes', personRoutes);
app.use('/api/familles', familleRoutes);

sequelize.sync().then(() => {
  app.listen(8000, '0.0.0.0', () => {
    console.log('API Express + MySQL sur http://localhost:8000');
  });
});
