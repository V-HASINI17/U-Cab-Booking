const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Resolved'],
    default: 'Open',
    index: true
  },
  replies: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      senderName: {
        type: String,
        required: true
      },
      senderRole: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
