import Vehicle from '../models/Vehicle.js';

// @desc    Purchase a vehicle (decrease quantity)
// @route   POST /api/vehicles/:id/purchase
// @access  Private
export const purchaseVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Vehicle is out of stock' });
    }

    vehicle.quantity -= 1;
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Restock a vehicle (increase quantity)
// @route   POST /api/vehicles/:id/restock
// @access  Private/Admin
export const restockVehicle = async (req, res) => {
  const { quantity } = req.body;
  const restockAmount = Number(quantity);

  if (isNaN(restockAmount) || restockAmount <= 0) {
    return res.status(400).json({ error: 'Please provide a valid restock quantity greater than 0' });
  }

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehicle.quantity += restockAmount;
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
