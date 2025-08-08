const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', cartController.getMyCart);
router.post('/add', cartController.addItem);
router.post('/update', cartController.updateItem);
router.post('/clear', cartController.clearCart);

module.exports = router;