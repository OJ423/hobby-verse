const nodemailer = require('nodemailer');

// Transporter Config

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

// Registration Verification

exports.sendVerificationEmail = (email, token) => {
  const url = `http://localhost:3000/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Hobby-Verse Verification Email',
    html: `Please click the link to verify your email address: <a href="${url}">${url}</a>`
  };

  transporter.sendMail(mailOptions)
    .catch(error => {
      console.error('Error sending email:', error);
    });
}

// Password Reset Verification Email

exports.sendPasswordResetEmail = (email, token) => {
  const url = `http://localhost:3000/update-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Hobby-Verse Password Reset',
    html: `Please click the link to reset your password: <a href="${url}">${url}</a>`
  };

  transporter.sendMail(mailOptions)
    .catch(error => {
      console.error('Error sending email:', error);
    });
}