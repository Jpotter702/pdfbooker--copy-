"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFGenerator = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const jsdom_1 = require("jsdom");
const logger_1 = require("../utils/logger");
class PDFGenerator {
    constructor(config) {
        this.config = {
            pageSize: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50,
            },
            font: 'Helvetica',
            fontSize: 12,
            lineHeight: 1.5,
            colors: {
                text: '#000000',
                headings: '#333333',
                links: '#0066cc',
                background: '#ffffff',
            },
            layout: {
                showCoverPage: true,
                showTableOfContents: true,
                showPageNumbers: true,
                showHeaders: true,
                showFooters: true,
            },
            metadata: {
                title: 'Generated PDF',
            },
            ...config,
        };
    }
    /**
     * Generates a PDF from organized content
     * @param content Organized content to convert to PDF
     * @returns PDF buffer
     */
    async generate(content) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: this.config.pageSize,
                    margins: this.config.margins,
                    bufferPages: true,
                });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (error) => reject(error));
                // Generate cover page if enabled
                if (this.config.layout.showCoverPage) {
                    this.generateCoverPage(doc, content.title);
                }
                // Generate table of contents if enabled
                if (this.config.layout.showTableOfContents) {
                    this.generateTableOfContents(doc, content.tableOfContents);
                }
                // Generate content pages
                this.generateContentPages(doc, content);
                // Finalize the document
                doc.end();
            }
            catch (error) {
                logger_1.logger.error('Error generating PDF:', error);
                reject(error);
            }
        });
    }
    /**
     * Generates the cover page
     * @param doc PDF document
     * @param title Document title
     */
    generateCoverPage(doc, title) {
        // Add cover image if provided
        if (this.config.metadata.coverImage) {
            const { width, height } = doc.page;
            doc.image(this.config.metadata.coverImage, {
                fit: [width, height],
                align: 'center',
                valign: 'center',
            });
            doc.addPage();
        }
        doc
            .fontSize(24)
            .font(this.config.font)
            .fillColor(this.config.colors.headings)
            .text(this.config.metadata.title || title, { align: 'center' })
            .moveDown(2);
        if (this.config.metadata.author) {
            doc
                .fontSize(14)
                .fillColor(this.config.colors.text)
                .text(`By ${this.config.metadata.author}`, { align: 'center' })
                .moveDown(2);
        }
        doc
            .fontSize(12)
            .text(new Date().toLocaleDateString(), { align: 'center' });
        // Add a new page
        doc.addPage();
    }
    /**
     * Generates the table of contents
     * @param doc PDF document
     * @param toc Table of contents entries
     */
    generateTableOfContents(doc, toc) {
        doc
            .fontSize(18)
            .font(this.config.font)
            .fillColor(this.config.colors.headings)
            .text('Table of Contents', { align: 'center' })
            .moveDown(2);
        toc.forEach((entry) => {
            const indent = entry.depth * 20;
            const dots = '.'.repeat(60 - entry.title.length - entry.pageNumber.toString().length - indent / 10);
            doc
                .fontSize(12)
                .font(this.config.font)
                .fillColor(this.config.colors.text)
                .text(entry.title, { continued: true, indent })
                .text(dots, { continued: true })
                .text(entry.pageNumber.toString(), { align: 'right' });
        });
        // Add a new page
        doc.addPage();
    }
    /**
     * Generates content pages
     * @param doc PDF document
     * @param content Organized content
     */
    generateContentPages(doc, content) {
        content.pages.forEach((page, index) => {
            // Add page header
            this.addPageHeader(doc, page.title, index + 1, content.pages.length);
            // Process content
            this.processContent(doc, page.content, content.images);
            // Add page footer
            this.addPageFooter(doc);
            // Add a new page if not the last page
            if (index < content.pages.length - 1) {
                doc.addPage();
            }
        });
    }
    /**
     * Adds page header
     * @param doc PDF document
     * @param title Page title
     * @param pageNumber Current page number
     * @param totalPages Total number of pages
     */
    addPageHeader(doc, title, pageNumber, totalPages) {
        if (!this.config.layout.showHeaders)
            return;
        const { top, left, right } = this.config.margins;
        doc
            .fontSize(10)
            .font(this.config.font)
            .fillColor(this.config.colors.headings)
            .text(title, left, top, {
            width: doc.page.width - left - right,
            align: 'left',
        });
        if (this.config.layout.showPageNumbers) {
            doc
                .fillColor(this.config.colors.text)
                .text(`Page ${pageNumber} of ${totalPages}`, left, top, {
                width: doc.page.width - left - right,
                align: 'right',
            });
        }
        doc.moveDown(2);
    }
    /**
     * Adds page footer
     * @param doc PDF document
     */
    addPageFooter(doc) {
        if (!this.config.layout.showFooters)
            return;
        const { bottom, left, right } = this.config.margins;
        doc
            .fontSize(8)
            .font(this.config.font)
            .fillColor(this.config.colors.text)
            .text('Generated by PDFBooker', left, doc.page.height - bottom, {
            width: doc.page.width - left - right,
            align: 'center',
        });
    }
    /**
     * Processes content and adds it to the document
     * @param doc PDF document
     * @param content HTML content
     * @param images Image cache
     */
    processContent(doc, content, images) {
        var _a;
        const dom = new jsdom_1.JSDOM(content);
        const document = dom.window.document;
        // Process each element
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                switch (element.tagName.toLowerCase()) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        this.processHeading(doc, element);
                        break;
                    case 'p':
                        this.processParagraph(doc, element);
                        break;
                    case 'img':
                        this.processImage(doc, element, images);
                        break;
                    case 'a':
                        this.processLink(doc, element);
                        break;
                    case 'ul':
                    case 'ol':
                        this.processList(doc, element);
                        break;
                    case 'li':
                        this.processListItem(doc, element);
                        break;
                    case 'br':
                        doc.moveDown();
                        break;
                }
            }
            else if (node.nodeType === Node.TEXT_NODE) {
                const text = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                if (text) {
                    doc.text(text);
                }
            }
        }
    }
    /**
     * Processes a heading element
     * @param doc PDF document
     * @param element Heading element
     */
    processHeading(doc, element) {
        const level = parseInt(element.tagName[1]);
        const fontSize = 24 - (level - 1) * 2;
        doc
            .fontSize(fontSize)
            .font(this.config.font)
            .fillColor(this.config.colors.headings)
            .text(element.textContent || '')
            .moveDown();
    }
    /**
     * Processes a paragraph element
     * @param doc PDF document
     * @param element Paragraph element
     */
    processParagraph(doc, element) {
        doc
            .fontSize(this.config.fontSize)
            .font(this.config.font)
            .fillColor(this.config.colors.text)
            .text(element.textContent || '', {
            lineGap: this.config.lineHeight,
        })
            .moveDown();
    }
    /**
     * Processes an image element
     * @param doc PDF document
     * @param element Image element
     * @param images Image cache
     */
    processImage(doc, element, images) {
        const src = element.getAttribute('src');
        if (!src)
            return;
        const imageBuffer = images.get(src);
        if (!imageBuffer)
            return;
        const width = parseInt(element.getAttribute('width') || '');
        const height = parseInt(element.getAttribute('height') || '');
        // Calculate dimensions to fit page width
        const maxWidth = doc.page.width - this.config.margins.left - this.config.margins.right;
        const scale = width ? maxWidth / width : 1;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        // Add image
        doc.image(imageBuffer, {
            width: scaledWidth,
            height: scaledHeight,
            align: 'center',
        });
        // Add caption if alt text exists
        const alt = element.getAttribute('alt');
        if (alt) {
            doc
                .fontSize(10)
                .font(this.config.font)
                .fillColor(this.config.colors.text)
                .text(alt, { align: 'center' });
        }
        doc.moveDown();
    }
    /**
     * Processes a link element
     * @param doc PDF document
     * @param element Link element
     */
    processLink(doc, element) {
        const href = element.getAttribute('href');
        const text = element.textContent || '';
        doc
            .fontSize(this.config.fontSize)
            .font(this.config.font)
            .fillColor(this.config.colors.links)
            .text(text, { link: href });
    }
    /**
     * Processes a list element
     * @param doc PDF document
     * @param element List element
     */
    processList(doc, element) {
        doc.moveDown();
    }
    /**
     * Processes a list item element
     * @param doc PDF document
     * @param element List item element
     */
    processListItem(doc, element) {
        var _a;
        const bullet = ((_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.tagName.toLowerCase()) === 'ul' ? '•' : '1.';
        const text = element.textContent || '';
        doc
            .fontSize(this.config.fontSize)
            .font(this.config.font)
            .fillColor(this.config.colors.text)
            .text(`${bullet} ${text}`, { indent: 20 });
    }
}
exports.PDFGenerator = PDFGenerator;
//# sourceMappingURL=pdf-generator.js.map