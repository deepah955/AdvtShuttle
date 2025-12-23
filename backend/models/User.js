import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'employee', 'driver'],
        required: true
    },
    registrationNumber: {
        type: String,
        sparse: true
    },
    employeeId: {
        type: String,
        sparse: true
    },
    phone: {
        type: String
    },
    photoURL: {
        type: String
    },
    vehicleNo: {
        type: String
    },
    selectedRoute: {
        type: String
    },
    lastRouteUpdate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
