"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const formSchema = z.object({
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

export type FormValues = z.infer<typeof formSchema>;

interface PDFCustomizationFormProps {
  onSave: (values: FormValues) => void;
  initialValues?: Partial<FormValues>;
}

export function PDFCustomizationForm({ onSave, initialValues }: PDFCustomizationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      pageSize: 'A4',
      fontFamily: 'Arial',
      fontSize: 12,
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      colors: {
        text: '#000000',
        headings: '#000000',
        links: '#0000FF',
        background: '#FFFFFF',
      },
      layout: {
        showCoverPage: true,
        showTableOfContents: true,
        showPageNumbers: true,
        showHeaders: true,
        showFooters: true,
      },
      ...initialValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-8 max-w-2xl mx-auto">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter book title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              {...form.register("author")}
              placeholder="Enter author name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pageSize">Page Size</Label>
            <Select
              onValueChange={(value: "A4" | "A5" | "Letter") => form.setValue("pageSize", value)}
              defaultValue={form.getValues("pageSize")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="A5">A5</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Margins</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(form.getValues("margins")).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <Slider
                    defaultValue={[value]}
                    max={100}
                    step={1}
                    onValueChange={([value]: [number]) =>
                      form.setValue(`margins.${key}` as any, value, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Layout Options</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(form.getValues("layout")).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked: boolean) =>
                      form.setValue(`layout.${key}` as any, checked, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <Label htmlFor={key}>
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Generate PDF
      </Button>
    </form>
  );
} 