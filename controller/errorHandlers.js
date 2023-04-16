//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const OperationalError = require('../utils/operationalError');

//TYPES OF MONGOOSE ERRORS -> WILL RETURN A NEW OPERATIONAL ERROR
/**
 * Function use to create an OperationalError, providing a human friendly message
 * Called when the dabase id of an entity doesn't exist
 * @param {object} err instance of Error class
 * @returns OperationalError object
 */
exports.handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  //400 stands for bad request
  return new OperationalError(message, 400);
};

/**
 * Function use to create an OperationalError, providing a human friendly message
 * Called when trying to insert a dabase field that is supposed to be unique but it is not
 * @param {object} err instance of Error class
 * @returns OperationalError object
 */
exports.handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${Object.keys(err.keyValue).join('-')}. Please use another value`;
  return new OperationalError(message, 400);
};

/**
 * Function use to create an OperationalError, providing a human friendly message
 * Called when field validation within the mongoose schema fails.
 * @param {object} err instance of Error class
 * @returns OperationalError object
 */
exports.handleValidationErrorDB = (err) => {
  //Object.values() return an array of the given objects
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input dataset. ${errors.join('. ')}`;
  return new OperationalError(message, 400);
};
