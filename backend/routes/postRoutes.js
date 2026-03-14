import express from 'express';
import { verifyTokenMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import { getAllPosts, createPost, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, getAllPosts);
router.post('/', verifyTokenMiddleware, upload.single('image'), createPost);
router.delete('/:id', verifyTokenMiddleware, deletePost);

export default router;
