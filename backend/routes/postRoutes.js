import express from 'express';
import { verifyTokenMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { getAllPosts, createPost, deletePost, toggleLike } from '../controllers/postController.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, getAllPosts);
router.post('/', verifyTokenMiddleware, upload.single('image'), createPost);
router.put('/:id/like', verifyTokenMiddleware, toggleLike);
router.delete('/:id', verifyTokenMiddleware, deletePost);

export default router;
