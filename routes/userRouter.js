const express = require('express');
const { singupUser, loginUser } = require('../controller/authHandler');

const router = express.Router();

//Authentification route defition resources, used to map authentification handlers
router.post('/signup', singupUser);
router.post('/login', loginUser);

module.exports = router;
