# Node.js API Server

A robust Node.js API server with authentication, real-time messaging, and admin capabilities.

## Features

- 🔐 JWT Authentication
- 👥 User Management
- 👮‍♂️ Admin Dashboard
- 💬 Real-time Messaging (Socket.IO)
- 📝 API Documentation (Swagger)
- 📊 Rate Limiting
- 📝 Request Logging
- 📧 Email Integration (Brevo)
- 🔒 Security Features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone git@github.com:abhishektada/node-js-test.git
cd node-js-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
BREVO_API_KEY=your_brevo_api_key
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

The API documentation is available at:
- User API: `http://localhost:3000/api/docs/user`
- Admin API: `http://localhost:3000/api/docs/admin`

## Default Admin Credentials

The system automatically creates an admin user on startup with the following credentials:

```
Email: admin@example.com
Password: admin123
```

**Important**: Please change these credentials immediately after first login.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - User login
- POST `/api/auth/admin/login` - Admin login

### Users
- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Groups
- GET `/api/groups` - Get all groups
- POST `/api/groups` - Create a new group
- GET `/api/groups/:id` - Get group by ID
- PUT `/api/groups/:id` - Update group
- DELETE `/api/groups/:id` - Delete group

### Messages
- GET `/api/messages` - Get all messages
- POST `/api/messages` - Send a message
- GET `/api/messages/:id` - Get message by ID

## Security Features

- Rate limiting for API endpoints
- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Request logging with Winston
- Input validation with express-validator

## Real-time Features

The application uses Socket.IO for real-time messaging. WebSocket connections are available at:
```
ws://localhost:3000
```

## Logging

Logs are stored in the `logs` directory with daily rotation. The logging system uses Winston for:
- HTTP request logging
- Error logging
- Application events

## Error Handling

The application includes centralized error handling with proper error responses and logging.
