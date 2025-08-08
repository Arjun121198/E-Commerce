const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/login', authController.login);
router.post('/sign-up', userController.signUp);

module.exports = router;