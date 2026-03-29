import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PG from './models/PGModel.js';

dotenv.config();

const samplePGs = [
  {
    name: 'Akurdi Boys PG',
    price: 5500,
    location: { lat: 18.6492, lng: 73.7707, address: 'Akurdi, Pune' },
    rating: 4.2,
    amenities: ['WiFi', 'AC', 'Laundry', 'Parking'],
    type: 'pg',
    gender: 'male',
    contact: '+91 98765 43210',
  },
  {
    name: 'Nigdi Girls Hostel',
    price: 6500,
    location: { lat: 18.6520, lng: 73.7680, address: 'Nigdi, Pune' },
    rating: 4.5,
    amenities: ['WiFi', 'AC', 'Mess', 'CCTV', 'Gym'],
    type: 'hostel',
    gender: 'female',
    contact: '+91 98765 12345',
  },
  {
    name: 'Pradhikaran PG',
    price: 5000,
    location: { lat: 18.6550, lng: 73.7760, address: 'Pradhikaran, Nigdi, Pune' },
    rating: 3.9,
    amenities: ['WiFi', 'Laundry', 'Power Backup'],
    type: 'pg',
    gender: 'unisex',
    contact: '+91 91234 56789',
  },
  {
    name: 'Chinchwad Premium Flat',
    price: 12000,
    location: { lat: 18.6298, lng: 73.7997, address: 'Chinchwad, Pune' },
    rating: 4.7,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Gym', 'Swimming Pool'],
    type: 'flat',
    gender: 'unisex',
    contact: '+91 99887 65432',
  },
  {
    name: 'Ravet Boys Hostel',
    price: 4500,
    location: { lat: 18.6475, lng: 73.7420, address: 'Ravet, Pune' },
    rating: 3.6,
    amenities: ['WiFi', 'Mess', 'Power Backup'],
    type: 'hostel',
    gender: 'male',
    contact: '+91 87654 32109',
  },
  {
    name: 'Thermax Chowk Girls PG',
    price: 6000,
    location: { lat: 18.6440, lng: 73.7750, address: 'Thermax Chowk, Akurdi, Pune' },
    rating: 4.1,
    amenities: ['WiFi', 'AC', 'CCTV', 'Laundry'],
    type: 'pg',
    gender: 'female',
    contact: '+91 78901 23456',
  },
  {
    name: 'Pimpri Co-Living Space',
    price: 9000,
    location: { lat: 18.6279, lng: 73.8009, address: 'Pimpri, Pune' },
    rating: 4.6,
    amenities: ['WiFi', 'AC', 'Gym', 'Kitchen', 'Coworking Space', 'Parking'],
    type: 'flat',
    gender: 'unisex',
    contact: '+91 81234 67890',
  },
  {
    name: 'Dehu Road Budget Hostel',
    price: 3500,
    location: { lat: 18.6720, lng: 73.7480, address: 'Dehu Road, Pune' },
    rating: 3.3,
    amenities: ['WiFi', 'Power Backup'],
    type: 'hostel',
    gender: 'male',
    contact: '+91 76543 21098',
  },
  {
    name: 'Sector 27 PG for Girls',
    price: 7000,
    location: { lat: 18.6530, lng: 73.7640, address: 'Sector 27, Pradhikaran, Pune' },
    rating: 4.4,
    amenities: ['WiFi', 'AC', 'Mess', 'CCTV', 'Laundry'],
    type: 'pg',
    gender: 'female',
    contact: '+91 90123 45678',
  },
  {
    name: 'Akurdi Station PG',
    price: 4800,
    location: { lat: 18.6485, lng: 73.7695, address: 'Near Akurdi Railway Station, Pune' },
    rating: 3.8,
    amenities: ['WiFi', 'Laundry', 'Parking', 'Power Backup'],
    type: 'pg',
    gender: 'unisex',
    contact: '+91 85678 90123',
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
