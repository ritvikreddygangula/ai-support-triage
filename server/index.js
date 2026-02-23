require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const ticketsRouter = require('./routes/tickets');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
