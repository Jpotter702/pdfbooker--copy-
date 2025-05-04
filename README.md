# PDFBooker

PDFBooker transforms web content into beautifully formatted PDF books with just a few clicks. Users can enter any URL and specify how deep they want the crawler to go, and the system automatically scrapes all connected pages, cleans up the content to remove ads and unnecessary elements, and generates a professional-looking PDF "book" with proper formatting, table of contents, and navigation.

## Features

- Automated web crawling with configurable depth
- Intelligent content extraction and cleaning
- Beautiful PDF formatting with templates
- Table of contents generation
- Image processing and optimization
- Custom styling options

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Shadcn UI, TailwindCSS
- **Backend**: Next.js API Routes, Serverless Functions
- **Web Scraping**: Puppeteer/Playwright
- **Content Processing**: Readability algorithms, custom processors
- **PDF Generation**: React-PDF / PDFKit
- **Authentication**: NextAuth.js (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pdfbooker.git
   cd pdfbooker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Navigate to the Create page
2. Enter the URL you want to start crawling from
3. Set the crawl depth and content options
4. Choose your template and styling preferences
5. Click "Start Processing" to generate your PDF book
6. Preview and download the resulting PDF

## Project Structure

```
pdfbooker/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # UI Components 
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Shadcn UI components
│   ├── lib/                 # Utility functions
│   └── server/              # Server-side code (coming soon)
├── public/                  # Static assets
└── ...                      # Config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.