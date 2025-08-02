const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Op } = require('sequelize');


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Connexion
// exports.login = async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) return res.status(400).json({ error: 'Veuillez fournir un nom d’utilisateur et un mot de passe' });
//   try {
//       const user = await User.findOne({ where: { username } });
//       if (!user) return res.status(401).json({ error: 'Utilisateur inconnu' });

//       const valid = await bcrypt.compare(password, user.password);
//       if (!valid) return res.status(401).json({ error: 'Email/Mot de passe incorrect' });

//       const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

//       res.json({ token });
//   } catch (err) {
//     console.error('Erreur login :', err);
//     return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
//   }
// };

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Validation des champs requis
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Veuillez fournir un email et un mot de passe' 
    });
  }

  // Validation du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Format d\'email invalide' 
    });
  }

  // Validation de la longueur du mot de passe
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Le mot de passe doit contenir au moins 6 caractères' 
    });
  }

  try {
    // Recherche de l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérification du mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ 
      token
    });

  } catch (err) {
    console.error('Erreur login :', err);
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la connexion.' 
    });
  }
};

// Inscription
exports.register = async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) return res.status(400).json({ error: 'Veuillez fournir un nom d’utilisateur, un email et un mot de passe' });
 try {

  const existingUser = await User.findOne({
      where: { 
        [Op.or]: [{ username }, { email }]
      }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Nom d\'utilisateur ou email déjà utilisés.' });
    }
    
  const hash = await bcrypt.hash(password, 10);
  
  const user = await User.create({ username, email, password: hash });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token });
  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur :', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Nom d\'utilisateur ou email déjà utilisés.' });
    }
    return res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
}