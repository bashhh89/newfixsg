import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Plus Jakarta Sans fonts from GitHub raw content
const fontBaseUrl = 'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/master/fonts/ttf/';
Font.register({
  family: 'Plus Jakarta Sans',
  fonts: [
    // --- Regular Weights ---
    { src: `${fontBaseUrl}PlusJakartaSans-ExtraLight.ttf`, fontWeight: 200 }, // Changed 'extralight' to 200
    { src: `${fontBaseUrl}PlusJakartaSans-Light.ttf`, fontWeight: 300 },         // fontWeight: 'light' is also 300
    { src: `${fontBaseUrl}PlusJakartaSans-Regular.ttf`, fontWeight: 400 },      // fontWeight: 'normal' is also 400
    { src: `${fontBaseUrl}PlusJakartaSans-Medium.ttf`, fontWeight: 500 },       // fontWeight: 'medium' is also 500
    { src: `${fontBaseUrl}PlusJakartaSans-SemiBold.ttf`, fontWeight: 600 },   // fontWeight: 'semibold' is also 600
    { src: `${fontBaseUrl}PlusJakartaSans-Bold.ttf`, fontWeight: 700 },           // fontWeight: 'bold' is also 700
    { src: `${fontBaseUrl}PlusJakartaSans-ExtraBold.ttf`, fontWeight: 800 }, // Changed 'extrabold' to 800
    // --- Italic Weights ---
    { src: `${fontBaseUrl}PlusJakartaSans-ExtraLightItalic.ttf`, fontWeight: 200, fontStyle: 'italic' }, // Changed 'extralight' to 200
    { src: `${fontBaseUrl}PlusJakartaSans-LightItalic.ttf`, fontWeight: 300, fontStyle: 'italic' },
    { src: `${fontBaseUrl}PlusJakartaSans-Italic.ttf`, fontWeight: 400, fontStyle: 'italic' }, // Regular Italic
    { src: `${fontBaseUrl}PlusJakartaSans-MediumItalic.ttf`, fontWeight: 500, fontStyle: 'italic' },
    { src: `${fontBaseUrl}PlusJakartaSans-SemiBoldItalic.ttf`, fontWeight: 600, fontStyle: 'italic' },
    { src: `${fontBaseUrl}PlusJakartaSans-BoldItalic.ttf`, fontWeight: 700, fontStyle: 'italic' },
    { src: `${fontBaseUrl}PlusJakartaSans-ExtraBoldItalic.ttf`, fontWeight: 800, fontStyle: 'italic' }, // Changed 'extrabold' to 800
  ]
});

// Color Palette
const COLORS = {
  primaryDark: '#103138', // Dark Teal/Blue
  accentGreen: '#20E28F', // Bright Green
  white: '#FFFFFF',
  lightBg: '#F3FDF5',     // Very Light Off-White/Mint
  textDark: '#103138',    // For body text, slightly adjusted from primaryDark if needed, but using same for now
  textLight: '#6D7278',   // Lighter grey for less important text
  borderColor: '#DDE2E5', // Subtle border color
  reasoningBg: '#F3FDF5', // Light mint for reasoning bg
};

// Create styles - Resetting to simpler text styles for debugging overlap
const styles = StyleSheet.create({
  page: {
    padding: '20mm 20mm',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10, // Simplified base font size
    lineHeight: 1.5, // Simplified base line height
    color: COLORS.textDark,
    backgroundColor: COLORS.white, 
  },
  header: {
    backgroundColor: COLORS.primaryDark,
    color: COLORS.white,
    padding: '6mm 15mm 8mm 15mm',
    marginBottom: 15, 
    textAlign: 'center',
  },
  logo: {
    width: 160, height: 34, marginBottom: 8, alignSelf: 'center',
  },
  title: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20, // Simplified
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 1.4, // Explicit line height
  },
  userInfoContainer: {
    marginBottom: 5, alignItems: 'center',
  },
  userInfoLine: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10, // Simplified
    color: COLORS.white, opacity: 0.9,
    lineHeight: 1.5, // Explicit line height
    marginBottom: 2, textAlign: 'center',
  },
  userInfoLabel: { fontWeight: 'normal' },
  userInfoValueBold: { fontWeight: 'semibold' },
  reportDetailsLine: { 
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9, // Simplified
    color: COLORS.white, opacity: 0.8,
    lineHeight: 1.4, // Explicit line height
    textAlign: 'center', marginBottom: 1,
  },
  content: { marginBottom: 20 },
  section: { marginBottom: 15, paddingBottom: 5 },
  sectionTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16, // Simplified
    fontWeight: 'semibold',
    color: COLORS.primaryDark,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.accentGreen,
    lineHeight: 1.4, // Explicit line height
    textAlign: 'left',
  },
  paragraph: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10, // Simplified
    fontWeight: 'normal',
    marginBottom: 8,
    textAlign: 'left', // Changed from justify
    lineHeight: 1.6, // Explicit line height
    color: COLORS.textDark,
  },
  listItem: {
    flexDirection: 'row', marginBottom: 5, paddingLeft: 5,
  },
  bullet: {
    width: 10, marginRight: 5, fontFamily: 'Plus Jakarta Sans',
    fontSize: 10, color: COLORS.accentGreen, lineHeight: 1.6,
  },
  link: {
    fontFamily: 'Plus Jakarta Sans', color: COLORS.accentGreen, fontWeight: 'medium',
    textDecoration: 'none', lineHeight: 1.6,
  },
  qnaSection: {
    marginTop: 20, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.primaryDark,
  },
  // Styles for Q&A placeholder text
  qnaPlaceholderText: {
    fontFamily: 'Plus Jakarta Sans', fontSize: 10, margin: 10, 
    color: COLORS.textDark, lineHeight: 1.5,
  },
  footer: {
    textAlign: 'center', marginTop: 25, paddingVertical: 10,
    borderTopWidth: 1.5, borderTopColor: COLORS.primaryDark,
    fontSize: 8, fontFamily: 'Plus Jakarta Sans', color: COLORS.textLight,
    backgroundColor: COLORS.white, lineHeight: 1.4,
  },
  pageNumber: {
    position: 'absolute', bottom: '8mm', left: 0, right: 0,
    textAlign: 'center', fontSize: 8, fontFamily: 'Plus Jakarta Sans',
    color: COLORS.textLight, fontStyle: 'italic', lineHeight: 1.3,
  },
  
  // NEW STYLES FOR PAGES 3 & 4 - "Full Report Details" section
  fullReportHeader: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accentGreen,
    lineHeight: 1.4,
    textAlign: 'left',
    pageBreakAfter: 'avoid',
  },
  fullReportIntro: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    color: COLORS.primaryDark,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  reportSubTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  tierText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: 'semibold',
    color: COLORS.primaryDark,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  scoreBox: {
    backgroundColor: COLORS.lightBg,
    padding: '8px 12px',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    display: 'inline-block',
    marginBottom: 20,
  },
  scoreText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    lineHeight: 1.4,
  },
  keyFindingsHeader: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accentGreen,
    lineHeight: 1.4,
    textAlign: 'left',
    pageBreakAfter: 'avoid',
  },
  strengthWeaknessHeader: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: 'semibold',
    color: COLORS.primaryDark,
    marginTop: 15,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  itemBlock: {
    backgroundColor: COLORS.lightBg,
    padding: '12px 15px',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentGreen,
    marginBottom: 10,
    pageBreakInside: 'avoid',
  },
  itemBlockText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 1.6,
  },
  markdownParagraph: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 1.6,
    marginBottom: 12,
  },
});

const renderMarkdownContent = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  // Split content into major sections
  const fullReportPattern = /^#+\s*Full Report Details/im;
  const fullReportMatch = content.match(fullReportPattern);
  
  if (!fullReportMatch) {
    // If no "Full Report Details" section found, render as before
    return renderStandardMarkdownContent(content);
  }
  
  // Split content into pre-full report and full report sections
  const fullReportIndex = fullReportMatch.index;
  const preFullReportContent = content.substring(0, fullReportIndex);
  const fullReportContent = content.substring(fullReportIndex);
  
  // Render the pre-full report content using the existing method
  const preFullReportElements = renderStandardMarkdownContent(preFullReportContent);
  
  // Render the full report content with enhanced styling
  const fullReportElements = renderFullReportContent(fullReportContent);
  
  // Combine the two sets of elements
  return (
    <>
      {preFullReportElements}
      {fullReportElements}
    </>
  );
};

// The original renderMarkdownContent renamed to renderStandardMarkdownContent
const renderStandardMarkdownContent = (content: string) => {
  if (!content || content.trim() === '') return null;
  const sections = content.split(new RegExp('\n(?=#+\s)')).filter(Boolean);
  return sections.map((section, sectionIndex) => {
    const lines = section.trim().split('\n');
    let title = '';
    let contentLines = lines;
    if (lines.length > 0 && lines[0].trim().startsWith('#')) {
      title = lines[0].replace(/^#+\s*/, '').trim();
      contentLines = lines.slice(1);
    } else if (sectionIndex === 0 && lines.length > 0) {
       title = ''; contentLines = lines;
    }
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let isNumberedList = false;
    const processList = (list: string[], numbered: boolean) => {
      if (list.length === 0) return;
      const listKey = `list-${elements.length}-${Math.random()}`;
      elements.push(
        <View key={listKey} style={{ marginBottom: 6, paddingLeft: 5 }}>
          {list.map((item, itemIndex) => (
            <View key={`${listKey}-item-${itemIndex}`} style={styles.listItem}>
              <Text style={styles.bullet}>{numbered ? `${itemIndex + 1}.` : '• '}</Text>
              <Text style={{ flex: 1, fontFamily: 'Plus Jakarta Sans', fontSize: 10, lineHeight: 1.6, color: COLORS.textDark }}>{item}</Text>
            </View>
          ))}
        </View>
      );
      currentList = [];
    };
    contentLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (isNumberedList) { processList(currentList, true); isNumberedList = false; }
        currentList.push(trimmedLine.substring(2).trim());
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        if (!isNumberedList && currentList.length > 0) { processList(currentList, false); }
        isNumberedList = true;
        currentList.push(trimmedLine.replace(/^\d+\.\s*/, '').trim());
      } else {
        processList(currentList, isNumberedList); isNumberedList = false;
        if (trimmedLine.length > 0) {
          let formattedText = trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1');
          formattedText = formattedText.replace(/\*(.*?)\*/g, '$1');
          // Remove leftover asterisks if they are the only characters
          if (formattedText.match(/^\*+$/)) {
            formattedText = '';
          } else {
            // Trim leading/trailing asterisks that might be adjacent to actual content
            formattedText = formattedText.replace(/^\*+/, '').replace(/\*+$/, '').trim();
          }
          if (formattedText.trim().length === 0 && !trimmedLine.match(/^\s*\*+\s*$/) && trimmedLine !== '') {
            // If original line was not just asterisks or empty, but formattedText is, preserve a space to avoid empty Text
            // This case might be too complex, for now, if formattedText is empty, we skip
          } 

          if (formattedText.length === 0) return; // Skip if nothing to render after cleanup

          const linkMatch = formattedText.match(/(https?:\/\/[^\s]+)/);
          if (linkMatch) {
             elements.push(
                <Text key={`text-${elements.length}-${Math.random()}`} style={styles.paragraph}>
                   {formattedText.split(linkMatch[0]).reduce((acc, part, i) => {
                      if (i > 0) acc.push(<Text key={`link-${i}-${Math.random()}`} style={styles.link}>{linkMatch[0]}</Text>);
                      if (part.length > 0) acc.push(part);
                      return acc;
                   }, [] as React.ReactNode[])}
                </Text>
             );
          } else {
             elements.push(
                <Text key={`text-${elements.length}-${Math.random()}`} style={styles.paragraph}>
                   {formattedText}
                </Text>
             );
          }
        }
      }
    });
    processList(currentList, isNumberedList);
    if (title.trim().length === 0 && elements.length === 0) return null;
    const sectionProps = { style: styles.section, key: `${sectionIndex}-${Math.random()}`, wrap: sectionIndex > 0 ? false : undefined };
    return (
      <View {...sectionProps}>
        {title.trim().length > 0 && <Text style={styles.sectionTitle}>{title}</Text>}
        {elements}
      </View>
    );
  });
};

// New function to render the Full Report Details section with enhanced styling
const renderFullReportContent = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  // Extract the first line which should be the "Full Report Details" header
  const lines = content.trim().split('\n');
  const headerLine = lines[0];
  const contentLines = lines.slice(1);
  
  // Extract sections: we need to identify "Key Findings" section specifically
  const keyFindingsPattern = /^#+\s*Key Findings/im;
  const remainingContent = contentLines.join('\n');
  const keyFindingsMatch = remainingContent.match(keyFindingsPattern);
  
  let introContent, keyFindingsContent;
  
  if (keyFindingsMatch) {
    const keyFindingsIndex = keyFindingsMatch.index;
    introContent = remainingContent.substring(0, keyFindingsIndex).trim();
    keyFindingsContent = remainingContent.substring(keyFindingsIndex).trim();
  } else {
    // If no Key Findings section, treat all content after the header as intro
    introContent = remainingContent;
    keyFindingsContent = '';
  }
  
  // Extract "Strengths" and "Weaknesses" from Key Findings if present
  const strengthsPattern = /^#+\s*Strengths:/im;
  const weaknessesPattern = /^#+\s*Weaknesses:/im;
  
  const strengthsMatch = keyFindingsContent.match(strengthsPattern);
  const weaknessesMatch = keyFindingsContent.match(weaknessesPattern);
  
  let strengthsContent = '', weaknessesContent = '', otherContent = '';
  
  if (strengthsMatch && weaknessesMatch) {
    const strengthsIndex = strengthsMatch.index;
    const weaknessesIndex = weaknessesMatch.index;
    
    // Extract the Key Findings intro (if any)
    otherContent = keyFindingsContent.substring(0, strengthsIndex).trim();
    
    // Extract strengths content
    strengthsContent = keyFindingsContent.substring(
      strengthsIndex,
      weaknessesIndex
    ).trim();
    
    // Extract weaknesses content
    weaknessesContent = keyFindingsContent.substring(weaknessesIndex).trim();
  } else if (strengthsMatch) {
    // Only strengths section found
    const strengthsIndex = strengthsMatch.index;
    otherContent = keyFindingsContent.substring(0, strengthsIndex).trim();
    strengthsContent = keyFindingsContent.substring(strengthsIndex).trim();
  } else if (weaknessesMatch) {
    // Only weaknesses section found
    const weaknessesIndex = weaknessesMatch.index;
    otherContent = keyFindingsContent.substring(0, weaknessesIndex).trim();
    weaknessesContent = keyFindingsContent.substring(weaknessesIndex).trim();
  } else {
    // No strengths or weaknesses sections, treat all as other content
    otherContent = keyFindingsContent;
  }
  
  return (
    <View style={{ marginTop: 30 }}>
      {/* Full Report Details Header */}
      <Text style={styles.fullReportHeader}>Full Report Details</Text>
      
      {/* Introduction text */}
      <Text style={styles.fullReportIntro}>Below is the complete content of your AI Efficiency Scorecard report:</Text>
      
      {/* Parse and render the report sub-title and score information */}
      {renderFullReportIntroContent(introContent)}
      
      {/* Key Findings Section */}
      {(otherContent || strengthsContent || weaknessesContent) && (
        <>
          <Text style={styles.keyFindingsHeader}>Key Findings</Text>
          
          {/* Other Key Findings content */}
          {otherContent && renderKeyFindingsOtherContent(otherContent)}
          
          {/* Strengths Section */}
          {strengthsContent && renderStrengthsSection(strengthsContent)}
          
          {/* Weaknesses Section */}
          {weaknessesContent && renderWeaknessesSection(weaknessesContent)}
        </>
      )}
    </View>
  );
};

// Function to render the intro content of the full report (sub-title, industry, tier, score)
const renderFullReportIntroContent = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  // Extract key information using regex patterns
  const industryPattern = /AI Efficiency Scorecard Report: (.*?)(?:\n|$)/i;
  const tierPattern = /Overall Tier: (.*?)(?:\n|$)/i;
  const scorePattern = /Final Score: (.*?)(?:\n|$)/i;
  
  const industryMatch = content.match(industryPattern);
  const tierMatch = content.match(tierPattern);
  const scoreMatch = content.match(scorePattern);
  
  return (
    <View style={{ marginBottom: 20 }}>
      {industryMatch && (
        <Text style={styles.reportSubTitle}>
          AI Efficiency Scorecard Report: {industryMatch[1].trim()}
        </Text>
      )}
      
      {tierMatch && (
        <Text style={styles.tierText}>
          Overall Tier: {tierMatch[1].trim()}
        </Text>
      )}
      
      {scoreMatch && (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>
            Final Score: {scoreMatch[1].trim()}
          </Text>
        </View>
      )}
    </View>
  );
};

// Function to render other content in the Key Findings section
const renderKeyFindingsOtherContent = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  // Remove the "Key Findings" header line if present
  const lines = content.trim().split('\n');
  if (lines[0].match(/^#+\s*Key Findings/i)) {
    lines.shift();
  }
  
  // Join the remaining lines back together
  const remainingContent = lines.join('\n');
  
  // Render as standard markdown paragraphs
  return renderMarkdownParagraphs(remainingContent);
};

// Function to render the Strengths section
const renderStrengthsSection = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  // Extract the strengths as list items
  const lines = content.trim().split('\n');
  
  // First line should be the "Strengths:" heading
  const headerLine = lines.shift();
  
  const strengths = [];
  let currentStrength = '';
  
  // Process each line to build strengths items
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a list item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // If we have a current strength, push it to the array
      if (currentStrength) {
        strengths.push(currentStrength);
        currentStrength = '';
      }
      
      // Start a new strength with this line
      currentStrength = trimmedLine.substring(2).trim();
    } else if (currentStrength && trimmedLine) {
      // Continue the current strength with this line
      currentStrength += ' ' + trimmedLine;
    }
  }
  
  // Add the last strength if there is one
  if (currentStrength) {
    strengths.push(currentStrength);
  }
  
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.strengthWeaknessHeader}>Strengths:</Text>
      
      {/* Render each strength as an item block */}
      {strengths.map((strength, index) => (
        <View key={`strength-${index}`} style={styles.itemBlock}>
          <Text style={styles.itemBlockText}>{strength}</Text>
        </View>
      ))}
    </View>
  );
};

// Function to render the Weaknesses section
const renderWeaknessesSection = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  // Extract the weaknesses as list items
  const lines = content.trim().split('\n');
  
  // First line should be the "Weaknesses:" heading
  const headerLine = lines.shift();
  
  const weaknesses = [];
  let currentWeakness = '';
  
  // Process each line to build weaknesses items
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a list item
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // If we have a current weakness, push it to the array
      if (currentWeakness) {
        weaknesses.push(currentWeakness);
        currentWeakness = '';
      }
      
      // Start a new weakness with this line
      currentWeakness = trimmedLine.substring(2).trim();
    } else if (currentWeakness && trimmedLine) {
      // Continue the current weakness with this line
      currentWeakness += ' ' + trimmedLine;
    }
  }
  
  // Add the last weakness if there is one
  if (currentWeakness) {
    weaknesses.push(currentWeakness);
  }
  
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.strengthWeaknessHeader}>Weaknesses:</Text>
      
      {/* Render each weakness as an item block */}
      {weaknesses.map((weakness, index) => (
        <View key={`weakness-${index}`} style={styles.itemBlock}>
          <Text style={styles.itemBlockText}>{weakness}</Text>
        </View>
      ))}
    </View>
  );
};

// Function to render markdown paragraphs
const renderMarkdownParagraphs = (content: string) => {
  if (!content || content.trim() === '') return null;
  
  const lines = content.trim().split('\n');
  const paragraphs = [];
  let currentParagraph = '';
  
  // Process each line to build paragraphs
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // If empty line, end current paragraph
    if (!trimmedLine) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
    } else {
      // Continue or start a paragraph
      currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
    }
  }
  
  // Add the last paragraph if there is one
  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }
  
  return (
    <View style={{ marginBottom: 15 }}>
      {paragraphs.map((paragraph, index) => (
        <Text key={`para-${index}`} style={styles.markdownParagraph}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
};

const renderQnAHistory = (qaHistory: any[]) => {
  if (!qaHistory || qaHistory.length === 0) {
    return <Text style={{ ...styles.qnaPlaceholderText, fontStyle:'italic', textAlign: 'center' }}>No Q&A history available.</Text>;
  }
  return (
    <View style={styles.qnaSection}>
      <Text style={{...styles.sectionTitle, marginBottom: 10 }}>Full Assessment Q&A History</Text>
      <Text style={styles.qnaPlaceholderText}>
        [Q&A History is present (length: {qaHistory.length}) but rendering is temporarily simplified for debugging overlap issues.]
      </Text>
    </View>
  );
};

const ScorecardPDFDocument = ({ reportData }: { reportData: any }) => {
  const companyName = reportData?.companyName || reportData?.leadCompany || 'Your Company';
  const userName = reportData?.userName || reportData?.leadName || 'User';
  const industry = reportData?.industry || 'General Business';
  const aiTier = reportData?.userAITier || 'Not Specified';
  const reportId = reportData?.reportId || 'REPORT-ID';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  // Use report markdown if available, otherwise fall back to reportMarkdown
  const reportContent = reportData?.reportMarkdown || 'No report content available.';
  
  // Format the question/answer history if available
  const qaHistory = reportData?.questionAnswerHistory || [];
  
  return (
    <Document title={`AI Efficiency Scorecard - ${userName} at ${companyName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.title}>AI EFFICIENCY SCORECARD</Text>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLine}>
              <Text style={styles.userInfoLabel}>For: </Text>
              <Text style={styles.userInfoValueBold}>{userName}</Text>
              {companyName ? <Text> at {companyName}</Text> : null}
            </Text>
            <Text style={styles.userInfoLine}>
              <Text style={styles.userInfoLabel}>Industry: </Text>
              <Text>{industry}</Text>
            </Text>
            <Text style={styles.userInfoLine}>
              <Text style={styles.userInfoLabel}>AI Tier: </Text>
              <Text style={styles.userInfoValueBold}>{aiTier}</Text>
            </Text>
          </View>
          <Text style={styles.reportDetailsLine}>Report ID: {reportId} | Generated: {currentDate}</Text>
        </View>
        
        <View style={styles.content}>
          {renderMarkdownContent(reportContent)}
        </View>
        
        {qaHistory.length > 0 && renderQnAHistory(qaHistory)}
        
        <View style={styles.footer} fixed>
          <Text>AI Efficiency Scorecard | Confidential Report</Text>
          <Text>© {new Date().getFullYear()} - All Rights Reserved</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ScorecardPDFDocument; 