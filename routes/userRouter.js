//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const express = require('express');
const {
  singupUser,
  loginUser,
  forgotUserPassword,
  resetPassword,
  logout,
  protectRoute,
  restrictAdmin,
} = require('../controller/authHandler');
const {
  updateMyAccount,
  getMyAccount,
  deleteMyAccount,
  getAllUsers,
  updateUser,
  deleteUser,
  createUser,
  getUser,
} = require('../controller/userHandler');
const { uploadImageInMemory } = require('../utils/imageProcessor');
const router = express.Router();

//Authentification route defition resources, used to map authentification handlers
router.post('/signup', singupUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.post('/forgotPassword', forgotUserPassword);
router.patch('/resetPassword/:token', resetPassword);
//Logged in user route mounting, plus their layer of protection
router.patch('/updateMe', protectRoute, uploadImageInMemory, updateMyAccount);
router.get('/getMe', protectRoute, getMyAccount);
router.delete('/deleteMe', protectRoute, deleteMyAccount);
//Admin users
router.use(protectRoute, restrictAdmin);
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
