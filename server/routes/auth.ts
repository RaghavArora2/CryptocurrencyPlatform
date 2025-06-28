import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { dbRun, dbGet } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 20 }).trim(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;

    // Check if user exists
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    await dbRun(
      'INSERT INTO users (id, email, username, password_hash, is_verified) VALUES (?, ?, ?, ?, ?)',
      [userId, email, username, passwordHash, true] // Auto-verify for demo
    );

    // Create initial wallets with demo funds
    const currencies = ['USD', 'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'LTC', 'BNB', 'SOL', 'DOGE', 'AVAX'];
    for (const currency of currencies) {
      await dbRun(
        'INSERT INTO wallets (id, user_id, currency, balance) VALUES (?, ?, ?, ?)',
        [uuidv4(), userId, currency, currency === 'USD' ? 50000 : currency === 'BTC' ? 1 : currency === 'ETH' ? 10 : 0]
      );
    }

    // Log security event
    await dbRun(
      'INSERT INTO security_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'REGISTER', req.ip, 'Account created successfully']
    );

    // Generate JWT
    const token = jwt.sign({ userId, email, username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, username, is_verified: true }
    });

    logger.info(`New user registered: ${email}`);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await dbGet(
      'SELECT id, email, username, password_hash, is_verified, two_factor_enabled FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      // Log failed login attempt
      await dbRun(
        'INSERT INTO security_logs (id, user_id, action, ip_address, success, details) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), 'unknown', 'LOGIN_ATTEMPT', req.ip, false, `Failed login for email: ${email}`]
      );
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Log failed login attempt
      await dbRun(
        'INSERT INTO security_logs (id, user_id, action, ip_address, success, details) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), user.id, 'LOGIN_ATTEMPT', req.ip, false, 'Invalid password']
      );
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log successful login
    await dbRun(
      'INSERT INTO security_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), user.id, 'LOGIN', req.ip, 'Successful login']
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        is_verified: user.is_verified,
        two_factor_enabled: user.two_factor_enabled
      }
    });

    logger.info(`User logged in: ${email}`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, [
  body('current_password').exists(),
  body('new_password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_password, new_password } = req.body;
    const userId = req.user.userId;

    // Get current password hash
    const user = await dbGet(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      // Log failed password change attempt
      await dbRun(
        'INSERT INTO security_logs (id, user_id, action, ip_address, success, details) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, 'PASSWORD_CHANGE', req.ip, false, 'Invalid current password']
      );
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 12);

    // Update password
    await dbRun(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    // Log successful password change
    await dbRun(
      'INSERT INTO security_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'PASSWORD_CHANGE', req.ip, 'Password changed successfully']
    );

    res.json({ message: 'Password changed successfully' });
    logger.info(`Password changed for user: ${userId}`);
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate API key
router.post('/generate-api-key', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const apiKey = crypto.randomBytes(32).toString('hex');

    await dbRun(
      'UPDATE users SET api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [apiKey, userId]
    );

    // Log API key generation
    await dbRun(
      'INSERT INTO security_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'API_KEY_GENERATED', req.ip, 'New API key generated']
    );

    res.json({ api_key: apiKey });
    logger.info(`API key generated for user: ${userId}`);
  } catch (error) {
    logger.error('API key generation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Enable/Disable 2FA (mock implementation)
router.post('/enable-2fa', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await dbRun(
      'UPDATE users SET two_factor_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [true, userId]
    );

    // Log 2FA enablement
    await dbRun(
      'INSERT INTO security_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, '2FA_ENABLED', req.ip, 'Two-factor authentication enabled']
    );

    res.json({ message: '2FA enabled successfully' });
    logger.info(`2FA enabled for user: ${userId}`);
  } catch (error) {
    logger.error('2FA enable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/disable-2fa', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await dbRun(
      'UPDATE users SET two_factor_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [false, userId]
    );

    // Log 2FA disablement
    await dbRun(
      'INSERT INTO security_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, '2FA_DISABLED', req.ip, 'Two-factor authentication disabled']
    );

    res.json({ message: '2FA disabled successfully' });
    logger.info(`2FA disabled for user: ${userId}`);
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;