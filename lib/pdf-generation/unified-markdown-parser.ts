/**
 * Unified Markdown Parser for PDF Generation
 * Consolidates all markdown parsing logic with robust error handling
 */

export interface ParsedSection {
  title: string;
  content: string;
  htmlContent: string;
}

export interface ParsedReport {
  introText: string;
  overallTier: string;
  keyFindings: {
    strengths: string[];
    weaknesses: string[];
  };
  sections: {
    strengths: ParsedSection;
    weaknesses: ParsedSection;
    strategicPlan: ParsedSection;
    resources: ParsedSection;
    benchmarks: ParsedSection;
    learningPath: ParsedSection;
    detailedAnalysis: ParsedSection;
  };
  dynamicSections: ParsedSection[];
}

/**
 * Enhanced markdown to HTML converter with comprehensive formatting support
 */
export function parseMarkdownToHTML(markdown: string, options: { preserveLineBreaks?: boolean } = {}): string {
  if (!markdown) return '';

  console.log('PARSE_MARKDOWN: Processing markdown of length:', markdown.length);

  let html = markdown.trim();

  // Handle code blocks first to prevent internal markdown parsing
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers - ensure they are on their own lines
  html = html.replace(/^#{6}\s+(.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s+(.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s+(.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s+(.*$)/gim, '<h1>$1</h1>');

  // Bold text (multiple patterns)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic text (avoiding conflicts with bold)
  html = html.replace(/(?<!\*)\*([^\*]+?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Links
  html = html.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Process lists with proper nesting
  html = processLists(html);

  // Handle horizontal rules
  html = html.replace(/^-{3,}\s*$/gim, '<hr>');

  // Process paragraphs
  if (!options.preserveLineBreaks) {
    html = processParagraphs(html);
  } else {
    html = html.replace(/\n/g, '<br>');
  }

  return html.trim();
}

/**
 * Process lists with proper nesting support
 */
function processLists(html: string): string {
  const lines = html.split('\n');
  const processedLines: string[] = [];
  
  type ListContext = { type: 'ul' | 'ol', indent: number };
  const listStack: ListContext[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for unordered list items
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)/);
    // Check for ordered list items
    const olMatch = line.match(/^(\s*)(\d+)\.?\s+(.*)/);
    
    if (ulMatch || olMatch) {
      const match = ulMatch || olMatch;
      if (!match) continue;
      
      const [, indent, marker, content] = match;
      const indentLevel = indent.length;
      const listType: 'ul' | 'ol' = ulMatch ? 'ul' : 'ol';
      
      // Handle list nesting
      if (listStack.length === 0) {
        processedLines.push(`<${listType}>`);
        listStack.push({ type: listType, indent: indentLevel });
      } else {
        const currentList = listStack[listStack.length - 1];
        
        if (indentLevel > currentList.indent) {
          processedLines.push(`<${listType}>`);
          listStack.push({ type: listType, indent: indentLevel });
        } else if (indentLevel < currentList.indent) {
          while (listStack.length > 0 && indentLevel < listStack[listStack.length - 1].indent) {
            const popped = listStack.pop();
            processedLines.push(`</${popped?.type}>`);
          }
          
          if (listStack.length === 0) {
            processedLines.push(`<${listType}>`);
            listStack.push({ type: listType, indent: indentLevel });
          }
        }
      }
      
      processedLines.push(`<li>${content}</li>`);
      
    } else if (listStack.length > 0) {
      if (trimmedLine === '') {
        // Empty line - close lists
        while (listStack.length > 0) {
          const list = listStack.pop();
          processedLines.push(`</${list?.type}>`);
        }
        processedLines.push('');
      } else {
        // Not a list item and we're in a list - close lists
        while (listStack.length > 0) {
          const list = listStack.pop();
          processedLines.push(`</${list?.type}>`);
        }
        processedLines.push(line);
      }
    } else {
      processedLines.push(line);
    }
  }
  
  // Close any remaining open lists
  while (listStack.length > 0) {
    const list = listStack.pop();
    processedLines.push(`</${list?.type}>`);
  }

  return processedLines.join('\n');
}

/**
 * Process paragraphs with proper block element detection
 */
function processParagraphs(html: string): string {
  const paragraphs = html.split(/\n{2,}/g);
  const formattedParagraphs = paragraphs.map(paragraph => {
    paragraph = paragraph.trim();
    if (!paragraph) return '';
    
    // Skip wrapping if already a block element
    if (paragraph.match(/^<(h[1-6]|p|ul|ol|pre|div|table|hr)/i)) {
      return paragraph;
    }
    
    // Wrap in paragraph tags
    return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
  });

  return formattedParagraphs.join('\n\n');
}

/**
 * Extract all sections from markdown content with robust pattern matching
 */
export function extractAllSections(markdownContent: string): ParsedReport {
  console.log('EXTRACT_SECTIONS: Processing markdown content of length:', markdownContent.length);
  
  const result: ParsedReport = {
    introText: '',
    overallTier: '',
    keyFindings: {
      strengths: [],
      weaknesses: []
    },
    sections: {
      strengths: { title: 'Strengths', content: '', htmlContent: '' },
      weaknesses: { title: 'Weaknesses', content: '', htmlContent: '' },
      strategicPlan: { title: 'Strategic Action Plan', content: '', htmlContent: '' },
      resources: { title: 'Resources', content: '', htmlContent: '' },
      benchmarks: { title: 'Benchmarks', content: '', htmlContent: '' },
      learningPath: { title: 'Learning Path', content: '', htmlContent: '' },
      detailedAnalysis: { title: 'Detailed Analysis', content: '', htmlContent: '' }
    },
    dynamicSections: []
  };

  if (!markdownContent) {
    console.warn('No markdown content provided');
    return result;
  }

  // Extract intro text (before any headers)
  const introMatch = markdownContent.match(/^([\s\S]*?)(?=##|$)/);
  if (introMatch) {
    result.introText = parseMarkdownToHTML(introMatch[1].trim());
  }

  // Extract overall tier
  const tierMatch = markdownContent.match(/## Overall Tier(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i);
  if (tierMatch) {
    result.overallTier = parseMarkdownToHTML(tierMatch[1].trim());
  }

  // Extract key findings with multiple patterns
  const keyFindingsPatterns = [
    /## Key Findings(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Key\s+Findings(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Summary(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i
  ];

  for (const pattern of keyFindingsPatterns) {
    const match = markdownContent.match(pattern);
    if (match) {
      const findingsContent = match[1].trim();
      result.keyFindings = extractKeyFindings(findingsContent);
      break;
    }
  }

  // Extract strengths and weaknesses
  result.sections.strengths = extractSection(markdownContent, [
    /\*\*Strengths:\*\*\n?([\s\S]*?)(?=\*\*(?:Weaknesses|Challenges):|## |###|$)/i,
    /### Strengths\n?([\s\S]*?)(?=### (?:Weaknesses|Challenges)|## |$)/i
  ], 'Strengths');

  result.sections.weaknesses = extractSection(markdownContent, [
    /\*\*(?:Weaknesses|Challenges):\*\*\n?([\s\S]*?)(?=## |###|$)/i,
    /### (?:Weaknesses|Challenges)\n?([\s\S]*?)(?=## |###|$)/i
  ], 'Weaknesses');

  // Extract strategic plan
  result.sections.strategicPlan = extractSection(markdownContent, [
    /## Strategic Action Plan(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Action Plan(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i
  ], 'Strategic Action Plan');

  // Extract resources
  result.sections.resources = extractSection(markdownContent, [
    /## Getting Started (?:&|\+|and) Resources(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Resources(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i
  ], 'Resources');

  // Extract benchmarks
  result.sections.benchmarks = extractSection(markdownContent, [
    /## Illustrative Benchmarks(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Benchmarks(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i
  ], 'Benchmarks');

  // Extract learning path
  result.sections.learningPath = extractSection(markdownContent, [
    /## Your Personalized AI Learning Path(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Personalized AI Learning Path(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i,
    /## Learning Path(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i
  ], 'Learning Path');

  // Extract detailed analysis
  result.sections.detailedAnalysis = extractSection(markdownContent, [
    /## Detailed Analysis(?:[^\n]*)?\n?([\s\S]*?)(?=\n##|$)/i
  ], 'Detailed Analysis');

  // Extract dynamic sections (any remaining ## sections)
  result.dynamicSections = extractDynamicSections(markdownContent);

  return result;
}

/**
 * Extract a section using multiple patterns
 */
function extractSection(markdown: string, patterns: RegExp[], title: string): ParsedSection {
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match && match[1]) {
      const content = match[1].trim();
      return {
        title,
        content,
        htmlContent: parseMarkdownToHTML(content)
      };
    }
  }
  
  return {
    title,
    content: '',
    htmlContent: ''
  };
}

/**
 * Extract key findings from content
 */
function extractKeyFindings(content: string): { strengths: string[]; weaknesses: string[] } {
  const findings = { strengths: [] as string[], weaknesses: [] as string[] };
  
  // Extract strengths
  const strengthsMatch = content.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?=\*\*(?:Weaknesses|Challenges):|$)/i);
  if (strengthsMatch) {
    const strengthsList = strengthsMatch[1].trim();
    findings.strengths = extractListItems(strengthsList);
  }
  
  // Extract weaknesses
  const weaknessesMatch = content.match(/\*\*(?:Weaknesses|Challenges):\*\*\s*([\s\S]*?)$/i);
  if (weaknessesMatch) {
    const weaknessesList = weaknessesMatch[1].trim();
    findings.weaknesses = extractListItems(weaknessesList);
  }
  
  return findings;
}

/**
 * Extract list items from text
 */
function extractListItems(text: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
      const item = trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (item) {
        items.push(item);
      }
    }
  }
  
  return items;
}

/**
 * Extract dynamic sections
 */
function extractDynamicSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const allSections = markdown.split(/^## /gm);
  
  // Skip the first item (intro text) and process the rest
  for (let i = 1; i < allSections.length; i++) {
    const section = allSections[i];
    const titleMatch = section.match(/^(.*?)$/m);
    
    if (titleMatch) {
      const title = titleMatch[1].trim();
      
      // Skip sections that are already handled specifically
      const skipSections = [
        'Key Findings', 'Overall Tier', 'Strategic Action Plan', 'Action Plan',
        'Getting Started & Resources', 'Resources', 'Illustrative Benchmarks',
        'Benchmarks', 'Your Personalized AI Learning Path', 'Personalized AI Learning Path',
        'Learning Path', 'Detailed Analysis'
      ];
      
      if (skipSections.some(skip => title.toLowerCase().includes(skip.toLowerCase()))) {
        continue;
      }
      
      const content = section.substring(section.indexOf('\n')).trim();
      
      sections.push({
        title,
        content,
        htmlContent: parseMarkdownToHTML(content)
      });
    }
  }
  
  return sections;
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
