const express = require('express');
const crypto = require('crypto');
// Swap these for NUTRIFLOW_BACKEND's real middleware / DB layer.
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth'); // or wherever admin-only checks live
const db = require('../db'); // whatever this backend already uses (Prisma/Knex/raw SQL/etc)

const router = express.Router();

// GET /articles/today — the home screen calls this once a day.
// "Today's" article = the most recently published one at or before now.
router.get('/articles/today', requireAuth, async (req, res) => {
  const article = await db.articles.findFirst({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' }
  });
  if (!article) return res.status(404).json({ message: 'no article published yet' });
  res.json(article);
});

// GET /articles/:id — used if the client ever opens an article from something
// other than today's card (e.g. a deep link into an older one).
router.get('/articles/:id', requireAuth, async (req, res) => {
  const article = await db.articles.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ message: 'article not found' });
  res.json(article);
});

// POST /articles — how you add the day's article. Bare-bones: call this with
// curl/Postman/a script from your own machine. Swap requireAdmin for a real
// admin-role check once more than one person needs to publish.
router.post('/articles', requireAuth, requireAdmin, async (req, res) => {
  const { title, excerpt, body, imageUrl, publishedAt } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'title and body are required' });

  const article = await db.articles.create({
    data: {
      id: crypto.randomUUID(),
      title,
      excerpt: excerpt ?? null,
      body,
      imageUrl: imageUrl ?? null, // optional — the app falls back to a generic icon if omitted
      publishedAt: publishedAt ? new Date(publishedAt) : new Date()
    }
  });
  res.status(201).json(article);
});

module.exports = router;
