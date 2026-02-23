const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { classifyTicket } = require('../services/classify');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/tickets/:id/classify - run AI classification
router.post('/:id/classify', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const result = await classifyTicket(ticket);

    const modelRun = await prisma.modelRun.create({
      data: {
        ticketId: ticket.id,
        modelName: result.modelName,
        rawModelText: result.rawModelText,
        parsedJson: result.parsedJson,
        confidence: result.confidence,
      },
    });

    res.status(201).json({
      ...modelRun,
      parsedJson: result.parsedJson, // frontend-friendly parsed data
    });
  } catch (err) {
    console.error('Classify error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Classification failed'
        : err.message || 'Classification failed';
    res.status(500).json({ error: message });
  }
});

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

// GET /api/tickets/:id - get single ticket with latest model run
router.get('/:id', async (req, res) => {
  try {
    let ticket;
    try {
      ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id },
        include: {
          modelRuns: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    } catch (includeErr) {
      // ModelRun table may not exist yet if migration not run - fetch without include
      if (includeErr.code === 'P2021' || includeErr.message?.includes('ModelRun')) {
        ticket = await prisma.ticket.findUnique({
          where: { id: req.params.id },
        });
        if (ticket) ticket = { ...ticket, modelRuns: [] };
      } else {
        throw includeErr;
      }
    }
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const { modelRuns, ...ticketData } = ticket;
    res.json({
      ...ticketData,
      latestModelRun: modelRuns?.[0] || null,
    });
  } catch (err) {
    console.error('Fetch ticket error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Failed to fetch ticket'
        : err.message || 'Failed to fetch ticket';
    res.status(500).json({ error: message });
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
