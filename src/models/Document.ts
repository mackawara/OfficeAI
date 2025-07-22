import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  originalText: String,
  wordUrl: String,
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const DocumentModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default DocumentModel; 