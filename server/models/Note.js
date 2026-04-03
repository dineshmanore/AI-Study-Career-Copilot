const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:          { type: String, required: true },
  summaryMode:    { type: String, enum: ['Quick Summary', 'Detailed Summary', 'Key Concepts'], required: true },
  summaryContent: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
