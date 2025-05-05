import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PDFCustomizationForm } from './pdf-customization-form';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/app/components/ui/slider';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  depth: z.number().min(1).max(10),
  pdfConfig: z.object({
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
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function PDFForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      depth: 3,
      pdfConfig: {
        title: '',
        pageSize: 'A4',
        fontFamily: 'Helvetica',
        fontSize: 12,
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
        colors: {
          text: '#000000',
          headings: '#333333',
          links: '#0066cc',
          background: '#ffffff',
        },
        layout: {
          showCoverPage: true,
          showTableOfContents: true,
          showPageNumbers: true,
          showHeaders: true,
          showFooters: true,
        },
      },
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsGenerating(true);
      setProgress(0);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('url', values.url);
      formData.append('depth', values.depth.toString());
      formData.append('pdfConfig', JSON.stringify(values.pdfConfig));

      // Add cover image if provided
      if (values.pdfConfig.coverImage) {
        formData.append('coverImage', values.pdfConfig.coverImage);
      }

      // Start SSE connection for progress updates
      const eventSource = new EventSource(`/api/generate-pdf?url=${encodeURIComponent(values.url)}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress(data.progress);

        if (data.progress === 100) {
          eventSource.close();
          setIsGenerating(false);
          toast({
            title: 'PDF Generated',
            description: 'Your PDF has been generated successfully.',
          });
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsGenerating(false);
        toast({
          title: 'Error',
          description: 'Failed to generate PDF. Please try again.',
          variant: 'destructive',
        });
      };

      // Send request to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter website URL"
                          {...field}
                          disabled={isGenerating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crawl Depth</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          disabled={isGenerating}
                        />
                      </FormControl>
                      <FormDescription>
                        Current depth: {field.value}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating ({progress}%)
                    </>
                  ) : (
                    'Generate PDF'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="advanced">
            <PDFCustomizationForm
              onSave={(values) => {
                form.setValue('pdfConfig', values);
                toast({
                  title: 'Settings saved',
                  description: 'Your PDF customization settings have been saved.',
                });
              }}
              initialValues={form.getValues('pdfConfig')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 