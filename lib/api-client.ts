import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PDFConfig {
  title: string;
  author?: string;
  pageSize: 'A4' | 'A5' | 'Letter';
  fontFamily: string;
  fontSize: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
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
  };
}

export interface GeneratePDFRequest {
  url: string;
  depth: number;
  pdfConfig: PDFConfig;
  coverImage?: File;
  userId?: string; // Optional user ID for authentication
}

export interface GeneratePDFResponse {
  progress: number;
  message: string;
  step: 'initializing' | 'scraping' | 'organizing' | 'generating' | 'saving' | 'complete' | 'error';
  details?: any;
  error?: string;
}

export interface PDFListItem {
  id: string;
  title: string;
  sourceUrl: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'error';
  pageCount?: number;
}

export const pdfApi = {
  // Generate a new PDF from a URL
  generatePDF: async (data: GeneratePDFRequest) => {
    const formData = new FormData();
    formData.append('url', data.url);
    formData.append('depth', data.depth.toString());
    formData.append('pdfConfig', JSON.stringify(data.pdfConfig));
    
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }
    
    if (data.userId) {
      formData.append('userId', data.userId);
    }

    const response = await apiClient.post('/api/generate-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    return response.data;
  },

  // Get progress for a PDF generation task
  getProgress: (url: string) => {
    return new EventSource(`${apiClient.defaults.baseURL}/api/generate-pdf/progress?url=${encodeURIComponent(url)}`);
  },
  
  // List all PDFs for a user
  listPDFs: async (userId?: string) => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get<{ pdfs: PDFListItem[] }>('/api/pdfs', { params });
    return response.data.pdfs;
  },
  
  // Download a specific PDF
  downloadPDF: async (id: string, userId?: string) => {
    const params = userId ? { userId } : {};
    const response = await apiClient.get(`/api/pdfs/${id}`, { 
      params,
      responseType: 'blob',
    });
    
    // Create and trigger download
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return response.data;
  },
  
  // Delete a PDF
  deletePDF: async (id: string, userId?: string) => {
    const params = userId ? { userId } : {};
    const response = await apiClient.delete(`/api/pdfs/${id}`, { params });
    return response.data;
  },
}; 