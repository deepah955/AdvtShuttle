import mongoose from 'mongoose';

const shuttleLocationSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        unique: true
    },
    routeId: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    lon: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    speed: {
        type: Number,
        default: 0
    },
    bearing: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for real-time location queries
shuttleLocationSchema.index({ driverId: 1 });
shuttleLocationSchema.index({ routeId: 1 });
shuttleLocationSchema.index({ timestamp: -1 });

// TTL index to auto-delete old locations (after 24 hours)
shuttleLocationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('ShuttleLocation', shuttleLocationSchema);
