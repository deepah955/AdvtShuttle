import express from 'express';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/drivers/:userId
 * Get driver data by user ID
 */
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.params.userId });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({ error: error.message || 'Failed to get driver data' });
    }
});

/**
 * POST /api/drivers/initialize
 * Initialize driver data if it doesn't exist
 */
router.post('/initialize', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if driver already exists
        let driver = await Driver.findOne({ userId });
        if (driver) {
            return res.json(driver);
        }

        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create driver record
        driver = await Driver.create({
            userId: user._id,
            name: user.name,
            email: user.email,
            employeeId: user.employeeId,
            phone: user.phone,
            vehicleNo: user.vehicleNo,
            photoURL: user.photoURL,
            isOnShift: false,
            currentRoute: null
        });

        res.status(201).json(driver);
    } catch (error) {
        console.error('Initialize driver error:', error);
        res.status(500).json({ error: error.message || 'Failed to initialize driver' });
    }
});

/**
 * PUT /api/drivers/:userId/shift
 * Update driver shift status
 */
router.put('/:userId/shift', authenticateToken, async (req, res) => {
    try {
        const { isOnShift, routeId } = req.body;

        const driver = await Driver.findOneAndUpdate(
            { userId: req.params.userId },
            {
                isOnShift,
                currentRoute: routeId,
                lastShiftUpdate: new Date()
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Update shift error:', error);
        res.status(500).json({ error: error.message || 'Failed to update shift status' });
    }
});

/**
 * PUT /api/drivers/:userId/route
 * Update driver route
 */
router.put('/:userId/route', authenticateToken, async (req, res) => {
    try {
        const { routeId } = req.body;

        const driver = await Driver.findOneAndUpdate(
            { userId: req.params.userId },
            {
                currentRoute: routeId,
                lastRouteUpdate: new Date()
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({ error: error.message || 'Failed to update route' });
    }
});

/**
 * PUT /api/drivers/:userId/vehicle
 * Update driver vehicle number
 */
router.put('/:userId/vehicle', authenticateToken, async (req, res) => {
    try {
        const { vehicleNo } = req.body;

        const driver = await Driver.findOneAndUpdate(
            { userId: req.params.userId },
            {
                vehicleNo: vehicleNo.trim(),
                vehicleUpdatedAt: new Date()
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ error: error.message || 'Failed to update vehicle number' });
    }
});

/**
 * GET /api/drivers/active/all
 * Get all active drivers (on shift)
 */
router.get('/active/all', async (req, res) => {
    try {
        const drivers = await Driver.find({ isOnShift: true }).populate('userId', 'name email photoURL');
        res.json(drivers);
    } catch (error) {
        console.error('Get active drivers error:', error);
        res.status(500).json({ error: error.message || 'Failed to get active drivers' });
    }
});

export default router;
