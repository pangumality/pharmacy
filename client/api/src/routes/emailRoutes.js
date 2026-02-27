import express from 'express';
import nodemailer from 'nodemailer';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// @desc    Send bulk email to multiple recipients
// @route   POST /api/email/bulk
// @access  Private/Admin
router.post('/bulk', protect, admin, async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Recipients array is required' });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Send email to all recipients (BCC)
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      bcc: recipients.join(','),
      subject,
      text: message, // Plain text version
      html: message.replace(/\n/g, '<br>'), // HTML version
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Emails sent successfully',
      recipientCount: recipients.length
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      message: 'Failed to send emails',
      error: error.message
    });
  }
});

export default router; 