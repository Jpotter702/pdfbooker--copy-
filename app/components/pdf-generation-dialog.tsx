import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cross2Icon } from '@radix-ui/react-icons';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { GeneratePDFRequest } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

interface PDFGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfRequest: GeneratePDFRequest;
}

export function PDFGenerationDialog({ isOpen, onClose, pdfRequest }: PDFGenerationDialogProps) {
  const { generatePDF, cancelGeneration, isGenerating, progress, error } = usePDFGeneration();
  const [generationStarted, setGenerationStarted] = useState(false);

  // Start the generation when the dialog is opened
  const handleGenerate = async () => {
    setGenerationStarted(true);
    try {
      await generatePDF(pdfRequest);
      // Don't close the dialog here - let the user close it
    } catch (error) {
      console.error('PDF generation failed:', error);
      // We'll display the error in the UI, so no need to do anything else here
    }
  };

  const handleCancel = () => {
    if (isGenerating) {
      cancelGeneration();
    }
    setGenerationStarted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Generating PDF</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={isGenerating}
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {!generationStarted ? (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground">
                  We'll crawl {pdfRequest.url} to a depth of {pdfRequest.depth} pages 
                  and create a PDF with your selected settings.
                </p>
              </div>
              <Button onClick={handleGenerate} className="w-full">
                Start Generation
              </Button>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-4">
              <div className="bg-destructive/10 rounded-md p-4 border border-destructive/20">
                <h3 className="text-destructive font-medium mb-2">Error</h3>
                <p className="text-sm">{error.message}</p>
              </div>
              <Button onClick={handleGenerate} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{progress.message || 'Preparing...'}</span>
                  <span>{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>

              {isGenerating ? (
                <div className="flex items-center justify-center mt-2">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">This may take a few minutes...</span>
                </div>
              ) : progress.progress === 100 ? (
                <div className="text-center mt-4">
                  <h3 className="text-green-600 dark:text-green-400 font-medium">
                    PDF Generated Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your PDF has been downloaded to your computer.
                  </p>
                  <Button onClick={onClose} className="mt-4 w-full">
                    Close
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={cancelGeneration} 
                  variant="outline" 
                  className="mt-4"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 