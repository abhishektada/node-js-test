const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const Group = require('../models/group');
const User = require('../models/user');

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group operations for users
 */

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - members
 *             properties:
 *               name:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, members } = req.body;
        
        // Verify all members exist
        const validMembers = await User.find({ _id: { $in: members } });
        if (validMembers.length !== members.length) {
            return res.status(400).json({ message: 'One or more members do not exist' });
        }

        const group = new Group({
            name,
            members: [...members, req.user._id], // Add creator as member
            createdBy: req.user._id
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups for the authenticated user
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('members', 'name email')
            .populate('createdBy', 'name email');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get a specific group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name email');
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.some(member => member._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/groups/{id}/members:
 *   post:
 *     summary: Add members to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - members
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to add members
 *       404:
 *         description: Group not found
 */
router.post('/:id/members', authenticate, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.createdBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to add members' });
        }

        const { members } = req.body;
        
        // Verify all members exist
        const validMembers = await User.find({ _id: { $in: members } });
        if (validMembers.length !== members.length) {
            return res.status(400).json({ message: 'One or more members do not exist' });
        }

        // Add new members
        group.members = [...new Set([...group.members, ...members])];
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 