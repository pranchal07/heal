const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param } = require('express-validator');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    }
}));

const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' }
});

app.use(limiter);

const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many submissions, please try again later.' }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
}

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

const validateSubmission = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must be 2-100 characters and contain only letters and spaces'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
];

const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation failed', { 
            errors: errors.array(), 
            ip: req.ip, 
            userAgent: req.get('User-Agent') 
        });
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

app.post('/api/submissions', 
    submitLimiter, 
    validateSubmission, 
    handleValidationErrors, 
    async (req, res) => {
        try {
            const { name, email, message } = req.body;

            logger.info('Creating new submission', { 
                name, 
                email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
                ip: req.ip 
            });

            const result = await db.query(
                'INSERT INTO submissions (name, email, message, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [name, email, message]
            );

            const submission = result.rows[0];

            logger.info('Submission created successfully', { 
                id: submission.id, 
                ip: req.ip 
            });

            res.status(201).json({
                success: true,
                message: 'Submission created successfully',
                data: submission
            });

        } catch (error) {
            logger.error('Error creating submission', { 
                error: error.message, 
                stack: error.stack, 
                ip: req.ip 
            });

            res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again later.'
            });
        }
    }
);

app.get('/api/submissions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = (page - 1) * limit;

        logger.info('Fetching submissions', { 
            page, 
            limit, 
            ip: req.ip 
        });

        const countResult = await db.query('SELECT COUNT(*) FROM submissions');
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await db.query(
            'SELECT id, name, email, message, created_at FROM submissions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const submissions = result.rows;

        logger.info('Submissions fetched successfully', { 
            count: submissions.length, 
            total: totalCount,
            ip: req.ip 
        });

        res.json({
            success: true,
            data: submissions,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        logger.error('Error fetching submissions', { 
            error: error.message, 
            stack: error.stack, 
            ip: req.ip 
        });

        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

app.delete('/api/submissions/:id', 
    validateId, 
    handleValidationErrors, 
    async (req, res) => {
        try {
            const { id } = req.params;

            logger.info('Deleting submission', { 
                id, 
                ip: req.ip 
            });

            const result = await db.query(
                'DELETE FROM submissions WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                logger.warn('Submission not found for deletion', { 
                    id, 
                    ip: req.ip 
                });

                return res.status(404).json({
                    success: false,
                    message: 'Submission not found'
                });
            }

            logger.info('Submission deleted successfully', { 
                id, 
                ip: req.ip 
            });

            res.json({
                success: true,
                message: 'Submission deleted successfully'
            });

        } catch (error) {
            logger.error('Error deleting submission', { 
                error: error.message, 
                stack: error.stack, 
                id: req.params.id,
                ip: req.ip 
            });

            res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again later.'
            });
        }
    }
);

if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

app.use('*', (req, res) => {
    logger.warn('Route not found', { 
        url: req.originalUrl, 
        method: req.method, 
        ip: req.ip 
    });

    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((error, req, res, next) => {
    logger.error('Unhandled error', { 
        error: error.message, 
        stack: error.stack, 
        url: req.originalUrl, 
        method: req.method,
        ip: req.ip 
    });

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT
    });
});

server.on('error', (error) => {
    logger.error('Server error', { error: error.message, stack: error.stack });
});

module.exports = app;