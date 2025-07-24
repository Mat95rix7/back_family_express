const express = require('express');
const router = express.Router();
const familleController = require('../controllers/familleController');
const auth = require('../middlewares/auth');

// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

router.get('/', auth, familleController.getHommesMaries);
router.get('/:pereId', auth, familleController.getFamilleByHommeMarie);

module.exports = router;