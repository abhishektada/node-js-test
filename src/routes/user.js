const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');
const { User, Group, Message } = require('../models');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

/**
 * @swagger
 * /api/users/groups:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user's groups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching groups' });
    }
});

/**
 * @swagger
 * /api/users/messages:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user's messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group]
 *         required: true
 *       - in: query
 *         name: recipientId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/messages', async (req, res) => {
    try {
        const { type, recipientId } = req.query;
        let query = {};

        if (type === 'direct') {
            query = {
                $or: [
                    { sender: req.user.id, recipient: recipientId },
                    { sender: recipientId, recipient: req.user.id }
                ],
                messageType: 'direct'
            };
        } else if (type === 'group') {
            query = {
                group: recipientId,
                messageType: 'group'
            };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .populate('sender', 'name firstName')
            .populate('recipient', 'name firstName');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

/**
 * @swagger
 * /api/users/groups/{groupId}/join:
 *   post:
 *     tags:
 *       - User
 *     summary: Join a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Joined group successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/groups/:groupId/join', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ error: 'Already a member of this group' });
        }

        group.members.push(req.user.id);
        await group.save();
        res.json({ message: 'Joined group successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error joining group' });
    }
});

/**
 * @swagger
 * /api/users/groups/{groupId}/leave:
 *   post:
 *     tags:
 *       - User
 *     summary: Leave a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully left the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Left group successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/groups/:groupId/leave', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.members.includes(req.user.id)) {
            return res.status(400).json({ error: 'Not a member of this group' });
        }

        group.members = group.members.filter(memberId => memberId.toString() !== req.user.id);
        await group.save();
        res.json({ message: 'Left group successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error leaving group' });
    }
});

module.exports = router;
