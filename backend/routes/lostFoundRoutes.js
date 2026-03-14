import express from 'express';
import { createItem, getItems, deleteItem, updateItem } from '../controllers/lostFoundController.js';
import { verifyTokenMiddleware, isAuthenticated } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, isAuthenticated, getItems);
router.post('/', verifyTokenMiddleware, isAuthenticated, upload.single('image'), createItem);
router.put('/:id', verifyTokenMiddleware, isAuthenticated, updateItem);
router.delete('/:id', verifyTokenMiddleware, isAuthenticated, deleteItem);

export default router;
