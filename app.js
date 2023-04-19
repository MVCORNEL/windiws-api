//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const dotenv = require('dotenv');
const express = require('express');
const OperationalError = require('./utils/operationalError');
const globalErrorHandler = require('./controller/errorController');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

//Setup Config variables.
dotenv.config({ path: './config.env' });
//Create Server.
const app = express();

//Morgan -> only in development process will reqturn query details
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Implement CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

//Body parser - Takes data coming from the user and puts in in the body of the request object (15 KB LIMIT).
app.use(express.json({ limit: '15kb' }));
//Cookie Parser - parses data from cookie
app.use(cookieParser());

//Serv static images within the public file folder
app.use(express.static(path.join(__dirname, 'public/images/products')));
//Serve the product images to the client
app.get('/public/images/products/:path', function (req, res) {
  res.download('./public/images/products/' + req.params.path);
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);

//Unhadled routes, if the code reaches this point it means that the desired route doesn't exit (all stands for all http methods, while * stand for any route)
app.all('*', (req, res, next) => {
  //Propagate the error further, when the next function is called with an argument express knows that this in a Error which ->
  //applies for all middleware, anywhere in the app. Forcing the code to skip all the middlewares from the stack, directly to the erorr handling middleware.
  next(new OperationalError(`The page is not available ${req.originalUrl} `));
});

//Out of the box, Express error handler middleware
app.use(globalErrorHandler);

module.exports = app;
