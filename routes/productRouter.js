const express = require('express');
const {
  getProduct,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} = require('./../controller/productHandler');

//Product route defition resoruces, used to map product query handlers
const router = express.Router();

router.route('/:id').get(getProduct).patch(updateProduct).delete(deleteProduct);
router.route('/').get(getAllProducts).post(createProduct);

module.exports = router;
