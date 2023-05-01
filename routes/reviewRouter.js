//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const express = require('express');
const {
  getAllReviews,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  setReviewsIds,
} = require('./../controller/reviewController');
const { protectRoute, restrictAdmin } = require('./../controller/authHandler');

//Mounting the router
//ADVANCE NESTED ROUTES -> the paramet found in training can be accessed here too
const router = express.Router({ mergeParams: true });
// router.use(protectRoute);
router.route('/getAllReviews').get(getAllReviews);
router.route('/').get(getAllReviews).post(protectRoute, setReviewsIds, createReview);
router.route('/:id').get(getReview).delete(deleteReview).patch(updateReview);

module.exports = router;
