import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Contest from '../models/Contest.js';
import Problem from '../models/Problem.js';
import { authenticateToken, requireOrganiser } from '../middleware/auth.js';
import crypto from 'crypto';
import { checkCollegeAccess } from '../middleware/checkOrganiserAccess.js';

const router = express.Router();
const CODING_EVENT_TYPES = new Set(['coding_contest', 'hackathon']);

const parseDateTime = (dateValue, timeValue) => {
  const baseDate = new Date(dateValue);
  if (Number.isNaN(baseDate.getTime())) return null;

  if (typeof timeValue === 'string' && /^\d{2}:\d{2}$/.test(timeValue)) {
    const [hours, minutes] = timeValue.split(':').map(Number);
    baseDate.setHours(hours, minutes, 0, 0);
  } else {
    baseDate.setHours(0, 0, 0, 0);
  }
  return baseDate;
};

const getContestStatus = (startTime, endTime) => {
  const now = new Date();
  if (endTime <= now) return 'ended';
  if (startTime <= now && now < endTime) return 'ongoing';
  return 'upcoming';
};

const normalizeProblemIds = (problemIds) => {
  if (!Array.isArray(problemIds)) return [];
  return [...new Set(problemIds.filter(id => typeof id === 'string' && id.trim()))];
};

const buildContestPayload = ({ title, description, date, startTime, endTime, problemIds, createdBy }) => {
  const contestStart = parseDateTime(date, startTime);
  const contestEnd = parseDateTime(date, endTime);

  if (!contestStart || !contestEnd) {
    return { error: 'Valid event date, start time, and end time are required for coding events.' };
  }

  if (contestEnd <= contestStart) {
    return { error: 'End time must be greater than start time for coding events.' };
  }

  const duration = Math.max(1, Math.round((contestEnd.getTime() - contestStart.getTime()) / (1000 * 60)));

  return {
    payload: {
      name: `${title} Contest`,
      description: description || `${title} coding contest`,
      startTime: contestStart,
      endTime: contestEnd,
      duration,
      status: getContestStatus(contestStart, contestEnd),
      problems: problemIds.map((problemId, index) => ({
        problem: problemId,
        score: 100,
        order: index + 1
      })),
      createdBy,
      isPublic: true
    }
  };
};

const validateProblemIds = async (problemIds) => {
  if (!problemIds.length) {
    return { isValid: false, message: 'Coding events require at least one coding problem.' };
  }

  const problems = await Problem.find({
    _id: { $in: problemIds },
    isPublished: true
  }).select('_id');

  if (problems.length !== problemIds.length) {
    return { isValid: false, message: 'Some selected problems are invalid or unpublished.' };
  }

  return { isValid: true };
};

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

// POST create event (organiser/admin only)
router.post('/', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const { title, description, banner, venue, date, startTime, endTime, capacity, eventType, tags, college, problemIds } = req.body;
    const normalizedEventType = eventType || 'general';
    const normalizedProblemIds = normalizeProblemIds(problemIds);
    const assignedCollege = req.user.role === 'admin' ? (college || req.user.college) : req.user.college;

    if (!assignedCollege) {
      return res.status(400).json({ message: 'A college is required to create an event' });
    }

    let contestId = null;
    if (CODING_EVENT_TYPES.has(normalizedEventType)) {
      const validation = await validateProblemIds(normalizedProblemIds);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
      }

      const contestResult = buildContestPayload({
        title,
        description,
        date,
        startTime,
        endTime,
        problemIds: normalizedProblemIds,
        createdBy: req.user._id
      });

      if (contestResult.error) {
        return res.status(400).json({ message: contestResult.error });
      }

      const contest = await Contest.create(contestResult.payload);
      contestId = contest._id;
    }

    const event = await Event.create({
      title, description, banner, venue, date, startTime, endTime, capacity,
      eventType: normalizedEventType,
      tags: tags || [],
      college: assignedCollege,
      createdBy: req.user._id,
      contestId
    });

    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// PUT update event (organiser/admin with college scope)
const updateEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const allowedUpdates = ['title', 'description', 'banner', 'venue', 'date', 'startTime', 'endTime', 'capacity', 'eventType', 'tags', 'isActive'];
    if (req.user.role === 'admin') {
      allowedUpdates.push('college');
    }

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const nextEventType = updates.eventType || existingEvent.eventType;
    const isCodingEvent = CODING_EVENT_TYPES.has(nextEventType);
    const normalizedProblemIds = normalizeProblemIds(req.body.problemIds);

    if (isCodingEvent) {
      let finalProblemIds = normalizedProblemIds;

      if (!finalProblemIds.length && existingEvent.contestId) {
        const existingContest = await Contest.findById(existingEvent.contestId).select('problems');
        if (existingContest?.problems?.length) {
          finalProblemIds = existingContest.problems.map((entry) => entry.problem.toString());
        }
      }

      const validation = await validateProblemIds(finalProblemIds);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
      }

      const merged = {
        title: updates.title ?? existingEvent.title,
        description: updates.description ?? existingEvent.description,
        date: updates.date ?? existingEvent.date,
        startTime: updates.startTime ?? existingEvent.startTime,
        endTime: updates.endTime ?? existingEvent.endTime
      };

      const contestResult = buildContestPayload({
        ...merged,
        problemIds: finalProblemIds,
        createdBy: existingEvent.createdBy
      });

      if (contestResult.error) {
        return res.status(400).json({ message: contestResult.error });
      }

      if (existingEvent.contestId) {
        await Contest.findByIdAndUpdate(existingEvent.contestId, contestResult.payload, { new: true, runValidators: true });
        updates.contestId = existingEvent.contestId;
      } else {
        const newContest = await Contest.create(contestResult.payload);
        updates.contestId = newContest._id;
      }
    } else if (req.body.eventType && !CODING_EVENT_TYPES.has(req.body.eventType)) {
      updates.contestId = null;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ message: 'Event updated', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

router.put('/:id', authenticateToken, requireOrganiser, checkCollegeAccess, updateEvent);

// PATCH update event (backward compatibility)
router.patch('/:id', authenticateToken, requireOrganiser, checkCollegeAccess, updateEvent);

// DELETE event (organiser/admin with college scope)
router.delete('/:id', authenticateToken, requireOrganiser, checkCollegeAccess, async (req, res) => {
  try {

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

// POST mark attendance via QR (organiser/admin with college scope)
router.post('/:id/attendance', authenticateToken, requireOrganiser, checkCollegeAccess, async (req, res) => {
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

// GET events I can manage (organiser/admin)
router.get('/my/managed', authenticateToken, requireOrganiser, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : {
          $or: [
            { createdBy: req.user._id },
            { college: req.user.college }
          ]
        };

    const events = await Event.find(filter)
      .populate('college', 'name city logo')
      .populate('createdBy', 'username profile.avatar')
      .sort({ date: -1 });

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

// GET registrations for an event (organiser/admin with college scope)
router.get('/:id/registrations', authenticateToken, requireOrganiser, checkCollegeAccess, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.studentId', 'username email profile.avatar')
      .select('title registrations');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json({
      eventId: event._id,
      title: event.title,
      registrations: event.registrations || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
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

export default router;
