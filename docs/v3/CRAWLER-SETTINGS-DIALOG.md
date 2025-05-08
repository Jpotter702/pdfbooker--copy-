### Documentation for Crawler Settings Implementation

**Crawler Settings Dialog Documentation**

We've implemented the Crawler Settings dialog for the PDF creation process, allowing users to configure how web content is crawled and processed. The implementation includes:

1.  **URL Configuration**:

-   Input field for entering the starting URL
-   Real-time URL validation with error feedback
-   Clear explanation of how the URL is used

2.  **Crawl Depth Control**:

-   Interactive slider for selecting crawl depth (1-5)
-   Visual indicators for depth impact (shallow vs. deep)
-   Dynamic estimates for pages crawled and processing time

3.  **Content Extraction Options**:

-   Checkboxes for selecting which elements to include:

-   Images
-   Tables
-   Code blocks
-   Hyperlinks

-   Visual previews showing how selected options affect output

4.  **Tab-Based Interface**:

-   Organized into "General Settings" and "Content Options" tabs
-   Intuitive navigation between different setting groups
-   Clean layout with appropriate spacing and grouping

5.  **Real-Time Feedback**:

-   Dynamic content extraction preview based on selected options
-   Visual indicators for current selections
-   Informative help text explaining each option

6.  **Validation**:

-   URL validation to ensure a valid input
-   Button state management (disabled when input is invalid)
-   Clear error messages for invalid inputs

This implementation satisfies requirement 1.3.3 from the requirements document, providing a user interface for configuring crawler settings including URL input, crawl depth, and content filtering options.