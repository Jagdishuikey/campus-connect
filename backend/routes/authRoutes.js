import express from 'express';
import { signup, login, verifyToken, logout } from '../controllers/authController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.post('/verify', verifyTokenMiddleware, isAuthenticated, verifyToken);
router.post('/logout', verifyTokenMiddleware, logout);

export default router;
