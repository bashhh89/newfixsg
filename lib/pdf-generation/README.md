# Unified PDF Generation System

This directory contains a unified PDF generation system for AI Efficiency Scorecard reports. The system consolidates multiple legacy PDF generators into a single, maintainable solution.

## Overview

The unified system provides:
- **Consistent PDF output** across all report types
- **Centralized markdown parsing** with robust error handling
- **Flexible HTML generation** with customizable styles
- **Unified PDF service integration** with WeasyPrint
- **Backward compatibility** with existing API endpoints

## Architecture

```
lib/pdf-generation/
├── index.ts                    # Main entry point and public API
├── unified-markdown-parser.ts  # Markdown content extraction
├── unified-html-generator.ts   # HTML template generation
├── pdf-service.ts             # PDF generation service
└── README.md                  # This documentation
```

## Core Components

### 1. Unified Markdown Parser (`unified-markdown-parser.ts`)

Extracts structured content from markdown reports:

```typescript
import { parseMarkdownContent } from './unified-markdown-parser';

const sections = parseMarkdownContent(markdownText);
// Returns: { intro, strengths, weaknesses, strategicPlan, resources, etc. }
```

**Features:**
- Robust section extraction with multiple fallback patterns
- Markdown-to-HTML conversion with proper list handling
- Error handling and content validation
- Support for various markdown formats

### 2. Unified HTML Generator (`unified-html-generator.ts`)

Generates HTML from structured data:

```typescript
import { generateHTMLPreview } from './unified-html-generator';

const result = generateHTMLPreview(scoreCardData, {
  includeQA: true,
  includeDetailedAnalysis: true,
  style: 'standard' // or 'presentation'
});
```

**Features:**
- Template-based HTML generation
- Responsive CSS styling
- Q&A section formatting
- Print-optimized layouts
- Multiple style variants

### 3. PDF Service (`pdf-service.ts`)

Handles PDF generation via WeasyPrint:

```typescript
import { generatePDFFromHTML } from './pdf-service';

const result = await generatePDFFromHTML(htmlContent, {
  style: 'standard',
  includeQA: true
});
```

**Features:**
- WeasyPrint service integration
- Retry logic for reliability
- Error handling and logging
- Configurable PDF options

### 4. Main API (`index.ts`)

Public interface for the unified system:

```typescript
import { generateScorecardPDF, generateHTMLPreview } from '../lib/pdf-generation';

// Generate PDF
const pdfResult = await generateScorecardPDF(scoreCardData, options);

// Generate HTML preview
const htmlResult = generateHTMLPreview(scoreCardData, options);
```

## Data Types

### ScoreCardData Interface

```typescript
interface ScoreCardData {
  UserInformation: {
    UserName: string;
    CompanyName: string;
    Industry: string;
    Email: string;
  };
  ScoreInformation: {
    AITier: string;
    FinalScore: number | null;
    ReportID: string;
  };
  QuestionAnswerHistory: AnswerHistoryEntry[];
  FullReportMarkdown: string;
}
```

### Generation Options

```typescript
interface GenerationOptions {
  includeQA?: boolean;              // Include Q&A section
  includeDetailedAnalysis?: boolean; // Include detailed analysis
  style?: 'standard' | 'presentation'; // Output style
}
```

## Usage Examples

### Basic PDF Generation

```typescript
import { generateScorecardPDF } from '../lib/pdf-generation';

const result = await generateScorecardPDF(scoreCardData, {
  includeQA: true,
  includeDetailedAnalysis: true,
  style: 'standard'
});

if (result.success) {
  // Use result.pdfBuffer, result.filename
} else {
  // Handle result.error, result.warnings
}
```

### HTML Preview Generation

```typescript
import { generateHTMLPreview } from '../lib/pdf-generation';

const result = generateHTMLPreview(scoreCardData, {
  includeQA: false,
  style: 'presentation'
});

if (result.success) {
  // Use result.html
} else {
  // Handle result.error
}
```

### Legacy API Integration

The system maintains backward compatibility with existing APIs:

```typescript
// Legacy WeasyPrint generator
import { generateScorecardHTML } from '../app/api/generate-scorecard-weasyprint-report/html-generator';

// Now uses unified system internally
const html = await generateScorecardHTML(legacyData);
```

## Migration Guide

### From Legacy Generators

1. **Update imports:**
   ```typescript
   // Old
   import { generateScorecardHTML } from './legacy-generator';
   
   // New
   import { generateHTMLPreview } from '../lib/pdf-generation';
   ```

2. **Convert data format:**
   ```typescript
   // Legacy data conversion is handled automatically
   const convertedData = convertToNewFormat(legacyData);
   ```

3. **Update function calls:**
   ```typescript
   // Old
   const html = await generateScorecardHTML(data);
   
   // New
   const result = generateHTMLPreview(data, options);
   const html = result.success ? result.html : '';
   ```

### API Endpoint Updates

Legacy API endpoints have been updated to use the unified system while maintaining their original interfaces:

- `app/api/generate-scorecard-weasyprint-report/html-generator.ts`
- `app/api/generate-scorecard-report-v6/scorecard-html-generator.ts`
- `app/api/generate-presentation-weasyprint-report/route.ts`

## Configuration

### Environment Variables

```bash
# WeasyPrint service URL
WEASYPRINT_SERVICE_URL=http://localhost:5001/generate-pdf

# PDF generation timeout (milliseconds)
PDF_GENERATION_TIMEOUT=120000
```

### WeasyPrint Service

The system expects a WeasyPrint service running at the configured URL. The service should accept POST requests with:

```json
{
  "html_content": "<html>...</html>",
  "pdf_options": {
    "presentational_hints": true,
    "optimize_size": ["images", "fonts"],
    "pdf_format": {
      "page_size": "A4",
      "margin": {
        "top": "20mm",
        "right": "15mm",
        "bottom": "20mm",
        "left": "15mm"
      }
    }
  }
}
```

## Error Handling

The unified system provides comprehensive error handling:

### Result Objects

All functions return result objects with consistent structure:

```typescript
interface GenerationResult {
  success: boolean;
  error?: string;
  warnings?: string[];
  // Additional fields based on operation
}
```

### Error Types

- **Validation Errors**: Missing or invalid input data
- **Parsing Errors**: Markdown content parsing issues
- **Service Errors**: WeasyPrint service communication failures
- **Generation Errors**: PDF/HTML generation failures

### Logging

The system provides detailed logging at multiple levels:

```typescript
console.log('UNIFIED_SYSTEM: Operation started');
console.warn('UNIFIED_SYSTEM: Warning message');
console.error('UNIFIED_SYSTEM: Error occurred');
```

## Testing

### Unit Tests

Test individual components:

```typescript
// Test markdown parser
const sections = parseMarkdownContent(testMarkdown);
expect(sections.strengths).toBeDefined();

// Test HTML generator
const result = generateHTMLPreview(testData, testOptions);
expect(result.success).toBe(true);
```

### Integration Tests

Test the complete flow:

```typescript
const result = await generateScorecardPDF(testData, testOptions);
expect(result.success).toBe(true);
expect(result.pdfBuffer).toBeDefined();
```

## Performance Considerations

### Optimization Strategies

1. **Content Caching**: Cache parsed markdown sections
2. **Template Reuse**: Reuse HTML templates across requests
3. **Service Pooling**: Pool WeasyPrint service connections
4. **Lazy Loading**: Load components only when needed

### Monitoring

Monitor key metrics:
- PDF generation time
- Success/failure rates
- Memory usage
- Service response times

## Troubleshooting

### Common Issues

1. **Missing Sections**: Check markdown format and parsing patterns
2. **PDF Generation Failures**: Verify WeasyPrint service availability
3. **Styling Issues**: Check CSS template and HTML structure
4. **Performance Issues**: Monitor service response times

### Debug Mode

Enable detailed logging:

```typescript
// Set environment variable
DEBUG_PDF_GENERATION=true

// Or use debug flag
const result = await generateScorecardPDF(data, { debug: true });
```

## Contributing

### Adding New Features

1. Update the appropriate component (parser, generator, or service)
2. Add corresponding tests
3. Update this documentation
4. Ensure backward compatibility

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Add comprehensive error handling
- Include detailed logging

## Future Enhancements

### Planned Features

1. **Template Customization**: Allow custom HTML templates
2. **Multi-format Output**: Support for Word, Excel formats
3. **Batch Processing**: Generate multiple reports simultaneously
4. **Advanced Styling**: More sophisticated CSS frameworks
5. **Performance Optimization**: Caching and optimization improvements

### Architecture Improvements

1. **Plugin System**: Extensible architecture for custom processors
2. **Configuration Management**: Centralized configuration system
3. **Service Discovery**: Automatic WeasyPrint service discovery
4. **Health Monitoring**: Built-in health checks and monitoring
