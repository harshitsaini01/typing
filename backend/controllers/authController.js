const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login an admin
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt with email:', email);

  if (!email || !password) {
    console.log('Login failed: Email or password missing');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`Login failed: No admin found with email ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Admin found:', admin.email);
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Login failed: Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched for admin:', email);

    // Verify environment variables
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.error('Token secrets not set in .env');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const accessToken = jwt.sign({ id: admin._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: admin._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log('Generated access token:', accessToken);
    console.log('Generated refresh token:', refreshToken);

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
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log('Refresh token missing');
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      console.log('Admin not found for refresh token');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ id: admin._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    console.log('New access token generated via refresh:', accessToken);
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error.message);
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
  console.log('Logout successful');
  res.status(200).json({ message: 'Logout successful' });
};

// Check authentication
const checkAuth = async (req, res) => {
  console.log('Checking authentication for user:', req.user.id);
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      console.log('Admin not found during auth check');
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Authenticated', admin });
  } catch (error) {
    console.error('Auth check error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login, refreshToken, logout, checkAuth };