"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StepperIndicator } from "@/components/stepper-indicator";
import { PDFStylingStep } from "@/components/pdf-styling-step";
import { PDFFormatStep } from "@/components/pdf-format-step";
import { cn } from "@/lib/utils";

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
  
  // Crawler settings step state (to be implemented)
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState(2);
  const [keepImages, setKeepImages] = useState(true);
  const [keepTables, setKeepTables] = useState(true);
  const [keepCode, setKeepCode] = useState(true);
  const [keepLinks, setKeepLinks] = useState(true);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
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
        return <div>Step 3: Crawler Settings (to be implemented)</div>;
      case 3:
        return <div>Step 4: Final Preview (to be implemented)</div>;
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
        return "Final Preview";
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
        return "Review your settings before generating the PDF";
      default:
        return "Create a PDF book from web content";
    }
  };

  // Override the default dialog styling to add backdrop blur
  const backdropStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
  };

  const handleCreate = () => {
    // In a real application, we would create a PDF book here
    // For now, we'll just close the modal
    console.log("Creating PDF book with settings:", {
      bookTitle,
      font,
      primaryColor,
      hasTOC,
      outputFormat,
      pageSize,
      template,
      url,
      depth,
      keepImages,
      keepTables,
      keepCode,
      keepLinks,
    });
    onClose();
  };

  return (
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

          <div className="min-h-[300px] py-4">
            {getStepContent()}
          </div>

          <div className="flex justify-between mt-4">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps - 1 ? (
              <Button onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleCreate}>
                Create PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
} 