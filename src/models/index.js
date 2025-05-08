const User = require('./User');
const Group = require('./Group');
const Message = require('./Message');

// Mongoose doesn't need explicit associations like Sequelize
// The relationships are defined in the schemas using refs

module.exports = {
    User,
    Group,
    Message
}; 