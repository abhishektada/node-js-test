const path = require('path');

module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node JS Test - Admin Documentation',
      version: '1.0.0',
      description: 'API documentation for admin endpoints',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../src/routes/admin.js'),
  ],
}; 