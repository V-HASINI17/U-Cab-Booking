const SupportTicket = require('../models/SupportTicketSchema');

// Create a new support ticket
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      res.status(400);
      throw new Error('Subject and message description are required');
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      subject,
      message,
      replies: []
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket registered successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// Get personal tickets (Users & Drivers)
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all tickets
exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('userId', 'name email mobile role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

// Get single ticket details
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'name email mobile role');

    if (ticket) {
      // Authorize access: Admin or owner user
      if (req.user.role !== 'admin' && ticket.userId._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Access denied: You do not own this ticket');
      }
      res.json({ success: true, data: ticket });
    } else {
      res.status(404);
      throw new Error('Support ticket not found');
    }
  } catch (error) {
    next(error);
  }
};

// Reply to support ticket
exports.replyToTicket = async (req, res, next) => {
  try {
    const { message, status } = req.body;
    if (!message) {
      res.status(400);
      throw new Error('Reply message content is required');
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Support ticket not found');
    }

    // Authorize access: Admin or owner user
    if (req.user.role !== 'admin' && ticket.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied: You cannot reply to this ticket');
    }

    // Append reply with denormalised sender info to avoid cross-collection population failures
    ticket.replies.push({
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      createdAt: new Date()
    });

    // Admin can update ticket resolution status
    if (req.user.role === 'admin' && status) {
      ticket.status = status;
    }

    await ticket.save();

    // Fetch fresh ticket (no replies.senderId populate needed — data is denormalised)
    const updatedTicket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'name email mobile role');

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};
