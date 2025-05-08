import PDFDocument from 'pdfkit';
import { JSDOM } from 'jsdom';
import { logger } from '../utils/logger';
import fs from 'fs';

// Utility: Replace template variables in a string
function replaceTemplateVars(template: string, vars: Record<string, any>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : ''
  );
}

// Utility: Try to load a font, fallback to system font if missing
function getFontOrFallback(doc: PDFKit.PDFDocument, fontPath: string, fallback: string = 'Helvetica') {
  try {
    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
      return fontPath;
    }
  } catch (e) {
    logger.warn(`Font not found: ${fontPath}, falling back to ${fallback}`);
  }
  doc.font(fallback);
  return fallback;
}

interface PDFConfig {
  pageSize: 'A4' | 'A5' | 'Letter';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  font: string;
  fontSize: number;
  lineHeight: number;
  colors: {
    text: string;
    headings: string;
    links: string;
    background: string;
  };
  layout: {
    showCoverPage: boolean;
    showTableOfContents: boolean;
    showPageNumbers: boolean;
    showHeaders: boolean;
    showFooters: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    logoPath?: string;
  };
  metadata: {
    title: string;
    author?: string;
    coverImage?: Buffer;
  };
}

interface OrganizedContent {
  title: string;
  pages: Array<{
    title: string;
    content: string;
    depth: number;
    order: number;
  }>;
  tableOfContents: Array<{
    title: string;
    pageNumber: number;
    depth: number;
  }>;
  images: Map<string, Buffer>;
}

export class PDFGenerator {
  private readonly config: PDFConfig;
  private templateCache: Record<string, string> = {};

  constructor(config?: Partial<PDFConfig>) {
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
        headerTemplate: undefined,
        footerTemplate: undefined,
        logoPath: undefined,
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
  public async generate(content: OrganizedContent): Promise<Buffer> {
    // Background processing for large documents (scaffold only)
    if (content.pages.length > 100) {
      logger.info('Large document detected, would offload to background worker.');
      // TODO: Implement real background job system
    }
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: this.config.pageSize,
          margins: this.config.margins,
          bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
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
      } catch (error) {
        logger.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Generates the cover page
   * @param doc PDF document
   * @param title Document title
   */
  private generateCoverPage(doc: PDFKit.PDFDocument, title: string): void {
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
  private generateTableOfContents(
    doc: PDFKit.PDFDocument,
    toc: Array<{
      title: string;
      pageNumber: number;
      depth: number;
    }>
  ): void {
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
   * Generates content pages with dynamic header/footer and logo scaling
   * @param doc PDF document
   * @param content Organized content
   */
  private generateContentPages(
    doc: PDFKit.PDFDocument,
    content: OrganizedContent
  ): void {
    const { headerTemplate, footerTemplate, logoPath } = this.config.layout;
    // Cache for processed templates (per request)
    this.templateCache = {};
    content.pages.forEach((page, index) => {
      // Prepare variables for this page
      const vars = {
        title: page.title,
        pageNumber: index + 1,
        totalPages: content.pages.length,
        date: new Date().toLocaleDateString(),
        ...this.config.metadata,
      };
      // Render header
      if (this.config.layout.showHeaders) {
        this.renderHeader(doc, vars, headerTemplate, logoPath);
      }
      // Process content
      this.processContent(doc, page.content, content.images);
      // Render footer
      if (this.config.layout.showFooters) {
        this.renderFooter(doc, vars, footerTemplate, logoPath);
      }
      // Add a new page if not the last page
      if (index < content.pages.length - 1) {
        doc.addPage();
      }
    });
  }

  /**
   * Renders a dynamic header with variable replacement and logo scaling
   * @param doc PDF document
   * @param vars Variables for template replacement
   * @param template Optional header template
   * @param logoPath Optional logo path
   */
  private renderHeader(
    doc: PDFKit.PDFDocument,
    vars: Record<string, any>,
    template?: string,
    logoPath?: string
  ) {
    const { top, left, right } = this.config.margins;
    let header = template || '{{title}}';
    // Cache processed template
    if (!this.templateCache['header']) {
      this.templateCache['header'] = header;
    }
    header = replaceTemplateVars(this.templateCache['header'], vars);
    // Logo scaling if logoPath is provided and looks like a logo
    if (logoPath && (logoPath.toLowerCase().includes('logo') || logoPath.endsWith('.svg') || logoPath.endsWith('.png'))) {
      try {
        if (fs.existsSync(logoPath)) {
          // Max height 40px, center
          doc.image(logoPath, doc.page.width / 2 - 40, top - 10, { fit: [80, 40], align: 'center' });
        }
      } catch (e) {
        logger.warn('Logo not found or failed to load:', logoPath);
      }
    }
    doc
      .fontSize(10)
      .font(this.config.font)
      .fillColor(this.config.colors.headings)
      .text(header, left, top, {
        width: doc.page.width - left - right,
        align: 'left',
      });
    if (this.config.layout.showPageNumbers) {
      doc
        .fillColor(this.config.colors.text)
        .text(`Page ${vars.pageNumber} of ${vars.totalPages}`, left, top, {
          width: doc.page.width - left - right,
          align: 'right',
        });
    }
    doc.moveDown(2);
  }

  /**
   * Renders a dynamic footer with variable replacement and logo scaling
   * @param doc PDF document
   * @param vars Variables for template replacement
   * @param template Optional footer template
   * @param logoPath Optional logo path
   */
  private renderFooter(
    doc: PDFKit.PDFDocument,
    vars: Record<string, any>,
    template?: string,
    logoPath?: string
  ) {
    const { bottom, left, right } = this.config.margins;
    let footer = template || 'Generated by PDFBooker';
    // Cache processed template
    if (!this.templateCache['footer']) {
      this.templateCache['footer'] = footer;
    }
    footer = replaceTemplateVars(this.templateCache['footer'], vars);
    // Logo scaling if logoPath is provided and looks like a logo
    if (logoPath && (logoPath.toLowerCase().includes('logo') || logoPath.endsWith('.svg') || logoPath.endsWith('.png'))) {
      try {
        if (fs.existsSync(logoPath)) {
          // Max height 40px, center
          doc.image(logoPath, doc.page.width / 2 - 40, doc.page.height - bottom - 40, { fit: [80, 40], align: 'center' });
        }
      } catch (e) {
        logger.warn('Logo not found or failed to load:', logoPath);
      }
    }
    doc
      .fontSize(8)
      .font(this.config.font)
      .fillColor(this.config.colors.text)
      .text(footer, left, doc.page.height - bottom, {
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
  private processContent(
    doc: PDFKit.PDFDocument,
    content: string,
    images: Map<string, Buffer>
  ): void {
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Process each element
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

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
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
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
  private processHeading(doc: PDFKit.PDFDocument, element: Element): void {
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
  private processParagraph(doc: PDFKit.PDFDocument, element: Element): void {
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
  private processImage(
    doc: PDFKit.PDFDocument,
    element: Element,
    images: Map<string, Buffer>
  ): void {
    const src = element.getAttribute('src');
    if (!src) return;

    const imageBuffer = images.get(src);
    if (!imageBuffer) return;

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
  private processLink(doc: PDFKit.PDFDocument, element: Element): void {
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
  private processList(doc: PDFKit.PDFDocument, element: Element): void {
    doc.moveDown();
  }

  /**
   * Processes a list item element
   * @param doc PDF document
   * @param element List item element
   */
  private processListItem(doc: PDFKit.PDFDocument, element: Element): void {
    const bullet = element.parentElement?.tagName.toLowerCase() === 'ul' ? '•' : '1.';
    const text = element.textContent || '';

    doc
      .fontSize(this.config.fontSize)
      .font(this.config.font)
      .fillColor(this.config.colors.text)
      .text(`${bullet} ${text}`, { indent: 20 });
  }
} 