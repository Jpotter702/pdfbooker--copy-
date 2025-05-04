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
}

export interface GeneratePDFResponse {
  progress: number;
  message: string;
}

export const pdfApi = {
  generatePDF: async (data: GeneratePDFRequest) => {
    const formData = new FormData();
    formData.append('url', data.url);
    formData.append('depth', data.depth.toString());
    formData.append('pdfConfig', JSON.stringify(data.pdfConfig));
    
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }

    const response = await apiClient.post('/api/generate-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    return response.data;
  },

  getProgress: (url: string) => {
    return new EventSource(`${apiClient.defaults.baseURL}/api/generate-pdf/progress?url=${encodeURIComponent(url)}`);
  },
}; 