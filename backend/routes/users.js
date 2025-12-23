import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/:userId
 * Get user data by ID
 */
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: error.message || 'Failed to get user data' });
    }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow password updates through this endpoint
        delete updates.password;
        delete updates.email; // Email shouldn't be changed

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: error.message || 'Failed to update user' });
    }
});

/**
 * PUT /api/users/:userId/route
 * Update user's selected route (for students/employees)
 */
router.put('/:userId/route', authenticateToken, async (req, res) => {
    try {
        const { routeId } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            {
                selectedRoute: routeId,
                lastRouteUpdate: new Date()
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update user route error:', error);
        res.status(500).json({ error: error.message || 'Failed to update route' });
    }
});

/**
 * GET /api/users/:userId/route
 * Get user's selected route
 */
router.get('/:userId/route', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('selectedRoute');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ selectedRoute: user.selectedRoute || null });
    } catch (error) {
        console.error('Get user route error:', error);
        res.status(500).json({ error: error.message || 'Failed to get route' });
    }
});

export default router;
