import express from 'express';
import { createEvent, getEvents, deleteEvent, updateEvent } from '../controllers/eventController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, isAuthenticated, getEvents);
router.post('/', verifyTokenMiddleware, isAuthenticated, createEvent);
router.put('/:id', verifyTokenMiddleware, isAuthenticated, updateEvent);
router.delete('/:id', verifyTokenMiddleware, isAuthenticated, deleteEvent);

export default router;
