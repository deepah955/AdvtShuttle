import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role, registrationNumber, employeeId, phone, photoURL, vehicleNo } = req.body;

        // Validate required fields
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Email, password, name, and role are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
            registrationNumber,
            employeeId,
            phone,
            photoURL,
            vehicleNo
        });

        // If driver, create driver record
        if (role === 'driver') {
            await Driver.create({
                userId: user._id,
                name,
                email: email.toLowerCase(),
                employeeId,
                phone,
                vehicleNo,
                photoURL,
                isOnShift: false,
                currentRoute: null
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.email, user.role);

        // Return user data (without password)
        res.status(201).json({
            user: {
                uid: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                registrationNumber: user.registrationNumber,
                employeeId: user.employeeId,
                phone: user.phone,
                photoURL: user.photoURL,
                vehicleNo: user.vehicleNo,
                createdAt: user.createdAt
            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message || 'Failed to create user' });
    }
});

/**
 * POST /api/auth/signin
 * Sign in an existing user
 */
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.email, user.role);

        // Return user data (without password)
        res.json({
            user: {
                uid: user._id,
                email: user.email,
                displayName: user.name,
                photoURL: user.photoURL
            },
            token
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: error.message || 'Failed to sign in' });
    }
});

export default router;
