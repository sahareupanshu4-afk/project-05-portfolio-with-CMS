const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send contact form email notification
 */
const sendContactEmail = async ({ name, email, subject, message, phone }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.EMAIL_FROM || process.env.SMTP_USER,
    subject: `[Portfolio Contact] ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #667eea; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from your portfolio contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    replyTo: email
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send auto-reply to contact form submitter
 */
const sendAutoReply = async ({ name, email }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Thank you for contacting me!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You, ${name}!</h2>
          </div>
          <div class="content">
            <p>Thank you for reaching out! I have received your message and will get back to you as soon as possible.</p>
            <p>In the meantime, feel free to explore my portfolio and connect with me on social media.</p>
            <p>Best regards,<br>Your Name</p>
          </div>
          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send reply to contact form submitter
 */
const sendReplyEmail = async ({ to, name, subject, replyMessage, originalMessage }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Re: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reply-box { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #667eea; }
          .original-box { background: #f0f0f0; padding: 15px; border-radius: 10px; font-size: 14px; color: #666; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Reply to Your Message</h2>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for reaching out! Here's my response to your message:</p>
            <div class="reply-box">
              ${replyMessage.replace(/\n/g, '<br>')}
            </div>
            <p><strong>Your original message:</strong></p>
            <div class="original-box">
              ${originalMessage ? originalMessage.replace(/\n/g, '<br>') : ''}
            </div>
            <p>Feel free to reply if you have any more questions!</p>
            <p>Best regards</p>
          </div>
          <div class="footer">
            <p>This email was sent from my portfolio website.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send test email
 */
const sendTestEmail = async (to) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Test Email from Portfolio CMS',
    html: `
      <h2>Test Email</h2>
      <p>This is a test email from your Portfolio CMS.</p>
      <p>If you received this email, your email configuration is working correctly!</p>
      <p>Sent at: ${new Date().toISOString()}</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendContactEmail,
  sendAutoReply,
  sendReplyEmail,
  sendTestEmail
};
