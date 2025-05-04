"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookIcon, GlobeIcon } from "lucide-react";

export default function CreatePage() {
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Mock submission function
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCurrentStep(1);
    
    // Mock progress updates
    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 5;
      setProgress(progressVal);
      
      if (progressVal >= 100) {
        clearInterval(interval);
        setCurrentStep(2);
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Create PDF Book</h1>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Web Content to PDF</CardTitle>
                <CardDescription>
                  Enter a URL and specify how deep you want to crawl
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 0 && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="url" className="text-sm font-medium">
                        URL
                      </label>
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
                          onChange={(e) => setUrl(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="depth" className="text-sm font-medium">
                        Crawl Depth
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="depth"
                          type="number"
                          min="1"
                          max="5"
                          value={depth}
                          onChange={(e) => setDepth(e.target.value)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          Levels deep (1-5)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Higher depth values will crawl more pages but take longer to process.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        Content Filters
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="keep-images" defaultChecked />
                          <label htmlFor="keep-images" className="text-sm">
                            Keep Images
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="keep-tables" defaultChecked />
                          <label htmlFor="keep-tables" className="text-sm">
                            Keep Tables
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="keep-code" defaultChecked />
                          <label htmlFor="keep-code" className="text-sm">
                            Keep Code Blocks
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="keep-styles" defaultChecked />
                          <label htmlFor="keep-styles" className="text-sm">
                            Keep Formatting
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button type="submit" disabled={!url}>
                        Start Processing
                      </Button>
                    </div>
                  </form>
                )}
                
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Processing: {url}</h3>
                      <Progress value={progress} />
                      <p className="text-sm text-muted-foreground">
                        Crawling and processing web content...
                      </p>
                    </div>
                    
                    <div className="border rounded p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pages crawled:</span>
                        <span>14</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Content processed:</span>
                        <span>{Math.floor(progress / 10)} MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Images processed:</span>
                        <span>{Math.floor(progress / 5)}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" onClick={() => {
                      setIsSubmitting(false);
                      setCurrentStep(0);
                      setProgress(0);
                    }}>
                      Cancel
                    </Button>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <BookIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-medium">PDF Book Ready!</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your PDF has been successfully generated
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button>Download PDF</Button>
                      <Button variant="outline">Preview</Button>
                      <Button variant="outline" onClick={() => {
                        setCurrentStep(0);
                        setProgress(0);
                        setUrl("");
                      }}>
                        Create Another
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Output Options</CardTitle>
                <CardDescription>
                  Customize your PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Format</h3>
                    <select className="w-full border rounded p-2 bg-background">
                      <option>Full Website Replica</option>
                      <option>Text with Images</option>
                      <option>Text Only</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Template</h3>
                    <select className="w-full border rounded p-2 bg-background">
                      <option>Modern</option>
                      <option>Classic</option>
                      <option>Minimal</option>
                      <option>Academic</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Page Size</h3>
                    <select className="w-full border rounded p-2 bg-background">
                      <option>A4</option>
                      <option>Letter</option>
                      <option>A5</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}