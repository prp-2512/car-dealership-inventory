import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: [true, 'Please add the make of the vehicle'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please add the model of the vehicle'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add the category of the vehicle'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please add the price of the vehicle'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Please add the quantity in stock'],
      min: [0, 'Quantity cannot be negative']
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Format output for JSON: transform _id to id
vehicleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
