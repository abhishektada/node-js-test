const swaggerJsdoc = require('swagger-jsdoc');

const baseOptions = {
    openapi: '3.0.0',
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    firstName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    country: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                    isVerified: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['name', 'firstName', 'email', 'country']
            },
            Group: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    members: { 
                        type: 'array',
                        items: { type: 'string' }
                    },
                    createdBy: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['name']
            },
            Message: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    content: { type: 'string' },
                    sender: { type: 'string' },
                    recipient: { type: 'string' },
                    group: { type: 'string' },
                    messageType: { type: 'string', enum: ['direct', 'group'] },
                    isRead: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['content', 'messageType']
            },
            Login: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' }
                },
                required: ['email', 'password']
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                }
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
};

const userSwaggerOptions = {
    definition: {
        ...baseOptions,
        info: {
            title: 'Node JS Test - User Documentation',
            version: '1.0.0',
            description: 'API documentation for user endpoints',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'API Server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Groups', description: 'Group operations' },
            { name: 'Messages', description: 'Message operations' }
        ]
    },
    apis: [
        './src/routes/auth.js',
        './src/routes/group.js',
        './src/routes/message.js'
    ],
};

const adminSwaggerOptions = {
    definition: {
        ...baseOptions,
        info: {
            title: 'Node JS Test - Admin Documentation',
            version: '1.0.0',
            description: 'API documentation for admin endpoints',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'API Server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Admin', description: 'Admin operations' }
        ]
    },
    apis: ['./src/routes/admin.js'],
};

module.exports = {
    userSwaggerOptions,
    adminSwaggerOptions
}; 