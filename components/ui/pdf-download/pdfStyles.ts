// Define colors for consistency
const COLORS = {
  primaryDark: '#103138',
  accentGreen: '#20E28F',
  white: '#FFFFFF',
  lightBg: '#F3FDF5',
  textDark: '#103138',
  textLight: '#6D7278',
  borderColor: '#DDE2E5',
  cardShadow: 'rgba(0,0,0,0.12)',
};

// In a client component, we can't use fs.readFileSync
// For production, we'll just use empty strings since the font loading is handled server-side
const regularFontBase64 = '';
const boldFontBase64 = '';

export const pdfStyles = {
  // Default styles
  defaultStyle: {
    font: 'PlusJakarta',
    fontSize: 12,
    lineHeight: 1.5,
    color: '#333333',
  },
  
  // Heading styles
  header: {
    fontSize: 22,
    bold: true,
    color: '#202124',
    margin: [0, 0, 0, 10],
  },
  
  subheader: {
    fontSize: 18,
    bold: true,
    color: '#202124',
    margin: [0, 15, 0, 10],
  },
  
  sectionTitle: {
    fontSize: 16,
    bold: true,
    color: '#202124',
    margin: [0, 10, 0, 8],
  },
  
  // Text styles
  bold: {
    bold: true,
  },
  
  italic: {
    italics: true,
  },
  
  highlight: {
    background: '#F8F9FA',
    color: '#1A73E8',
  },
  
  // Table styles
  table: {
    margin: [0, 5, 0, 15],
  },
  
  tableHeader: {
    bold: true,
    fontSize: 13,
    color: '#202124',
    fillColor: '#F1F3F4',
  },
  
  // Link style
  link: {
    color: '#1A73E8',
    decoration: 'underline',
  },
  
  // Quote style
  quote: {
    italics: true,
    margin: [20, 10, 20, 10],
    color: '#5F6368',
  },
  
  // List styles
  listItem: {
    margin: [0, 2, 0, 2],
  },
  
  // Custom branding elements
  brandHeader: {
    fontSize: 14,
    color: '#1A73E8',
    bold: true,
  },
  
  brandFooter: {
    fontSize: 10,
    color: '#5F6368',
    alignment: 'center',
  },
  
  // NEW STYLES FOR PAGES 3 & 4 - "Full Report Details" section
  fullReportHeader: {
    font: 'PlusJakarta',
    fontSize: 22,
    bold: true,
    color: COLORS.primaryDark,
    margin: [0, 20, 0, 20],
    decoration: 'underline',
    decorationStyle: 'solid',
    decorationColor: COLORS.accentGreen,
    decorationThickness: 2,
  },
  
  fullReportIntro: {
    font: 'PlusJakarta',
    fontSize: 18,
    color: COLORS.primaryDark,
    margin: [0, 0, 0, 10],
    lineHeight: 1.4,
  },
  
  reportSubTitle: {
    font: 'PlusJakarta',
    fontSize: 20,
    bold: true,
    color: COLORS.primaryDark,
    margin: [0, 0, 0, 5],
    lineHeight: 1.4,
  },
  
  tierText: {
    font: 'PlusJakarta',
    fontSize: 18,
    bold: true,
    color: COLORS.primaryDark,
    margin: [0, 0, 0, 5],
  },
  
  scoreBox: {
    background: COLORS.lightBg,
    padding: [12, 8],
    border: [1, 'solid', COLORS.borderColor],
    borderRadius: 4,
    margin: [0, 0, 0, 20],
    display: 'inline-block',
  },
  
  scoreText: {
    font: 'PlusJakarta',
    fontSize: 18,
    bold: true,
    color: COLORS.primaryDark,
  },
  
  keyFindingsHeader: {
    font: 'PlusJakarta',
    fontSize: 20,
    bold: true,
    color: COLORS.primaryDark,
    margin: [0, 20, 0, 15],
    decoration: 'underline',
    decorationStyle: 'solid',
    decorationColor: COLORS.accentGreen,
    decorationThickness: 2,
  },
  
  strengthWeaknessHeader: {
    font: 'PlusJakarta',
    fontSize: 18,
    bold: true,
    color: COLORS.primaryDark,
    margin: [0, 15, 0, 10],
  },
  
  itemBlock: {
    background: COLORS.lightBg,
    padding: [15, 12],
    border: [1, 'solid', COLORS.borderColor],
    borderLeft: [4, 'solid', COLORS.accentGreen],
    borderRadius: 4,
    margin: [0, 0, 0, 10],
  },
  
  itemBlockText: {
    font: 'PlusJakarta',
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 1.6,
  },
  
  markdownParagraph: {
    font: 'PlusJakarta',
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 1.6,
    margin: [0, 0, 0, 12],
  }
};

// Export default to be compatible with different import methods
export default pdfStyles; 