const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');

router.use(auth);
router.post('/', orderController.placeOrder);
router.get('/', orderController.myOrders);

module.exports = router;