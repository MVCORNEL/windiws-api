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
const { updateMyAccount, getMyAccount, deleteMyAccount } = require('../controller/userHandler');
const router = express.Router();

//Authentification route defition resources, used to map authentification handlers
router.post('/signup', singupUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.post('/forgotPassword', forgotUserPassword);
router.patch('/resetPassword/:token', resetPassword);
//Logged in user route mounting, plus their layer of protection
router.patch('/updateMe', protectRoute, updateMyAccount);
router.get('/getMe', protectRoute, getMyAccount);
router.delete('/deleteMe', protectRoute, deleteMyAccount);

module.exports = router;
