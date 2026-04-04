import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },
  banner: { type: String, default: '' },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  capacity: { type: Number, required: true },

  // Event type - determines which features are enabled
  eventType: {
    type: String,
    enum: ['general', 'coding_contest', 'quiz', 'hackathon', 'seminar', 'workshop', 'cultural'],
    default: 'general'
  },

  // For coding contests - link to Contest model
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },

  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },

  registrations: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      qrToken: String,
      attended: { type: Boolean, default: false },
      attendedAt: Date,
      registeredAt: { type: Date, default: Date.now }
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isActive: { type: Boolean, default: true },
  tags: [{ type: String, trim: true }]

}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
