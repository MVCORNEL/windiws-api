//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const User = require('../model/userModel');
const createJWT = require('../utils/jwt');
const catchAsync = require('./../controller/catchAsync');
const OperationalError = require('../utils/operationalError');

/**
 * Function used to create a JWT TOKEN based on a user id as payload, expiring time, and some headers options.
 * The JWT Token will be embeded into response object cookie and sent back to the client
 * Jwt token is created by calling @function createJWT
 * @param {object} user expects an user schema object
 * @param {number} statusCode expects a status code
 * @param {function} expects a response object
 */
const createSendToken = (user, statusCode, res) => {
  const JSON_TOKEN_EXPIRING_TIME_IN_DAYS = process.env.JSON_TOKEN_EXPIRING_TIME_IN_DAYS;
  const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
  //1 Create JWT token with the payload of user's id
  const token = createJWT(user._id);
  //2 Create COOKIE OPTION
  const cookieOptions = {
    expires: new Date(Date.now() + JSON_TOKEN_EXPIRING_TIME_IN_DAYS * DAY_IN_MILLISECONDS),
    //Prevents the cookie to be accessed or modified in any way by the browser. Prvents XSS cross scripting attacks.(HTTP FLAG)
    httpOnly: true,
  };
  //3 Secure flag used only in production allows cookies to be sent over HTTPS.Only in production otherwise won't work in development
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  //4 Set the cookie on the response object
  res.cookie('jwt', token, cookieOptions);
  //5 set response to the user
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**
 * Middleware function used to login a user, based on the  data provided into the request object.
 * If the credentials are correct user data will be fetch from the db,
 * and based on that a JWT token will be created and sent back to the user though a cookie header by calling the @function createSendToken
 *
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function taht will be used to no navigate to the enxt middlewre
 */
exports.loginUser = catchAsync(async (req, res, next) => {
  //1 Check if the email and if the password exist.
  const { email, password } = req.body;
  if (!email) {
    return next(new OperationalError('Please provide an email'));
  }
  if (!password) {
    return next(new OperationalError('Please provide a password'));
  }

  //2 Query the user details by its email and select(PROJECTION BY FIELD) only the field required (NOT DISCLOSING OTHER USER DATA)
  const user = await User.findOne({ email: email }).select('+password');

  //3 Check if the email is exists into the DB and matched the provided password into a single step.
  //Avoid doing this in 2 steps like checking first if the user is correct and only after if the password match with the user->
  //as that we might give extra info if the email or password is correct.
  //Since the password is ecnrypted there is no way to generate the password back from the hashed password.
  //Use BCRYPT to generate again the hashed password based on the user inputed pass in order to compare the current generate hash with the generated hash stored into the DB.
  //Since this encryption belongs to the data itself, the operation will be carried out in the MODEL CLASS.
  //If the the user doesn't exist the second evalution won't be evalauted
  if (!user || !(await user.isLoginPasswordCorrect(password, user.password))) {
    //401 = Unauthorized
    next(new OperationalError('Email and password do not match'));
  }
  //4 Remove the password from output
  user.password = undefined;
  //5 Create and send JWT and user data to the client
  createSendToken(user, 200, res);
});

/**
 * Middleware function used to create a user account, based on the  data provided into the request object.
 * This function will be used to create the user calling the mongoose model interface create function
 * If the signup process is correct, a user object will result, with a user id user as the JWT payload,
 * and based on that a JWT token will be created and sent back to the user though a cookie header.
 * by calling the @function createSendToken
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function taht will be used to no navigate to the enxt middlewre
 */
//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
exports.singupUser = catchAsync(async (req, res, next) => {
  //Important to avoid using User.create(req.body) -> User can register as an administrator, setting user:"admin" field.
  const createdUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //Remove the password from output -> In schema its projection is false, problem is that it doesn't show up on DB query, but appears when creating a new document
  createdUser.password = undefined;

  //Create and send JWT and user data to the client, 201=Successfully created
  createSendToken(createdUser, 201, res);
});
