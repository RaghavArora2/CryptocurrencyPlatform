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

// Open position (for advanced trading)
router.post('/position', authenticateToken, [
  body('symbol').isString().isLength({ min: 1 }),
  body('type').isIn(['long', 'short']),
  body('amount').isFloat({ min: 0.00000001 }),
  body('leverage').isInt({ min: 1, max: 100 }),
  body('order_type').isIn(['market', 'limit', 'stop']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symbol, type, amount, price, leverage, stop_loss, take_profit, order_type } = req.body;
    const userId = req.user.userId;
    const currentPrice = price || 45000; // Mock current price
    const margin = (amount * currentPrice) / leverage;
    const fee = margin * 0.001; // 0.1% fee

    // Check USD balance for margin
    const usdWallet = await dbGet(
      'SELECT balance FROM wallets WHERE user_id = ? AND currency = ?',
      [userId, 'USD']
    );

    if (!usdWallet || usdWallet.balance < (margin + fee)) {
      return res.status(400).json({ message: 'Insufficient margin' });
    }

    // Start transaction
    await dbRun('BEGIN TRANSACTION');

    try {
      // Update USD balance (lock margin)
      await dbRun(
        'UPDATE wallets SET balance = balance - ?, locked_balance = locked_balance + ? WHERE user_id = ? AND currency = ?',
        [margin + fee, margin, userId, 'USD']
      );

      // Create position
      const positionId = uuidv4();
      await dbRun(
        `INSERT INTO positions (id, user_id, symbol, type, size, entry_price, current_price, leverage, margin, status, stop_loss, take_profit) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [positionId, userId, symbol.toUpperCase(), type, amount, currentPrice, currentPrice, leverage, margin, 'open', stop_loss, take_profit]
      );

      // Create order if not market order
      if (order_type !== 'market') {
        const orderId = uuidv4();
        await dbRun(
          'INSERT INTO orders (id, user_id, symbol, type, side, amount, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orderId, userId, symbol.toUpperCase(), order_type, type === 'long' ? 'buy' : 'sell', amount, price, 'pending']
        );
      }

      await dbRun('COMMIT');

      res.json({
        message: 'Position opened successfully',
        position: {
          id: positionId,
          symbol: symbol.toUpperCase(),
          type,
          amount,
          entry_price: currentPrice,
          leverage,
          margin,
        },
      });

      logger.info(`Position opened: ${userId} ${type} ${amount} ${symbol} at ${leverage}x leverage`);
    } catch (error) {
      await dbRun('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Position opening error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Close position
router.post('/position/:id/close', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const position = await dbGet(
      'SELECT * FROM positions WHERE id = ? AND user_id = ? AND status = ?',
      [id, userId, 'open']
    );

    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    const currentPrice = 45000; // Mock current price
    const priceDiff = currentPrice - position.entry_price;
    const multiplier = position.type === 'long' ? 1 : -1;
    const pnl = priceDiff * position.size * multiplier * position.leverage;

    // Start transaction
    await dbRun('BEGIN TRANSACTION');

    try {
      // Update position
      await dbRun(
        'UPDATE positions SET status = ?, current_price = ?, realized_pnl = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['closed', currentPrice, pnl, id]
      );

      // Release margin and add/subtract PnL
      await dbRun(
        'UPDATE wallets SET balance = balance + ?, locked_balance = locked_balance - ? WHERE user_id = ? AND currency = ?',
        [position.margin + pnl, position.margin, userId, 'USD']
      );

      await dbRun('COMMIT');

      res.json({
        message: 'Position closed successfully',
        pnl,
      });

      logger.info(`Position closed: ${userId} ${position.type} ${position.symbol} PnL: ${pnl}`);
    } catch (error) {
      await dbRun('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Position closing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user positions
router.get('/positions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status = 'open' } = req.query;

    const positions = await dbAll(
      'SELECT * FROM positions WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, status]
    );

    res.json(positions);
  } catch (error) {
    logger.error('Error fetching positions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    let query = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status as string);
    }

    query += ' ORDER BY created_at DESC';

    const orders = await dbAll(query, params);
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel order
router.delete('/order/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await dbGet(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = ?',
      [id, userId, 'pending']
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await dbRun(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', id]
    );

    res.json({ message: 'Order cancelled successfully' });
    logger.info(`Order cancelled: ${userId} ${order.symbol} ${order.side}`);
  } catch (error) {
    logger.error('Order cancellation error:', error);
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

// Get trading analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { timeframe = '30d' } = req.query;

    let dateFilter = '';
    switch (timeframe) {
      case '7d':
        dateFilter = "AND created_at >= datetime('now', '-7 days')";
        break;
      case '30d':
        dateFilter = "AND created_at >= datetime('now', '-30 days')";
        break;
      case '90d':
        dateFilter = "AND created_at >= datetime('now', '-90 days')";
        break;
      case '1y':
        dateFilter = "AND created_at >= datetime('now', '-1 year')";
        break;
    }

    const stats = await dbGet(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN side = 'buy' THEN total ELSE -total END) as total_pnl,
        SUM(CASE WHEN side = 'buy' THEN total ELSE 0 END) as total_bought,
        SUM(CASE WHEN side = 'sell' THEN total ELSE 0 END) as total_sold,
        SUM(fee) as total_fees,
        AVG(total) as avg_trade_size,
        SUM(total) as total_volume,
        MAX(CASE WHEN side = 'sell' THEN total - fee ELSE 0 END) as best_trade,
        MIN(CASE WHEN side = 'buy' THEN -(total + fee) ELSE 0 END) as worst_trade
      FROM trades 
      WHERE user_id = ? ${dateFilter}
    `, [userId]);

    // Calculate win/loss stats
    const winLossStats = await dbGet(`
      SELECT 
        COUNT(CASE WHEN side = 'sell' AND total > 0 THEN 1 END) as winning_trades,
        COUNT(CASE WHEN side = 'buy' AND total > 0 THEN 1 END) as losing_trades
      FROM trades 
      WHERE user_id = ? ${dateFilter}
    `, [userId]);

    const totalTrades = stats.total_trades || 0;
    const winningTrades = winLossStats.winning_trades || 0;
    const losingTrades = winLossStats.losing_trades || 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const analytics = {
      total_trades: totalTrades,
      winning_trades: winningTrades,
      losing_trades: losingTrades,
      win_rate: winRate,
      total_pnl: stats.total_pnl || 0,
      best_trade: stats.best_trade || 0,
      worst_trade: stats.worst_trade || 0,
      avg_trade_size: stats.avg_trade_size || 0,
      total_volume: stats.total_volume || 0,
      total_fees: stats.total_fees || 0,
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching trading analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;