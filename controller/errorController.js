//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const { handleCastErrorDB, handleDuplicateFieldsDB, handleValidationErrorDB } = require('./errorHandlers');

//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
//Two types of errors, Operational Error and Progamming Error.
//Operation Errors are predicable error.
//Programming Error difficult to find and overcome, programmer fault errors.

/**
 * Function used to send an error message to the developer when the appliation is in development, and someting goes wrong
 * The message will include the staus of the erorr, the errror itself, the error message ->
 * but also the stack trace that shows where the error firsly occurred.
 * @param {object} err Error class object
 * @param {object} res expects a response object
 */
const sendErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Function used to send error message to the client when the application is in the production phase
 * If the error is a programming error or an unknown error the message will be a generic message,
 * otherwise extra details about the error will be discolsed to the client
 * @param {object} err Error class object
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 */
const sendErrorProduction = (err, req, res) => {
  //Only the operational erorr will be send in production.Trusted errors.
  if (err.isOperational) {
    //1 LOG ERROR -> When the app will be deployed by using heroku...will have access to the logs
    console.error('Error ', err);
    res.status(err.statusCode).json({
      status: err?.status,
      message: err.message,
    });
  }
  //Programming or other unknown error, do not expose the details to the client
  else {
    //On heroku, this will provide access to the error logs
    //Send a generic message, for non operational errors
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

/**
 * Global error handler function, that is used to handle all errors that are propagated into the global error middleware, this handler will be mounted at the app.
 * If the project is in developlment phase the @function sendErrorDevelopment will be used to provide details about the errors
 * If the project is in production phase the @function sendErrorProduction will be used to provide details about the errors to the client (but not disclosing sensitive data)
 * @param {object} err instance of Error class
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to no navigate to the next middlewre
 */
module.exports = (err, req, res, next) => {
  //All operational error have a status code, that is defined on OperationError objects.
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, res);
  }
  //PRODUCTION
  if (process.env.NODE_ENV === 'production') {
    //Operational errors and mongoose errors handled only in production by sending meaningful message to the client (in dev we present the stack)
    let error = { ...err };
    error.message = err.message; //work around because the message doesnt appear otherwise
    //MONGOOSE ERRORS
    //1 CAST ERROR -> (Mongoose invalid id Error)
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    //2 DUPLICATE DATA FIELD SET  -> (MongoDB Driver Error) -> trying to create duplicate fields on mongo db that were supposed to be unique
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    //3 VALIDATION ERROR -> (Mongoose ERROR)
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProduction(error, req, res);
  }
};
