import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { authenticateToken, requireOrganiser, requireAdmin } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// GET all events (public) - with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, eventType, college, upcoming, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }
    if (eventType) filter.eventType = eventType;
    if (college) filter.college = college;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('college', 'name city logo')
      .populate('createdBy', 'username profile.avatar')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('college', 'name city state logo')
      .populate('createdBy', 'username profile.avatar')
      .populate('registrations.studentId', 'username email profile.avatar');

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create event (organiser/admin only)
router.post('/', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const { title, description, banner, venue, date, startTime, endTime, capacity, eventType, tags, college } = req.body;

    const event = await Event.create({
      title, description, banner, venue, date, startTime, endTime, capacity,
      eventType: eventType || 'general',
      tags: tags || [],
      college: college || req.user.college,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// PATCH update event (organiser/admin only)
router.patch('/:id', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only creator or admin can update
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const allowedUpdates = ['title', 'description', 'banner', 'venue', 'date', 'startTime', 'endTime', 'capacity', 'eventType', 'tags', 'isActive'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ message: 'Event updated', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// DELETE event (organiser/admin only)
router.delete('/:id', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// POST register for event (authenticated user)
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isActive) return res.status(400).json({ message: 'Event is not active' });

    // Check capacity
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.find(
      r => r.studentId.toString() === req.user._id.toString()
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Generate QR token
    const qrToken = crypto.randomBytes(32).toString('hex');

    // Add to event registrations
    event.registrations.push({
      studentId: req.user._id,
      qrToken,
      attended: false
    });
    await event.save();

    // Add to user's registeredEvents
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        registeredEvents: {
          eventId: event._id,
          qrCode: qrToken,
          attended: false
        }
      }
    });

    res.json({ message: 'Registered successfully', qrToken });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST unregister from event
router.post('/:id/unregister', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.registrations = event.registrations.filter(
      r => r.studentId.toString() !== req.user._id.toString()
    );
    await event.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { registeredEvents: { eventId: event._id } }
    });

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unregistration failed', error: error.message });
  }
});

// POST mark attendance via QR (organiser/admin)
router.post('/:id/attendance', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const { qrToken } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const registration = event.registrations.find(r => r.qrToken === qrToken);
    if (!registration) return res.status(404).json({ message: 'Invalid QR code' });
    if (registration.attended) return res.status(400).json({ message: 'Attendance already marked' });

    registration.attended = true;
    registration.attendedAt = new Date();
    await event.save();

    // Update user's registeredEvents too
    await User.updateOne(
      { _id: registration.studentId, 'registeredEvents.eventId': event._id },
      { $set: { 'registeredEvents.$.attended': true, 'registeredEvents.$.attendedAt': new Date() } }
    );

    const student = await User.findById(registration.studentId).select('username email');
    res.json({ message: 'Attendance marked', student });
  } catch (error) {
    res.status(500).json({ message: 'Attendance failed', error: error.message });
  }
});

// GET my events (events I registered for)
router.get('/my/registered', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('registeredEvents');
    const eventIds = user.registeredEvents.map(e => e.eventId);
    const events = await Event.find({ _id: { $in: eventIds } })
      .populate('college', 'name city logo')
      .populate('createdBy', 'username')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET events created by me (organiser)
router.get('/my/created', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .populate('college', 'name city logo')
      .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
