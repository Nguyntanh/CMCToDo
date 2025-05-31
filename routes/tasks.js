// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Không có token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { filter, date, history } = req.query;
    let query = { userId: req.userId };
    if (history === 'true') {
      // Lấy tất cả task của người dùng
    } else if (filter === 'completed') {
      query.completed = true;
      query.deleted = false;
    } else {
      query.deleted = false;
      if (filter === 'today') query.isToday = true;
      if (filter === 'important') query.important = true;
      if (date) {
        query.dueDate = {
          $gte: new Date(date),
          $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
        };
      }
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { text, isToday, important, dueDate, color } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'Tên công việc là bắt buộc và phải là chuỗi không rỗng' });
    }
    const task = new Task({
      text: text.trim(),
      isToday: isToday || false,
      important: important || false,
      dueDate: dueDate ? new Date(dueDate) : null,
      color: color || null,
      userId: req.userId
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { text, completed, isToday, important, dueDate, color } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }
    if (text) task.text = text.trim();
    if (typeof completed === 'boolean') {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
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

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }
    task.deleted = true;
    await task.save();
    res.json({ message: 'Công việc đã được đánh dấu xóa' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;