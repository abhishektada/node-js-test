require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { apiLimiter, authLimiter } = require('./src/middlewares/rateLimiter');
const logger = require('./src/utils/logger');
const { createAdminUser } = require('./src/utils/seeder');
const messageHandler = require('./src/sockets/messageHandler');
const userSwaggerOptions = require('./swagger/userSpec');
const adminSwaggerOptions = require('./swagger/adminSpec');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Create admin user on startup
        createAdminUser();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', authLimiter, require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/user'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/groups', require('./src/routes/group'));
app.use('/api/messages', require('./src/routes/message'));

// Swagger Documentation
const userSpec = swaggerJsdoc(userSwaggerOptions);
const adminSpec = swaggerJsdoc(adminSwaggerOptions);

// Admin API Documentation
app.use('/api/docs/admin', swaggerUi.serveFiles(adminSpec, {}), swaggerUi.setup(adminSpec));
// User API Documentation
app.use('/api/docs/user', swaggerUi.serveFiles(userSpec, {}), swaggerUi.setup(userSpec));


// WebSocket setup
messageHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`User API Documentation: http://localhost:${PORT}/api/docs/user`);
    console.log(`Admin API Documentation: http://localhost:${PORT}/api/docs/admin`);
}); 