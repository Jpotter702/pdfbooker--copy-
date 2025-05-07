"use client";

import * as React from "react";
import { CheckIcon, CircleIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: {
    id: string;
    label: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ol className="overflow-hidden">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "relative flex items-center pb-8 last:pb-0",
              "after:absolute after:left-3.5 after:top-[calc(50%_+_16px)] after:h-full after:w-px after:bg-muted last:after:hidden"
            )}
          >
            <div
              className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border",
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "border-primary border-2 bg-background"
                  : "border-muted bg-muted"
              )}
            >
              {index < currentStep ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CircleIcon className="h-4 w-4 fill-current" />
              )}
            </div>
            <div className="ml-4 pb-2">
              <h3
                className={cn(
                  "text-sm font-medium leading-tight",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </h3>
              {step.description && (
                <p
                  className={cn(
                    "text-xs",
                    index <= currentStep ? "text-muted-foreground" : "text-muted"
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
} 