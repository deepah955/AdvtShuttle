import express from 'express';
import ShuttleLocation from '../models/ShuttleLocation.js';
import Driver from '../models/Driver.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/locations/update
 * Update driver location
 */
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { driverId, routeId, lat, lon, speed, bearing, timestamp } = req.body;

        // Validate coordinates
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        // Update or create location
        const location = await ShuttleLocation.findOneAndUpdate(
            { driverId },
            {
                driverId,
                routeId,
                lat,
                lon,
                speed: speed || 0,
                bearing: bearing || 0,
                timestamp,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json(location);
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ error: error.message || 'Failed to update location' });
    }
});

/**
 * DELETE /api/locations/:driverId
 * Remove driver location
 */
router.delete('/:driverId', authenticateToken, async (req, res) => {
    try {
        await ShuttleLocation.findOneAndDelete({ driverId: req.params.driverId });
        res.json({ message: 'Location removed successfully' });
    } catch (error) {
        console.error('Remove location error:', error);
        res.status(500).json({ error: error.message || 'Failed to remove location' });
    }
});

/**
 * GET /api/locations/active
 * Get all active shuttle locations with driver info
 */
router.get('/active', async (req, res) => {
    try {
        // Get all active drivers
        const activeDrivers = await Driver.find({ isOnShift: true }).populate('userId', 'name');

        // Get locations for active drivers
        const driverIds = activeDrivers.map(d => d._id);
        const locations = await ShuttleLocation.find({ driverId: { $in: driverIds } });

        // Combine driver and location data
        const shuttles = activeDrivers.map(driver => {
            const location = locations.find(loc => loc.driverId.toString() === driver._id.toString());

            if (!location) return null;

            return {
                id: driver._id,
                routeId: driver.currentRoute || location.routeId,
                lat: location.lat,
                lon: location.lon,
                speed: location.speed,
                bearing: location.bearing,
                driverName: driver.name,
                vehicleNo: driver.vehicleNo || 'N/A',
                timestamp: location.timestamp
            };
        }).filter(Boolean); // Remove null entries

        res.json(shuttles);
    } catch (error) {
        console.error('Get active locations error:', error);
        res.status(500).json({ error: error.message || 'Failed to get active locations' });
    }
});

/**
 * GET /api/locations/:driverId
 * Get specific driver location
 */
router.get('/:driverId', async (req, res) => {
    try {
        const location = await ShuttleLocation.findOne({ driverId: req.params.driverId });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    } catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({ error: error.message || 'Failed to get location' });
    }
});

export default router;
