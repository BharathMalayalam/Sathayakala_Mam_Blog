import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Folder', folderSchema);
