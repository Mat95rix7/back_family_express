module.exports = (req, res, next) => {
  console.log('user = ', req.user);
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
};