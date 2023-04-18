const express = require('express');
const {
  getProduct,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} = require('./../controller/productHandler');

//Load the img on the requ object
const { uploadImageInMemory } = require('../utils/imageProcessor');

//Product route defition resoruces, used to map product query handlers
const router = express.Router();

router.route('/:id').get(getProduct).patch(updateProduct).delete(deleteProduct);
router.route('/').get(getAllProducts).post(uploadImageInMemory, createProduct);
//upload.single('image')

module.exports = router;
