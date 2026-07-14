import express from 'express';
import Folder from '../models/Folder.js';
import File from '../models/File.js';
import { requireAuth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// GET /api/folders — public
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    // Attach file count to each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const count = await File.countDocuments({ folderId: folder._id });
        return { ...folder.toObject(), fileCount: count };
      })
    );
    res.json(foldersWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/folders/:id — public (folder + files)
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    const files = await File.find({ folderId: req.params.id }).sort({ createdAt: -1 });
    res.json({ folder, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/folders — admin only
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name required' });
    const existing = await Folder.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(400).json({ error: 'Folder with this name already exists' });
    const folder = new Folder({ name: name.trim(), description: description?.trim() || '' });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/folders/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    // Delete associated files from disk
    const files = await File.find({ folderId: req.params.id });
    for (const file of files) {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(file.fileUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await File.deleteMany({ folderId: req.params.id });

    res.json({ message: 'Folder and all its files deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
