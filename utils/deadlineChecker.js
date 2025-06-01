const cron = require('node-cron');
const Task = require('../models/Task');
const { sendEmail } = require('./email');

const startDeadlineChecker = () => {
  console.log('Starting deadline checker...'); // Thêm log
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Checking deadlines at:', new Date().toISOString()); // Log mỗi phút
      const now = new Date();
      const tasks = await Task.find({
        dueDate: { $exists: true },
        completed: false,
        deleted: false,
        notificationEmail: { $ne: null }
      });
      console.log(`Found ${tasks.length} tasks to check`); // Log số lượng task
      for (const task of tasks) {
        const due = new Date(task.dueDate);
        const timeDiff = due - now;
        const hoursUntilDue = timeDiff / (1000 * 60 * 60);
        console.log(`Task ${task._id}: ${task.text}, Hours until due: ${hoursUntilDue}`); // Log chi tiết task
        if ((hoursUntilDue <= 24 && hoursUntilDue > 0) || due.toDateString() === now.toDateString()) {
          const subject = `Nhắc nhở: Công việc "${task.text}" sắp đến hạn`;
          const text = `Công việc "${task.text}" của bạn sẽ đến hạn vào ${due.toLocaleString('vi-VN')}. Vui lòng kiểm tra và hoàn thành!`;
          await sendEmail(task.notificationEmail, subject, text);
          console.log(`Sent notification for task ${task._id} to ${task.notificationEmail}`);
        }
      }
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  });
};

module.exports = { startDeadlineChecker };