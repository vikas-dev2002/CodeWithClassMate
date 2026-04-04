import express from 'express';
import College from '../models/College.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all colleges (public)
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST add college (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, city, state, code, logo } = req.body;
    if (!name) return res.status(400).json({ message: 'College name is required' });

    const existing = await College.findOne({ name });
    if (existing) return res.status(400).json({ message: 'College already exists' });

    const college = await College.create({ name, city, state, code, logo });
    res.status(201).json({ message: 'College added', college });
  } catch (error) {
    res.status(500).json({ message: 'Error adding college', error: error.message });
  }
});

// GET college by ID
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
