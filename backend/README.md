# Shuttle Tracker Backend API

Backend server for the Shuttle Tracker application using MongoDB Atlas, Cloudinary, and JWT authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env` file is already configured with your credentials:
- MongoDB Atlas
- Cloudinary
- JWT Secret

### 3. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user

### Users
- `GET /api/users/:userId` - Get user data
- `PUT /api/users/:userId` - Update user profile
- `PUT /api/users/:userId/route` - Update user's selected route
- `GET /api/users/:userId/route` - Get user's selected route

### Drivers
- `GET /api/drivers/:userId` - Get driver data
- `POST /api/drivers/initialize` - Initialize driver record
- `PUT /api/drivers/:userId/shift` - Update shift status
- `PUT /api/drivers/:userId/route` - Update driver route
- `PUT /api/drivers/:userId/vehicle` - Update vehicle number
- `GET /api/drivers/active/all` - Get all active drivers

### Locations
- `POST /api/locations/update` - Update driver location
- `GET /api/locations/active` - Get all active shuttle locations
- `GET /api/locations/:driverId` - Get specific driver location
- `DELETE /api/locations/:driverId` - Remove driver location

### Image Upload (Cloudinary)
- `POST /api/upload/profile` - Upload profile photo
- `GET /api/upload/user/:userId` - Get user's images
- `DELETE /api/upload/:cloudinaryId` - Delete image

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📦 Database Schema

### Users Collection
- email, password (hashed), name, role
- registrationNumber, employeeId, phone
- photoURL, vehicleNo
- selectedRoute, lastRouteUpdate

### Drivers Collection
- userId (ref to User), name, email
- employeeId, phone, vehicleNo, photoURL
- isOnShift, currentRoute
- lastShiftUpdate, vehicleUpdatedAt

### ShuttleLocations Collection
- driverId (ref to Driver)
- routeId, lat, lon, speed, bearing
- timestamp
- Auto-deletes after 24 hours (TTL index)

### Images Collection
- userId (ref to User)
- imageUrl, cloudinaryId
- imageType (profile/vehicle/other)

## 🌐 CORS

CORS is enabled for all origins. For production, update the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: 'your-expo-app-url'
}));
```

## 📝 Example Requests

### Signup
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "driver@example.com",
  "password": "password123",
  "name": "John Driver",
  "role": "driver",
  "employeeId": "EMP001",
  "phone": "+1234567890",
  "vehicleNo": "TN01AB1234"
}
```

### Upload Profile Photo
```bash
POST http://localhost:5000/api/upload/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "base64Image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

### Update Location
```bash
POST http://localhost:5000/api/locations/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "driverId": "driver_id_here",
  "routeId": "lh-prp",
  "lat": 13.0827,
  "lon": 80.2707,
  "speed": 45.5,
  "bearing": 180,
  "timestamp": 1703251200000
}
```

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **MongoDB Atlas** - Database (512 MB free tier)
- **Mongoose** - MongoDB ODM
- **Cloudinary** - Image storage (~25 GB free)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📊 Monitoring

Check server health:
```bash
GET http://localhost:5000/
```

## 🔒 Security Notes

- Never commit `.env` file to version control
- JWT tokens expire after 30 days
- Passwords are hashed with bcrypt (10 rounds)
- Old shuttle locations auto-delete after 24 hours
- Image uploads limited to 50MB

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check your IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env`

### Cloudinary Upload Fails
- Verify Cloudinary credentials in `.env`
- Check image size (max 50MB)
- Ensure base64 format is correct

### CORS Errors
- Update CORS configuration for your Expo app URL
- Check request headers include proper Authorization

---

**Ready to integrate with your Expo app!** 🎉
