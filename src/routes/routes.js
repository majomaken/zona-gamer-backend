import { Router } from 'express';
import authRoutes from './auth.routes.js';
import postRoutes from './post.routes.js';
const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK'})
})

router.use('/auth', authRoutes);
router.use('/post', postRoutes);

export default router;