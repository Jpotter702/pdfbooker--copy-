"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Loader2, 
  Download, 
  AlertTriangle, 
  Globe, 
  BookOpen, 
  FileText, 
  Save
} from "lucide-react";
import { GeneratePDFRequest } from "@/lib/api-client";
import { usePDFGeneration } from "@/lib/hooks/use-pdf-generation";

interface PDFGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfRequest: GeneratePDFRequest;
}

export function PDFGenerationDialog({ isOpen, onClose, pdfRequest }: PDFGenerationDialogProps) {
  const { generatePDF, cancelGeneration, isGenerating, progress, error } = usePDFGeneration();
  const [generationComplete, setGenerationComplete] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (isOpen && !isGenerating && !generationComplete && !error) {
      generatePDF(pdfRequest)
        .then((blob) => {
          setPdfBlob(blob);
          setGenerationComplete(true);
        })
        .catch(() => {
          // Error is handled by the hook
        });
    }

    return () => {
      // Clean up when dialog closes
      if (!isOpen) {
        cancelGeneration();
      }
    };
  }, [isOpen, generatePDF, cancelGeneration, isGenerating, generationComplete, error, pdfRequest]);

  // Once progress reaches 100%, mark generation as complete
  useEffect(() => {
    if (progress.progress === 100) {
      setGenerationComplete(true);
    }
  }, [progress.progress]);

  const handleDownload = () => {
    if (pdfBlob) {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfRequest.pdfConfig.title || 'generated'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  // Get the step icon based on current progress step
  const getStepIcon = () => {
    switch (progress.step) {
      case 'initializing':
        return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
      case 'scraping':
        return <Globe className="h-6 w-6 text-blue-500" />;
      case 'organizing':
        return <BookOpen className="h-6 w-6 text-yellow-500" />;
      case 'generating':
        return <FileText className="h-6 w-6 text-green-500" />;
      case 'saving':
        return <Save className="h-6 w-6 text-purple-500" />;
      case 'complete':
        return <Check className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {error ? "Generation Failed" : 
             generationComplete ? "PDF Generated Successfully" : 
             `Generating PDF - ${progress.step.charAt(0).toUpperCase()}${progress.step.slice(1)}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {error ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-destructive/20 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Error during PDF generation</h3>
                <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
              </div>
              <Button onClick={onClose} className="mt-4">Close</Button>
            </div>
          ) : generationComplete ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="font-medium">Your PDF is ready</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {progress.details?.pageCount 
                    ? `${progress.details.pageCount} pages successfully generated.` 
                    : 'The PDF has been generated and is ready to download.'}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleDownload} className="gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={onClose}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-full bg-primary/10 p-4 mb-3">
                  {getStepIcon()}
                </div>
                <Progress value={progress.progress} className="h-2 w-full mb-2" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="font-medium">{progress.message}</p>
                <p className="text-sm text-muted-foreground">
                  {progress.progress}% complete
                </p>
                
                {/* Show step-specific details */}
                {progress.step === 'scraping' && progress.details && (
                  <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                    <p>Pages found: {progress.details.totalPages}</p>
                    <p>Pages scraped: {progress.details.pagesScraped}</p>
                    {progress.details.currentUrl && (
                      <p className="truncate max-w-full">URL: {progress.details.currentUrl}</p>
                    )}
                  </div>
                )}
                
                {progress.step === 'organizing' && progress.details && (
                  <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                    <p>Processing content for PDF generation...</p>
                  </div>
                )}
                
                {progress.step === 'generating' && progress.details && (
                  <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                    <p>Pages to generate: {progress.details.pageCount}</p>
                    {progress.details.tocEntries && (
                      <p>Table of contents entries: {progress.details.tocEntries}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>This may take a few minutes depending on the content and depth of the crawl.</p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  cancelGeneration();
                  onClose();
                }} 
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 