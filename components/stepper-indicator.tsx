"use client";

import { cn } from "@/lib/utils";

interface StepperIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  labels?: string[];
}

export function StepperIndicator({ 
  currentStep, 
  totalSteps, 
  className,
  labels = ["Styling", "Format", "Crawler", "Preview"]
}: StepperIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={cn(
              "flex flex-col items-center",
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-colors text-sm font-medium border-2",
                index === currentStep 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : index < currentStep 
                    ? "border-primary bg-primary/20 text-primary" 
                    : "border-muted bg-muted/20 text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            
            <span className="text-xs mt-2 font-medium">
              {labels[index] || `Step ${index + 1}`}
            </span>
          </div>
        ))}
      </div>
      
      <div className="relative flex items-center justify-between mt-4">
        {Array.from({ length: totalSteps - 1 }).map((_, index) => (
          <div 
            key={index} 
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 h-1 transition-all",
              index < currentStep 
                ? "bg-primary" 
                : "bg-muted",
              index === 0 
                ? "left-0 ml-5" 
                : index === totalSteps - 2 
                  ? "right-0 mr-5" 
                  : `left-1/${totalSteps - 1} ml-${5 * (index + 1)}`
            )}
            style={{
              left: `${(100 / (totalSteps - 1)) * index}%`,
              right: `${100 - ((100 / (totalSteps - 1)) * (index + 1))}%`,
              transform: "translateY(-50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
} 