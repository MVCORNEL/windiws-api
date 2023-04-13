//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
/**
 * Higher level function that takes another asyncfunction as a parameter, used to propagate further the error,
 * within a promise into the error handling middleware.
 * This function will be used as a wrapper function for any asynchronous router handler middleware
 *
 * @param {function} fn expects a function, more specific any asynchronous middlware handler
 *
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => next(error));
  };
};

module.exports = catchAsync;
