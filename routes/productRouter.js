const express = require('express');
const { getProduct, getAllProducts } = require('./../controller/productHandler');

//Product route defition resoruces, used to map product query handlers
const router = express.Router();

router.get('/:id', getProduct);
router.get('/', getAllProducts);

module.exports = router;
