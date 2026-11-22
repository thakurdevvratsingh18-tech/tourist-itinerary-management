const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const { AppError } = require('../middleware/errorHandler');

// ─── helpers ─────────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[contactController] SMTP not configured – skipping email send.');
    return false;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'Tourist Itinerary'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return true;
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res) => {
  const { name, email, subject, message, phone } = req.body;

  if (!name || !email || !subject || !message) {
    throw new AppError('Name, email, subject and message are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new AppError('Invalid email address', 400);

  const contactMsg = await ContactMessage.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone,
    subject: subject.trim(),
    message: message.trim(),
    status: 'new',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify admin if configured
  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Submitted at ${new Date().toISOString()}</small></p>
      `,
      text: `New contact from ${name} (${email}): ${message}`,
    }).catch((e) => console.error('[submitContact] Admin notify failed:', e.message));
  }

  res.status(201).json({
    success: true,
    message: 'Your message has been received. We will get back to you soon.',
    data: { id: contactMsg._id },
  });
};

/**
 * @desc    Get all contact messages (admin)
 * @route   GET /api/contact
 * @access  Admin
 */
const getMessages = async (req, res) => {
  const { status, sort = '-createdAt', page = 1, limit = 20, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [messages, total] = await Promise.all([
    ContactMessage.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    ContactMessage.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    data: messages,
  });
};

/**
 * @desc    Update message status (admin)
 * @route   PUT /api/contact/:id/status
 * @access  Admin
 */
const updateMessageStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['new', 'read', 'in-progress', 'resolved', 'closed'];

  if (!allowedStatuses.includes(status)) {
    throw new AppError(`Status must be one of: ${allowedStatuses.join(', ')}`, 400);
  }

  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  );
  if (!msg) throw new AppError('Message not found', 404);

  res.status(200).json({ success: true, message: 'Status updated', data: msg });
};

/**
 * @desc    Reply to a contact message (admin)
 * @route   POST /api/contact/:id/reply
 * @access  Admin
 */
const replyMessage = async (req, res) => {
  const { replyText } = req.body;
  if (!replyText) throw new AppError('Reply text is required', 400);

  const msg = await ContactMessage.findById(req.params.id);
  if (!msg) throw new AppError('Message not found', 404);

  let emailSent = false;
  try {
    emailSent = await sendEmail({
      to: msg.email,
      subject: `Re: ${msg.subject}`,
      html: `
        <p>Dear ${msg.name},</p>
        <p>Thank you for contacting us. Here is our reply:</p>
        <blockquote style="border-left:4px solid #4f46e5;padding-left:12px;color:#555;">
          ${replyText.replace(/\n/g, '<br>')}
        </blockquote>
        <p>Best regards,<br>Tourist Itinerary Support Team</p>
        <hr>
        <p><small>Your original message: ${msg.message}</small></p>
      `,
      text: replyText,
    });
  } catch (err) {
    console.error('[replyMessage] Email send failed:', err.message);
  }

  // Record the reply
  msg.adminReply = replyText;
  msg.repliedAt = new Date();
  msg.repliedBy = req.user._id;
  msg.status = 'resolved';
  await msg.save();

  res.status(200).json({
    success: true,
    message: emailSent
      ? 'Reply sent and message marked as resolved'
      : 'Reply saved (email not sent – SMTP not configured)',
    data: msg,
  });
};

module.exports = {
  submitContact,
  getMessages,
  updateMessageStatus,
  replyMessage,
};
