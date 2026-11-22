const mongoose = require('mongoose');
const { CONTACT_STATUS } = require('../config/constants');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [300, 'Subject cannot exceed 300 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(CONTACT_STATUS),
      default: CONTACT_STATUS.NEW,
    },
    reply: {
      type: String,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ email: 1 });

// ─── Pre-save: set repliedAt when reply is added ──────────────────────────────
ContactMessageSchema.pre('save', function (next) {
  if (this.isModified('reply') && this.reply && !this.repliedAt) {
    this.repliedAt = new Date();
    this.status = CONTACT_STATUS.REPLIED;
  }
  next();
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
