"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileTextIcon, ImageIcon, LayoutIcon } from "lucide-react";

interface PDFFormatStepProps {
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  pageSize: string;
  setPageSize: (size: string) => void;
  template: string;
  setTemplate: (template: string) => void;
}

const pageSizes = [
  { value: "a4", label: "A4", description: "210 × 297 mm" },
  { value: "letter", label: "Letter", description: "8.5 × 11 inches" },
  { value: "a5", label: "A5", description: "148 × 210 mm" },
  { value: "legal", label: "Legal", description: "8.5 × 14 inches" },
];

const templates = [
  { value: "modern", label: "Modern", description: "Clean, minimal design with focus on readability" },
  { value: "classic", label: "Classic", description: "Traditional book-like layout" },
  { value: "academic", label: "Academic", description: "Formal layout ideal for research papers" },
  { value: "magazine", label: "Magazine", description: "Visual layout with emphasis on images" },
];

export function PDFFormatStep({
  outputFormat,
  setOutputFormat,
  pageSize,
  setPageSize,
  template,
  setTemplate,
}: PDFFormatStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">Output Format</Label>
        <p className="text-sm text-muted-foreground">
          Choose how the web content will be formatted in your PDF
        </p>

        <RadioGroup
          value={outputFormat}
          onValueChange={setOutputFormat}
          className="grid grid-cols-1 gap-4 pt-2"
        >
          <Card
            className={`cursor-pointer transition-colors ${
              outputFormat === "text-only" ? "border-primary" : ""
            }`}
            onClick={() => setOutputFormat("text-only")}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <RadioGroupItem value="text-only" id="text-only" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-primary" />
                  <Label htmlFor="text-only" className="text-base font-medium cursor-pointer">
                    Text Only
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Extract only the text content from the pages. No images, tables, or styling will be included. 
                  Best for simple reading and smallest file size.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              outputFormat === "text-with-images" ? "border-primary" : ""
            }`}
            onClick={() => setOutputFormat("text-with-images")}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <RadioGroupItem value="text-with-images" id="text-with-images" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <Label htmlFor="text-with-images" className="text-base font-medium cursor-pointer">
                    Text with Images
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Extract text and images from the pages with basic formatting. Tables and code blocks can be
                  included. Good balance between content preservation and file size.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${
              outputFormat === "full-replica" ? "border-primary" : ""
            }`}
            onClick={() => setOutputFormat("full-replica")}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <RadioGroupItem value="full-replica" id="full-replica" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <LayoutIcon className="h-5 w-5 text-primary" />
                  <Label htmlFor="full-replica" className="text-base font-medium cursor-pointer">
                    Full Website Replica
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Preserve the full layout and styling of the website as closely as possible. All images, 
                  tables, and interactive elements will be captured. Largest file size but most faithful to original.
                </p>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="page-size">Page Size</Label>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger id="page-size">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{size.label}</span>
                    <span className="text-xs text-muted-foreground">{size.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template">Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((tmpl) => (
                <SelectItem key={tmpl.value} value={tmpl.value}>
                  <div className="flex flex-col">
                    <span>{tmpl.label}</span>
                    <span className="text-xs text-muted-foreground">{tmpl.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-lg">
        <h3 className="text-sm font-medium mb-3">Preview</h3>
        <div className="aspect-[3/4] border rounded overflow-hidden bg-white relative">
          {outputFormat === "text-only" && (
            <div className="absolute inset-0 p-4">
              <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-2/3 h-3 bg-gray-200 rounded mb-6"></div>
              
              <div className="space-y-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full h-2 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          )}
          
          {outputFormat === "text-with-images" && (
            <div className="absolute inset-0 p-4">
              <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-2/3 h-3 bg-gray-200 rounded mb-4"></div>
              
              <div className="w-full h-24 bg-gray-200 rounded mb-4"></div>
              
              <div className="space-y-2 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full h-2 bg-gray-200 rounded"></div>
                ))}
              </div>
              
              <div className="w-1/2 h-16 bg-gray-200 rounded float-right ml-2 mb-2"></div>
              
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-full h-2 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          )}
          
          {outputFormat === "full-replica" && (
            <div className="absolute inset-0">
              <div className="w-full h-8 bg-gray-800"></div>
              <div className="p-4">
                <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
                <div className="w-2/3 h-3 bg-gray-200 rounded mb-4"></div>
                
                <div className="flex gap-4 mb-4">
                  <div className="w-1/3 h-40 bg-gray-200 rounded"></div>
                  <div className="w-2/3 space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                    <div className="mt-4 flex gap-2">
                      <div className="w-16 h-6 bg-blue-200 rounded"></div>
                      <div className="w-16 h-6 bg-green-200 rounded"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full h-2 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 