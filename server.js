//server.js
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
    createdAt: { type: Date, default: Date.now }
});
taskSchema.index({ createdAt: -1 }); // Thêm index cho createdAt
const Task = mongoose.model('Task', taskSchema);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message, type: err.name });
});

// Lấy danh sách tasks (hỗ trợ filter)
app.get('/tasks', async (req, res, next) => {
    try {
        const { filter } = req.query;
        let query = {};
        if (filter === 'today') query.isToday = true;
        if (filter === 'important') query.important = true;
        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

// Thêm task mới
app.post('/tasks', async (req, res, next) => {
    try {
        const { text, isToday, important } = req.body;
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ message: 'Task text is required and must be a non-empty string' });
        }
        const task = new Task({ 
            text: text.trim(), 
            isToday: isToday || false, 
            important: important || false 
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
        const { text, completed, isToday, important } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (text) task.text = text.trim();
        if (typeof completed === 'boolean') task.completed = completed;
        if (typeof isToday === 'boolean') task.isToday = isToday;
        if (typeof important === 'boolean') task.important = important;
        await task.save();
        res.json(task);
    } catch (error) {
        next(error);
    }
});

// Xóa task
app.delete('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));