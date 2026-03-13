import express from 'express';
import { sendRequest, getConnections, updateConnection, getUsers } from '../controllers/connectionController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', verifyTokenMiddleware, isAuthenticated, getUsers);
router.get('/', verifyTokenMiddleware, isAuthenticated, getConnections);
router.post('/', verifyTokenMiddleware, isAuthenticated, sendRequest);
router.put('/:id', verifyTokenMiddleware, isAuthenticated, updateConnection);

export default router;
