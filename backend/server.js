import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import driverRoutes from './routes/drivers.js';
import locationRoutes from './routes/locations.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DATABASE || 'shuttle_tracker'
})
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        console.log(`📦 Database: ${process.env.MONGODB_DATABASE || 'shuttle_tracker'}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Shuttle Tracker API',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            drivers: '/api/drivers',
            locations: '/api/locations',
            upload: '/api/upload'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`☁️  Cloudinary configured: ${process.env.CLOUDINARY_NAME}`);
    console.log('\n📍 Available endpoints:');
    console.log('   POST   /api/auth/signup');
    console.log('   POST   /api/auth/signin');
    console.log('   GET    /api/users/:userId');
    console.log('   PUT    /api/users/:userId');
    console.log('   GET    /api/drivers/:userId');
    console.log('   PUT    /api/drivers/:userId/shift');
    console.log('   POST   /api/locations/update');
    console.log('   GET    /api/locations/active');
    console.log('   POST   /api/upload/profile');
    console.log('\n✨ Ready to accept requests!');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});
