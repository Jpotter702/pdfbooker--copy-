# PDF Customization Form

The PDF Customization Form is a React component that provides a comprehensive interface for customizing PDF generation settings. It uses Shadcn UI components and React Hook Form for form management.

## Features

### Basic Settings
- **Book Title**: Required field for the PDF title
- **Author**: Optional field for the PDF author
- **Page Size**: Selection between A4, A5, and Letter formats
- **Font Family**: Selection from common web-safe fonts
- **Font Size**: Adjustable between 8px and 24px

### Advanced Settings
- **Margins**: Customizable margins for all sides (top, bottom, left, right)
- **Colors**: Color picker for:
  - Text color
  - Headings color
  - Links color
  - Background color
- **Layout Options**: Toggle switches for:
  - Cover page
  - Table of contents
  - Page numbers
  - Headers
  - Footers

## Component Structure

```typescript
interface PDFCustomizationFormProps {
  onSave: (values: PDFConfigValues) => void;
  initialValues?: PDFConfigValues;
}
```

### Form Schema
The form uses Zod for validation with the following schema:

```typescript
const pdfConfigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  pageSize: z.enum(['A4', 'A5', 'Letter']),
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(24),
  margins: z.object({
    top: z.number().min(0).max(100),
    bottom: z.number().min(0).max(100),
    left: z.number().min(0).max(100),
    right: z.number().min(0).max(100),
  }),
  colors: z.object({
    text: z.string(),
    headings: z.string(),
    links: z.string(),
    background: z.string(),
  }),
  layout: z.object({
    showCoverPage: z.boolean(),
    showTableOfContents: z.boolean(),
    showPageNumbers: z.boolean(),
    showHeaders: z.boolean(),
    showFooters: z.boolean(),
  }),
});
```

## API Integration

### API Client
The application uses Axios for API communication with the following endpoints:

```typescript
interface GeneratePDFRequest {
  url: string;
  depth: number;
  pdfConfig: PDFConfig;
  coverImage?: File;
}

interface GeneratePDFResponse {
  progress: number;
  message: string;
}

const pdfApi = {
  generatePDF: async (data: GeneratePDFRequest) => Promise<Blob>;
  getProgress: (url: string) => EventSource;
};
```

### React Query Integration
The application uses React Query for state management and data fetching:

```typescript
const { generatePDF, isGenerating, progress, error } = usePDFGeneration();

// Usage in component
const handleSubmit = async (data: GeneratePDFRequest) => {
  generatePDF(data);
};
```

### Real-time Progress Updates
Progress updates are handled using Server-Sent Events (SSE):

```typescript
const eventSource = pdfApi.getProgress(data.url);
eventSource.onmessage = (event) => {
  const { progress, message } = JSON.parse(event.data);
  setProgress(progress);
  if (progress === 100) {
    eventSource.close();
  }
};
```

### Error Handling
Errors are handled using Shadcn UI's Toast component:

```typescript
toast({
  title: 'Error',
  description: 'Failed to generate PDF. Please try again.',
  variant: 'destructive',
});
```

## Dependencies

- **UI Components**:
  - `@radix-ui/react-switch`: For toggle switches
  - `@radix-ui/react-popover`: For color picker popover
  - `@radix-ui/react-toast`: For toast notifications
  - `react-colorful`: For color picking functionality
  - `clsx` and `tailwind-merge`: For class name utilities
- **API Communication**:
  - `axios`: For HTTP requests
  - `@tanstack/react-query`: For state management

## Usage Example

```typescript
import { PDFCustomizationForm } from '@/components/pdf-customization-form';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

export function MyComponent() {
  const { generatePDF, isGenerating, progress } = usePDFGeneration();

  const handleSave = (values) => {
    generatePDF({
      url: 'https://example.com',
      depth: 3,
      pdfConfig: values,
    });
  };

  return (
    <PDFCustomizationForm
      onSave={handleSave}
      initialValues={{
        title: 'My Book',
        pageSize: 'A4',
        // ... other initial values
      }}
    />
  );
}
```

## Styling

The component uses Tailwind CSS for styling and follows the Shadcn UI design system. All components are responsive and accessible.

## Type Safety

The component is fully typed with TypeScript, ensuring type safety for:
- Form values
- Props
- Event handlers
- Component props
- API requests and responses

## Integration with PDF Generator

The form values are designed to work seamlessly with the PDF generator service, which uses these settings to:
- Set page dimensions
- Apply typography settings
- Configure margins
- Apply color schemes
- Control layout elements

## Best Practices

1. **Form Validation**: Always validate form inputs using the provided Zod schema
2. **Default Values**: Provide sensible defaults for all form fields
3. **Error Handling**: Use the built-in error messages from the form validation
4. **Accessibility**: All form controls are accessible and keyboard-navigable
5. **Responsive Design**: The form layout adapts to different screen sizes
6. **API Error Handling**: Always handle API errors gracefully with user feedback
7. **Progress Updates**: Show real-time progress for long-running operations
8. **State Management**: Use React Query for efficient state management 