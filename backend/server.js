import express from 'express'
import cors from 'cors'
import connectdb from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import lostFoundRoutes from './routes/lostFoundRoutes.js'
import connectionRoutes from './routes/connectionRoutes.js'

import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 3000

const app = express()

// CORS Middleware - must be before routes
app.use(cors({
  origin: 'http://localhost:5173',
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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' })
})

// 404 route - must be last
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})