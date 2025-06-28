import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Place trade order
router.post('/order', authenticateToken, [
  body('symbol').isString().isLength({ min: 1 }),
  body('side').isIn(['buy', 'sell']),
  body('amount').isFloat({ min: 0.00000001 }),
  body('price').isFloat({ min: 0.01 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symbol, side, amount, price } = req.body;
    const userId = req.user.userId;
    const total = amount * price;
    const fee = total * 0.001; // 0.1% trading fee

    // Start transaction
    await dbRun('BEGIN TRANSACTION');

    try {
      if (side === 'buy') {
        // Check USD balance
        const usdWallet = await dbGet(
          'SELECT balance FROM wallets WHERE user_id = ? AND currency = ?',
          [userId, 'USD']
        );

        if (!usdWallet || usdWallet.balance < (total + fee)) {
          await dbRun('ROLLBACK');
          return res.status(400).json({ message: 'Insufficient USD balance' });
        }

        // Update USD balance
        await dbRun(
          'UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?',
          [total + fee, userId, 'USD']
        );

        // Update crypto balance
        await dbRun(
          'UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND currency = ?',
          [amount, userId, symbol.toUpperCase()]
        );
      } else {
        // Check crypto balance
        const cryptoWallet = await dbGet(
          'SELECT balance FROM wallets WHERE user_id = ? AND currency = ?',
          [userId, symbol.toUpperCase()]
        );

        if (!cryptoWallet || cryptoWallet.balance < amount) {
          await dbRun('ROLLBACK');
          return res.status(400).json({ message: `Insufficient ${symbol.toUpperCase()} balance` });
        }

        // Update crypto balance
        await dbRun(
          'UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?',
          [amount, userId, symbol.toUpperCase()]
        );

        // Update USD balance
        await dbRun(
          'UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND currency = ?',
          [total - fee, userId, 'USD']
        );
      }

      // Record trade
      const tradeId = uuidv4();
      await dbRun(
        'INSERT INTO trades (id, user_id, symbol, side, amount, price, total, fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [tradeId, userId, symbol.toUpperCase(), side, amount, price, total, fee]
      );

      // Record transaction
      const transactionId = uuidv4();
      await dbRun(
        'INSERT INTO transactions (id, user_id, type, currency, amount, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
        [transactionId, userId, 'trade', symbol.toUpperCase(), side === 'buy' ? amount : -amount, tradeId]
      );

      await dbRun('COMMIT');

      res.json({
        message: 'Trade executed successfully',
        trade: {
          id: tradeId,
          symbol: symbol.toUpperCase(),
          side,
          amount,
          price,
          total,
          fee,
        },
      });

      logger.info(`Trade executed: ${userId} ${side} ${amount} ${symbol} at ${price}`);
    } catch (error) {
      await dbRun('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Trading error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user trades
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const trades = await dbAll(
      'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, Number(limit), Number(offset)]
    );

    res.json(trades);
  } catch (error) {
    logger.error('Error fetching trades:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trading statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await dbGet(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN side = 'buy' THEN total ELSE 0 END) as total_bought,
        SUM(CASE WHEN side = 'sell' THEN total ELSE 0 END) as total_sold,
        SUM(fee) as total_fees,
        AVG(total) as avg_trade_size
      FROM trades 
      WHERE user_id = ?
    `, [userId]);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching trading stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;