import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  code: { type: String, trim: true },
  logo: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('College', collegeSchema);
