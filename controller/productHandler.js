const Product = require('../model/productModel');
const {
  createDocument,
  getDocument,
  getAllDocuments,
  deleteDocument,
  updateDocument,
} = require('./factoryCRUDHandler');

exports.getProduct = getDocument(Product);

/**
 * Middleware function used query the database for produts, and send the respomnse as JSON to the client
 */
exports.getAllProducts = getAllDocuments(Product);

/**
 * Middleware function used to create a new product document entry based on the user information passed into the body request object.
 */
exports.createProduct = createDocument(Product, 'products');
/**
 * Middleware function used to delete  product document entry based on a user id
 */
exports.deleteProduct = deleteDocument(Product);

/**
 * Middleware function used to update product document entry based on a user id and its field passed into the request body.
 */
exports.updateProduct = updateDocument(Product, 'products');
