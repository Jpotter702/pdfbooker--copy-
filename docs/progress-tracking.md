# Progress Tracking System

The progress tracking system provides a comprehensive way to monitor and display the status of PDF generation processes using Shadcn UI components.

## Features

### 1. Overall Progress
- Visual progress bar showing completion percentage
- Real-time updates of progress status
- Clean and intuitive design

### 2. Stage Tracking
- Stepper component showing current stage
- Visual indicators for completed, in-progress, and pending stages
- Stage descriptions and details

### 3. Status Indicators
- Badge components for different status types:
  - Success (Completed)
  - Info (In Progress)
  - Warning (Pending)
  - Error (Failed)
- Color-coded status indicators

### 4. Detailed Information
- Accordion component for detailed progress information
- Expandable sections for each stage
- Progress bars for individual stages
- Additional details and descriptions

### 5. Notifications
- Toast notifications for important milestones
- Stage completion alerts
- Error notifications

### 6. Tooltips
- Hover tooltips for additional information
- Stage details on hover
- Status explanations

## Components

### ProgressTracker
The main component that combines all progress tracking elements:

```tsx
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
```

### Usage Example

```tsx
const stages = [
  {
    id: "init",
    label: "Initialization",
    description: "Setting up PDF generation",
    status: "completed",
    progress: 100,
  },
  {
    id: "processing",
    label: "Processing",
    description: "Generating PDF content",
    status: "in-progress",
    progress: 45,
    details: "Processing page 3 of 7",
  },
  {
    id: "finalization",
    label: "Finalization",
    description: "Finalizing PDF document",
    status: "pending",
    progress: 0,
  },
];

<ProgressTracker
  stages={stages}
  currentStage={1}
  overallProgress={48}
/>
```

## Integration

The progress tracking system integrates with:

1. PDF Generation Service
   - Real-time progress updates
   - Stage status tracking
   - Error handling

2. Toast Notifications
   - Stage completion alerts
   - Error notifications
   - Progress updates

3. UI Components
   - Progress bars
   - Steppers
   - Badges
   - Accordions
   - Tooltips

## Best Practices

1. Progress Updates
   - Update progress frequently (every 1-2 seconds)
   - Show meaningful progress indicators
   - Provide detailed status information

2. Error Handling
   - Clear error messages
   - Visual error indicators
   - Recovery options

3. User Experience
   - Clear visual hierarchy
   - Consistent status indicators
   - Helpful tooltips
   - Non-intrusive notifications

4. Accessibility
   - ARIA labels for progress indicators
   - Keyboard navigation support
   - Screen reader compatibility

## Dependencies

- @radix-ui/react-progress
- @radix-ui/react-accordion
- @radix-ui/react-tooltip
- class-variance-authority
- lucide-react
- clsx
- tailwind-merge 