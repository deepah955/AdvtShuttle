import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    employeeId: {
        type: String
    },
    phone: {
        type: String
    },
    vehicleNo: {
        type: String
    },
    photoURL: {
        type: String
    },
    isOnShift: {
        type: Boolean,
        default: false
    },
    currentRoute: {
        type: String,
        default: null
    },
    lastShiftUpdate: {
        type: Date
    },
    vehicleUpdatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for real-time queries
driverSchema.index({ userId: 1 });
driverSchema.index({ isOnShift: 1 });
driverSchema.index({ currentRoute: 1 });

export default mongoose.model('Driver', driverSchema);
