const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', personController.getAll);
router.get('/:id', auth, personController.getOne);
router.delete('/:id', auth, isAdmin, personController.delete);
router.post('/', auth, isAdmin, upload.single('photo'), personController.create);
router.put('/:id', auth, isAdmin, upload.single('photo'), personController.update);


// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

module.exports = router;