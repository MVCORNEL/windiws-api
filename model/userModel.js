const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
/**
 * Mongoose schema  usded to model the structure of the data, default values, and data validation for the USER
 * User data fields within the documents are (firstName,lastName,email,phoneNumber, password, passwordConfirm, role)
 */
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please insert your first name'],
    maxlength: [20, 'First name must have less or equal than 20 characters'],
    trim: true,
  },

  lastName: {
    type: String,
    required: [true, 'Please insert your last name'],
    maxlength: [20, 'Last name must have less or equal than 20 characters'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Please provide a valid email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  phoneNumber: {
    type: String,
    required: [true, 'Please insert your phone number'],
    unique: true,
    //The current validate function works only when a new document is created, but not on update
    validate: function (val) {
      return validator.isMobilePhone(val);
    },
    //The way of gettign access of the current value
    message: 'Please insert a valid phone number',
  },
  //longer passwords are more efficientT
  password: {
    type: String,
    required: [true, 'Please provide a valid password'],
    minLength: 8,
    //HIDE PASSWORD FROM USERS WHEN QUERYING COLLECTION
    select: false,
    validate: [
      validator.isStrongPassword,
      'Password must contain a small letter ,a capital letter, a digit, a symbol and at least 8 characters length',
    ],
  },
  passwordConfirm: {
    type: String,
    required: 'Passwords do not match',
    validate: function (passwordConfirm) {
      //Works only onCreate and onSave, doesn't work onUpdate.
      return (password = passwordConfirm);
    },
  },

  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin',
    },
    default: 'user',
  },
});

/**
 *Password encryption function middleware pre hook middleware on save
 *The encryption will happened between the moment that we receive the data, and the moment the data is actually persisted to the database
 *Runs before the following events .save() and .create(), but does not work on insertMany() event.
 *The password will be encrypted only in the case that the password field has actually been updated (password changed and password created) ->
 *in case the user updates another field, the password won't get encrypted again.
 *Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
 *@param {function} next function called to jump to the next middleware into the stack
 */
userSchema.pre('save', async function (next) {
  //1 SKIP TO NEXT MIDDLEWARE IF PASSWORD NOT UPDATED
  if (!this.isModified('password')) {
    return next();
  }
  //2 HASH PASSWORD WITH THE COST IF 12, USING BCRYPT HASHING ALGORITHM (2 idintical passwords won't generate same hash)
  this.password = await bcryptjs.hash(this.password, 12);
  //3 DELETE UNWANTED CONFIRM PASSWORD FIELD BECAUSE AT THIS POINT WE ONLY NEED THE REAL HASHED PASSWORD
  this.passwordConfirm = undefined;
  //4 MOVE TO NEXT MIDDLWARE
  next();
});

/**
 * Instance method available for all the documents of a the User collection, used to compare hashed password from the database
 * with the hashed result from the candidate password.
 * @param {string} candiatePassword password that the user passes into the request body object (not encrypted)
 * @param {string} dbPassword password hashed and persisted into the data base (encrpted)
 */
//
userSchema.methods.isLoginPasswordCorrect = async function (candiatePassword, dbPassword) {
  //Because the password is projection is set to false, the password can't be access using this.passord (instead a db parameter is used)
  return await bcryptjs.compare(candiatePassword, dbPassword);
};

//MODEL FOR CREATING USER DOCUMENTS
const User = mongoose.model('User', userSchema);
module.exports = User;
