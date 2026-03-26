import mongoose from 'mongoose';

const pgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, trim: true },
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  type: {
    type: String,
    enum: ['pg', 'hostel', 'flat'],
    default: 'pg',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    default: 'unisex',
  },
  contact: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PG = mongoose.model('PG', pgSchema);

export default PG;
