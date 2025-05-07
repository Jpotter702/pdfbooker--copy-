"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_CONFIG = exports.SCRAPING_CONFIG = exports.PDF_CONFIG = exports.logger = exports.CORS_ORIGIN = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = require("winston");
dotenv_1.default.config();
// Server configuration
exports.PORT = process.env.PORT || 3001;
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
// Logger configuration
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    defaultMeta: { service: 'pdfbooker-server' },
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
        }),
        new winston_1.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.transports.File({ filename: 'combined.log' })
    ]
});
// PDF configuration
exports.PDF_CONFIG = {
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
};
// Scraping configuration
exports.SCRAPING_CONFIG = {
    maxDepth: 3,
    maxPages: 100,
    requestTimeout: 30000,
    maxConcurrentRequests: 5,
    userAgent: 'PDFBooker/1.0',
};
exports.SERVER_CONFIG = {
    port: process.env.PORT || 3001,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
};
//# sourceMappingURL=config.js.map