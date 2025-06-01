const cron = require('node-cron');
const Task = require('../models/Task');
const { sendEmail } = require('./email');

const startDeadlineChecker = () => {
  // Chạy mỗi phút
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const tasks = await Task.find({
        dueDate: { $exists: true },
        completed: false,
        deleted: false,
        notificationEmail: { $ne: null }
      });

      for (const task of tasks) {
        const due = new Date(task.dueDate);
        const timeDiff = due - now;
        const hoursUntilDue = timeDiff / (1000 * 60 * 60);
        // Gửi thông báo nếu còn 24 giờ hoặc đúng ngày
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