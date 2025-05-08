const { User } = require('../models');
const crypto = require('crypto');

const seedDefaultAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            const admin = new User({
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                name: 'Admin',
                firstName: 'Super',
                country: 'System',
                role: 'admin',
                isVerified: true
            });

            await admin.save();
            console.log('Default admin created successfully');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

module.exports = seedDefaultAdmin; 