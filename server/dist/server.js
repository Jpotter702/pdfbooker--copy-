"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scraper_1 = require("./services/scraper");
const content_organizer_1 = require("./services/content-organizer");
const pdf_generator_1 = require("./services/pdf-generator");
const logger_1 = require("./utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Configure storage for PDFs
const storagePath = process.env.STORAGE_PATH || path_1.default.join(__dirname, '../storage');
const pdfStoragePath = path_1.default.join(storagePath, 'pdfs');
// Create storage directories if they don't exist
if (!fs_1.default.existsSync(storagePath)) {
    fs_1.default.mkdirSync(storagePath, { recursive: true });
}
if (!fs_1.default.existsSync(pdfStoragePath)) {
    fs_1.default.mkdirSync(pdfStoragePath, { recursive: true });
}
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Store progress information for each URL
const progressMap = new Map();
// Progress endpoint with Server-Sent Events
app.get('/api/generate-pdf/progress', (req, res) => {
    const url = req.query.url;
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
        const userPdfPath = path_1.default.join(pdfStoragePath, userId.toString());
        // Create user directory if it doesn't exist
        if (!fs_1.default.existsSync(userPdfPath)) {
            fs_1.default.mkdirSync(userPdfPath, { recursive: true });
            return res.json({ pdfs: [] });
        }
        // Read PDF files from user directory
        const files = fs_1.default.readdirSync(userPdfPath);
        const pdfs = files
            .filter(file => file.endsWith('.pdf') || file.endsWith('.json'))
            .map(file => {
            if (file.endsWith('.json')) {
                // This is a metadata file
                try {
                    const metadata = JSON.parse(fs_1.default.readFileSync(path_1.default.join(userPdfPath, file), 'utf8'));
                    return {
                        id: path_1.default.basename(file, '.json'),
                        ...metadata,
                        createdAt: metadata.createdAt || new Date().toISOString(),
                        status: 'completed'
                    };
                }
                catch (e) {
                    // If metadata can't be read, return basic info
                    return {
                        id: path_1.default.basename(file, '.json'),
                        title: path_1.default.basename(file, '.json'),
                        createdAt: new Date().toISOString(),
                        status: 'completed'
                    };
                }
            }
            else {
                // Just the PDF without metadata
                return {
                    id: path_1.default.basename(file, '.pdf'),
                    title: path_1.default.basename(file, '.pdf'),
                    createdAt: new Date().toISOString(),
                    status: 'completed'
                };
            }
        });
        res.json({ pdfs });
    }
    catch (error) {
        logger_1.logger.error('Error listing PDFs:', error);
        res.status(500).json({ error: 'Failed to list PDFs' });
    }
});
// Download PDF endpoint
app.get('/api/pdfs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Add user authentication and filter by user ID
        const userId = req.query.userId || 'anonymous';
        const pdfPath = path_1.default.join(pdfStoragePath, userId.toString(), `${id}.pdf`);
        if (!fs_1.default.existsSync(pdfPath)) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${id}.pdf`);
        fs_1.default.createReadStream(pdfPath).pipe(res);
    }
    catch (error) {
        logger_1.logger.error('Error downloading PDF:', error);
        res.status(500).json({ error: 'Failed to download PDF' });
    }
});
// Delete PDF endpoint
app.delete('/api/pdfs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Add user authentication and filter by user ID
        const userId = req.query.userId || 'anonymous';
        const pdfPath = path_1.default.join(pdfStoragePath, userId.toString(), `${id}.pdf`);
        const metadataPath = path_1.default.join(pdfStoragePath, userId.toString(), `${id}.json`);
        if (!fs_1.default.existsSync(pdfPath)) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        // Delete PDF file
        fs_1.default.unlinkSync(pdfPath);
        // Delete metadata file if it exists
        if (fs_1.default.existsSync(metadataPath)) {
            fs_1.default.unlinkSync(metadataPath);
        }
        res.json({ success: true });
    }
    catch (error) {
        logger_1.logger.error('Error deleting PDF:', error);
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
        const updateProgress = (progress, message, step, details) => {
            progressMap.set(url, {
                progress,
                message,
                step,
                details
            });
        };
        // Configure web scraper
        updateProgress(5, 'Web scraper configured and starting...', 'initializing');
        const scraper = new scraper_1.WebScraper();
        // Set up detailed progress tracking for scraping
        scraper.setProgressCallback((scrapingProgress) => {
            const { pagesScraped, totalPages, currentUrl } = scrapingProgress;
            // Calculate overall progress for scraping phase (5-55%)
            const scrapingProgressPercent = Math.min(100, Math.floor((pagesScraped / Math.max(totalPages, 1)) * 100));
            const overallProgress = 5 + Math.floor(scrapingProgressPercent * 0.5); // 5-55%
            updateProgress(overallProgress, `Scraping page ${pagesScraped} of ${totalPages}: ${currentUrl || ''}`, 'scraping', {
                pagesScraped,
                totalPages,
                currentUrl,
                scrapingProgressPercent
            });
        });
        // Start scraping
        let scrapedPages;
        try {
            scrapedPages = await scraper.scrape(url, parseInt(depth) || 1);
            updateProgress(55, 'Web scraping complete. Organizing content...', 'organizing');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown scraping error';
            logger_1.logger.error('Scraping error:', error);
            updateProgress(0, `Scraping failed: ${errorMsg}`, 'error', { error: errorMsg });
            throw error;
        }
        // Organize content
        let organizedContent;
        try {
            const organizer = new content_organizer_1.ContentOrganizer();
            organizedContent = await organizer.organize(scrapedPages);
            updateProgress(70, 'Content organized. Generating PDF...', 'generating', {
                pageCount: organizedContent.pages.length,
                tocEntries: organizedContent.tableOfContents.length
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown content organization error';
            logger_1.logger.error('Content organization error:', error);
            updateProgress(0, `Content organization failed: ${errorMsg}`, 'error', { error: errorMsg });
            throw error;
        }
        // Generate PDF with custom configuration
        let pdfBuffer;
        try {
            const generator = new pdf_generator_1.PDFGenerator(config);
            pdfBuffer = await generator.generate(organizedContent);
            updateProgress(90, 'PDF generated. Saving...', 'saving');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown PDF generation error';
            logger_1.logger.error('PDF generation error:', error);
            updateProgress(0, `PDF generation failed: ${errorMsg}`, 'error', { error: errorMsg });
            throw error;
        }
        // Save the generated PDF
        try {
            // Ensure user directory exists
            const userPdfPath = path_1.default.join(pdfStoragePath, userId.toString());
            if (!fs_1.default.existsSync(userPdfPath)) {
                fs_1.default.mkdirSync(userPdfPath, { recursive: true });
            }
            // Save PDF file
            const pdfPath = path_1.default.join(userPdfPath, `${pdfId}.pdf`);
            fs_1.default.writeFileSync(pdfPath, pdfBuffer);
            // Save metadata
            const metadata = {
                title: pdfTitle,
                url,
                sourceUrl: url,
                createdAt: new Date().toISOString(),
                pageCount: organizedContent.pages.length,
                config
            };
            fs_1.default.writeFileSync(path_1.default.join(userPdfPath, `${pdfId}.json`), JSON.stringify(metadata, null, 2));
            updateProgress(100, 'PDF generation complete! Ready for download.', 'complete', {
                pdfId,
                pageCount: organizedContent.pages.length,
                fileSize: pdfBuffer.length
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown file saving error';
            logger_1.logger.error('File saving error:', error);
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
    }
    catch (error) {
        logger_1.logger.error('Error generating PDF:', error);
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
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
app.listen(port, () => {
    logger_1.logger.info(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map