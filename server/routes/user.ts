import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await dbGet(
      'SELECT id, email, username, bio, avatar, is_verified, two_factor_enabled, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3, max: 20 }).trim(),
  body('bio').optional().isLength({ max: 500 }).trim(),
  body('avatar').optional().isURL(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { username, bio, avatar } = req.body;

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    await dbRun(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Profile updated successfully' });
    logger.info(`Profile updated for user: ${userId}`);
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user wallets
router.get('/wallets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const wallets = await dbAll(
      'SELECT currency, balance, locked_balance FROM wallets WHERE user_id = ? ORDER BY currency',
      [userId]
    );

    res.json(wallets);
  } catch (error) {
    logger.error('Error fetching wallets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deposit funds
router.post('/deposit', authenticateToken, [
  body('currency').isString().isLength({ min: 1 }),
  body('amount').isFloat({ min: 0.01 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { currency, amount } = req.body;

    // Update wallet balance
    await dbRun(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND currency = ?',
      [amount, userId, currency.toUpperCase()]
    );

    // Record transaction
    const transactionId = uuidv4();
    await dbRun(
      'INSERT INTO transactions (id, user_id, type, currency, amount) VALUES (?, ?, ?, ?, ?)',
      [transactionId, userId, 'deposit', currency.toUpperCase(), amount]
    );

    res.json({ message: 'Deposit successful', transactionId });
    logger.info(`Deposit: ${userId} deposited ${amount} ${currency}`);
  } catch (error) {
    logger.error('Deposit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Withdraw funds
router.post('/withdraw', authenticateToken, [
  body('currency').isString().isLength({ min: 1 }),
  body('amount').isFloat({ min: 0.01 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { currency, amount } = req.body;

    // Check balance
    const wallet = await dbGet(
      'SELECT balance FROM wallets WHERE user_id = ? AND currency = ?',
      [userId, currency.toUpperCase()]
    );

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update wallet balance
    await dbRun(
      'UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?',
      [amount, userId, currency.toUpperCase()]
    );

    // Record transaction
    const transactionId = uuidv4();
    await dbRun(
      'INSERT INTO transactions (id, user_id, type, currency, amount) VALUES (?, ?, ?, ?, ?)',
      [transactionId, userId, 'withdrawal', currency.toUpperCase(), -amount]
    );

    res.json({ message: 'Withdrawal successful', transactionId });
    logger.info(`Withdrawal: ${userId} withdrew ${amount} ${currency}`);
  } catch (error) {
    logger.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0, type } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type as string);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const transactions = await dbAll(query, params);
    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;