const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  replyToTicket
} = require('../controllers/supportController');
const { protect, adminOnly } = require('../middlewares/auth');

// Ticket creation and user lists
router.post('/', protect, createTicket);
router.get('/', protect, getMyTickets);

// Admin-only ticket overview
router.get('/all', protect, adminOnly, getAllTickets);

// Single ticket view and replies
router.get('/:id', protect, getTicketById);
router.post('/:id/reply', protect, replyToTicket);

module.exports = router;
