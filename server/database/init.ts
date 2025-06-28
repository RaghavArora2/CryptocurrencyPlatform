import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';

const db = new sqlite3.Database('./database.sqlite');

// Promisify database methods
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

export async function initializeDatabase() {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        is_verified BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        api_key TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wallets table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        currency TEXT NOT NULL,
        balance DECIMAL(20, 8) DEFAULT 0,
        locked_balance DECIMAL(20, 8) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, currency)
      )
    `);

    // Trades table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
        amount DECIMAL(20, 8) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        total DECIMAL(20, 8) NOT NULL,
        fee DECIMAL(20, 8) DEFAULT 0,
        status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Positions table (for advanced trading)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('long', 'short')),
        size DECIMAL(20, 8) NOT NULL,
        entry_price DECIMAL(20, 8) NOT NULL,
        current_price DECIMAL(20, 8) NOT NULL,
        leverage INTEGER DEFAULT 1,
        margin DECIMAL(20, 8) NOT NULL,
        unrealized_pnl DECIMAL(20, 8) DEFAULT 0,
        realized_pnl DECIMAL(20, 8) DEFAULT 0,
        status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
        stop_loss DECIMAL(20, 8),
        take_profit DECIMAL(20, 8),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Orders table (for pending orders)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('market', 'limit', 'stop', 'stop_limit')),
        side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
        amount DECIMAL(20, 8) NOT NULL,
        price DECIMAL(20, 8),
        stop_price DECIMAL(20, 8),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected')),
        filled_amount DECIMAL(20, 8) DEFAULT 0,
        remaining_amount DECIMAL(20, 8),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Transactions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'fee', 'pnl')),
        currency TEXT NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
        reference_id TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Price history table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        volume_24h DECIMAL(20, 8),
        market_cap DECIMAL(20, 8),
        price_change_24h DECIMAL(10, 4),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Security logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN DEFAULT TRUE,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create indexes for better performance
    await dbRun('CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades (user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades (symbol)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades (created_at)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions (user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_positions_status ON positions (status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history (symbol)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history (timestamp)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs (user_id)');

    logger.info('Database initialized successfully with all tables and indexes');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export { db };