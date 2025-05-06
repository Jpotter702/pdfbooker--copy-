import { useState, useCallback, useEffect } from 'react';
import { GeneratePDFRequest } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

export interface PDFGenerationProgress {
  progress: number;
  message: string;
}

export function usePDFGeneration() {
  const [progress, setProgress] = useState<PDFGenerationProgress>({ progress: 0, message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { toast } = useToast();

  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const generatePDF = useCallback(async (data: GeneratePDFRequest) => {
    try {
      // Reset state
      setIsGenerating(true);
      setProgress({ progress: 0, message: 'Initializing...' });
      setError(null);
      
      // Close any existing event source
      if (eventSource) {
        eventSource.close();
      }

      // Set up progress tracking with SSE
      const newEventSource = new EventSource(`/api/generate-pdf/progress?url=${encodeURIComponent(data.url)}`);
      setEventSource(newEventSource);

      newEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress({
            progress: data.progress,
            message: data.message
          });

          // Close event source when done
          if (data.progress === 100) {
            newEventSource.close();
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      newEventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        newEventSource.close();
        setEventSource(null);
        setError(new Error('Error tracking PDF generation progress'));
      };

      // Create form data for the request
      const formData = new FormData();
      formData.append('url', data.url);
      formData.append('depth', data.depth.toString());
      formData.append('pdfConfig', JSON.stringify(data.pdfConfig));
      
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }

      // Send request to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.pdfConfig.title || 'generated'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'PDF Generated',
        description: 'Your PDF has been generated and downloaded successfully.',
      });

      return blob;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [eventSource, toast]);

  const cancelGeneration = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsGenerating(false);
    setProgress({ progress: 0, message: '' });
  }, [eventSource]);

  return {
    generatePDF,
    cancelGeneration,
    isGenerating,
    progress,
    error,
  };
} 