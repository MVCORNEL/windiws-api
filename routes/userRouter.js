const express = require('express');
const { singupUser, loginUser, forgotUserPassword } = require('../controller/authHandler');

const router = express.Router();

//Authentification route defition resources, used to map authentification handlers
router.post('/signup', singupUser);
router.post('/login', loginUser);
router.patch('/forgotPassword', forgotUserPassword);

module.exports = router;
