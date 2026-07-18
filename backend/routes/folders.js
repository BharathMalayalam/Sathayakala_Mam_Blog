import express from 'express';
import Folder from '../models/Folder.js';
import File from '../models/File.js';
import { requireAuth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Helper to build folder breadcrumbs
const buildFolderPath = async (folderId) => {
  const pathArr = [];
  let current = await Folder.findById(folderId).lean();
  while (current) {
    pathArr.unshift({ _id: current._id, name: current.name });
    if (current.parentFolderId) {
      current = await Folder.findById(current.parentFolderId).lean();
    } else {
      current = null;
    }
  }
  return pathArr;
};

// Helper to recursively delete subfolders and files
const deleteFolderRecursive = async (folderId) => {
  const subfolders = await Folder.find({ parentFolderId: folderId }).lean();
  for (const sub of subfolders) {
    await deleteFolderRecursive(sub._id);
  }

  const files = await File.find({ folderId }).lean();
  for (const file of files) {
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(file.fileUrl));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to unlink file:', filePath, err);
      }
    }
  }
  await File.deleteMany({ folderId });
  await Folder.findByIdAndDelete(folderId);
};

// GET /api/folders — public
router.get('/', async (req, res) => {
  try {
    const { parentFolderId, rootOnly } = req.query;
    
    const query = {};
    if (rootOnly === 'true' || parentFolderId === 'null') {
      query.parentFolderId = null;
    } else if (parentFolderId) {
      query.parentFolderId = parentFolderId;
    }

    const folders = await Folder.find(query).sort({ createdAt: -1 }).lean();
    const folderIds = folders.map(f => f._id);
    
    let fileCountMap = {};
    let subfolderCountMap = {};

    if (folderIds.length > 0) {
      // Bulk count files and subfolders using MongoDB aggregation, scoped only to returned folders (utilizing indexes)
      const fileCounts = await File.aggregate([
        { $match: { folderId: { $in: folderIds } } },
        { $group: { _id: '$folderId', count: { $sum: 1 } } }
      ]);
      
      const subfolderCounts = await Folder.aggregate([
        { $match: { parentFolderId: { $in: folderIds } } },
        { $group: { _id: '$parentFolderId', count: { $sum: 1 } } }
      ]);
      
      fileCounts.forEach(item => {
        if (item._id) fileCountMap[item._id.toString()] = item.count;
      });
      
      subfolderCounts.forEach(item => {
        if (item._id) subfolderCountMap[item._id.toString()] = item.count;
      });
    }
    
    const foldersWithCount = folders.map(folder => {
      const idStr = folder._id.toString();
      return {
        ...folder,
        fileCount: fileCountMap[idStr] || 0,
        subfolderCount: subfolderCountMap[idStr] || 0
      };
    });
    
    // Add public cache control header for 5 minutes (300 seconds) to avoid redundant DB requests on navigation
    res.set('Cache-Control', 'public, max-age=300');
    res.json(foldersWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/folders/:id — public (folder + files + subfolders + path)
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).lean();
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    const files = await File.find({ folderId: req.params.id }).sort({ createdAt: -1 }).lean();
    const subfolders = await Folder.find({ parentFolderId: req.params.id }).sort({ createdAt: -1 }).lean();
    
    const subfolderIds = subfolders.map(sf => sf._id);
    
    let fileCountMap = {};
    let subfolderCountMap = {};

    if (subfolderIds.length > 0) {
      // Bulk count files and subfolders for child subfolders, restricted to relevant subfolders
      const fileCounts = await File.aggregate([
        { $match: { folderId: { $in: subfolderIds } } },
        { $group: { _id: '$folderId', count: { $sum: 1 } } }
      ]);
      
      const subfolderCounts = await Folder.aggregate([
        { $match: { parentFolderId: { $in: subfolderIds } } },
        { $group: { _id: '$parentFolderId', count: { $sum: 1 } } }
      ]);
      
      fileCounts.forEach(item => {
        if (item._id) fileCountMap[item._id.toString()] = item.count;
      });
      
      subfolderCounts.forEach(item => {
        if (item._id) subfolderCountMap[item._id.toString()] = item.count;
      });
    }
    
    const subfoldersWithCount = subfolders.map(sf => {
      const idStr = sf._id.toString();
      return {
        ...sf,
        fileCount: fileCountMap[idStr] || 0,
        subfolderCount: subfolderCountMap[idStr] || 0
      };
    });

    const folderPath = await buildFolderPath(req.params.id);

    // Cache-Control headers for specific folder pages
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ folder, files, subfolders: subfoldersWithCount, path: folderPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/folders — admin only
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, parentFolderId } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required and must be a string' });
    }
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }
    
    const trimmedName = name.trim();
    const trimmedDesc = description?.trim() || '';
    
    // Check duplicate in same level
    const existing = await Folder.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      parentFolderId: parentFolderId || null
    }).lean();
    if (existing) return res.status(400).json({ error: 'Folder with this name already exists at this level' });
    
    const folder = new Folder({
      name: trimmedName,
      description: trimmedDesc,
      parentFolderId: parentFolderId || null
    });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/folders/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).lean();
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    // Recursively delete folder and all contents
    await deleteFolderRecursive(req.params.id);

    res.json({ message: 'Folder and all its contents recursively deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
