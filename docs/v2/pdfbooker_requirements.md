##### PDFBooker Requirements Document

###### 1. User Interface Requirements

1.1  	**Authentication:** The system should allow users to log in using a valid username and password, Google, or Github OAuth.

1.2  	**User Dashboard:** The system must provide a dashboard where users can view and manage their previously created PDF books. There must be a "Create New PDFBook" Button that invokes the PDF Book Creator Tool.

1.3	**PDF Book Creator Tool:** The system must provide a multi-step tool that guides the user through the creation process of their PDFBook with a stepper visual component indicating what step they are on. The creator tool should be a large dialog box that pops-over and blurs out the User Dashboard.

1.3.1	**Select Custom Styling Dialog:** The system must provide on the first section the PDF Book Creator Tool a Select Custom Styling dialog allowing the user to name the book, select from a list of fonts, colors, and add a TOC for the generated PDF.

1.3.2   **Select Output Format Dialog: ** The system must allow users to choose between different output formats (text-only, text with images, or full webpage replica)

1.3.3	**Select Crawler Settings Dialog:** The system must provide on the next section of the PDF Book Creator a Select Crawler Settings dialog where the user can input a URL, a crawl depth, options to keep or discard images, tables, code blocks, live links.

1.4	**Post-Crawl Results and Chooser Dialog:** The system should provide, after the website has been crawled a drag-and-drop chooser visual interface that is a representation of the structure of the website with thumbnails for pages that expand when clicked. The user can then choose if they want to include the page to be scraped and added to the PDF Book.

1.5	**Post-Scrape Results and Arranger Dialog:** The system should provide after the scraping process is complete a drag-and-drop interface where the user can order the pages appear in the PDF Book.

1.5.1	**PDF Preview Thumbnails:** The system should provide clickable thumbnails that expand the previews of the PDF as elements in the drag-and-drop arranger interface


## 2. Scraping and Processing Requirements

2.1  **Web Crawling:** The system must recursively crawl web pages up to the user-specified depth.

2.2  **Content Extraction:** The system must use readability algorithms to extract the main content from web pages.

2.3  **Image Handling:** The system must properly download and include images when the user selects to keep them.

2.4  **Link Resolution:** The system must resolve relative links within the scraped content for proper navigation in the PDF.

2.5  **Content Organization:** The system must organize scraped content in a logical reading order.

2.6  **Rate Limiting:** The system must implement appropriate rate limiting to avoid overloading target websites.

2.7  **Robots.txt Compliance:** The system must respect robots.txt directives of websites being scraped.

2.8  **Error Handling:** The system must gracefully handle and report scraping errors without terminating the entire process.

2.9  **Content Cleaning:** The system should remove ads, navigation bars, footers, and other non-essential elements.
 
2.10  **Mobile Optimization:** The system should detect and optimize mobile versions of websites when available.
 

## 3. PDF Generation Requirements

3.1  **PDF Creation:** The system must generate a well-formatted PDF from the processed content.
 
3.2  **Table of Contents:** The system must generate an automatic table of contents based on the document structure.
    
3.3  **Cover Page:** The system must generate a cover page with the website title and date of creation.
    
3.4  **Page Numbering:** The system must include page numbers in the generated PDF.
    
3.5  **Bookmarks:** The system must create PDF bookmarks for different sections and pages.
    
3.6  **Metadata:** The system should include relevant metadata in the PDF (title, author, creation date).
    
3.7  **Responsive Layouts:** The system should ensure content displays properly regardless of PDF page size.
    
3.8  **Image Quality:** The system should optimize images for quality and file size balance in the PDF.
    
3.9  **Header/Footer Customization:** The system may allow users to customize headers and footers in the PDF.
    
3.10  **Watermarking:** The system may offer options to add custom watermarks to generated PDFs.
    

## 4. System Requirements

4.1 **Performance:** The system must handle the scraping and processing of at least 100 pages within a reasonable time frame.
    
4.2  **Concurrent Users:** The system should support multiple concurrent users generating PDFs.
    
4.3  **Storage Management:** The system should implement temporary storage for processing and allow users to delete old PDFs.
    
4.4  **Security:** The system must implement security measures to prevent malicious URL inputs.
    
4.5  **API Access:** The system should provide an API for programmatic access to all features and functionality of PDFBooker.
    
4.6  **Export Options:** The system may support exporting to multiple formats beyond PDF (EPUB, HTML archive).
    
4.7  **Offline Access:** The system may allow users to download a package for offline viewing.
    
4.8  **Sharing:** The system should provide options to share generated PDFs via link or email.
    
4.9  **Batch Processing:** The system may support batch processing of multiple URLs.
    
4.10  **Scheduled Scraping:** The system may allow users to schedule periodic scraping and PDF generation of specified URLs.

<sub>Must verbs are critical for launch. The absolute must-haves.
Should verbs should be included in launch if possible, if not then on roadmap for one of the initial updates.  
May verbs should be included in launch if ahead of schedule or if adding them does not cause delay or other requirements to slip. The nice-to-haves.</sub> 

