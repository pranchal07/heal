# HealthSync Complete Project Setup Guide

## What's Included
This zip contains a complete full-stack web application with:

### Frontend
- Modern HTML5, CSS3, and JavaScript
- User data form with validation
- Responsive design
- API integration

### Backend
- Node.js + Express.js server
- PostgreSQL database integration
- RESTful API endpoints
- Security middleware
- Comprehensive logging
- Test suite

### DevOps
- Docker containerization
- Multi-service orchestration
- Nginx web server configuration
- Production-ready deployment

## Quick Start Steps

1. **Extract Files**
   ```bash
   unzip HealthSync_Complete_Project_*.zip
   cd HealthSync_Complete_Project/
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for Docker)
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

4. **Access Application**
   - Frontend: http://localhost:8080
   - API: http://localhost:3000/health
   - Database: PostgreSQL on port 5432

5. **Test the User Data Feature**
   - Click on "User Data" in the sidebar
   - Fill out the form with your information
   - Submit and see it appear in the saved records
   - Try deleting a record

## Manual Setup (Alternative)

If you prefer to run without Docker:

1. **Setup Database**
   ```bash
   # Install PostgreSQL and create database
   createdb healthsync_db
   psql healthsync_db < backend/database/migration.sql
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run seed  # Optional: add sample data
   npm start     # Runs on port 3000
   ```

3. **Setup Frontend**
   ```bash
   # In a new terminal
   cd frontend
   python -m http.server 8080
   # Or use any static file server
   ```

## API Testing

Test the API directly:

```bash
# Create a submission
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Testing the API functionality"}'

# Get all submissions
curl http://localhost:3000/api/submissions

# Check health
curl http://localhost:3000/health
```

## Development

```bash
# Run tests
cd backend && npm test

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## Features

✅ User data form with validation
✅ Real-time form validation
✅ Persistent data storage
✅ Records management (view/delete)
✅ RESTful API with proper error handling
✅ Security best practices
✅ Comprehensive logging
✅ Docker containerization
✅ Production-ready configuration

## Troubleshooting

**Database connection issues:**
- Ensure PostgreSQL is running
- Check credentials in .env file
- Wait for database to fully start (30 seconds)

**API not responding:**
- Check if port 3000 is available
- View logs: `docker-compose logs api`
- Verify environment variables

**Frontend not loading:**
- Ensure port 8080 is available
- Check if API is running
- Verify CORS configuration

## Support

Refer to README.md for complete documentation and troubleshooting guide.

---
Built with ❤️ for student health and academic success
