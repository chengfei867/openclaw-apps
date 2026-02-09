import { Router } from 'express';

const router = Router();

// Placeholder routes until CRUD handlers are implemented.
router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
