import express from 'express';
import { signup, login, googleAuth, verifyToken, logout, updateProfile } from '../controllers/authController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.post('/verify', verifyTokenMiddleware, isAuthenticated, verifyToken);
router.post('/logout', verifyTokenMiddleware, logout);
router.put('/profile', verifyTokenMiddleware, isAuthenticated, upload.single('profileImage'), updateProfile);

export default router;
