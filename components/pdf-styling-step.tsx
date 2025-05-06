"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HexColorPicker } from "react-colorful";
import { Check, ChevronDown } from "lucide-react";

interface PDFStylingStepProps {
  bookTitle: string;
  setBookTitle: (title: string) => void;
  font: string;
  setFont: (font: string) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  hasTOC: boolean;
  setHasTOC: (hasTOC: boolean) => void;
}

const fonts = [
  { value: "inter", label: "Inter", description: "Modern sans-serif" },
  { value: "georgia", label: "Georgia", description: "Classic serif" },
  { value: "courier", label: "Courier", description: "Monospace" },
  { value: "merriweather", label: "Merriweather", description: "Elegant serif" },
  { value: "open-sans", label: "Open Sans", description: "Clean sans-serif" },
];

export function PDFStylingStep({
  bookTitle,
  setBookTitle,
  font,
  setFont,
  primaryColor,
  setPrimaryColor,
  hasTOC,
  setHasTOC,
}: PDFStylingStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="book-title">Book Title</Label>
        <Input
          id="book-title"
          placeholder="Enter a title for your PDF book"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          This will appear on the cover page and in the document metadata.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Font Family</Label>
        <RadioGroup value={font} onValueChange={setFont} className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {fonts.map((fontOption) => (
            <div
              key={fontOption.value}
              className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-colors hover:bg-accent"
              onClick={() => setFont(fontOption.value)}
            >
              <RadioGroupItem value={fontOption.value} id={`font-${fontOption.value}`} />
              <div>
                <Label
                  htmlFor={`font-${fontOption.value}`}
                  className="font-medium cursor-pointer"
                  style={{ fontFamily: fontOption.value }}
                >
                  {fontOption.label}
                </Label>
                <p className="text-sm text-muted-foreground">{fontOption.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Primary Color</Label>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[220px] flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span>{primaryColor}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <HexColorPicker
                color={primaryColor}
                onChange={setPrimaryColor}
              />
            </PopoverContent>
          </Popover>
          <div className="text-sm text-muted-foreground">
            Used for headings, links, and UI elements in the PDF.
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="toc-switch" className="flex flex-col gap-1">
            <span>Table of Contents</span>
            <span className="font-normal text-sm text-muted-foreground">
              Include an auto-generated table of contents
            </span>
          </Label>
          <Switch
            id="toc-switch"
            checked={hasTOC}
            onCheckedChange={setHasTOC}
          />
        </div>
      </div>

      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="text-sm font-medium mb-2">Preview</h3>
        <div 
          className="p-4 border rounded bg-white"
          style={{ fontFamily: font }}
        >
          <h1 style={{ color: primaryColor }} className="text-xl font-bold mb-2">
            {bookTitle || "Your PDF Book Title"}
          </h1>
          <p className="text-sm mb-4">
            This is a sample of how your text will appear in the PDF.
          </p>
          {hasTOC && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">Table of contents will be included</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 