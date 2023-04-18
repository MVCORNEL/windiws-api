//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const mongoose = require('mongoose');
const crypto = require('crypto'); //NODE JS MODULE
const validator = require('validator');
const bcryptjs = require('bcryptjs');

/**
 * Mongoose schema  used to model the structure of the data, default values, and data validation for the USER
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

  passwordResetToken: String,
  passwordResetTokenExpireDate: Date,
  passwordChagedAt: Date,

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
 *Middleware function used to change  passwordChangedAtProperty but only when be modified the password property (not when a new doc is created)
 *@param {function} next function called to jump to the next middleware into the stack
 */
userSchema.pre('save', async function (next) {
  //When a new doc is created the password is not modified, that why isNew() is used
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  //VERY IMPORTANT !!
  //The problem here is sometimes saving the data is a bit slower and sometimes is saved after the JSON WEB TOKEN has been created
  //That will make it sometimes that the user will not be able to log in using the new token
  //Sometimes happens that this that the JWT token is created a bit before the changedPasswordTimeStamp
  //By substractig one or more seconds, will put the the passWordChange time one second in the past(not 100% accurate) but doesn't matter at all
  this.passwordChagedAt = Date.now() - 1000;
  next();
});

/**
 *Middleware function used to check if the  password  was changed after the token was issued
 *@param {number} JwtStamp iat number representing represented as time in seconds
 *@returns {boolean} returns true if the JwtStamp was issued before of password getting changed
 */
userSchema.methods.isPasswordChangedAfterJWTIssued = function (JwtStamp) {
  // Check if the password has been ever changed -> 10 meaning the digits base
  // Check if user changed password after JWT issued (each payload having its own iat on payload time of ISSUED AT TIME in seconds)
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    //returns true if the password was cahnged after the JWT token was issued
    return changedTimestamp > JwtStamp;
  }
  // Password never changed, by default this field is not required
  return false;
};

/**
 * Instance method available for all the documents of a the User collection, used to compare hashed password from the database
 * with the hashed result from the candidate password.
 * @param {string} candidatePassword password that the user passes into the request body object (not encrypted)
 * @param {string} dbPassword password hashed and persisted into the data base (encrpted)
 
* @returns true if the hascode generate of the passwords matches
 */
userSchema.methods.isLoginPasswordCorrect = async function (candidatePassword, dbPassword) {
  //Because the password is projection is set to false, the password can't be access using this.passord (instead a db parameter is used)
  return await bcryptjs.compare(candidatePassword, dbPassword);
};

/**
 * Instance method available for all the documents of a the User collection, used generate a random reset token string later sent to the user.
 * In the database the randaom generated token hasdcode will be stored and its expiring date.
 *
 * @returns the plain string of the random generated token
 */
userSchema.methods.createPasswordResetToken = function () {
  //1 Generate random rest token with the length of 32 bytes, which get converted into a hexadecimal number.
  const restartToken = crypto.randomBytes(32).toString('hex');
  //2 Store into the DB the sha256 hascode in hexadecimal format of the random generate code, never store plain reset token into the DB
  this.passwordResetToken = crypto.createHash('sha256').update(restartToken).digest('hex');
  //3 Store into the DB, token's expire time, which is 10 minutes from de current time
  this.passwordResetTokenExpireDate = Date.now() + 1000 * 60 * 10;
  //4 Return to the user the plaintext of the reset token.
  return restartToken;
};

//MODEL FOR CREATING USER DOCUMENTS
const User = mongoose.model('User', userSchema);
module.exports = User;
