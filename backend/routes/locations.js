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

        // Find Driver by userId (driverId from frontend is actually userId)
        const driver = await Driver.findOne({ userId: driverId });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Use Driver._id as the driverId for ShuttleLocation
        const driverObjectId = driver._id;

        // Update or create location
        const location = await ShuttleLocation.findOneAndUpdate(
            { driverId: driverObjectId },
            {
                driverId: driverObjectId,
                routeId: routeId || driver.currentRoute,
                lat,
                lon,
                speed: speed || 0,
                bearing: bearing || 0,
                timestamp: timestamp || Date.now(),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        console.log(`📍 [LOCATIONS] Updated location for driver ${driverId} (${driver.name}) at ${lat}, ${lon}`);
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
router.delete('/:userId', authenticateToken, async (req, res) => {
    try {
        // Find Driver by userId
        const driver = await Driver.findOne({ userId: req.params.userId });
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Delete location using Driver._id
        await ShuttleLocation.findOneAndDelete({ driverId: driver._id });
        console.log(`🗑️ [LOCATIONS] Removed location for driver ${req.params.userId}`);
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
            // Find location by driverId (which should match driver._id or driver.userId)
            const location = locations.find(loc => 
                loc.driverId.toString() === driver._id.toString() || 
                loc.driverId.toString() === driver.userId?.toString()
            );

            if (!location) return null;

            return {
                id: driver.userId?.toString() || driver._id.toString(), // Use userId if available, fallback to _id
                routeId: driver.currentRoute || location.routeId,
                lat: location.lat,
                lon: location.lon,
                speed: location.speed || 0,
                bearing: location.bearing || 0,
                driverName: driver.name,
                vehicleNo: driver.vehicleNo || 'N/A',
                timestamp: location.timestamp || Date.now()
            };
        }).filter(Boolean); // Remove null entries
        
        console.log(`📍 [LOCATIONS] Returning ${shuttles.length} active shuttles`);

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
