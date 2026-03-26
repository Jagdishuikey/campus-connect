import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PG from './models/PGModel.js';

dotenv.config();

const samplePGs = [
  {
    name: 'Sunshine PG for Boys',
    price: 6500,
    location: { lat: 22.7196, lng: 75.8577, address: 'Vijay Nagar, Indore' },
    rating: 4.3,
    amenities: ['WiFi', 'AC', 'Laundry', 'Parking'],
    type: 'pg',
    gender: 'male',
    contact: '+91 98765 43210',
  },
  {
    name: 'Grace Girls Hostel',
    price: 7000,
    location: { lat: 22.7235, lng: 75.8630, address: 'Bhawarkuan, Indore' },
    rating: 4.5,
    amenities: ['WiFi', 'AC', 'Mess', 'CCTV', 'Gym'],
    type: 'hostel',
    gender: 'female',
    contact: '+91 98765 12345',
  },
  {
    name: 'Campus Nest PG',
    price: 5500,
    location: { lat: 22.7150, lng: 75.8600, address: 'Palasia, Indore' },
    rating: 3.8,
    amenities: ['WiFi', 'Laundry', 'Power Backup'],
    type: 'pg',
    gender: 'unisex',
    contact: '+91 91234 56789',
  },
  {
    name: 'Royal Residency Flat',
    price: 12000,
    location: { lat: 22.7280, lng: 75.8650, address: 'Scheme No. 54, Indore' },
    rating: 4.7,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Gym', 'Swimming Pool'],
    type: 'flat',
    gender: 'unisex',
    contact: '+91 99887 65432',
  },
  {
    name: 'Comfort Zone Boys Hostel',
    price: 5000,
    location: { lat: 22.7100, lng: 75.8520, address: 'Rau, Indore' },
    rating: 3.5,
    amenities: ['WiFi', 'Mess', 'Power Backup'],
    type: 'hostel',
    gender: 'male',
    contact: '+91 87654 32109',
  },
  {
    name: 'Laxmi Girls PG',
    price: 6000,
    location: { lat: 22.7220, lng: 75.8550, address: 'AB Road, Indore' },
    rating: 4.0,
    amenities: ['WiFi', 'AC', 'CCTV', 'Laundry'],
    type: 'pg',
    gender: 'female',
    contact: '+91 78901 23456',
  },
  {
    name: 'Urban Stay Co-Living',
    price: 9000,
    location: { lat: 22.7300, lng: 75.8700, address: 'MR 10, Indore' },
    rating: 4.6,
    amenities: ['WiFi', 'AC', 'Gym', 'Kitchen', 'Coworking Space', 'Parking'],
    type: 'flat',
    gender: 'unisex',
    contact: '+91 81234 67890',
  },
  {
    name: 'Budget Stay Hostel',
    price: 4000,
    location: { lat: 22.7050, lng: 75.8480, address: 'Dewas Naka, Indore' },
    rating: 3.2,
    amenities: ['WiFi', 'Power Backup'],
    type: 'hostel',
    gender: 'male',
    contact: '+91 76543 21098',
  },
];

const seedPGs = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log('✅ MongoDB connected');

    const existing = await PG.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} PGs already exist. Skipping seed.`);
      process.exit(0);
    }

    await PG.insertMany(samplePGs);
    console.log(`✅ ${samplePGs.length} sample PGs seeded successfully`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding PGs:', error.message);
    process.exit(1);
  }
};

seedPGs();
