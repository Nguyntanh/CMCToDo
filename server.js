const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Route mặc định
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the To Do List API. Use /tasks for operations.' });
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  isToday: { type: Boolean, default: false },
  important: { type: Boolean, default: false },
  dueDate: { type: Date, default: null },
  color: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }, // Thêm trường completedAt
  deleted: { type: Boolean, default: false }
});
taskSchema.index({ createdAt: -1, dueDate: 1, completedAt: 1 });
const Task = mongoose.model('Task', taskSchema);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message, type: err.name });
});

// Lấy danh sách tasks (hỗ trợ filter và lịch sử)
app.get('/tasks', async (req, res, next) => {
  try {
    const { filter, date, history } = req.query;
    let query = {};
    if (history === 'true') {
      query = {}; // Lấy tất cả task, bao gồm đã xóa
    } else if (filter === 'completed') {
      query = { completed: true, deleted: false }; // Lịch sử: chỉ task đã hoàn thành, chưa xóa
    } else {
      query.deleted = false; // Tác vụ: chỉ task chưa xóa
      if (filter === 'today') query.isToday = true;
      if (filter === 'important') query.important = true;
      if (date) query.dueDate = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Thêm task mới
app.post('/tasks', async (req, res, next) => {
  try {
    const { text, isToday, important, dueDate, color } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'Task text is required and must be a non-empty string' });
    }
    const task = new Task({
      text: text.trim(),
      isToday: isToday || false,
      important: important || false,
      dueDate: dueDate ? new Date(dueDate) : null,
      color: color || null
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Cập nhật task
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { text, completed, isToday, important, dueDate, color } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (text) task.text = text.trim();
    if (typeof completed === 'boolean') {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null; // Cập nhật completedAt
    }
    if (typeof isToday === 'boolean') task.isToday = isToday;
    if (typeof important === 'boolean') task.important = important;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (color) task.color = color;
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Xóa task (đánh dấu deleted: true)
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.deleted = true;
    await task.save();
    res.json({ message: 'Task marked as deleted' });
  } catch (error) {
    next(error);
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));