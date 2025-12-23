import express from 'express';
import cloudinary from 'cloudinary';
import Image from '../models/Image.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/upload/profile
 * Upload profile photo to Cloudinary
 */
router.post('/profile', authenticateToken, async (req, res) => {
    try {
        const { base64Image, userId } = req.body;

        if (!base64Image || !userId) {
            return res.status(400).json({ error: 'Image data and user ID are required' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload(base64Image, {
            folder: 'shuttle-tracker/profiles',
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                { quality: 'auto:good' }
            ]
        });

        // Save image record
        const image = await Image.create({
            userId,
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            imageType: 'profile'
        });

        // Update user's photoURL
        await User.findByIdAndUpdate(userId, { photoURL: result.secure_url });

        // If user is a driver, update driver photoURL too
        await Driver.findOneAndUpdate(
            { userId },
            { photoURL: result.secure_url }
        );

        res.json({
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            image
        });
    } catch (error) {
        console.error('Upload profile photo error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload photo' });
    }
});

/**
 * DELETE /api/upload/:cloudinaryId
 * Delete image from Cloudinary
 */
router.delete('/:cloudinaryId', authenticateToken, async (req, res) => {
    try {
        const { cloudinaryId } = req.params;

        // Delete from Cloudinary
        await cloudinary.v2.uploader.destroy(cloudinaryId);

        // Delete from database
        await Image.findOneAndDelete({ cloudinaryId });

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete image' });
    }
});

/**
 * GET /api/upload/user/:userId
 * Get all images for a user
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const images = await Image.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        console.error('Get user images error:', error);
        res.status(500).json({ error: error.message || 'Failed to get images' });
    }
});

export default router;
