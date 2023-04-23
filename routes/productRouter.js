const express = require('express');
const {
  getProduct,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} = require('./../controller/productHandler');
const { protectRoute } = require('./../controller/authHandler');

//Load the img on the requ object
const { uploadImageInMemory } = require('../utils/imageProcessor');

//Product route defition resoruces, used to map product query handlers
const router = express.Router();

router.route('/:id').get(getProduct).patch(protectRoute, updateProduct).delete(protectRoute, deleteProduct);
router.route('/').get(protectRoute, getAllProducts).post(protectRoute, uploadImageInMemory, createProduct);
//upload.single('image')

module.exports = router;
