const db = require('./db');
const logger = require('../utils/logger');

const seedData = [
    {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        message: 'This health dashboard is amazing! I love how it tracks my sleep patterns and correlates them with my academic performance.'
    },
    {
        name: 'Bob Smith',
        email: 'bob.smith@student.edu',
        message: 'The stress level monitoring feature is incredibly helpful. It alerts me when I need to take breaks.'
    },
    {
        name: 'Carol Davis',
        email: 'carol.davis@university.edu',
        message: 'I appreciate the integration between health metrics and academic goals. The burnout risk assessment has been particularly valuable.'
    }
];

async function seedDatabase() {
    try {
        logger.info('Starting database seeding...');

        const existingData = await db.query('SELECT COUNT(*) FROM submissions');
        const count = parseInt(existingData.rows[0].count);

        if (count > 0) {
            logger.info(`Database already contains ${count} submissions. Skipping seed.`);
            return;
        }

        for (const submission of seedData) {
            await db.query(
                'INSERT INTO submissions (name, email, message) VALUES ($1, $2, $3)',
                [submission.name, submission.email, submission.message]
            );
        }

        logger.info(`Database seeding completed successfully. Total submissions: ${seedData.length}`);

    } catch (error) {
        logger.error('Database seeding failed', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

if (require.main === module) {
    seedDatabase()
        .then(() => {
            logger.info('Seeding process completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Seeding process failed', { error: error.message });
            process.exit(1);
        });
}

module.exports = { seedDatabase, seedData };