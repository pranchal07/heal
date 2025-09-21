# HealthSync - AI-Powered Student Health & Academic Dashboard

A comprehensive full-stack application that monitors student health metrics and correlates them with academic performance to provide personalized insights and recommendations.

## 🚀 Features

### Frontend
- **User Data Management**: Submit and manage user feedback with real-time form validation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, professional interface with intuitive navigation

### Backend
- **RESTful API**: Secure endpoints for user data management
- **PostgreSQL Database**: Robust data storage with proper schema design
- **Security**: CORS, Helmet, rate limiting, and request sanitization
- **Logging**: Comprehensive logging with Winston for monitoring

### DevOps
- **Docker Support**: Complete containerization with multi-service setup
- **Database Migrations**: Automated schema setup and seeding
- **Testing**: Test suite with Jest and Supertest
- **Production Ready**: Environment configuration and deployment scripts

## 📁 Project Structure

```
healthsync/
├── frontend/
│   ├── index.html              # Main HTML file with User Data functionality
│   ├── style.css              # Complete CSS styling
│   └── app.js                 # JavaScript with API integration
├── backend/
│   ├── server.js              # Express server with all endpoints
│   ├── package.json           # Node.js dependencies
│   ├── database/
│   │   ├── db.js             # Database connection and utilities
│   │   ├── migration.sql     # Schema setup script
│   │   └── seed.js           # Sample data seeding
│   ├── utils/
│   │   └── logger.js         # Winston logging configuration
│   └── tests/
│       └── api.test.js       # API endpoint tests
├── docker-compose.yml         # Multi-service Docker setup
├── Dockerfile                 # Backend container configuration
├── nginx.conf                 # Nginx configuration for frontend
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS custom properties
- **Vanilla JavaScript**: ES6+ features with modular architecture

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database
- **Winston**: Logging library

### DevOps
- **Docker**: Containerization platform
- **Nginx**: Web server and reverse proxy
- **Jest**: Testing framework

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose**
- **Node.js** (v16 or higher) for local development

### Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthsync
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health

### Manual Setup

1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb healthsync_db
   psql healthsync_db < backend/database/migration.sql
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   # Edit .env with your database credentials
   npm run seed
   npm start
   ```

3. **Frontend Setup**
   ```bash
   # Serve frontend files
   cd frontend
   python -m http.server 8080
   # Or use any static file server
   ```

## 📡 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/submissions` | Create new submission | `{name, email, message}` |
| GET | `/api/submissions` | Get all submissions | Query params: `page`, `limit` |
| DELETE | `/api/submissions/:id` | Delete submission | - |
| GET | `/health` | Service health status | - |

### Example Usage

**Create Submission:**
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "This is a test message from the API."
  }'
```

**Get Submissions:**
```bash
curl http://localhost:3000/api/submissions
```

**Delete Submission:**
```bash
curl -X DELETE http://localhost:3000/api/submissions/1
```

## 🧪 Testing

```bash
cd backend
npm test
```

## 🔒 Security Features

- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for XSS, CSRF protection
- **SQL Injection Prevention**: Parameterized queries

## 🚀 Deployment

### Production Deployment with Docker

```bash
# Build and deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthsync_db
DB_USER=healthsync_user
DB_PASSWORD=healthsync_password
PORT=3000
NODE_ENV=production
```

## 📊 Database Schema

```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📞 Support

For support and questions:
- Create a GitHub issue
- Check documentation and inline code comments

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for student health and academic success**