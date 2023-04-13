//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const dotenv = require('dotenv');
const express = require('express');
const OperationalError = require('./utils/operationalError');
const globalErrorHandler = require('./controller/errorController');
const userRouter = require('./routes/userRouter');

//Setup Config variables.
dotenv.config({ path: './config.env' });
//Create Server.
const app = express();

//Body parser - Takes data coming from the user and puts in in the body of the request object (15 KB LIMIT).
app.use(express.json({ limit: '15kb' }));
app.use('/api/v1/users', userRouter);

//Unhadled routes, if the code reaches this point it means that the desired route doesn't exit (all stands for all http methods, while * stand for any route)
app.all('*', (req, res, next) => {
  //Propagate the error further, when the next function is called with an argument express knows that this in a Error which ->
  //applies for all middleware, anywhere in the app. Forcing the code to skip all the middlewares from the stack, directly to the erorr handling middleware.
  next(new OperationalError(`The page is not available ${req.originalUrl} `));
});

//Out of the box, Express error handler middleware
app.use(globalErrorHandler);

module.exports = app;
