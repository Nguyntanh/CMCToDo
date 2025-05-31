// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  isToday: { type: Boolean, default: false },
  important: { type: Boolean, default: false },
  dueDate: { type: Date, default: null },
  color: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  deleted: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

taskSchema.index({ createdAt: -1, dueDate: 1, completedAt: 1, userId: 1 });

module.exports = mongoose.model('Task', taskSchema);