//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const dotenv = require('dotenv');
const express = require('express');
const OperationalError = require('./utils/operationalError');
const globalErrorHandler = require('./controller/errorController');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const reviewRouter = require('./routes/reviewRouter');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
//security layer
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
//Setup Config variables.
dotenv.config({ path: './config.env' });
//Create Server.
const app = express();

//Morgan -> only in development process will reqturn query details
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

//2.1 RATE LIMITER
const limiter = rateLimit({
  //300 request per hour
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, please try again in an hour',
});

//We want to apply the limiter only to the /api routes in case the would an extension of the app with server resources
app.use('/api', limiter);

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
//DATA SANITIZATION against NoSQL query Injection
//The aboce function reads our data into requset.body and only after we can clean
app.use(mongoSanitize());
//Clean any user input from malicious html code and javascript
app.use(xss());

//Serv static images within the public file folder
app.use(express.static(path.join(__dirname, 'public/images/products')));
app.use(express.static(path.join(__dirname, 'public/images/users')));

//Serve the product images to the client
app.get('/public/images/products/:path', function (req, res) {
  res.download('./public/images/products/' + req.params.path);
});
app.get('/public/images/users/:path', function (req, res) {
  res.download('./public/images/users/' + req.params.path);
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);

//Unhadled routes, if the code reaches this point it means that the desired route doesn't exit (all stands for all http methods, while * stand for any route)
app.all('*', (req, res, next) => {
  //Propagate the error further, when the next function is called with an argument express knows that this in a Error which ->
  //applies for all middleware, anywhere in the app. Forcing the code to skip all the middlewares from the stack, directly to the erorr handling middleware.
  next(new OperationalError(`The page is not available ${req.originalUrl} `));
});

//Out of the box, Express error handler middleware
app.use(globalErrorHandler);

module.exports = app;
