# PDFBooker Usage Guide

## Getting Started

To run PDFBooker locally, you'll need to start both the frontend and backend servers.

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Running the Application

1. **Start the Backend Server**

```bash
# Navigate to the server directory
cd server

# Install dependencies (if not already installed)
npm install

# Start the server
npm run dev
```

The backend server will start on port 3001 by default.

2. **Start the Frontend Application**

```bash
# In a new terminal, from the project root
npm install

# Start the Next.js app
npm run dev
```

The frontend application will start on port 3000 by default. You can access it at http://localhost:3000.

## Using the PDF Generation Feature

### Creating a PDF Book

1. Navigate to the dashboard and click "Create New PDF Book"
2. Complete the four-step creation process:
   - **Step 1: Custom Styling** - Set book title, font, color scheme, and TOC options
   - **Step 2: Output Format** - Choose format, page size, and template
   - **Step 3: Crawler Settings** - Configure URL, crawl depth, and content options
   - **Step 4: Preview & Arrange** - Select and organize pages

3. Click "Create PDF" to start the generation process
4. Monitor the generation progress in the dialog that appears
5. When complete, the PDF will automatically download to your computer

### PDF Generation Process

During PDF generation, the system will:

1. Crawl the specified website to the configured depth
2. Extract and organize content from the crawled pages
3. Generate a PDF document with your styling preferences
4. Display real-time progress updates during generation

The process may take several minutes depending on the website size and crawl depth.

### Troubleshooting

If you encounter issues during PDF generation:

1. **Generation fails to start**
   - Check that the backend server is running
   - Verify the URL is accessible and valid
   - Ensure you're connected to the internet

2. **Slow generation**
   - Reduce the crawl depth
   - Try a website with fewer pages
   - Check your internet connection speed

3. **Formatting issues in the generated PDF**
   - Different websites may require different output format settings
   - Try adjusting the template or font settings
   - Some complex layouts may not render perfectly

4. **Download issues**
   - Check your browser's download settings
   - Clear your browser cache
   - Try a different browser

## Advanced Options

### Content Selection

You can control what types of content are included in your PDF:

- **Images** - Include or exclude images
- **Tables** - Preserve table layouts
- **Code Blocks** - Maintain code formatting
- **Links** - Keep hyperlinks active in the PDF

### Page Organization

After crawling, you can organize the PDF content by:

- Selecting specific pages to include
- Dragging and dropping to reorder pages
- Previewing page content before generation 