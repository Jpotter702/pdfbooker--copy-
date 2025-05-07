"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookIcon, FileIcon, MoreVertical, PlusIcon, Loader2 } from "lucide-react";
import { Navigation } from "../components/navigation";
import { PDFCreatorModal } from "@/components/pdf-creator/pdf-creator-modal";
import { usePDFList } from "@/lib/hooks/use-pdf-list";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the PDF list hook to fetch and manage PDFs
  const { pdfs, isLoading: isPDFsLoading, error, refreshPDFs, downloadPDF, deletePDF } = usePDFList();

  useEffect(() => {
    // Wait for the session status to be determined
    if (status !== "loading") {
      setIsLoading(false);
      // No need to redirect - let users view the page without login for now
    }
  }, [status, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const openCreator = () => {
    setIsCreatorOpen(true);
  };

  const closeCreator = () => {
    setIsCreatorOpen(false);
    // Refresh the PDF list after closing the creator
    refreshPDFs();
  };

  return (
    <div className="container py-10">
      <Navigation />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Guest User"}
          </p>
        </div>
        <Button onClick={openCreator} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create New PDFBook
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All PDFBooks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {isPDFsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading PDFs...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 rounded-md p-6 text-center">
              <h3 className="font-medium text-destructive mb-2">Error loading PDFs</h3>
              <p>{error.message}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => refreshPDFs()}
              >
                Try Again
              </Button>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="text-center py-10 bg-muted/40 rounded-md">
              <BookIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No PDFs yet</h3>
              <p className="text-muted-foreground mb-4">Create your first PDF book from any website!</p>
              <Button onClick={openCreator}>Create PDF Book</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pdfs.map((book) => (
                <Card key={book.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{book.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadPDF(book.id)}>
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deletePDF(book.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="truncate">
                      {book.sourceUrl}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        book.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {book.status === "completed" ? "Completed" : "Processing"}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      disabled={book.status !== "completed"}
                      onClick={() => downloadPDF(book.id)}
                    >
                      <FileIcon className="mr-2 h-4 w-4" />
                      {book.status === "completed" ? "View PDF" : "Processing..."}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pdfs.filter(book => book.status === "completed").map((book) => (
              <Card key={book.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{book.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadPDF(book.id)}>
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deletePDF(book.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="truncate">
                    {book.sourceUrl}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Completed
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => downloadPDF(book.id)}
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    View PDF
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="processing" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pdfs.filter(book => book.status === "processing").map((book) => (
              <Card key={book.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{book.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="truncate">
                    {book.sourceUrl}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    <FileIcon className="mr-2 h-4 w-4" />
                    Processing...
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isCreatorOpen && <PDFCreatorModal isOpen={isCreatorOpen} onClose={closeCreator} />}
    </div>
  );
} 