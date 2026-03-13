import express from 'express';
import { createGroup, getGroups, deleteGroup, updateGroup, joinGroup, leaveGroup } from '../controllers/groupController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, isAuthenticated, getGroups);
router.post('/', verifyTokenMiddleware, isAuthenticated, createGroup);
router.put('/:id', verifyTokenMiddleware, isAuthenticated, updateGroup);
router.delete('/:id', verifyTokenMiddleware, isAuthenticated, deleteGroup);
router.post('/:id/join', verifyTokenMiddleware, isAuthenticated, joinGroup);
router.post('/:id/leave', verifyTokenMiddleware, isAuthenticated, leaveGroup);

export default router;

