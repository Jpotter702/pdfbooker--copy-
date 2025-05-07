"use client";

import { PDFCustomizationForm } from '../../app/components/pdf-creator/pdf-customization-form';
import { ProgressTracker } from '../../app/components/pdf-creator/progress-tracker';
import { useState } from "react";
import { Toaster } from "@/app/components/ui/toaster";
import { type FormValues } from '../../app/components/pdf-creator/pdf-customization-form';

type Stage = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress: number;
  details?: string;
};

export default function Home() {
  const [stages, setStages] = useState<Stage[]>([
    {
      id: "init",
      label: "Initialization",
      description: "Setting up PDF generation",
      status: "pending",
      progress: 0,
    },
    {
      id: "processing",
      label: "Processing",
      description: "Generating PDF content",
      status: "pending",
      progress: 0,
    },
    {
      id: "finalization",
      label: "Finalization",
      description: "Finalizing PDF document",
      status: "pending",
      progress: 0,
    },
  ]);

  const [currentStage, setCurrentStage] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const handlePDFGeneration = async (values: FormValues) => {
    // Update initialization stage
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === "init"
          ? { ...stage, status: "in-progress", progress: 50 }
          : stage
      )
    );
    setOverallProgress(10);

    // Simulate processing
    setTimeout(() => {
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === "init"
            ? { ...stage, status: "completed", progress: 100 }
            : stage.id === "processing"
            ? { ...stage, status: "in-progress", progress: 30 }
            : stage
        )
      );
      setCurrentStage(1);
      setOverallProgress(40);
    }, 2000);

    // Simulate completion
    setTimeout(() => {
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === "processing"
            ? { ...stage, status: "completed", progress: 100 }
            : stage.id === "finalization"
            ? { ...stage, status: "in-progress", progress: 60 }
            : stage
        )
      );
      setCurrentStage(2);
      setOverallProgress(70);
    }, 4000);

    // Simulate finalization
    setTimeout(() => {
      setStages((prev) =>
        prev.map((stage) =>
          stage.id === "finalization"
            ? { ...stage, status: "completed", progress: 100 }
            : stage
        )
      );
      setOverallProgress(100);
    }, 6000);
  };

  return (
    <main className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">PDF Book Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Customize Your PDF</h2>
          <PDFCustomizationForm onSave={handlePDFGeneration} />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Generation Progress</h2>
          <ProgressTracker
            stages={stages}
            currentStage={currentStage}
            overallProgress={overallProgress}
          />
        </div>
      </div>
      
      <Toaster />
    </main>
  );
}