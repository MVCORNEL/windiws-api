const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Mongoose schema  used to model the structure of the data, default values, and data validation for the PRODUCT
 * User data fields within the documents are (name,summary,email,description, imageUrl, slug)
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'A product must have a name'],
    minLength: [4, 'A product name must have at least 5 characters.'],
    maxLength: [30, 'A product name must have maximum 20 characters.'],
  },

  category: {
    type: String,
    required: [true, 'A product must have a category'],
    enum: {
      values: ['doors', 'windows', 'nets', 'sills'],
      message: 'Category must be either:  doors, windows, nets, sills',
    },
  },

  summary: {
    type: String,
    trim: true,
    minLength: [50, 'A product summary must have at least 50 characters.'],
    maxLength: [120, 'A product summary must have maximum 120 characters.'],
    requried: [true, 'A product must a short summary '],
  },

  description: {
    type: String,
    trim: true,
    requried: [true, 'A product must have description'],
    minLength: [50, 'A product summary must have at least 50 characters.'],
  },

  imageUrl: {
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
