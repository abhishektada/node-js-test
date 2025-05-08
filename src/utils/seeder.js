const bcrypt = require('bcryptjs');
const User = require('../models/user');

const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new User({
            name: 'Admin',
            firstName: 'Super',
            email: 'admin@example.com',
            country: 'System',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        await admin.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

module.exports = {
    createAdminUser
}; 