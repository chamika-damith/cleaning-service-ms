const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for regular users
router
  .route('/')
  .get(bookingController.getMyBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

// Admin only routes
router.use(authController.restrictTo('admin'));

// Get all bookings (admin only)
router.get('/all', bookingController.getAllBookings);

module.exports = router;
