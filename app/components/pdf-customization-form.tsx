"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { HexColorPicker } from 'react-colorful';

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

type PDFConfigValues = z.infer<typeof pdfConfigSchema>;

interface PDFCustomizationFormProps {
  onSave: (values: PDFConfigValues) => void;
  initialValues?: PDFConfigValues;
}

const fontFamilies = [
  'Helvetica',
  'Times New Roman',
  'Arial',
  'Georgia',
  'Verdana',
  'Courier New',
];

const pageSizes = [
  { label: 'A4', value: 'A4' },
  { label: 'A5', value: 'A5' },
  { label: 'Letter', value: 'Letter' },
] as const;

export function PDFCustomizationForm({ onSave, initialValues }: PDFCustomizationFormProps) {
  const form = useForm<PDFConfigValues>({
    resolver: zodResolver(pdfConfigSchema),
    defaultValues: initialValues || {
      title: '',
      author: '',
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
  });

  const ColorPickerField = ({ name, label }: { name: keyof PDFConfigValues['colors']; label: string }) => (
    <FormField
      control={form.control}
      name={`colors.${name}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[100px] h-[30px] p-0"
                  style={{ backgroundColor: field.value }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <HexColorPicker color={field.value} onChange={field.onChange} />
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select page size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pageSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font family" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Size</FormLabel>
                    <FormControl>
                      <Slider
                        min={8}
                        max={24}
                        step={1}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormDescription>Current size: {field.value}px</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Margins</h3>
              <div className="grid grid-cols-2 gap-6">
                {(['top', 'bottom', 'left', 'right'] as const).map((margin) => (
                  <FormField
                    key={margin}
                    control={form.control}
                    name={`margins.${margin}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{margin}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormDescription>{field.value}px</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Colors</h3>
              <div className="grid grid-cols-2 gap-6">
                <ColorPickerField name="text" label="Text Color" />
                <ColorPickerField name="headings" label="Headings Color" />
                <ColorPickerField name="links" label="Links Color" />
                <ColorPickerField name="background" label="Background Color" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Layout Options</h3>
              <div className="grid grid-cols-2 gap-6">
                {([
                  ['showCoverPage', 'Show Cover Page'],
                  ['showTableOfContents', 'Show Table of Contents'],
                  ['showPageNumbers', 'Show Page Numbers'],
                  ['showHeaders', 'Show Headers'],
                  ['showFooters', 'Show Footers'],
                ] as const).map(([key, label]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`layout.${key}` as const}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit">Save Settings</Button>
      </form>
    </Form>
  );
} 