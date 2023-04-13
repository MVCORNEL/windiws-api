/**
 * Operational error class representing predictable erros, that might happen at a given point.
 */
class OperationalError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    //400 status code represents fail operation
    //500 status code represents error
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    //Feedback to the user will be send only if the error is an operational error
    this.isOperational = true;
    //Capturing the stack trace, that will show us where the error firstly occured
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = OperationalError;
