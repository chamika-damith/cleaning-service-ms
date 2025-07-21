const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { customerName, address, dateTime, serviceId, specialInstructions } = req.body;
    
    // 1) Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'No service found with that ID'
      });
    }

    // 2) Create new booking
    const booking = await Booking.create({
      customerName,
      address,
      dateTime: new Date(dateTime),
      service: serviceId,
      user: req.user.id,
      specialInstructions
    });

    // 3) Populate the service details
    await booking.populate('service');

    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ dateTime: 1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update a booking
// @route   PATCH /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const { customerName, address, dateTime, serviceId, specialInstructions, status } = req.body;
    
    // 1) Find the booking
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'No booking found with that ID'
      });
    }

    // 2) Check if the booking belongs to the user or if user is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this booking'
      });
    }

    // 3) Update the booking
    booking.customerName = customerName || booking.customerName;
    booking.address = address || booking.address;
    booking.dateTime = dateTime ? new Date(dateTime) : booking.dateTime;
    booking.service = serviceId || booking.service;
    booking.specialInstructions = specialInstructions !== undefined ? specialInstructions : booking.specialInstructions;
    
    // Only allow status update if user is admin
    if (status && req.user.role === 'admin') {
      booking.status = status;
    }

    // 4) Save the updated booking
    const updatedBooking = await booking.save();
    
    // 5) Populate the service and user details
    await updatedBooking.populate('service');
    await updatedBooking.populate('user', 'username email');

    res.status(200).json({
      status: 'success',
      data: {
        booking: updatedBooking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'No booking found with that ID'
      });
    }

    // Check if the booking belongs to the user or if user is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this booking'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ dateTime: 1 })
      .populate('user', 'username email');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};
