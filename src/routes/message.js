const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const Message = require('../models/Message');
const User = require('../models/user');
const Group = require('../models/Group');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging endpoints for users
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - messageType
 *             properties:
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [direct, group]
 *               recipient:
 *                 type: string
 *               group:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { content, messageType, recipient, group } = req.body;

        // Validate message type and recipient/group
        if (messageType === 'direct' && !recipient) {
            return res.status(400).json({ message: 'Recipient is required for direct messages' });
        }
        if (messageType === 'group' && !group) {
            return res.status(400).json({ message: 'Group is required for group messages' });
        }

        // For direct messages, verify recipient exists
        if (messageType === 'direct') {
            const recipientUser = await User.findById(recipient);
            if (!recipientUser) {
                return res.status(400).json({ message: 'Recipient not found' });
            }
        }

        // For group messages, verify group exists and user is a member
        if (messageType === 'group') {
            const groupDoc = await Group.findById(group);
            if (!groupDoc) {
                return res.status(400).json({ message: 'Group not found' });
            }
            if (!groupDoc.members.includes(req.user._id)) {
                return res.status(403).json({ message: 'Not a member of this group' });
            }
        }

        const message = new Message({
            sender: req.user._id,
            recipient: messageType === 'direct' ? recipient : undefined,
            group: messageType === 'group' ? group : undefined,
            content,
            messageType
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get messages for the authenticated user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group]
 *       - in: query
 *         name: recipient
 *         schema:
 *           type: string
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { type, recipient, group } = req.query;
        let query = {};

        if (type === 'direct') {
            query = {
                messageType: 'direct',
                $or: [
                    { sender: req.user._id, recipient },
                    { sender: recipient, recipient: req.user._id }
                ]
            };
        } else if (type === 'group') {
            query = {
                messageType: 'group',
                group
            };
        } else {
            query = {
                $or: [
                    { sender: req.user._id },
                    { recipient: req.user._id },
                    { group: { $in: req.user.groups } }
                ]
            };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name email')
            .populate('recipient', 'name email')
            .populate('group', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 