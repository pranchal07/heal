const { Pool } = require('pg');
const logger = require('../utils/logger');

const dbConfig = {
    user: process.env.DB_USER || 'healthsync_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'healthsync_db',
    password: process.env.DB_PASSWORD || 'healthsync_password',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', {
        error: err.message,
        stack: err.stack
    });
    process.exit(-1);
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();

        logger.info('Database connection test successful', {
            timestamp: result.rows[0].now
        });

        return true;
    } catch (error) {
        logger.error('Database connection test failed', {
            error: error.message,
            stack: error.stack
        });
        return false;
    }
};

const initializeSchema = async () => {
    try {
        const client = await pool.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_submissions_created_at 
            ON submissions(created_at DESC);
        `);

        client.release();

        logger.info('Database schema initialized successfully');

    } catch (error) {
        logger.error('Failed to initialize database schema', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

const query = async (text, params = []) => {
    const start = Date.now();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        logger.debug('Query executed successfully', {
            query: text,
            duration: `${duration}ms`,
            rows: result.rowCount
        });

        return result;
    } catch (error) {
        const duration = Date.now() - start;

        logger.error('Query execution failed', {
            query: text,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack
        });

        throw error;
    }
};

const end = async () => {
    try {
        await pool.end();
        logger.info('Database pool closed');
    } catch (error) {
        logger.error('Error closing database pool', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = {
    query,
    end,
    testConnection,
    initializeSchema,
    pool
};