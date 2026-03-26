import express from 'express';
import { verifyTokenMiddleware } from '../middleware/authMiddleware.js';
import { getAllPGs, createPG, deletePG } from '../controllers/pgController.js';

const router = express.Router();

router.get('/', verifyTokenMiddleware, getAllPGs);
router.post('/', verifyTokenMiddleware, createPG);
router.delete('/:id', verifyTokenMiddleware, deletePG);

export default router;
