//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const express = require('express');
const { singupUser, loginUser, forgotUserPassword, resetPassword } = require('../controller/authHandler');

const router = express.Router();

//Authentification route defition resources, used to map authentification handlers
router.post('/signup', singupUser);
router.post('/login', loginUser);
router.post('/forgotPassword', forgotUserPassword);
router.patch('/resetPassword/:token', resetPassword);

module.exports = router;
