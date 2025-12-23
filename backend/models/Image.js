import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    imageType: {
        type: String,
        enum: ['profile', 'vehicle', 'other'],
        default: 'profile'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for user's images
imageSchema.index({ userId: 1 });
imageSchema.index({ imageType: 1 });

export default mongoose.model('Image', imageSchema);
