const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { analyzeLabReportPdf } = require('../services/geminiAnalysisService');
const { generateReportPdf } = require('../services/reportPdfService');
// Swap this for NUTRIFLOW_BACKEND's real auth middleware (see AuthService.js /
// however the existing /app/* routes authenticate requests).
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Local disk is fine to start — swap for S3/cloud storage before this needs to
// survive a redeploy.
const REPORTS_DIR = path.join(__dirname, '..', 'storage', 'ai-reports');

router.post('/ai/analyses', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file is required' });
  if (req.file.mimetype !== 'application/pdf') return res.status(400).json({ message: 'file must be a PDF' });

  try {
    const analysis = await analyzeLabReportPdf(req.file.buffer);
    const reportPdfBuffer = await generateReportPdf(analysis);

    const id = crypto.randomUUID();
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    await fs.writeFile(path.join(REPORTS_DIR, `${id}.pdf`), reportPdfBuffer);

    res.json({
      id,
      pdfUrl: `${process.env.PUBLIC_BASE_URL}/ai/analyses/${id}/pdf`,
      createdAt: new Date().toISOString(),
      summary: analysis.summary
    });
  } catch (error) {
    console.error('[ai-analyses] failed', error);
    res.status(502).json({ message: 'AI analysis failed, please try again' });
  }
});

// Serves the generated PDF back — this is the pdfUrl the client downloads.
router.get('/ai/analyses/:id/pdf', requireAuth, async (req, res) => {
  const filePath = path.join(REPORTS_DIR, `${req.params.id}.pdf`);
  try {
    await fs.access(filePath);
  } catch {
    return res.status(404).json({ message: 'report not found' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(filePath);
});

module.exports = router;
