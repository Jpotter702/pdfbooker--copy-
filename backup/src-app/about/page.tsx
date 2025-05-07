import { MainLayout } from "@/components/layout/main-layout";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About PDFBooker</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              PDFBooker transforms web content into beautifully formatted PDF books with just a few clicks.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              We believe that valuable web content should be accessible in formats that work for you.
              PDFBooker was created to make it easy to transform online articles, documentation, and resources
              into well-formatted PDF books that you can read offline, archive, or share.
            </p>
            
            <h2>How PDFBooker Works</h2>
            <p>
              PDFBooker uses advanced web scraping technology to crawl web pages, extract the meaningful content,
              and organize it into a cohesive document. Our system automatically:
            </p>
            
            <ul>
              <li>Crawls web pages to the depth you specify</li>
              <li>Cleans up the content to remove ads and unnecessary elements</li>
              <li>Processes images and other media</li>
              <li>Creates a logical structure with headings and sections</li>
              <li>Generates a table of contents</li>
              <li>Formats everything into a beautiful PDF</li>
            </ul>
            
            <h2>Use Cases</h2>
            
            <h3>Learning & Research</h3>
            <p>
              Save online tutorials, documentation, and research papers as PDF books for offline study.
              Create comprehensive resources by combining related articles.
            </p>
            
            <h3>Content Archiving</h3>
            <p>
              Preserve important web content that might change or disappear over time.
              Create permanent copies of online resources for your digital library.
            </p>
            
            <h3>Professional Documentation</h3>
            <p>
              Transform your company's web-based documentation into professional PDF manuals.
              Create branded materials from online content.
            </p>
            
            <h2>Responsible Use</h2>
            <p>
              PDFBooker is designed for personal and educational use of publicly available content.
              We respect copyright and encourage our users to do the same. Please only use PDFBooker with:
            </p>
            
            <ul>
              <li>Content you have permission to use</li>
              <li>Open-source documentation and resources</li>
              <li>Your own content</li>
              <li>Public domain materials</li>
            </ul>
            
            <p>
              Always respect the terms of service of the websites you crawl and the copyright of the content creators.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}