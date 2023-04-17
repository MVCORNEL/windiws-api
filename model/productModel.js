const mongoose = require('mongoose');
const slugify = require('slugify');
/**
 * Mongoose schema  used to model the structure of the data, default values, and data validation for the PRODUCT
 * Product  fields within the documents are (name,summary,email,description, imageUrl, slug)
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
      values: ['door', 'window', 'net', 'sill'],
      message: 'Category must be either:  door, window, net, sill',
    },
  },

  summary: {
    type: String,
    trim: true,
    minLength: [50, 'A product summary must have at least 50 characters.'],
    maxLength: [250, 'A product summary must have maximum 25 characters.'],
    requried: [true, 'A product must a short summary '],
  },

  description: {
    type: String,
    trim: true,
    requried: [true, 'A product must have description'],
    minLength: [50, 'A product summary must have at least 50 characters.'],
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
