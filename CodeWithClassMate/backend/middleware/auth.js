import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  console.log('🔐 Auth middleware triggered');
  
  const authHeader = req.headers['authorization'];
  console.log('📊 Request headers: Auth header', authHeader ? 'present' : 'missing');
  
  if (!authHeader) {
    console.log('❌ No authorization header provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    console.log('❌ No token found in authorization header');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user ID:', decoded.userId);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    console.log('✅ User authenticated:', user.username);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireOrganiser = (req, res, next) => {
  if (req.user.role !== 'organiser' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Organiser access required' });
  }
  next();
};