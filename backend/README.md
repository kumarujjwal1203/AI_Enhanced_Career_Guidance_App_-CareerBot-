# CareerBot Backend API

Custom Express.js backend with MongoDB for CareerBot application.

## Features

- ✅ User authentication (JWT-based)
- ✅ Chat message storage and retrieval
- ✅ MongoDB local database
- ✅ RESTful API architecture
- ✅ Password hashing with bcrypt
- ✅ Message history pruning
- ✅ CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB is running locally on port 27017:
```bash
# Start MongoDB (if not running)
mongod
```

4. Configure environment variables (`.env` file is already created):
   - Update `JWT_SECRET` to a secure random string
   - Adjust `PORT` if needed (default: 3000)

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### 1. Sign Up
- **POST** `/api/auth/signup`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "createdAt": "2025-11-11T..."
    }
  }
}
```

#### 2. Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:** Same as signup

### Chat Messages

**Note:** All chat endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your-jwt-token-here
```

#### 3. Save Message
- **POST** `/api/chat/messages`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "sender": "user",
  "message": "Hello, I need career advice",
  "meta": {
    "optional": "metadata"
  }
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Message saved successfully",
  "data": {
    "id": "message-id",
    "userId": "user-id",
    "sender": "user",
    "message": "Hello, I need career advice",
    "timestamp": "2025-11-11T...",
    "meta": {}
  }
}
```

#### 4. Get Messages
- **GET** `/api/chat/messages?limit=50`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": "message-id",
      "userId": "user-id",
      "sender": "user",
      "message": "Hello",
      "timestamp": "2025-11-11T...",
      "meta": {}
    }
  ]
}
```

#### 5. Clear All Messages
- **DELETE** `/api/chat/messages`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "All messages cleared successfully",
  "data": {
    "deletedCount": 10
  }
}
```

#### 6. Delete Specific Message
- **DELETE** `/api/chat/messages/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### Health Check
- **GET** `/api/health`
- **Response:**
```json
{
  "status": "OK",
  "message": "CareerBot Backend is running",
  "timestamp": "2025-11-11T..."
}
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### ChatMessage Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  sender: String (enum: ['user', 'ai']),
  message: String (required),
  timestamp: Date,
  meta: Map<String, String>
}
```

## Testing the API

You can test the API using:

### cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save message (replace TOKEN with actual JWT)
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"sender":"user","message":"Hello!"}'

# Get messages
curl http://localhost:3000/api/chat/messages \
  -H "Authorization: Bearer TOKEN"
```

### Postman
Import the endpoints above into Postman for easier testing.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/careerbot |
| JWT_SECRET | Secret key for JWT signing | (must be changed) |
| JWT_EXPIRES_IN | JWT token expiration | 7d |
| MAX_HISTORY | Maximum messages per user | 50 |

## Security Notes

1. **Change JWT_SECRET** in production to a strong random string
2. Use HTTPS in production
3. Implement rate limiting for production
4. Consider adding request logging
5. Add MongoDB authentication in production

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check if port 27017 is available
- Verify MONGODB_URI in `.env`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

## Next Steps

Update your Android app to connect to this backend instead of Firebase!
