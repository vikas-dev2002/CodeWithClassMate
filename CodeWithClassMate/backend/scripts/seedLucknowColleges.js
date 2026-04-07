import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import College from '../models/College.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const lucknowColleges = [
  {
    name: 'Institute of Engineering and Technology, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    code: 'IETLKO',
  },
  {
    name: 'University of Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    code: 'LUCKNOWUNIV',
  },
  {
    name: 'Dr. A.P.J. Abdul Kalam Technical University',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    code: 'AKTU',
  },
  {
    name: 'Babu Banarasi Das University',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    code: 'BBDU',
  },
  {
    name: 'Integral University',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    code: 'IUL',
  },
];

const seedLucknowColleges = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    let inserted = 0;
    let updated = 0;

    for (const college of lucknowColleges) {
      const result = await College.findOneAndUpdate(
        { name: college.name },
        { $set: college },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.createdAt && result.createdAt.getTime() === result.updatedAt.getTime()) {
        inserted += 1;
      } else {
        updated += 1;
      }
    }

    const totalLucknowColleges = await College.countDocuments({ city: 'Lucknow' });

    console.log(`Lucknow colleges seeded. Inserted: ${inserted}, Updated: ${updated}`);
    console.log(`Total colleges in Lucknow: ${totalLucknowColleges}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Lucknow colleges:', error);
    process.exit(1);
  }
};

seedLucknowColleges();
