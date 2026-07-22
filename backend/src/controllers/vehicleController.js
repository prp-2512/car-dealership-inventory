import Vehicle from '../models/Vehicle.js';

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const addVehicle = async (req, res) => {
  const { make, model, category, price, quantity, imageUrl } = req.body;

  if (!make || !model || !category || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity,
      imageUrl: imageUrl || ''
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Search vehicles by make, model, category, or price range
// @route   GET /api/vehicles/search
// @access  Private
export const searchVehicles = async (req, res) => {
  const { make, model, category, minPrice, maxPrice } = req.query;
  const query = {};

  if (make) {
    query.make = { $regex: make, $options: 'i' };
  }
  if (model) {
    query.model = { $regex: model, $options: 'i' };
  }
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price.$lte = Number(maxPrice);
    }
  }

  try {
    const vehicles = await Vehicle.find(query);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a vehicle's details
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { make, model, category, price, quantity, imageUrl } = req.body;

    if (make) vehicle.make = make;
    if (model) vehicle.model = model;
    if (category) vehicle.category = category;
    if (price !== undefined) vehicle.price = price;
    if (quantity !== undefined) vehicle.quantity = quantity;
    if (imageUrl !== undefined) vehicle.imageUrl = imageUrl;

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
