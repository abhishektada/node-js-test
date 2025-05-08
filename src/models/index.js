const User = require('./user');
const Group = require('./group');
const Message = require('./message');

// Mongoose doesn't need explicit associations like Sequelize
// The relationships are defined in the schemas using refs

module.exports = {
    User,
    Group,
    Message
}; 