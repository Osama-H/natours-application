const express = require('express');
const router = express.Router();
// const reviewController = require('./../controllers/reviewController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// will not follow the rest principles

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
