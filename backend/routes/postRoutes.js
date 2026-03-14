import express from 'express';
import { verifyTokenMiddleware } from '../middleware/authMiddleware.js';
import { getAllPosts, createPost, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, getAllPosts);
router.post('/', verifyTokenMiddleware, createPost);
router.delete('/:id', verifyTokenMiddleware, deletePost);

export default router;
