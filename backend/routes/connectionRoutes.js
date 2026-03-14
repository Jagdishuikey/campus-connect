import express from 'express';
import { sendRequest, getConnections, updateConnection, getUsers, sendMessage, getMessages } from '../controllers/connectionController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/users', verifyTokenMiddleware, isAuthenticated, getUsers);
router.get('/', verifyTokenMiddleware, isAuthenticated, getConnections);
router.post('/', verifyTokenMiddleware, isAuthenticated, sendRequest);
router.put('/:id', verifyTokenMiddleware, isAuthenticated, updateConnection);
router.post('/messages', verifyTokenMiddleware, isAuthenticated, upload.single('image'), sendMessage);
router.get('/messages/:userId', verifyTokenMiddleware, isAuthenticated, getMessages);

export default router;
