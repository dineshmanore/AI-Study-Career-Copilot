const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, maxlength: 100, trim: true },
  description: { type: String, default: '', maxlength: 500 },
  dueDate:     { type: Date, default: null },
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status:      { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
