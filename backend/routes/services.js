const express = require('express');
const serviceController = require('../controllers/serviceController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router
  .route('/')
  .get(serviceController.getAllServices);

router
  .route('/:id')
  .get(serviceController.getService);

// Protect all routes after this middleware
router.use(authController.protect);

// Admin only routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .post(serviceController.createService);

router
  .route('/:id')
  .patch(serviceController.updateService)
  .delete(serviceController.deleteService);

module.exports = router;
