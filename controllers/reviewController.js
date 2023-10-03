// const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');

const factory = require('./handlerFactory');



// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }

//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     reviews,
//   });
// });

exports.getAllReviews = factory.getAll(Review)

exports.setTourUserIds = (req,res,next)=>{
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id; // req.user get from the protect middleware
  }
  next();
}

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review)

// exports.createReview = catchAsync(async (req, res, next) => {
//   if (!req.body.tour) {
//     req.body.tour = req.params.tourId;
//   }

//   if (!req.body.user) {
//     req.body.user = req.user.id; // req.user get from the protect middleware
//   }

//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     newReview,
//   });
// });



exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);