# PDF Generation System Migration Guide

This guide helps you migrate from the legacy PDF generation system to the new unified system.

## Overview

The unified PDF generation system consolidates multiple legacy generators into a single, maintainable solution while maintaining backward compatibility.

## What Changed

### Before (Legacy System)
- Multiple separate HTML generators with duplicated code
- Inconsistent markdown parsing across different generators
- Different styling and formatting approaches
- Manual template management
- Scattered error handling

### After (Unified System)
- Single unified system with consistent output
- Centralized markdown parsing with robust error handling
- Standardized HTML generation and styling
- Automatic template management
- Comprehensive error handling and logging

## Migration Steps

### 1. Update Imports

#### Legacy WeasyPrint Generator
```typescript
// OLD
import { generateScorecardHTML } from '../app/api/generate-scorecard-weasyprint-report/html-generator';

// NEW - The function still exists but now uses the unified system internally
import { generateScorecardHTML } from '../app/api/generate-scorecard-weasyprint-report/html-generator';
// OR use the unified system directly
import { generateHTMLPreview } from '../lib/pdf-generation';
```

#### V6 Scorecard Generator
```typescript
// OLD
import { generateScorecardHTML } from '../app/api/generate-scorecard-report-v6/scorecard-html-generator';

// NEW - The function still exists but now uses the unified system internally
import { generateScorecardHTML } from '../app/api/generate-scorecard-report-v6/scorecard-html-generator';
// OR use the unified system directly
import { generateHTMLPreview } from '../lib/pdf-generation';
```

### 2. Data Format Conversion

The unified system uses a standardized `ScoreCardData` interface. Legacy data is automatically converted:

```typescript
// Legacy data format (various structures)
interface LegacyData {
  UserInformation: { /* various fields */ };
  ScoreInformation: { /* various fields */ };
  QuestionAnswerHistory: any[];
  FullReportMarkdown: string;
}

// Unified format (standardized)
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

### 3. Function Call Updates

#### HTML Generation
```typescript
// OLD (Legacy V6)
const html = await generateScorecardHTML(reportData);

// NEW (Direct unified system usage)
const result = generateHTMLPreview(reportData, {
  includeQA: true,
  includeDetailedAnalysis: true,
  style: 'standard'
});

if (result.success) {
  const html = result.html;
} else {
  console.error('HTML generation failed:', result.error);
}
```

#### PDF Generation
```typescript
// OLD (Manual WeasyPrint service calls)
const html = await generateScorecardHTML(reportData);
const pdfResponse = await fetch(WEASYPRINT_SERVICE_URL, {
  method: 'POST',
  body: JSON.stringify({ html_content: html })
});

// NEW (Unified PDF generation)
const result = await generateScorecardPDF(reportData, {
  includeQA: true,
  includeDetailedAnalysis: true,
  style: 'standard'
});

if (result.success) {
  const pdfBuffer = result.pdfBuffer;
  const filename = result.filename;
} else {
  console.error('PDF generation failed:', result.error);
}
```

### 4. Error Handling Updates

#### Legacy Error Handling
```typescript
// OLD - Basic try/catch with limited error information
try {
  const html = await generateScorecardHTML(data);
  // Process HTML...
} catch (error) {
  console.error('Generation failed:', error.message);
  // Limited error context
}
```

#### Unified Error Handling
```typescript
// NEW - Comprehensive result objects with detailed error information
const result = await generateScorecardPDF(data, options);

if (result.success) {
  // Success case
  const pdfBuffer = result.pdfBuffer;
  const filename = result.filename;
  
  // Handle warnings if any
  if (result.warnings && result.warnings.length > 0) {
    console.warn('Generation warnings:', result.warnings);
  }
} else {
  // Error case with detailed information
  console.error('PDF generation failed:', result.error);
  
  // Additional context available
  if (result.warnings) {
    console.warn('Warnings during generation:', result.warnings);
  }
}
```

## API Endpoint Migration

### Existing Endpoints (Backward Compatible)

All existing API endpoints continue to work without changes:

- `POST /api/generate-scorecard-weasyprint-report`
- `POST /api/generate-scorecard-report-v6`
- `POST /api/generate-presentation-weasyprint-report`

These endpoints now use the unified system internally but maintain their original interfaces.

### New Unified Endpoints (Optional)

You can optionally create new endpoints that use the unified system directly:

```typescript
// app/api/generate-unified-pdf/route.ts
import { generateScorecardPDF } from '../../../lib/pdf-generation';

export async function POST(request: Request) {
  const data = await request.json();
  
  const result = await generateScorecardPDF(data, {
    includeQA: true,
    includeDetailedAnalysis: true,
    style: 'standard'
  });
  
  if (result.success) {
    return new Response(result.pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`
      }
    });
  } else {
    return Response.json({ error: result.error }, { status: 500 });
  }
}
```

## Configuration Changes

### Environment Variables

No changes required - existing environment variables continue to work:

```bash
WEASYPRINT_SERVICE_URL=http://localhost:5001/generate-pdf
```

### WeasyPrint Service

No changes required to your WeasyPrint service setup.

## Testing Migration

### 1. Verify Existing Functionality

Test that existing API endpoints still work:

```bash
# Test legacy WeasyPrint endpoint
curl -X POST http://localhost:3000/api/generate-scorecard-weasyprint-report \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Test V6 endpoint
curl -X POST http://localhost:3000/api/generate-scorecard-report-v6 \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Test presentation endpoint
curl -X POST http://localhost:3000/api/generate-presentation-weasyprint-report \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

### 2. Compare Output Quality

Generate PDFs using both old and new systems and compare:

- Content completeness
- Formatting consistency
- Styling accuracy
- Performance metrics

### 3. Error Handling Verification

Test error scenarios:

- Invalid input data
- Missing markdown content
- WeasyPrint service unavailability
- Network timeouts

## Performance Improvements

### Before Migration
- Inconsistent performance across different generators
- Duplicated parsing and processing
- Limited error recovery
- Manual retry logic

### After Migration
- Consistent performance across all report types
- Optimized parsing with caching
- Automatic retry logic
- Comprehensive error recovery

### Benchmarking

Monitor these metrics before and after migration:

```typescript
// Performance monitoring
const startTime = Date.now();
const result = await generateScorecardPDF(data, options);
const endTime = Date.now();

console.log(`PDF generation took ${endTime - startTime}ms`);
console.log(`Success: ${result.success}`);
console.log(`Warnings: ${result.warnings?.length || 0}`);
```

## Rollback Plan

If issues arise, you can temporarily rollback by:

### 1. Restore Legacy Files

Keep backup copies of original files:
- `app/api/generate-scorecard-weasyprint-report/html-generator.ts.backup`
- `app/api/generate-scorecard-report-v6/scorecard-html-generator.ts.backup`
- `app/api/generate-presentation-weasyprint-report/route.ts.backup`

### 2. Update Imports

Revert to original import statements and function calls.

### 3. Remove Unified System

Temporarily disable the unified system by commenting out imports:

```typescript
// import { generateHTMLPreview } from '../../../lib/pdf-generation';
```

## Common Issues and Solutions

### Issue 1: Missing Content Sections

**Problem**: Some content sections are missing from generated PDFs.

**Solution**: Check markdown format and parsing patterns in `unified-markdown-parser.ts`.

```typescript
// Debug markdown parsing
const sections = parseMarkdownContent(markdown);
console.log('Parsed sections:', Object.keys(sections));
```

### Issue 2: Styling Differences

**Problem**: PDF styling looks different from legacy system.

**Solution**: Compare CSS templates and adjust styling in `unified-html-generator.ts`.

### Issue 3: Performance Degradation

**Problem**: PDF generation is slower than before.

**Solution**: Enable performance monitoring and optimize bottlenecks:

```typescript
const result = await generateScorecardPDF(data, { 
  ...options, 
  debug: true 
});
```

### Issue 4: WeasyPrint Service Errors

**Problem**: WeasyPrint service communication failures.

**Solution**: Check service availability and network configuration:

```bash
# Test WeasyPrint service directly
curl -X POST http://localhost:5001/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html_content": "<html><body>Test</body></html>"}'
```

## Support and Resources

### Documentation
- [Unified System README](lib/pdf-generation/README.md)
- [API Documentation](docs/api.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Logging and Debugging

Enable detailed logging:

```typescript
// Set environment variable
DEBUG_PDF_GENERATION=true

// Or use console logging
console.log('MIGRATION: Starting PDF generation');
const result = await generateScorecardPDF(data, options);
console.log('MIGRATION: Generation result:', result.success);
```

### Getting Help

1. Check the troubleshooting section in the README
2. Review console logs for detailed error messages
3. Test with minimal data to isolate issues
4. Compare output with legacy system

## Timeline and Phases

### Phase 1: Preparation (Week 1)
- [ ] Review this migration guide
- [ ] Set up testing environment
- [ ] Create backup copies of legacy files
- [ ] Prepare test data sets

### Phase 2: Implementation (Week 2)
- [ ] Deploy unified system
- [ ] Update legacy generators to use unified system
- [ ] Test all API endpoints
- [ ] Monitor performance metrics

### Phase 3: Validation (Week 3)
- [ ] Compare output quality with legacy system
- [ ] Conduct user acceptance testing
- [ ] Performance benchmarking
- [ ] Error handling verification

### Phase 4: Cleanup (Week 4)
- [ ] Remove unused legacy code
- [ ] Update documentation
- [ ] Train team on new system
- [ ] Monitor production usage

## Success Criteria

Migration is considered successful when:

- [ ] All existing API endpoints work without changes
- [ ] PDF output quality matches or exceeds legacy system
- [ ] Performance is equal to or better than legacy system
- [ ] Error handling is more robust and informative
- [ ] Code maintainability is significantly improved
- [ ] No regression in functionality

## Post-Migration Benefits

After successful migration, you'll have:

1. **Unified Codebase**: Single system for all PDF generation needs
2. **Better Error Handling**: Comprehensive error reporting and recovery
3. **Improved Performance**: Optimized parsing and generation
4. **Enhanced Maintainability**: Centralized code with clear separation of concerns
5. **Future-Proof Architecture**: Extensible system for new features
6. **Consistent Output**: Standardized formatting across all report types
