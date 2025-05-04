import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3001;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Logger configuration
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'pdfbooker-server' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// PDF configuration
export const PDF_CONFIG = {
  pageSize: 'A4' as const,
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
};

// Scraping configuration
export const SCRAPING_CONFIG = {
  maxDepth: 3,
  maxPages: 100,
  requestTimeout: 30000,
  maxConcurrentRequests: 5,
  userAgent: 'PDFBooker/1.0',
};

export const SERVER_CONFIG = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
}; 