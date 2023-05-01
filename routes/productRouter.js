const express = require('express');
const {
  getProduct,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} = require('./../controller/productHandler');
const { protectRoute, restrictAdmin } = require('./../controller/authHandler');
//Load the img on the requ object
const { uploadImageInMemory } = require('../utils/imageProcessor');

const router = express.Router();

router
  .route('/:id')
  .get(getProduct)
  .patch(protectRoute, restrictAdmin, uploadImageInMemory, updateProduct)
  .delete(protectRoute, restrictAdmin, deleteProduct);
router.route('/').get(getAllProducts).post(protectRoute, restrictAdmin, uploadImageInMemory, createProduct);

module.exports = router;
