"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { GlobeIcon, Link2Icon, TableIcon, ImageIcon, CodeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PDFCrawlerStepProps {
  url: string;
  setUrl: (url: string) => void;
  depth: number;
  setDepth: (depth: number) => void;
  keepImages: boolean;
  setKeepImages: (keep: boolean) => void;
  keepTables: boolean;
  setKeepTables: (keep: boolean) => void;
  keepCode: boolean;
  setKeepCode: (keep: boolean) => void;
  keepLinks: boolean;
  setKeepLinks: (keep: boolean) => void;
}

export function PDFCrawlerStep({
  url,
  setUrl,
  depth,
  setDepth,
  keepImages,
  setKeepImages,
  keepTables,
  setKeepTables,
  keepCode,
  setKeepCode,
  keepLinks,
  setKeepLinks,
}: PDFCrawlerStepProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [urlError, setUrlError] = useState("");

  const validateUrl = (input: string) => {
    try {
      new URL(input);
      setUrlError("");
      return true;
    } catch (e) {
      if (input) {
        setUrlError("Please enter a valid URL (e.g., https://example.com)");
      } else {
        setUrlError("");
      }
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const handleDepthChange = (value: number[]) => {
    setDepth(value[0]);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="content">Content Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-base">URL to Crawl</Label>
            <div className="flex items-center border rounded-md overflow-hidden bg-background">
              <div className="flex-none px-3 py-2 text-muted-foreground">
                <GlobeIcon className="h-5 w-5" />
              </div>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                className="border-0 focus-visible:ring-0"
                value={url}
                onChange={handleUrlChange}
              />
            </div>
            {urlError && <p className="text-sm text-red-500 mt-1">{urlError}</p>}
            <p className="text-sm text-muted-foreground">
              Enter the starting URL for crawling. This will be the first page of your PDF book.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="depth-slider" className="text-base">Crawl Depth</Label>
              <span className="text-sm font-medium">{depth}</span>
            </div>
            <Slider
              id="depth-slider"
              min={1}
              max={5}
              step={1}
              value={[depth]}
              onValueChange={handleDepthChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Shallow (Faster)</span>
              <span>Deep (Slower)</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Controls how many levels deep the crawler will go. Higher values will include more pages but take longer to process.
            </p>
          </div>

          <Card className="mt-4">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium">Estimated Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Pages Crawled:</span>
                  <span className="text-lg font-bold">{depth < 3 ? "10-30" : depth < 5 ? "30-100" : "100+"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Estimated Time:</span>
                  <span className="text-lg font-bold">{depth < 3 ? "1-2 min" : depth < 5 ? "3-5 min" : "5+ min"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="keep-images" 
                checked={keepImages} 
                onCheckedChange={(checked) => setKeepImages(checked as boolean)}
              />
              <div>
                <Label htmlFor="keep-images" className="text-base font-medium cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Include Images
                  </div>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep images from the original content in your PDF.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="keep-tables" 
                checked={keepTables} 
                onCheckedChange={(checked) => setKeepTables(checked as boolean)}
              />
              <div>
                <Label htmlFor="keep-tables" className="text-base font-medium cursor-pointer">
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4 text-primary" />
                    Include Tables
                  </div>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Preserve tables from the original content in your PDF.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="keep-code" 
                checked={keepCode} 
                onCheckedChange={(checked) => setKeepCode(checked as boolean)}
              />
              <div>
                <Label htmlFor="keep-code" className="text-base font-medium cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CodeIcon className="h-4 w-4 text-primary" />
                    Include Code Blocks
                  </div>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Preserve code blocks and formatting in your PDF.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="keep-links" 
                checked={keepLinks} 
                onCheckedChange={(checked) => setKeepLinks(checked as boolean)}
              />
              <div>
                <Label htmlFor="keep-links" className="text-base font-medium cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Link2Icon className="h-4 w-4 text-primary" />
                    Include Hyperlinks
                  </div>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep hyperlinks active in your PDF for easy navigation.
                </p>
              </div>
            </div>
          </div>
          
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Content Extraction Preview</h3>
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="mb-2">The following elements will be extracted:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Main content text</li>
                  {keepImages && <li>Images and diagrams</li>}
                  {keepTables && <li>Tables and structured data</li>}
                  {keepCode && <li>Code blocks with syntax highlighting</li>}
                  {keepLinks && <li>Hyperlinks as clickable references</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 