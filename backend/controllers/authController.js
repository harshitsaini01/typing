const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login an admin
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Include password in query since it's not selected by default
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      const timeLeft = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({ 
        message: `Account is locked. Try again in ${timeLeft} minutes.` 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      await admin.incrementLoginAttempts();
      if (admin.isLocked()) {
        return res.status(423).json({ 
          message: 'Too many failed attempts. Account is locked for 30 minutes.' 
        });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify environment variables
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const accessToken = jwt.sign(
      { id: admin._id }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: admin._id }, 
      process.env.REFRESH_TOKEN_SECRET, 
      { expiresIn: '7d' }
    );

    // Update last login time and reset login attempts
    await admin.updateLastLogin();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { id: admin._id }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Logout
const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logout successful' });
};

// Check authentication
const checkAuth = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ 
      message: 'Authenticated',
      admin: {
        email: admin.email,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, refreshToken, logout, checkAuth };