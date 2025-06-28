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

    // Transactions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade')),
        currency TEXT NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
        reference_id TEXT,
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

    // Create indexes
    await dbRun('CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades (user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades (symbol)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history (symbol)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history (timestamp)');

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export { db };