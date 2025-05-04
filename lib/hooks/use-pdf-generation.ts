import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pdfApi, GeneratePDFRequest } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

export function usePDFGeneration() {
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: GeneratePDFRequest) => {
      setIsGenerating(true);
      setProgress(0);

      // Set up progress tracking
      const eventSource = pdfApi.getProgress(data.url);
      eventSource.onmessage = (event) => {
        const { progress, message } = JSON.parse(event.data);
        setProgress(progress);
        if (progress === 100) {
          eventSource.close();
        }
      };

      try {
        const blob = await pdfApi.generatePDF(data);
        return blob;
      } finally {
        setIsGenerating(false);
        eventSource.close();
      }
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'PDF Generated',
        description: 'Your PDF has been generated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    generatePDF: mutation.mutate,
    isGenerating,
    progress,
    error: mutation.error,
  };
} 