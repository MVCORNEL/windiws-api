//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const express = require('express');
const {
  singupUser,
  loginUser,
  forgotUserPassword,
  resetPassword,
  logout,
  protectRoute,
} = require('../controller/authHandler');
const { updateMyAccount, getMyAccount } = require('../controller/userHandler');
const router = express.Router();

//Authentification route defition resources, used to map authentification handlers
router.post('/signup', singupUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.post('/forgotPassword', forgotUserPassword);
router.patch('/resetPassword/:token', resetPassword);
//Logged in user route mounting, protected routes
router.patch('/updateMe', protectRoute, updateMyAccount);
router.get('/getMe', protectRoute, getMyAccount);

module.exports = router;
