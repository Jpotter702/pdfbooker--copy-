import { useState, useEffect, useCallback } from 'react';
import { pdfApi, PDFListItem } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

export function usePDFList() {
  const [pdfs, setPdfs] = useState<PDFListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch the list of PDFs
  const fetchPDFs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const pdfs = await pdfApi.listPDFs();
      setPdfs(pdfs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch PDFs');
      setError(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Download a PDF
  const downloadPDF = useCallback(async (id: string) => {
    try {
      await pdfApi.downloadPDF(id);
      toast({
        title: 'PDF Downloaded',
        description: 'Your PDF has been downloaded successfully.',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download PDF');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Delete a PDF
  const deletePDF = useCallback(async (id: string) => {
    try {
      await pdfApi.deletePDF(id);
      // Remove the deleted PDF from the state
      setPdfs((currentPdfs) => currentPdfs.filter(pdf => pdf.id !== id));
      toast({
        title: 'PDF Deleted',
        description: 'Your PDF has been deleted successfully.',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete PDF');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load PDFs on initial render
  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  return {
    pdfs,
    isLoading,
    error,
    refreshPDFs: fetchPDFs,
    downloadPDF,
    deletePDF,
  };
} 