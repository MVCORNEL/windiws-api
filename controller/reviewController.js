const Review = require('./../model/reviewsModel');
const factory = require('./factoryCRUDHandler');

exports.deleteReview = factory.deleteDocument(Review);
exports.updateReview = factory.updateDocument(Review);
exports.getReview = factory.getDocument(Review);
//TO CREATE REVIEW
exports.setReviewsIds = (req, res, next) => {
  req.body.user = req.userID;
  next();
};

exports.createReview = factory.createDocument(Review);
exports.getAllReviews = factory.getAllDocuments(Review);
