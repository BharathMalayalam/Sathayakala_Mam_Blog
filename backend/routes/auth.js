import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({ token, email });
});

export default router;
