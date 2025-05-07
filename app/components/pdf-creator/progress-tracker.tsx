"use client";

import * as React from "react";
import { Progress } from '../ui/progress';
import { Stepper } from '../ui/stepper';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useToast } from '../ui/use-toast';
import { cn } from "@/lib/utils";

interface ProgressStage {
  id: string;
  label: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress: number;
  details?: string;
}

interface ProgressTrackerProps {
  stages: ProgressStage[];
  currentStage: number;
  overallProgress: number;
  className?: string;
}

export function ProgressTracker({
  stages,
  currentStage,
  overallProgress,
  className,
}: ProgressTrackerProps) {
  const { toast } = useToast();

  // Show toast notifications for stage completion
  React.useEffect(() => {
    const completedStage = stages.find(
      (stage, index) => index < currentStage && stage.status === "completed"
    );
    if (completedStage) {
      toast({
        title: "Stage Completed",
        description: `${completedStage.label} has been completed successfully.`,
      });
    }
  }, [currentStage, stages, toast]);

  const getStatusBadge = (status: ProgressStage["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in-progress":
        return <Badge variant="info">In Progress</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Overall Progress</h3>
          <span className="text-sm text-muted-foreground">
            {overallProgress}%
          </span>
        </div>
        <Progress value={overallProgress} />
      </div>

      {/* Stage Stepper */}
      <Stepper
        steps={stages.map((stage) => ({
          id: stage.id,
          label: stage.label,
          description: stage.status,
        }))}
        currentStep={currentStage}
      />

      {/* Detailed Progress */}
      <Accordion type="single" collapsible className="w-full">
        {stages.map((stage, index) => (
          <AccordionItem key={stage.id} value={stage.id}>
            <AccordionTrigger className="flex items-center gap-2">
              <span>{stage.label}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>{getStatusBadge(stage.status)}</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stage.description}</p>
                    {stage.details && <p className="mt-1">{stage.details}</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {stage.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.progress}%
                    </span>
                  </div>
                  <Progress value={stage.progress} />
                </div>
                {stage.details && (
                  <p className="text-sm text-muted-foreground">
                    {stage.details}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
} 