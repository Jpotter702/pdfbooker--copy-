"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex w-full", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                index <= currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/25"
              )}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-sm font-medium">{step.label}</div>
            {step.description && (
              <div className="mt-1 text-xs text-muted-foreground">
                {step.description}
              </div>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-4 flex-1 border-t-2",
                index < currentStep
                  ? "border-primary"
                  : "border-muted-foreground/25"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 