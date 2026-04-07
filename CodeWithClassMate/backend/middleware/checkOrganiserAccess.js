import Event from '../models/Event.js';

export const checkCollegeAccess = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.role === 'admin') {
      return next();
    }

    const event = await Event.findById(id).select('college');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (
      user.role === 'organiser' &&
      user.college &&
      event.college &&
      event.college.toString() === user.college.toString()
    ) {
      req.targetEvent = event;
      return next();
    }

    return res.status(403).json({ message: 'Not authorized to access this event' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

