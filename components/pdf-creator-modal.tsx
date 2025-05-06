"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StepperIndicator } from "@/components/stepper-indicator";
import { PDFStylingStep } from "@/components/pdf-styling-step";
import { PDFFormatStep } from "@/components/pdf-format-step";
import { PDFCrawlerStep } from "@/components/pdf-crawler-step";
import { PDFPreviewStep } from "@/components/pdf-preview-step";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { PDFGenerationDialog } from "@/app/components/pdf-generation-dialog";
import { GeneratePDFRequest } from "@/lib/api-client";

interface PageItem {
  id: string;
  url: string;
  title: string;
  selected: boolean;
  thumbnail?: string;
  level: number;
  isParent: boolean;
  isExpanded?: boolean;
  children: string[];
  parentId?: string;
}

interface PDFCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PDFCreatorModal({ isOpen, onClose }: PDFCreatorModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4; // Total number of steps in the PDF creation process
  
  // Styling step state
  const [bookTitle, setBookTitle] = useState("");
  const [font, setFont] = useState("inter");
  const [primaryColor, setPrimaryColor] = useState("#0070f3");
  const [hasTOC, setHasTOC] = useState(true);
  
  // Output format step state
  const [outputFormat, setOutputFormat] = useState("text-with-images");
  const [pageSize, setPageSize] = useState("a4");
  const [template, setTemplate] = useState("modern");
  
  // Crawler settings step state
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState(2);
  const [keepImages, setKeepImages] = useState(true);
  const [keepTables, setKeepTables] = useState(true);
  const [keepCode, setKeepCode] = useState(true);
  const [keepLinks, setKeepLinks] = useState(true);
  
  // Preview step state
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledPages, setCrawledPages] = useState<PageItem[]>([]);
  
  // PDF generation dialog state
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      // Special handling for transitioning to the preview step
      if (currentStep === 2) {
        // Simulate crawling
        setIsCrawling(true);
        
        // Show toast notification
        toast({
          title: "Crawling started",
          description: `Crawling ${url} with depth ${depth}...`,
        });
        
        // Simulate crawling delay and then show mock results
        setTimeout(() => {
          setIsCrawling(false);
          setCurrentStep(currentStep + 1);
          
          // In a real implementation, this would be actual crawled data
          // For now, we use mock data defined in the preview component
          toast({
            title: "Crawling completed",
            description: "Found 6 pages. Select the ones you want to include.",
          });
        }, 2000);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PDFStylingStep
            bookTitle={bookTitle}
            setBookTitle={setBookTitle}
            font={font}
            setFont={setFont}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            hasTOC={hasTOC}
            setHasTOC={setHasTOC}
          />
        );
      case 1:
        return (
          <PDFFormatStep
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
            pageSize={pageSize}
            setPageSize={setPageSize}
            template={template}
            setTemplate={setTemplate}
          />
        );
      case 2:
        return (
          <PDFCrawlerStep
            url={url}
            setUrl={setUrl}
            depth={depth}
            setDepth={setDepth}
            keepImages={keepImages}
            setKeepImages={setKeepImages}
            keepTables={keepTables}
            setKeepTables={setKeepTables}
            keepCode={keepCode}
            setKeepCode={setKeepCode}
            keepLinks={keepLinks}
            setKeepLinks={setKeepLinks}
          />
        );
      case 3:
        return (
          <PDFPreviewStep
            bookTitle={bookTitle}
            url={url}
            crawledPages={crawledPages}
            setCrawledPages={setCrawledPages}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "Custom Styling";
      case 1:
        return "Output Format";
      case 2:
        return "Crawler Settings";
      case 3:
        return "Preview & Arrange";
      default:
        return "Create PDF Book";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 0:
        return "Customize the appearance of your PDF book";
      case 1:
        return "Choose how content should be formatted in your PDF";
      case 2:
        return "Configure how the web content should be crawled";
      case 3:
        return "Select and arrange pages for your PDF book";
      default:
        return "Create a PDF book from web content";
    }
  };

  // Override the default dialog styling to add backdrop blur
  const backdropStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!bookTitle.trim(); // Require a book title
      case 1:
        return true; // Always valid
      case 2:
        try {
          // Check if URL is valid
          if (!url.trim()) return false;
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      case 3:
        // At least one page must be selected
        return crawledPages.some(page => page.selected);
      default:
        return true;
    }
  };

  const handleCreate = () => {
    // Prepare PDF request data
    const pdfRequest: GeneratePDFRequest = {
      url,
      depth,
      pdfConfig: {
        title: bookTitle,
        fontFamily: font,
        fontSize: 11, // Default font size
        pageSize: pageSize.toUpperCase() as 'A4' | 'A5' | 'Letter',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
        colors: {
          text: "#000000",
          headings: primaryColor,
          links: primaryColor,
          background: "#ffffff",
        },
        layout: {
          showCoverPage: true,
          showTableOfContents: hasTOC,
          showPageNumbers: true,
          showHeaders: true,
          showFooters: true,
        }
      }
    };
    
    // Show the PDF generation dialog
    setShowGenerationDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={backdropStyle}>
          <DialogContent className="sm:max-w-3xl border-none bg-background/95 shadow-lg backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
              <DialogDescription>{getStepDescription()}</DialogDescription>
            </DialogHeader>

            <div className="mt-4 mb-6">
              <StepperIndicator currentStep={currentStep} totalSteps={totalSteps} />
            </div>

            <div className="min-h-[350px] py-4">
              {isCrawling ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Crawling {url}...</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              ) : (
                getStepContent()
              )}
            </div>

            <div className="flex justify-between mt-4">
              {currentStep > 0 ? (
                <Button variant="outline" onClick={prevStep} disabled={isCrawling}>
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps - 1 ? (
                <Button onClick={nextStep} disabled={!isStepValid() || isCrawling}>
                  {currentStep === 2 ? "Start Crawling" : "Continue"}
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={!isStepValid()}>
                  Create PDF
                </Button>
              )}
            </div>
          </DialogContent>
        </div>
      </Dialog>

      {showGenerationDialog && (
        <PDFGenerationDialog
          isOpen={showGenerationDialog}
          onClose={() => {
            setShowGenerationDialog(false);
            // Close the main modal as well if generation is complete
            onClose();
          }}
          pdfRequest={{
            url,
            depth,
            pdfConfig: {
              title: bookTitle,
              fontFamily: font,
              fontSize: 11,
              pageSize: pageSize.toUpperCase() as 'A4' | 'A5' | 'Letter',
              margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50,
              },
              colors: {
                text: "#000000",
                headings: primaryColor,
                links: primaryColor,
                background: "#ffffff",
              },
              layout: {
                showCoverPage: true,
                showTableOfContents: hasTOC,
                showPageNumbers: true,
                showHeaders: true,
                showFooters: true,
              }
            }
          }}
        />
      )}
    </>
  );
} 