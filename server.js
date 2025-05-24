// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Thêm để dùng biến môi trường

const app = express();
app.use(cors());
app.use(express.json());

// Route mặc định cho "/"
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the To Do List API. Use /tasks for operations.' });
});

// Kết nối MongoDB với biến môi trường
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tunangcmc:Tuananh2k5@tunang.118khwv.mongodb.net/todolist?retryWrites=true&w=majority', {
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const taskSchema = new mongoose.Schema({ text: String });
const Task = mongoose.model('Task', taskSchema);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Lấy danh sách tasks
app.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

// Thêm task mới
app.post('/tasks', async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ message: 'Task text is required and must be a non-empty string' });
        }
        const task = new Task({ text: text.trim() });
        await task.save();
        res.status(201).json(task);
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