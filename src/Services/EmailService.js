const nodemailer = require("nodemailer");

const sendEmailNotification = async (email, subject, text, name) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `School Scheduler <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Welcome to Your School Class Schedule, ${name}!</h2>
          <p>Dear ${name},</p>
          <p>${text}</p>
          <p>Login to your account to view and manage your class schedule:</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>School Scheduler Team</p>
        </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmailNotification;
