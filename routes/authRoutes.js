const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;