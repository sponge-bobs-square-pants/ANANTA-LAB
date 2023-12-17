const express = require('express');
const { LoginUser, CreateUser } = require('../Controllers/User');
const router = express.Router();

router.route('/login').post(LoginUser);
router.route('/createUser').post(CreateUser);

module.exports = router;
