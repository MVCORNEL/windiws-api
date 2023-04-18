//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const crypto = require('crypto');
const User = require('../model/userModel');
const createJWT = require('../utils/jwt');
const catchAsync = require('./../controller/catchAsync');
const OperationalError = require('../utils/operationalError');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

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
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.loginUser = catchAsync(async (req, res, next) => {
  //1 Check if the email and if the password exist.
  const { email, password } = req.body;
  if (!email) {
    return next(new OperationalError('Please provide an email address !', 400));
  }
  if (!password) {
    return next(new OperationalError('Please provide a password !', 400));
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
    next(new OperationalError(`Email doesn't match the password`, 401));
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
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
exports.singupUser = catchAsync(async (req, res, next) => {
  //1 Important to avoid using User.create(req.body) -> User can register as an administrator, setting user:"admin" field.
  const createdUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //2 Remove the password from output -> In schema its projection is false, problem is that it doesn't show up on DB query, but appears when creating a new document
  createdUser.password = undefined;
  //3 Create and send JWT and user data to the client, 201=Successfully created
  createSendToken(createdUser, 201, res);
});

/**
 * Middleware function used to send a user a reset password link on his emails address
 * By calling instance @method user.createPasswordResetToken   a random hexadecimal sequence is generated a and it is sent it to the user,
 * the sequence is hashed it with sha256 and stored with its expiration date into the DB.
 * Last step consists in sending an reset email -> TODO
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.forgotUserPassword = catchAsync(async (req, res, next) => {
  //1 Email address is not inserted
  if (!req.body.email) {
    return next(new OperationalError('Email field cannot be empty !', 400)); //400 BAD REQUEST
  }

  //2 Query and get user details based on email address.
  const user = await User.findOne({ email: req.body.email });

  //3 Check if the email is registerd with the DB
  if (!user) {
    return next(new OperationalError("Couldn't find the email address !", 404)); //404 NOT FOUND
  }

  //4 Generate a random reset token and its experitation date, and update the user with them.
  const resetToken = user.createPasswordResetToken();

  //5 Deactivate the evaluation, because the password confirmation is it not any longer on the document.
  await user.save({ validateBeforeSave: false });

  //6 Send the token to the user
  try {
    const resetUrlLink = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    //TODO send user email

    res.status(200).json({
      stats: 'success',
      //Reset link has to be sent to the user through the email, and never here, because we assume the email is a safe service, where only the user has access to.
      resetUrlLink,
    });
  } catch (err) {
    //In case that therte is anything wrong, we don't want to persist the useless information to the database
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpireDate = undefined;
    //Deactivare validation because the passowrd is not any longer on the queried document.
    await user.save({ validateBeforeSave: false }); // save the change because createPasswordResetToken persists modified data into db.
    return next(new OperationalError('There was an error sening the email. Try again later'), 500); //500 Internal Server Error
  }
});

/**
 * Middleware function used to reset the current user password, and login the user afterwards with  JWT
 * The client must provide a new password and its confirmation. Token will be embeded in the current link address as :token param.
 * By calling instance @function user.createSendToken   after the user successfully reset the password in order log the user in
 * Update passwordChangedAt -> TODO
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the user details from the db, linked with the forgotten password token.
  // The token sent by accessing  forgorPassword is non-ecrypted while the one stored within the DB is hashed.
  // Encrypt/hash the original token, in oreder to compare their values.
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  //Only details known about the user at the moment his token value, also check if the hashedTokenExpireDate is not obsoleted
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpireDate: { $gt: Date.now() },
  });

  //2 If the token has not expired and the user exists, set a new password.
  if (!user) {
    //400 BAD REQUEST
    return next(new OperationalError('Token is invalid, maybe it expired.', 400));
  }
  //Password must exist
  if (!req.body.password) {
    //400 BAD REQUEST
    return next(new OperationalError('You must provide a password!', 400));
  }
  //Password Confirmation  must exist
  if (!req.body.passwordConfirm) {
    //400 BAD REQUEST
    return next(new OperationalError('Your must provide a confirmation password !', 400));
  }

  //Not turning of the validators + using onSave instead of update, as that the validators will still work.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.poasswordResetToken = undefined;
  user.passwordResetTokenExpireDate = undefined;

  //3 Update changedPasswordAt by default i the pre save middleware
  await user.save();

  //4) Log in the user, and send him JWT.
  createSendToken(user, 200, res);
});

/**
 * Protection middleware function used to restrict any given route access, based on  a user jwt token credentials, acheived by login in the system.
 * This specials jwt token will be kept by the user within its headers, being a bear authorization token, carried out by the user as a passport.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.protectRoute = catchAsync(async (req, res, next) => {
  //1 Get and store the jwt bearer token
  let jwtToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //Token format beeing Bearer xxxxx, take just the token
    jwtToken = req.headers.authorization.split(' ')[1];
  }

  //2 Unauthorized, the token doesn't exist
  if (!jwtToken) {
    return next(new OperationalError(`You haven't logged in yet! Log in now to gain access.`), 401);
  }

  //3 Token verification. Verigy if someone manipulated the data or if the token has expired.
  //  Promisify function, keep the code sequential.
  const decodedPayload = await promisify(jwt.verify)(jwtToken, process.env.JSON_TOKEN_SECRET);

  //4 Check if the user still exists, maybe got deleted his account meantime
  const user = await User.findById(decodedPayload.id);
  if (!user) {
    return next(new OperationalError(`It is no longer possible to access this user's token.`), 401);
  }

  //5 Check if the user changed his password after the  after the JWT was issued.
  if (user.isPasswordChangedAfterJWTIssued(decodedPayload.iat)) {
    return next(new OperationalError('Password recently changed by user! Please log once more in.', 401));
  }

  //6 User gains access to the secure resource
  //PUT THE ENTIRE USER DATA ON THE REQUEST -> WILL BE MORE USEFUL FURTHER
  req.user = user;
  next();
});

/**
 * Middleware function that will put on the response object user specific information, if the user has logged in.
 * This function will expect a valid  jwt on the req headers, if the jwt exists, is valid will pass to the user data with personal character.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //1 Get and store the jwt bearer token
  let jwtToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //Token format beeing Bearer xxxxx, take just the token
    jwtToken = req.headers.authorization.split(' ')[1];

    //2 Token verification. Verigy if someone manipulated the data or if the token has expired.
    //  Promisify function, keep the code sequential.
    const decodedPayload = await promisify(jwt.verify)(jwtToken, process.env.JSON_TOKEN_SECRET);

    //3 Check if the user still exists, maybe got deleted his account meantime
    const user = await User.findById(decodedPayload.id);
    if (!user) {
      //Don't create any errors, just move forward to the next middleware
      return next();
    }
    //4 Check if the user changed his password after the  after the JWT was issued.
    if (user.isPasswordChangedAfterJWTIssued(decodedPayload.iat)) {
      //Don't create any errors, just move forward to the next middleware
      return next();
    }

    //5 The logged in user will receive extra information with personal character.
    const userInfo = { name: user.name, email: user.email };
    res.locals.user = userInfo;
  }

  next();
});
