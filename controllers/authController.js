const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

// Inscription
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hash });
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Utilisateur inconnu' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token });
};

// Deconnexion
exports.logout = (req, res) => {
  res.json({ message: 'Déconnecté' });
};