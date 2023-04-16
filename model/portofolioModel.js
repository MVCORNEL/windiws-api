import mongoose from 'mongoose';

/**
 * Mongoose schema  used to model the structure of the data, default values, and data validation for the Portofolio images
 * Portofolio image  fields within the documents are (category,imageUrl)
 */
const portofolioSchema = mongoose.Schema({
  category: {
    type: String,
    enum: {
      values: ['sills,windows,doors,nets'],
      message: 'Category must be either sills,windows,doors,nets',
    },
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const PortofolioModel = mongoose.Model('Portofio', portofolioSchema);
