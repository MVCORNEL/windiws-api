const mongoose = require('mongoose');
const Product = require('./productModel');

/**
 * Mongoose schema  used to model the structure of the data, default values, and data validation for the REVIEW
 * Review data fields within the documents are (comment,rating,createdAt,product, user, passwordConfirm, role)
 */
const reviewSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'A review must have a comment'],
      trim: true,
      maxlength: 250,
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a its rating'],
      min: 1,
      max: 5,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    //Parent referecing towards the Product Model
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a a product'],
    },

    productSlug: {
      type: String,
      required: [true, 'Please insert the product slug'],
      trim: true,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a registered user'],
    },
  },
  //When creating a schema the first object is the object with the schema definition itself
  //The second object is the object that cotnains the schema options
  {
    //When we have a virtual field that is not stored within the database, but calculated using other values
    //We want this so show up whenever there is an output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Only one review by product per user, now each combination of tour and user has always to be unique
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

//Query middleware, used to pupulate the current review data with the user name and image
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName image',
  });

  next();
});

//STATIC METHOD used to calculate the averages based on the product id
reviewSchema.statics.calcAverageRatings = async function (productId) {
  //AGGREGATION PIPELINE (this point to he model) (Aggregation pipeline always on the model)
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //Update the product fields, but only when there are reviews
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  }
  //Set thhe default values
  else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 4,
    });
  }
};

//Very important so update the Product fields only after the documents were already save to the DB
//PRE SAVE HOOK, run before an actual event, runs before .save() and .create() but not on insertMany()
reviewSchema.post('save', function () {
  //PROBLEM -> the problem here is that the Review variable is not defined yet ->
  //and we cannot move this code after the Review declaration(not gonna work cause the model won;t have the static model than)
  //because like in express in mogngoose the code runs in sequence, because we will only declare it only after the review model was created
  this.constructor.calcAverageRatings(this.product);
});

//CALC AVERAGE ON UPDATE AND ON DELETE
//Update review avg and quantity on Update and delete -> findByIdAndUpdate, findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this here will point to the current document not to the current query
  //if we want to execute the query and find the id of the document we must create a o copy of the query first because a query will execute only once
  //will pass the id of this clone query to the next
  //We also have to save the document otherwise we won't have access to the static method
  this.result = await this.clone().findOne();
  next();
});

//Calculate the document averages after the doc was saved, otherwise it won't be up to date
reviewSchema.post(/^findOneAnd/, async function () {
  await this.result.constructor.calcAverageRatings(this.result.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
