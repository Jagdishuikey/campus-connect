import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectdb from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import lostFoundRoutes from './routes/lostFoundRoutes.js'
import connectionRoutes from './routes/connectionRoutes.js'
import postRoutes from './routes/postRoutes.js'

import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000

const app = express()
const httpServer = createServer(app)

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://campus-connect-kohl.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  }
})

// Expose io to route handlers via req.app.get('io')
app.set('io', io)

// Track online users: userId -> socketId
const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  // User registers their identity
  socket.on('register', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id)
      console.log(`User ${userId} is online (socket: ${socket.id})`)
      // Broadcast online status
      io.emit('user_online', userId)
    }
  })

  // User sends a message
  socket.on('send_message', (data) => {
    const { recipientId, message } = data
    const recipientSocket = onlineUsers.get(recipientId)
    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_message', message)
    }
  })

  // Typing indicator
  socket.on('typing', (data) => {
    const { recipientId, senderId } = data
    const recipientSocket = onlineUsers.get(recipientId)
    if (recipientSocket) {
      io.to(recipientSocket).emit('user_typing', { senderId })
    }
  })

  socket.on('stop_typing', (data) => {
    const { recipientId, senderId } = data
    const recipientSocket = onlineUsers.get(recipientId)
    if (recipientSocket) {
      io.to(recipientSocket).emit('user_stop_typing', { senderId })
    }
  })

  // Connection request notification
  socket.on('connection_request', (data) => {
    const { recipientId } = data
    const recipientSocket = onlineUsers.get(recipientId)
    if (recipientSocket) {
      io.to(recipientSocket).emit('new_connection_request', data)
    }
  })

  socket.on('disconnect', () => {
    // Remove from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
        io.emit('user_offline', userId)
        console.log(`User ${userId} went offline`)
        break
      }
    }
  })
})

// CORS Middleware - must be before routes
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://campus-connect-kohl.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to database
await connectdb();

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/lostfound', lostFoundRoutes)
app.use('/api/connections', connectionRoutes)
app.use('/api/posts', postRoutes)

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' })
})

// 404 route - must be last
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT} with Socket.IO`)
})