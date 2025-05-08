"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
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
} from '../../../components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Stepper } from '../ui/stepper';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';

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

const steps = [
  { label: "Custom Styling" },
  { label: "Output Format" },
  { label: "Crawler Settings" },
  { label: "Chooser" },
  { label: "Arranger" },
  { label: "Review & Generate" },
];

export function PDFCreatorDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [customStyling, setCustomStyling] = useState<any>(null);
  const [outputFormat, setOutputFormat] = useState<string>('text-images');
  const [crawlerSettings, setCrawlerSettings] = useState({
    keepImages: true,
    keepTables: true,
    keepCodeBlocks: true,
    keepLiveLinks: true
  });
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');
  const [arrangedContent, setArrangedContent] = useState<{ url: string; title: string }[]>([]);

  // Initialize arranged content from sources when they change
  useEffect(() => {
    if (sources.length > 0 && arrangedContent.length === 0) {
      setArrangedContent(sources.map(url => ({ url, title: '' })));
    }
  }, [sources]);

  // Function to initiate PDF generation
  const handleGeneratePDF = async () => {
    try {
      // Prepare the request payload with collected settings
      const payload = {
        sources: arrangedContent,
        customStyling: customStyling || {},
        outputFormat,
        crawlerSettings,
        userId: 'anonymous' // TODO: Replace with actual user ID from auth context
      };

      // Send request to backend API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate PDF generation');
      }

      const data = await response.json();
      toast({
        title: 'PDF Generation Started',
        description: `Your PDF is being generated. Track progress at ${data.progressUrl}`,
      });

      // Close the dialog
      onClose();

      // Implement progress tracking using EventSource
      const eventSource = new EventSource(data.progressUrl);
      eventSource.onmessage = (event) => {
        const progressData = JSON.parse(event.data);
        // TODO: Update UI with progressData.progress and progressData.message
        console.log('Progress update:', progressData);
        if (progressData.progress === 100 || progressData.step === 'error') {
          eventSource.close();
          toast({
            title: progressData.step === 'error' ? 'Error' : 'PDF Generated',
            description: progressData.message,
            variant: progressData.step === 'error' ? 'destructive' : 'default',
          });
        }
      };
      eventSource.onerror = () => {
        eventSource.close();
        toast({
          title: 'Error',
          description: 'Progress tracking failed. Please check the status manually.',
          variant: 'destructive',
        });
      };
    } catch (error) {
      console.error('Error initiating PDF generation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start PDF generation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Custom Styling Step
        return (
          <PDFCustomizationForm
            onSave={(values) => {
              setCustomStyling(values);
              setCurrentStep(1);
            }}
            initialValues={customStyling || {}}
          />
        );
      case 1:
        // Output Format Step
        return (
          <form
            onSubmit={e => {
              e.preventDefault();
              setCurrentStep(2);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">Select Output Format</h3>
              <RadioGroup
                value={outputFormat}
                onValueChange={setOutputFormat}
                className="space-y-2"
              >
                <RadioGroupItem value="text-only" id="text-only" />
                <label htmlFor="text-only" className="ml-2">Text Only</label>
                <br />
                <RadioGroupItem value="text-images" id="text-images" />
                <label htmlFor="text-images" className="ml-2">Text + Images</label>
                <br />
                <RadioGroupItem value="full-replica" id="full-replica" />
                <label htmlFor="full-replica" className="ml-2">Full Webpage Replica</label>
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </form>
        );
      case 2:
        // Crawler Settings Step
        return (
          <form
            onSubmit={e => {
              e.preventDefault();
              setCurrentStep(3);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">Crawler Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keepImages"
                    checked={crawlerSettings.keepImages}
                    onChange={() => setCrawlerSettings(prev => ({ ...prev, keepImages: !prev.keepImages }))}
                  />
                  <label htmlFor="keepImages" className="ml-2">Keep Images</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keepTables"
                    checked={crawlerSettings.keepTables}
                    onChange={() => setCrawlerSettings(prev => ({ ...prev, keepTables: !prev.keepTables }))}
                  />
                  <label htmlFor="keepTables" className="ml-2">Keep Tables</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keepCodeBlocks"
                    checked={crawlerSettings.keepCodeBlocks}
                    onChange={() => setCrawlerSettings(prev => ({ ...prev, keepCodeBlocks: !prev.keepCodeBlocks }))}
                  />
                  <label htmlFor="keepCodeBlocks" className="ml-2">Keep Code Blocks</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keepLiveLinks"
                    checked={crawlerSettings.keepLiveLinks}
                    onChange={() => setCrawlerSettings(prev => ({ ...prev, keepLiveLinks: !prev.keepLiveLinks }))}
                  />
                  <label htmlFor="keepLiveLinks" className="ml-2">Keep Live Links</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </form>
        );
      case 3:
        // Chooser Step
        return (
          <form
            onSubmit={e => {
              e.preventDefault();
              setCurrentStep(4);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">Add Content Sources</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSource}
                  onChange={e => setNewSource(e.target.value)}
                  placeholder="Enter URL or source"
                  className="flex-1 p-2 border rounded-md"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newSource.trim()) {
                      setSources(prev => [...prev, newSource.trim()]);
                      setNewSource('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="mt-2 space-y-2">
                {sources.map((source, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                    {source}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setSources(prev => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={sources.length === 0}>
                Next
              </Button>
            </div>
          </form>
        );
      case 4:
        // Arranger Step
        return (
          <form
            onSubmit={e => {
              e.preventDefault();
              setCurrentStep(5);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">Arrange Content</h3>
              <div className="space-y-4">
                {arrangedContent.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{item.url}</p>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => {
                          const newTitle = e.target.value;
                          setArrangedContent(prev => prev.map((content, i) => i === index ? { ...content, title: newTitle } : content));
                        }}
                        placeholder="Section Title"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (index > 0) {
                            setArrangedContent(prev => {
                              const newContent = [...prev];
                              [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
                              return newContent;
                            });
                          }
                        }}
                        disabled={index === 0}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (index < arrangedContent.length - 1) {
                            setArrangedContent(prev => {
                              const newContent = [...prev];
                              [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
                              return newContent;
                            });
                          }
                        }}
                        disabled={index === arrangedContent.length - 1}
                      >
                        Down
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </form>
        );
      case 5:
        // Review & Generate Step
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Review Your Settings</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Custom Styling</h4>
                  <pre className="text-sm text-gray-600">{JSON.stringify(customStyling, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-medium">Output Format</h4>
                  <p className="text-sm text-gray-600">{outputFormat === 'text-only' ? 'Text Only' : outputFormat === 'text-images' ? 'Text + Images' : 'Full Webpage Replica'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Crawler Settings</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Images: {crawlerSettings.keepImages ? 'Keep' : 'Discard'}</li>
                    <li>Tables: {crawlerSettings.keepTables ? 'Keep' : 'Discard'}</li>
                    <li>Code Blocks: {crawlerSettings.keepCodeBlocks ? 'Keep' : 'Discard'}</li>
                    <li>Live Links: {crawlerSettings.keepLiveLinks ? 'Keep' : 'Discard'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Content Sources</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {arrangedContent.map((item, index) => (
                      <li key={index}>
                        {item.title || `Section ${index + 1}`}: {item.url}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(4)}
              >
                Back
              </Button>
              <Button
                onClick={handleGeneratePDF}
              >
                Generate PDF
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
        <DialogHeader>
          <DialogTitle>Create a New PDF Book</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Stepper
            steps={steps.map((s) => ({ id: s.label, label: s.label }))}
            currentStep={currentStep}
          />
        </div>
        <div className="min-h-[300px] flex flex-col justify-between">
          {renderStep()}
          {currentStep > 0 && currentStep < steps.length && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {/* Next button is handled by form submit in step 0 */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

      // Start SSE connection for progress updates
      const eventSource = new EventSource(`/api/generate-pdf/progress?url=${encodeURIComponent(values.url)}`);

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
    </div>
  );
} 