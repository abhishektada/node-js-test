const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure either recipient or group is present, but not both
messageSchema.pre('save', function(next) {
    if ((this.recipient && this.group) || (!this.recipient && !this.group)) {
        next(new Error('Message must have either a recipient or a group, but not both'));
    }
    next();
});

// Check if model exists before creating a new one
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
