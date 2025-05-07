"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangleIcon, CheckCircleIcon, ExternalLinkIcon, FileTextIcon, FolderIcon, LinkIcon, MaximizeIcon } from "lucide-react";

interface PageItem {
  id: string;
  url: string;
  title: string;
  selected: boolean;
  thumbnail?: string;
  level: number;
  isParent: boolean;
  isExpanded?: boolean;
  children: string[];
  parentId?: string;
}

interface PDFPreviewStepProps {
  bookTitle: string;
  url: string;
  crawledPages: PageItem[];
  setCrawledPages: (pages: PageItem[]) => void;
}

// Mock thumbnails for demonstration
const mockThumbnails = [
  'https://placehold.co/320x240/e5e7eb/a3a3a3?text=Homepage',
  'https://placehold.co/320x240/e5e7eb/a3a3a3?text=About',
  'https://placehold.co/320x240/e5e7eb/a3a3a3?text=Products',
  'https://placehold.co/320x240/e5e7eb/a3a3a3?text=Contact',
  'https://placehold.co/320x240/e5e7eb/a3a3a3?text=Product+1',
  'https://placehold.co/320x240/e5e7eb/a3a3a3?text=Product+2',
];

// Mock crawled pages data
const mockCrawledPages: PageItem[] = [
  {
    id: "1",
    url: "https://example.com",
    title: "Example Homepage",
    selected: true,
    level: 0,
    isParent: true,
    isExpanded: true,
    children: ["2", "3", "4"],
  },
  {
    id: "2",
    url: "https://example.com/about",
    title: "About Us",
    selected: true,
    level: 1,
    isParent: false,
    children: [],
    parentId: "1",
  },
  {
    id: "3",
    url: "https://example.com/products",
    title: "Products",
    selected: true,
    level: 1,
    isParent: true,
    isExpanded: true,
    children: ["5", "6"],
    parentId: "1",
  },
  {
    id: "4",
    url: "https://example.com/contact",
    title: "Contact",
    selected: true,
    level: 1,
    isParent: false,
    children: [],
    parentId: "1",
  },
  {
    id: "5",
    url: "https://example.com/products/item1",
    title: "Product Item 1",
    selected: true,
    level: 2,
    isParent: false,
    children: [],
    parentId: "3",
  },
  {
    id: "6",
    url: "https://example.com/products/item2",
    title: "Product Item 2",
    selected: true,
    level: 2,
    isParent: false,
    children: [],
    parentId: "3",
  },
];

export function PDFPreviewStep({
  bookTitle,
  url,
  crawledPages = mockCrawledPages,
  setCrawledPages
}: PDFPreviewStepProps) {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"structure" | "arrange">("structure");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [pagesWithThumbnails, setPagesWithThumbnails] = useState<PageItem[]>([]);

  // Add mock thumbnails to pages
  useEffect(() => {
    if (crawledPages.length > 0 && !crawledPages[0].thumbnail) {
      const updatedPages = crawledPages.map((page, index) => ({
        ...page,
        thumbnail: mockThumbnails[index % mockThumbnails.length]
      }));
      setPagesWithThumbnails(updatedPages);
    } else {
      setPagesWithThumbnails(crawledPages);
    }
  }, [crawledPages]);

  // Toggle page selection
  const togglePageSelection = (id: string, selected: boolean) => {
    const updatedPages = pagesWithThumbnails.map(page => 
      page.id === id ? { ...page, selected } : page
    );
    setPagesWithThumbnails(updatedPages);
    setCrawledPages(updatedPages);
  };

  // Toggle expand/collapse for parent pages
  const toggleExpand = (id: string) => {
    const updatedPages = pagesWithThumbnails.map(page => 
      page.id === id ? { ...page, isExpanded: !page.isExpanded } : page
    );
    setPagesWithThumbnails(updatedPages);
    setCrawledPages(updatedPages);
  };

  // Handle reordering pages
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(pagesWithThumbnails);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPagesWithThumbnails(items);
    setCrawledPages(items);
  };

  // Get visible pages based on expanded state
  const getVisiblePages = () => {
    if (currentView === "arrange") {
      return pagesWithThumbnails.filter(page => page.selected);
    }
    
    const visiblePages: PageItem[] = [];
    const processPage = (pageId: string, isVisible: boolean) => {
      const page = pagesWithThumbnails.find(p => p.id === pageId);
      if (!page) return;
      
      if (isVisible) {
        visiblePages.push(page);
      }
      
      if (page.isParent && page.isExpanded && isVisible) {
        page.children.forEach(childId => {
          processPage(childId, true);
        });
      }
    };
    
    // Start with root pages (level 0)
    pagesWithThumbnails
      .filter(page => page.level === 0)
      .forEach(page => processPage(page.id, true));
      
    return visiblePages;
  };

  // Get the selected page data
  const getSelectedPageData = () => {
    return pagesWithThumbnails.find(page => page.id === selectedPage);
  };

  // Calculate stats
  const totalPages = pagesWithThumbnails.length;
  const selectedPages = pagesWithThumbnails.filter(page => page.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{bookTitle || "Untitled Book"}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedPages} of {totalPages} pages selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={currentView === "structure" ? "default" : "outline"} 
            onClick={() => setCurrentView("structure")}
            size="sm"
          >
            <FolderIcon className="h-4 w-4 mr-2" />
            Site Structure
          </Button>
          <Button 
            variant={currentView === "arrange" ? "default" : "outline"} 
            onClick={() => setCurrentView("arrange")}
            size="sm"
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Arrange Pages
          </Button>
        </div>
      </div>

      <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
        {currentView === "structure" ? (
          <div className="space-y-1">
            <p className="text-sm mb-3">
              Select the pages you want to include in your PDF:
            </p>
            {getVisiblePages().map((page) => (
              <div 
                key={page.id}
                className="flex items-start py-2 hover:bg-muted/50 rounded-sm"
                style={{ paddingLeft: `${page.level * 1.5}rem` }}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={page.selected} 
                    onCheckedChange={(checked) => togglePageSelection(page.id, checked as boolean)}
                    id={`page-${page.id}`}
                    className="mt-1"
                  />
                  
                  {page.isParent && (
                    <button 
                      onClick={() => toggleExpand(page.id)}
                      className="text-muted-foreground hover:text-foreground mt-1"
                    >
                      {page.isExpanded ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )}
                  
                  <div className="flex gap-3 flex-1">
                    <div className="flex flex-col flex-1">
                      <div 
                        className="font-medium text-sm hover:underline cursor-pointer"
                        onClick={() => setSelectedPage(page.id)}
                      >
                        {page.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        <span className="truncate max-w-[400px]">{page.url}</span>
                      </div>
                    </div>
                    {page.thumbnail && (
                      <div className="flex-none w-10 h-10 rounded overflow-hidden relative cursor-pointer" onClick={() => {
                        setSelectedPage(page.id);
                        setPreviewDialogOpen(true);
                      }}>
                        <img 
                          src={page.thumbnail} 
                          alt={page.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                          <MaximizeIcon className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="pages">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  <p className="text-sm mb-3">
                    Drag and drop to reorder pages in your PDF:
                  </p>
                  {pagesWithThumbnails.filter(page => page.selected).map((page, index) => (
                    <Draggable key={page.id} draggableId={page.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-md p-3 bg-card flex items-center gap-3"
                        >
                          <div className="flex-none rounded bg-muted flex items-center justify-center w-10 h-10">
                            {index + 1}
                          </div>
                          
                          {page.thumbnail && (
                            <div 
                              className="flex-none w-14 h-14 rounded overflow-hidden cursor-pointer"
                              onClick={() => {
                                setSelectedPage(page.id);
                                setPreviewDialogOpen(true);
                              }}
                            >
                              <img 
                                src={page.thumbnail} 
                                alt={page.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{page.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{page.url}</div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-none"
                            onClick={() => {
                              setSelectedPage(page.id);
                              setPreviewDialogOpen(true);
                            }}
                          >
                            <MaximizeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {selectedPage && !previewDialogOpen && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium">Page Preview</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(getSelectedPageData()?.url, '_blank')}
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  View Original
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setPreviewDialogOpen(true)}
                >
                  <MaximizeIcon className="h-4 w-4 mr-2" />
                  Enlarge
                </Button>
              </div>
            </div>
            <div className="aspect-video bg-muted rounded overflow-hidden">
              {getSelectedPageData()?.thumbnail ? (
                <img 
                  src={getSelectedPageData()?.thumbnail} 
                  alt={getSelectedPageData()?.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span className="text-sm">{selectedPages} pages will be included</span>
        </div>
        
        {selectedPages === 0 && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangleIcon className="h-5 w-5" />
            <span className="text-sm">Please select at least one page</span>
          </div>
        )}
      </div>

      {/* Full size preview dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{getSelectedPageData()?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="rounded overflow-hidden bg-background border">
              <div className="p-2 bg-muted text-xs flex items-center">
                <LinkIcon className="h-3 w-3 mr-1" />
                <span className="truncate">{getSelectedPageData()?.url}</span>
              </div>
              <div className="p-6">
                {getSelectedPageData()?.thumbnail ? (
                  <img 
                    src={getSelectedPageData()?.thumbnail} 
                    alt={getSelectedPageData()?.title} 
                    className="max-h-[70vh] mx-auto"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    <p className="text-muted-foreground">No preview available</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => window.open(getSelectedPageData()?.url, '_blank')}
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Visit Original Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 