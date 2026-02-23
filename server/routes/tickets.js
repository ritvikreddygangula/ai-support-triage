const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tickets - list all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id - get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST /api/tickets - create ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ error: 'subject and description are required' });
    }
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        customerEmail: customerEmail || null,
      },
    });
    res.status(201).json(ticket);
  } catch (err) {
    console.error('Create ticket error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Failed to create ticket'
        : err.message || 'Failed to create ticket';
    res.status(500).json({ error: message });
  }
});

module.exports = router;
