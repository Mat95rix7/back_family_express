const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
      const user = await User.findByPk(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé - Admin requis' });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

  
