"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookIcon, FileIcon, MoreVertical, PlusIcon } from "lucide-react";
import { PDFCreatorModal } from "@/components/pdf-creator-modal";

// Mock data for PDF books
const mockPDFBooks = [
  {
    id: "1",
    title: "React Documentation",
    sourceUrl: "https://reactjs.org",
    createdAt: new Date("2023-05-15"),
    status: "completed",
  },
  {
    id: "2",
    title: "Next.js Documentation",
    sourceUrl: "https://nextjs.org",
    createdAt: new Date("2023-06-20"),
    status: "completed",
  },
  {
    id: "3",
    title: "MDN Web Docs",
    sourceUrl: "https://developer.mozilla.org",
    createdAt: new Date("2023-07-10"),
    status: "processing",
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // If not authenticated, redirect to sign in
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const openCreator = () => {
    setIsCreatorOpen(true);
  };

  const closeCreator = () => {
    setIsCreatorOpen(false);
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "User"}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPDFBooks.map((book) => (
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
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
                      {book.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled={book.status !== "completed"}>
                    <FileIcon className="mr-2 h-4 w-4" />
                    {book.status === "completed" ? "View PDF" : "Processing..."}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPDFBooks.filter(book => book.status === "completed").map((book) => (
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
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
                      {book.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
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
            {mockPDFBooks.filter(book => book.status === "processing").map((book) => (
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
                      {book.createdAt.toLocaleDateString()}
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