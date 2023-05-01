const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Mongoose schema  used to model the structure of the data, default values, and data validation for the PRODUCT
 * Product  fields within the documents are (name,summary,email,description, imageUrl, slug, ratingsAverage, ratingsQuantity)
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'A product must have a name'],
    minLength: [3, 'A product name must have at least 3 characters.'],
    maxLength: [25, 'A product name must have maximum 25 characters.'],
  },

  category: {
    type: String,
    required: [true, 'A product must have a category'],
    enum: {
      values: ['door', 'window', 'net', 'sill'],
      message: 'Category must be either:  door, window, net, sill',
    },
  },

  summary: {
    type: String,
    trim: true,
    minLength: [100, 'A product summary must have at least 100 characters.'],
    maxLength: [200, 'A product summary must have maximum 200 characters.'],
    requried: [true, 'A product must a short summary '],
  },

  description: {
    type: String,
    trim: true,
    requried: [true, 'A product must have description'],
    minLength: [200, 'A product description must have at least 200 characters.'],
    maxLength: [1500, 'A product description must have maximum 1500 characters.'],
  },

  ratingsAverage: {
    type: Number,
    default: 4,
    //min/max will also work with dates
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    //this function will be run each time a new value is set for this field
    set: (val) => Math.round(val * 10) / 10,
  },

  ratingsQuantity: {
    type: Number,
    default: 0,
  },

  imgUrl: {
    type: String,
    required: [true, 'A product must have an url pointing an image'],
  },

  slug: {
    type: String,
  },
});

/**
 * Pre save document hook middleware, that runs before .save() and .create(), but not in insertMany().
 * This function will run before a document it is save to the database and take the product name and replaces spaces with dashed.
 * The slug is used as the very end of the url.
 */
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//MODEL FOR CREATING PRODUCT DOCUMENTS
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
