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
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store progress information for each URL
const progressMap = new Map<string, { progress: number; message: string }>();

// Progress endpoint with Server-Sent Events
app.get('/api/generate-pdf/progress', (req, res) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial progress
  const initialProgress = progressMap.get(url) || { progress: 0, message: 'Initializing...' };
  res.write(`data: ${JSON.stringify(initialProgress)}\n\n`);

  // Set up interval to send progress updates
  const intervalId = setInterval(() => {
    const progress = progressMap.get(url) || initialProgress;
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
    
    // End the connection when complete
    if (progress.progress === 100) {
      clearInterval(intervalId);
      res.end();
    }
  }, 1000);

  // Handle client disconnect
  res.on('close', () => {
    clearInterval(intervalId);
  });
});

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

    // Initialize progress for this URL
    progressMap.set(url, { progress: 0, message: 'Starting web scraping...' });

    // Create progress callback function
    const updateProgress = (progress: number, message: string) => {
      progressMap.set(url, { progress, message });
    };

    // Scrape content
    updateProgress(10, 'Starting web scraping...');
    const scraper = new WebScraper();
    scraper.setProgressCallback((scrapingProgress) => {
      const progress = Math.floor((scrapingProgress.pagesScraped / Math.max(scrapingProgress.totalPages, 1)) * 50);
      updateProgress(10 + progress, `Scraping page ${scrapingProgress.pagesScraped} of ${scrapingProgress.totalPages}`);
    });
    
    const scrapedPages = await scraper.scrape(url, parseInt(depth) || 1);
    updateProgress(60, 'Web scraping complete. Organizing content...');

    // Organize content
    const organizer = new ContentOrganizer();
    const organizedContent = await organizer.organize(scrapedPages);
    updateProgress(80, 'Content organized. Generating PDF...');

    // Generate PDF with custom configuration
    const generator = new PDFGenerator(config);
    const pdfBuffer = await generator.generate(organizedContent);
    updateProgress(100, 'PDF generation complete!');

    // Clean up progress data after a delay
    setTimeout(() => {
      progressMap.delete(url);
    }, 60000); // Remove after 1 minute

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Error generating PDF:', error);
    // Update progress with error
    if (req.body.url) {
      progressMap.set(req.body.url, { 
        progress: 0, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
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