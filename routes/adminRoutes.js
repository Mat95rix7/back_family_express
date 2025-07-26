const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const adminController = require('../controllers/adminController');

// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

router.get('/stats', auth, isAdmin, adminController.stats);
router.get('/users', auth, isAdmin, adminController.users);
router.put('/users/:id', auth, isAdmin, adminController.updateUser);
router.delete('/users/:id', auth, isAdmin, adminController.deleteUser);
router.post('/users', auth, isAdmin, adminController.createUser);


module.exports = router;