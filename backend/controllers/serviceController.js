const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    
    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Create a new service (Admin only)
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    
    const newService = await Service.create({
      name,
      description,
      price,
      duration
    });

    res.status(201).json({
      status: 'success',
      data: {
        service: newService
      }
    });
  } catch (err) {
    // Handle duplicate service names
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Service with this name already exists!'
      });
    }
    
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update a service (Admin only)
// @route   PATCH /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res) => {
  try {
    const { name, description, price, duration, isActive } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, price, duration, isActive },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'No service found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (err) {
    // Handle duplicate service names
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Service with this name already exists!'
      });
    }
    
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Delete a service (Admin only)
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
  try {
    // Instead of deleting, we'll deactivate the service
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'No service found with that ID'
      });
    }

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

// @desc    Get a single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'No service found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};
