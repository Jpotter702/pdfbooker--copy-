import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { WebScraper } from './services/scraper';
import { ContentOrganizer } from './services/content-organizer';
import { PDFGenerator } from './services/pdf-generator';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// PDF generation endpoint
app.post('/api/generate-pdf', upload.single('coverImage'), async (req, res) => {
  try {
    const { url, depth, pdfConfig } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Parse PDF configuration
    const config = JSON.parse(pdfConfig || '{}');

    // Add cover image to config if provided
    if (req.file) {
      config.metadata = {
        ...config.metadata,
        coverImage: req.file.buffer,
      };
    }

    // Set up Server-Sent Events for progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (progress: number, message: string) => {
      res.write(`data: ${JSON.stringify({ progress, message })}\n\n`);
    };

    // Scrape content
    const scraper = new WebScraper();
    const scrapedPages = await scraper.scrape(url, depth, sendProgress);

    // Organize content
    const organizer = new ContentOrganizer();
    const organizedContent = await organizer.organize(scrapedPages);

    // Generate PDF with custom configuration
    const generator = new PDFGenerator(config);
    const pdfBuffer = await generator.generate(organizedContent);

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 