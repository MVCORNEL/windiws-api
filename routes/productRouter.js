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

const router = express.Router();

router
  .route('/:id')
  .get(getProduct)
  .patch(protectRoute, uploadImageInMemory, updateProduct)
  .delete(protectRoute, deleteProduct);
router.route('/').get(getAllProducts).post(protectRoute, uploadImageInMemory, createProduct);

module.exports = router;
