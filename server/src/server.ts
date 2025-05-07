import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { WebScraper } from './services/scraper';
import { ContentOrganizer } from './services/content-organizer';
import { PDFGenerator } from './services/pdf-generator';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure storage for PDFs
const storagePath = process.env.STORAGE_PATH || path.join(__dirname, '../storage');
const pdfStoragePath = path.join(storagePath, 'pdfs');

// Create storage directories if they don't exist
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}
if (!fs.existsSync(pdfStoragePath)) {
  fs.mkdirSync(pdfStoragePath, { recursive: true });
}

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
const progressMap = new Map<string, { 
  progress: number; 
  message: string;
  step: 'initializing' | 'scraping' | 'organizing' | 'generating' | 'saving' | 'complete' | 'error';
  details?: any;
  error?: string;
}>();

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
  const initialProgress = progressMap.get(url) || { 
    progress: 0, 
    message: 'Initializing...', 
    step: 'initializing',
  };
  res.write(`data: ${JSON.stringify(initialProgress)}\n\n`);

  // Set up interval to send progress updates
  const intervalId = setInterval(() => {
    const progress = progressMap.get(url) || initialProgress;
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
    
    // End the connection when complete or error
    if (progress.progress === 100 || progress.step === 'error') {
      clearInterval(intervalId);
      // Keep the connection for a bit longer so the client can see the final message
      setTimeout(() => {
        res.end();
      }, 2000);
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

// List PDFs endpoint
app.get('/api/pdfs', async (req, res) => {
  try {
    // TODO: Add user authentication and filter by user ID
    const userId = req.query.userId || 'anonymous';
    
    const userPdfPath = path.join(pdfStoragePath, userId.toString());
    
    // Create user directory if it doesn't exist
    if (!fs.existsSync(userPdfPath)) {
      fs.mkdirSync(userPdfPath, { recursive: true });
      return res.json({ pdfs: [] });
    }
    
    // Read PDF files from user directory
    const files = fs.readdirSync(userPdfPath);
    const pdfs = files
      .filter(file => file.endsWith('.pdf') || file.endsWith('.json'))
      .map(file => {
        if (file.endsWith('.json')) {
          // This is a metadata file
          try {
            const metadata = JSON.parse(fs.readFileSync(path.join(userPdfPath, file), 'utf8'));
            return {
              id: path.basename(file, '.json'),
              ...metadata,
              createdAt: metadata.createdAt || new Date().toISOString(),
              status: 'completed'
            };
          } catch (e) {
            // If metadata can't be read, return basic info
            return {
              id: path.basename(file, '.json'),
              title: path.basename(file, '.json'),
              createdAt: new Date().toISOString(),
              status: 'completed'
            };
          }
        } else {
          // Just the PDF without metadata
          return {
            id: path.basename(file, '.pdf'),
            title: path.basename(file, '.pdf'),
            createdAt: new Date().toISOString(),
            status: 'completed'
          };
        }
      });
    
    res.json({ pdfs });
  } catch (error) {
    logger.error('Error listing PDFs:', error);
    res.status(500).json({ error: 'Failed to list PDFs' });
  }
});

// Download PDF endpoint
app.get('/api/pdfs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Add user authentication and filter by user ID
    const userId = req.query.userId || 'anonymous';
    
    const pdfPath = path.join(pdfStoragePath, userId.toString(), `${id}.pdf`);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${id}.pdf`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (error) {
    logger.error('Error downloading PDF:', error);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

// Delete PDF endpoint
app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Add user authentication and filter by user ID
    const userId = req.query.userId || 'anonymous';
    
    const pdfPath = path.join(pdfStoragePath, userId.toString(), `${id}.pdf`);
    const metadataPath = path.join(pdfStoragePath, userId.toString(), `${id}.json`);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    // Delete PDF file
    fs.unlinkSync(pdfPath);
    
    // Delete metadata file if it exists
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting PDF:', error);
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});

// Modify PDF generation endpoint to use enhanced progress tracking
app.post('/api/generate-pdf', upload.single('coverImage'), async (req, res) => {
  try {
    const { url, depth, pdfConfig } = req.body;
    // TODO: Add user authentication and get real user ID
    const userId = req.body.userId || 'anonymous';

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Parse PDF configuration
    const config = JSON.parse(pdfConfig || '{}');
    const pdfTitle = config.title || 'generated';
    const safeTitle = pdfTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const pdfId = `${safeTitle}_${Date.now()}`;

    // Add cover image to config if provided
    if (req.file) {
      config.metadata = {
        ...config.metadata,
        coverImage: req.file.buffer,
      };
    }

    // Initialize progress for this URL
    progressMap.set(url, { 
      progress: 0, 
      message: 'Initializing web scraper...', 
      step: 'initializing' 
    });

    // Create progress callback function
    const updateProgress = (progress: number, message: string, step: 'initializing' | 'scraping' | 'organizing' | 'generating' | 'saving' | 'complete' | 'error', details?: any) => {
      progressMap.set(url, { 
        progress, 
        message, 
        step, 
        details 
      });
    };

    // Configure web scraper
    updateProgress(5, 'Web scraper configured and starting...', 'initializing');
    const scraper = new WebScraper();
    
    // Set up detailed progress tracking for scraping
    scraper.setProgressCallback((scrapingProgress) => {
      const { pagesScraped, totalPages, currentUrl } = scrapingProgress;
      
      // Calculate overall progress for scraping phase (5-55%)
      const scrapingProgressPercent = Math.min(100, Math.floor((pagesScraped / Math.max(totalPages, 1)) * 100));
      const overallProgress = 5 + Math.floor(scrapingProgressPercent * 0.5); // 5-55%
      
      updateProgress(
        overallProgress,
        `Scraping page ${pagesScraped} of ${totalPages}: ${currentUrl || ''}`,
        'scraping',
        {
          pagesScraped,
          totalPages,
          currentUrl,
          scrapingProgressPercent
        }
      );
    });
    
    // Start scraping
    let scrapedPages;
    try {
      scrapedPages = await scraper.scrape(url, parseInt(depth) || 1);
      updateProgress(55, 'Web scraping complete. Organizing content...', 'organizing');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown scraping error';
      logger.error('Scraping error:', error);
      updateProgress(0, `Scraping failed: ${errorMsg}`, 'error', { error: errorMsg });
      throw error;
    }

    // Organize content
    let organizedContent;
    try {
      const organizer = new ContentOrganizer();
      organizedContent = await organizer.organize(scrapedPages);
      updateProgress(70, 'Content organized. Generating PDF...', 'generating', {
        pageCount: organizedContent.pages.length,
        tocEntries: organizedContent.tableOfContents.length
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown content organization error';
      logger.error('Content organization error:', error);
      updateProgress(0, `Content organization failed: ${errorMsg}`, 'error', { error: errorMsg });
      throw error;
    }

    // Generate PDF with custom configuration
    let pdfBuffer;
    try {
      const generator = new PDFGenerator(config);
      pdfBuffer = await generator.generate(organizedContent);
      updateProgress(90, 'PDF generated. Saving...', 'saving');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown PDF generation error';
      logger.error('PDF generation error:', error);
      updateProgress(0, `PDF generation failed: ${errorMsg}`, 'error', { error: errorMsg });
      throw error;
    }

    // Save the generated PDF
    try {
      // Ensure user directory exists
      const userPdfPath = path.join(pdfStoragePath, userId.toString());
      if (!fs.existsSync(userPdfPath)) {
        fs.mkdirSync(userPdfPath, { recursive: true });
      }

      // Save PDF file
      const pdfPath = path.join(userPdfPath, `${pdfId}.pdf`);
      fs.writeFileSync(pdfPath, pdfBuffer);

      // Save metadata
      const metadata = {
        title: pdfTitle,
        url,
        sourceUrl: url,
        createdAt: new Date().toISOString(),
        pageCount: organizedContent.pages.length,
        config
      };
      fs.writeFileSync(path.join(userPdfPath, `${pdfId}.json`), JSON.stringify(metadata, null, 2));
      
      updateProgress(100, 'PDF generation complete! Ready for download.', 'complete', {
        pdfId,
        pageCount: organizedContent.pages.length,
        fileSize: pdfBuffer.length
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown file saving error';
      logger.error('File saving error:', error);
      updateProgress(0, `Failed to save PDF: ${errorMsg}`, 'error', { error: errorMsg });
      throw error;
    }

    // Clean up progress data after a delay
    setTimeout(() => {
      progressMap.delete(url);
    }, 300000); // Remove after 5 minutes (increased from 1 minute)

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${pdfId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Error generating PDF:', error);
    // Update progress with error if not already set
    if (req.body.url) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      // Only update if not already in error state
      const currentProgress = progressMap.get(req.body.url);
      if (!currentProgress || currentProgress.step !== 'error') {
        progressMap.set(req.body.url, { 
          progress: 0, 
          message: `Error: ${errorMsg}`,
          step: 'error',
          error: errorMsg
        });
      }
    }
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Swagger/OpenAPI setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PDFBooker API',
      version: '1.0.0',
      description: 'API documentation for PDFBooker backend',
    },
    components: {
      schemas: {
        PDFGenerationRequest: {
          type: 'object',
          required: ['sources', 'outputFormat'],
          properties: {
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'URL of the content source' },
                  title: { type: 'string', description: 'Title for the section (optional)' }
                }
              },
              description: 'List of content sources for the PDF'
            },
            customStyling: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Book title' },
                author: { type: 'string', description: 'Book author (optional)' },
                pageSize: { type: 'string', enum: ['A4', 'A5', 'Letter'], description: 'Page size for the PDF' },
                fontFamily: { type: 'string', description: 'Font family for text' },
                fontSize: { type: 'number', description: 'Font size for text' },
                margins: {
                  type: 'object',
                  properties: {
                    top: { type: 'number' },
                    bottom: { type: 'number' },
                    left: { type: 'number' },
                    right: { type: 'number' }
                  }
                },
                colors: {
                  type: 'object',
                  properties: {
                    text: { type: 'string', description: 'Text color' },
                    headings: { type: 'string', description: 'Headings color' },
                    links: { type: 'string', description: 'Links color' },
                    background: { type: 'string', description: 'Background color' }
                  }
                },
                layout: {
                  type: 'object',
                  properties: {
                    showCoverPage: { type: 'boolean' },
                    showTableOfContents: { type: 'boolean' },
                    showPageNumbers: { type: 'boolean' },
                    showHeaders: { type: 'boolean' },
                    showFooters: { type: 'boolean' }
                  }
                }
              },
              description: 'Custom styling options for the PDF (optional)'
            },
            outputFormat: {
              type: 'string',
              enum: ['text-only', 'text-images', 'full-replica'],
              description: 'Output format of the PDF'
            },
            crawlerSettings: {
              type: 'object',
              properties: {
                keepImages: { type: 'boolean', description: 'Whether to include images' },
                keepTables: { type: 'boolean', description: 'Whether to include tables' },
                keepCodeBlocks: { type: 'boolean', description: 'Whether to include code blocks' },
                keepLiveLinks: { type: 'boolean', description: 'Whether to keep links active' }
              },
              description: 'Settings for web crawling (optional)'
            }
          }
        },
        PDFGenerationResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique identifier for the PDF generation request' },
            status: { type: 'string', description: 'Current status of the PDF generation' },
            progressUrl: { type: 'string', description: 'URL to track progress of the generation' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            code: { type: 'number', description: 'HTTP status code' }
          }
        }
      }
    },
    paths: {
      '/api/generate-pdf': {
        post: {
          summary: 'Generate a PDF from specified web content',
          description: 'Initiates PDF generation based on provided content sources and settings.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PDFGenerationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'PDF generation started successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PDFGenerationResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid request data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Authentication required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, './**/*.ts')], // Path to your API files
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 