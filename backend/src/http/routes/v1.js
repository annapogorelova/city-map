var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');

var authController = require('../controllers/authController');
var usersController = require('../controllers/usersController');

router.post('/auth/token', authController.getAuthToken);

router.post('/auth/register', authController.createUser);

router.get('/users/:id', auth.verifyToken, usersController.getUser);

module.exports = router;