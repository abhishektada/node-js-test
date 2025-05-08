const path = require('path');

module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node JS Test - User Documentation',
      version: '1.0.0',
      description: `
## WebSocket API

This API supports real-time messaging via WebSockets (Socket.IO).

### WebSocket Connection
- URL: ws://localhost:3000 (or wss://yourdomain.com in production)
- Protocol: Socket.IO

### Events

#### 1. authenticate
- Client emits: authenticate
- Payload:
  {
    "userId": "<user_id>"
  }
- Description: Authenticate the socket connection with the user's ID.

#### 2. direct_message
- Client emits: direct_message
- Payload:
  {
    "senderId": "<user_id>",
    "recipientId": "<recipient_user_id>",
    "content": "Hello!"
  }
- Server emits to recipient: new_message
- Payload:
  {
    "type": "direct",
    "message": { ...messageObject }
  }

#### 3. group_message
- Client emits: group_message
- Payload:
  {
    "senderId": "<user_id>",
    "groupId": "<group_id>",
    "content": "Hello group!"
  }
- Server emits to group: new_message
- Payload:
  {
    "type": "group",
    "message": { ...messageObject }
  }

#### 4. join_group
- Client emits: join_group
- Payload:
  {
    "userId": "<user_id>",
    "groupId": "<group_id>"
  }
- Description: Joins the user to the group's real-time chat room.

#### 5. leave_group
- Client emits: leave_group
- Payload:
  {
    "groupId": "<group_id>"
  }
- Description: Leaves the group's real-time chat room.

#### 6. error
- Server emits: error
- Payload:
  {
    "message": "Error description"
  }

### Example Usage (Client-Side with Socket.IO)
\`\`\`
const socket = io('http://localhost:3000');

// Authenticate
socket.emit('authenticate', userId);

// Send a direct message
socket.emit('direct_message', { senderId, recipientId, content: 'Hello!' });

// Send a group message
socket.emit('group_message', { senderId, groupId, content: 'Hello group!' });

// Join a group
socket.emit('join_group', { userId, groupId });

// Leave a group
socket.emit('leave_group', { groupId });

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('Received message:', data);
});
\`\`\`
`,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  apis: [
    path.join(__dirname, '../src/routes/auth.js'),
    path.join(__dirname, '../src/routes/group.js'),
    path.join(__dirname, '../src/routes/message.js'),
  ],
}; 