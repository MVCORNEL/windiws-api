const User = require('../model/userModel');

/**
 * Middleware function used to login a user, based on the  data provided into the request object.
 *
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function taht will be used to no navigate to the enxt middlewre
 */
//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
exports.loginUser = async (req, res, next) => {
  //1 Check if the email and the password exists.
  const { email, password } = req.body;
  if (!email) {
    throw new Error('Please provide and email');
  }
  if (!password) {
    throw new Error('Please provide a password');
  }
  try {
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
      return next(new AppError('Incorrect email or password', 401));
    }
    res.status(200).json({
      status: 'Loggin',
      data: { user },
    });
  } catch (err) {
    res.status(401).json({
      status: err.message,
      data: err.message,
    });
  }
};

/**
 * Middleware function used to create a user account, based on the  data provided into the request object.
 * This function will be used to create the user calling the mongoose model interface create function
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function taht will be used to no navigate to the enxt middlewre
 */
//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
exports.singupUser = async (req, res, next) => {
  //VERY IMPORTANT TO AVOID USING User.create(req.body) -> User can register as an administrator, setting user:"admin" field.
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    res.status(200).json({
      status: 'Successfuly registered',
      data: { user },
    });
  } catch (err) {
    res.status(401).json({
      status: err.message,
      data: err.message,
    });
  }
};
