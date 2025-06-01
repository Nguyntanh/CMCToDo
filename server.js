const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { startDeadlineChecker } = require('./utils/deadlineChecker');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Route mặc định
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the To Do List API. Use /tasks for operations.' });
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  console.log('Connected to MongoDB');
  startDeadlineChecker(); // Khởi động kiểm tra deadline
}).catch(err => console.error('MongoDB connection error:', err));

// Sử dụng routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi!', error: err.message, type: err.name });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));