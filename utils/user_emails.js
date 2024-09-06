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

exports.orderConfirmationEmail = (order) => {
  const {orderItems} = order;

  let emailOrderText = ""
  orderItems.forEach((item) => {
    const date = new Date(item.event_date)
    const humanReadableDate = date.toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    emailOrderText += `
    * ${item.event_name}, ${item.ticket_name}, ${item.ticket_price}, ${humanReadableDate} * \n`
  })
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.order.customer_email,
    subject: 'Hobby-Verse Order Confirmation',
    html: `Hi ${order.order.customer_name},\n
    \n
    Thanks for your order. \n
    \n
    The total cost is £${order.order.total_amount}.\n
    \n
    Here are the details of your tickets:\n
\n
    ${emailOrderText}
    \n
    We look forward to seeing you soon.
\n
    Welcome the the Hobby-Verse!
    `
  };

  transporter.sendMail(mailOptions)
    .catch(error => {
      console.error('Error sending email:', error);
    });
}