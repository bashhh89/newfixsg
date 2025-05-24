'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Loader } from '../../../components/learning-hub/loader';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { ToastProvider, useToast, Toaster } from '../../../components/ui/toast-provider';
import PresentationPDFButton from '../../../components/ui/pdf-download/PresentationPDFButton';
import { toast as sonnerToast } from 'sonner';

// Import all section components
import { 
  DetailedAnalysisSection 
} from '../../../components/scorecard/sections/SectionComponents';

// Import enhanced section components
import KeyFindingsSection from '../../../components/scorecard/sections/KeyFindingsSection';
import { StrategicActionPlanSection } from '../../../components/scorecard/sections/StrategicActionPlanSection';
import { BenchmarksSection } from '../../../components/scorecard/sections/BenchmarksSection';
import { QAndASection } from '../../../components/scorecard/sections/QAndASection';
import { LearningPathSection } from '../../../components/scorecard/sections/LearningPathSection';

// Import lead capture component
import LeadCaptureForm from '../../../components/scorecard/LeadCaptureForm';

// Add import for the WeasyPrint PDF button
import WeasyprintPDFButton from '../../../components/ui/pdf-download/WeasyprintPDFButton';

// Client color palette
const colors = {
  brightGreen: '#20E28F',
  darkTeal: '#103138',
  white: '#FFFFFF',
  lightMint: '#F3FDF5',
  orange: '#FE7F01',
  yellow: '#FEC401',
  lightBlue: '#01CEFE',
  cream1: '#FFF9F2',
  cream2: '#FFFCF2',
  lightBlueShade: '#F5FDFF'
};

// Define SectionName type
type SectionName = 'Overall Tier' | 'Key Findings' | 'Recommendations' | 'Strategic Action Plan' | 'Detailed Analysis' | 'Benchmarks' | 'Assessment Q&A' | 'Learning Path';

// Define SectionRefs interface with correct syntax
interface SectionRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

export default function NewResultsPage() {
  // State variables
  const [activeTab, setActiveTab] = useState('Overall Tier');
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [questionAnswerHistory, setQuestionAnswerHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [userIndustry, setUserIndustry] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPresentationPdfLoading, setIsPresentationPdfLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  
  // Initialize toast hook
  const { toast } = useToast();
  
  // Refs for scroll animations
  const contentRef = useRef<HTMLDivElement>(null);
  const overallTierRef = useRef<HTMLDivElement>(null);
  const keyFindingsRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const strategicActionPlanRef = useRef<HTMLDivElement>(null);
  const detailedAnalysisRef = useRef<HTMLDivElement>(null);
  const benchmarksRef = useRef<HTMLDivElement>(null);
  const qAndARef = useRef<HTMLDivElement>(null);
  const learningPathRef = useRef<HTMLDivElement>(null);

  // Important: Make this safe for SSG by checking if window is defined
  const searchParams = useSearchParams();

  // Helper functions to extract data from markdown
  const extractTierFromMarkdown = (markdown: string | null): string | null => {
    if (!markdown) return null;
    
    console.log('EXTRACT TIER: Extracting tier from markdown');
    
    // First try to find the specific "Overall Tier" heading
    const tierMatch = markdown.match(/## Overall Tier:?\s*(.+?)($|\n)/i);
    if (tierMatch && tierMatch[1]) {
      const extracted = tierMatch[1].trim();
      console.log('EXTRACT TIER: Found tier via "Overall Tier" heading:', extracted);
      return extracted;
    }
    
    // Next, try to find tier mentioned after "Overall" heading
    const overallMatch = markdown.match(/## Overall:?\s*(.+?)($|\n)/i);
    if (overallMatch && overallMatch[1]) {
      const line = overallMatch[1].trim();
      // Look for Leader, Enabler, or Dabbler in this line
      if (line.includes('Leader') || line.includes('leader')) return 'Leader';
      if (line.includes('Enabler') || line.includes('enabler')) return 'Enabler';
      if (line.includes('Dabbler') || line.includes('dabbler')) return 'Dabbler';
    }
    
    // If not found yet, try looking for the terms with specific formatting
    const leaderBoldMatch = markdown.match(/\*\*Leader\*\*/i) || markdown.match(/__Leader__/i);
    if (leaderBoldMatch) {
      console.log('EXTRACT TIER: Found tier via bold "Leader" format');
      return 'Leader';
    }
    
    const enablerBoldMatch = markdown.match(/\*\*Enabler\*\*/i) || markdown.match(/__Enabler__/i);
    if (enablerBoldMatch) {
      console.log('EXTRACT TIER: Found tier via bold "Enabler" format');
      return 'Enabler';
    }
    
    const dabblerBoldMatch = markdown.match(/\*\*Dabbler\*\*/i) || markdown.match(/__Dabbler__/i);
    if (dabblerBoldMatch) {
      console.log('EXTRACT TIER: Found tier via bold "Dabbler" format');
      return 'Dabbler';
    }
    
    // Fallback to searching for Leader, Enabler, or Dabbler anywhere in the markdown
    // Looking for most frequent tier mentioned
    const leaderCount = (markdown.match(/Leader/gi) || []).length;
    const enablerCount = (markdown.match(/Enabler/gi) || []).length;
    const dabblerCount = (markdown.match(/Dabbler/gi) || []).length;
    
    console.log('EXTRACT TIER: Term frequency -', { leaderCount, enablerCount, dabblerCount });
    
    if (leaderCount > enablerCount && leaderCount > dabblerCount && leaderCount > 0) {
      console.log('EXTRACT TIER: Found tier via frequency of "Leader"');
      return 'Leader';
    } else if (enablerCount > leaderCount && enablerCount > dabblerCount && enablerCount > 0) {
      console.log('EXTRACT TIER: Found tier via frequency of "Enabler"');
      return 'Enabler';
    } else if (dabblerCount > 0) {
      console.log('EXTRACT TIER: Found tier via frequency of "Dabbler"');
      return 'Dabbler';
    }
    
    // If we still can't determine, return "Enabler" as a default
    console.log('EXTRACT TIER: Could not determine tier from markdown content, using default "Enabler"');
    return 'Enabler';
  };

  // New function to extract industry from markdown report
  const extractIndustryFromMarkdown = (markdown: string | null): string | null => {
    if (!markdown) return null;
    
    console.log('EXTRACT INDUSTRY: Extracting industry from markdown');
    
    // Pattern 1: Look for "X industry" pattern with emphasis
    const emphasisMatch = markdown.match(/\*\*([^*]+) industry\*\*/i);
    if (emphasisMatch && emphasisMatch[1]) {
      const extracted = emphasisMatch[1].trim();
      console.log('EXTRACT INDUSTRY: Found industry via emphasis pattern:', extracted);
      return extracted;
    }
    
    // Pattern 2: Look for "in the X industry" pattern
    const phraseMatch = markdown.match(/in the ([^\.]+) industry/i);
    if (phraseMatch && phraseMatch[1]) {
      const extracted = phraseMatch[1].trim();
      console.log('EXTRACT INDUSTRY: Found industry via phrase pattern:', extracted);
      return extracted;
    }
    
    // Pattern 3: Look for "for the X industry" pattern
    const forPhraseMatch = markdown.match(/for the ([^\.]+) industry/i);
    if (forPhraseMatch && forPhraseMatch[1]) {
      const extracted = forPhraseMatch[1].trim();
      console.log('EXTRACT INDUSTRY: Found industry via for-phrase pattern:', extracted);
      return extracted;
    }
    
    // Pattern 4: Look for "in the X sector" pattern
    const sectorMatch = markdown.match(/in the ([^\.]+) sector/i);
    if (sectorMatch && sectorMatch[1]) {
      const extracted = sectorMatch[1].trim();
      console.log('EXTRACT INDUSTRY: Found industry via sector pattern:', extracted);
      return extracted;
    }
    
    console.log('EXTRACT INDUSTRY: Could not find industry in markdown');
    return null;
  };

  // Extract industry from question-answer history
  const extractIndustryFromHistory = (history: any[]): string | null => {
    if (!history || !history.length) return null;
            // Non-critical error, don't throw
          }
        }
        
        // After successfully loading the report, check if lead info exists
        if (typeof window !== 'undefined') {
          const leadEmail = sessionStorage.getItem('scorecardLeadEmail') || localStorage.getItem('scorecardLeadEmail');
          const leadName = sessionStorage.getItem('scorecardLeadName') || localStorage.getItem('scorecardLeadName');
          
          if (!leadEmail || !leadName) {
            console.log('RESULTS PAGE: Report exists but no lead info found, showing lead form');
            setShowLeadForm(true);
          } else {
            setLeadCaptured(true);
          }
        }
      } catch (error) {
        console.error("RESULTS PAGE ERROR:", error);
        setError(error instanceof Error ? error.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }
    
      fetchReportData();
  }, [searchParams]); // Only re-run if searchParams changes

  // Handle lead capture success
  const handleLeadCaptureSuccess = (capturedName: string) => {
    console.log("Lead capture successful. Captured name:", capturedName);
    setLeadCaptured(true);
    setShowLeadForm(false);
    setUserName(capturedName);
    
    // Store the name in sessionStorage for use in results page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scorecardUserName', capturedName);
      sessionStorage.setItem('scorecardLeadName', capturedName);
    }
  };

  // Helper functions to extract data from markdown
  const extractTierFromMarkdown = (markdown: string | null): string | null => {
    if (!markdown) return null;
    
    console.log('EXTRACT TIER: Extracting tier from markdown');
    
    // First try to find the specific "Overall Tier" heading
    const tierMatch = markdown.match(/## Overall Tier:?\s*(.+?)($|\n)/i);
    if (tierMatch && tierMatch[1]) {
      const extracted = tierMatch[1].trim();
      console.log('EXTRACT TIER: Found tier via "Overall Tier" heading:', extracted);
      return extracted;
    }
    
    // Next, try to find tier mentioned after "Overall" heading
    const overallMatch = markdown.match(/## Overall:?\s*(.+?)($|\n)/i);
    if (overallMatch && overallMatch[1]) {
      const line = overallMatch[1].trim();
      // Look for Leader, Enabler, or Dabbler in this line
      if (line.includes('Leader') || line.includes('leader')) return 'Leader';
      if (line.includes('Enabler') || line.includes('enabler')) return 'Enabler';
      if (line.includes('Dabbler') || line.includes('dabbler')) return 'Dabbler';
    }
    
    // If not found yet, try looking for the terms with specific formatting
    const leaderBoldMatch = markdown.match(/\*\*Leader\*\*/i) || markdown.match(/__Leader__/i);
    if (leaderBoldMatch) {
      console.log('EXTRACT TIER: Found tier via bold "Leader" format');
      return 'Leader';
    }
    
    const enablerBoldMatch = markdown.match(/\*\*Enabler\*\*/i) || markdown.match(/__Enabler__/i);
    if (enablerBoldMatch) {
      console.log('EXTRACT TIER: Found tier via bold "Enabler" format');
      return 'Enabler';
    }
    
    const dabblerBoldMatch = markdown.match(/\*\*Dabbler\*\*/i) || markdown.match(/__Dabbler__/i);
    if (dabblerBoldMatch) {
      console.log('EXTRACT TIER: Found tier via bold "Dabbler" format');
      return 'Dabbler';
    }
    
    // Fallback to searching for Leader, Enabler, or Dabbler anywhere in the markdown
    // Looking for most frequent tier mentioned
    const leaderCount = (markdown.match(/Leader/gi) || []).length;
    const enablerCount = (markdown.match(/Enabler/gi) || []).length;
    const dabblerCount = (markdown.match(/Dabbler/gi) || []).length;
    
    console.log('EXTRACT TIER: Term frequency -', { leaderCount, enablerCount, dabblerCount });
    
    if (leaderCount > enablerCount && leaderCount > dabblerCount && leaderCount > 0) {
      console.log('EXTRACT TIER: Found tier via frequency of "Leader"');
      return 'Leader';
    } else if (enablerCount > leaderCount && enablerCount > dabblerCount && enablerCount > 0) {
      console.log('EXTRACT TIER: Found tier via frequency of "Enabler"');
      return 'Enabler';
    } else if (dabblerCount > 0) {
      console.log('EXTRACT TIER: Found tier via frequency of "Dabbler"');
      return 'Dabbler';
    }
    
    // If we still can't determine, return "Enabler" as a default
    console.log('EXTRACT TIER: Could not determine tier from markdown content, using default "Enabler"');
    return 'Enabler';
  };
  
  const extractStrengthsFromMarkdown = (markdown: string): string[] => {
    console.log('EXTRACT STRENGTHS: Extracting strengths from markdown');
    
    // Try different patterns to find strengths section
    let strengthsSection = null;
    
    // Pattern 1: Standard "Strengths" heading
    const pattern1 = markdown.match(/## Strengths[:\s]*([\s\S]*?)(?=##|$)/i);
    if (pattern1 && pattern1[1]) {
      strengthsSection = pattern1[1];
      console.log('EXTRACT STRENGTHS: Found strengths via pattern 1 (standard heading)');
    }
    
    // Pattern 2: Inside "Key Findings" section
    if (!strengthsSection) {
      const keyFindingsSection = markdown.match(/## Key Findings[:\s]*([\s\S]*?)(?=##|$)/i);
      if (keyFindingsSection && keyFindingsSection[1]) {
        const strengthsInFindings = keyFindingsSection[1].match(/Strengths[:\s]*([\s\S]*?)(?=Weaknesses|Areas for Improvement|##|$)/i);
        if (strengthsInFindings && strengthsInFindings[1]) {
          strengthsSection = strengthsInFindings[1];
          console.log('EXTRACT STRENGTHS: Found strengths via pattern 2 (inside Key Findings)');
        }
      }
    }
    
    // If we found a strengths section, extract the bullet points
    if (strengthsSection) {
      const strengthsList = strengthsSection.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().match(/^\d+\.\s/))
        .map(line => line.trim().replace(/^[*-]\s+/, '').replace(/^\d+\.\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT STRENGTHS: Found', strengthsList.length, 'strengths');
      
      return strengthsList.slice(0, 5); // Limit to 5 strengths
    }
    
    // If no strengths section found with specific headings, look for bullet points after a "strong" or "strength" keyword
    const strengthKeywordSection = markdown.match(/(strength|strong)[^\n]*\n+((?:[*-]\s+[^\n]+\n*)+)/i);
    if (strengthKeywordSection && strengthKeywordSection[2]) {
      const strengthsList = strengthKeywordSection[2].split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[*-]\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT STRENGTHS: Found', strengthsList.length, 'strengths via keyword pattern');
      
      if (strengthsList.length > 0) {
        return strengthsList.slice(0, 5);
      }
    }
    
    // Last resort: Find first set of bullet points in the document
    const firstBulletPoints = markdown.match(/(?:[*-]\s+[^\n]+\n*){2,}/);
    if (firstBulletPoints) {
      const bulletList = firstBulletPoints[0].split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[*-]\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT STRENGTHS: Using first bullet points as fallback, found', bulletList.length, 'items');
      
      if (bulletList.length > 0) {
        return bulletList.slice(0, 5);
      }
    }
    
    console.log('EXTRACT STRENGTHS: Could not find any strengths in the markdown');
    return [];
  };
  
  const extractWeaknessesFromMarkdown = (markdown: string): string[] => {
    console.log('EXTRACT WEAKNESSES: Extracting weaknesses from markdown');
    
    // Try different patterns to find weaknesses section
    let weaknessesSection = null;
    
    // Pattern 1: Standard "Weaknesses" or variations heading
    const pattern1 = markdown.match(/## (Weaknesses|Areas for Improvement|Challenges|Opportunities)[:\s]*([\s\S]*?)(?=##|$)/i);
    if (pattern1 && pattern1[2]) {
      weaknessesSection = pattern1[2];
      console.log('EXTRACT WEAKNESSES: Found weaknesses via pattern 1 (standard heading)');
    }
    
    // Pattern 2: Inside "Key Findings" section
    if (!weaknessesSection) {
      const keyFindingsSection = markdown.match(/## Key Findings[:\s]*([\s\S]*?)(?=##|$)/i);
      if (keyFindingsSection && keyFindingsSection[1]) {
        const weaknessesInFindings = keyFindingsSection[1].match(/(Weaknesses|Areas for Improvement|Challenges|Opportunities)[:\s]*([\s\S]*?)(?=##|$)/i);
        if (weaknessesInFindings && weaknessesInFindings[2]) {
          weaknessesSection = weaknessesInFindings[2];
          console.log('EXTRACT WEAKNESSES: Found weaknesses via pattern 2 (inside Key Findings)');
        }
      }
    }
    
    // If we found a weaknesses section, extract the bullet points
    if (weaknessesSection) {
      const weaknessesList = weaknessesSection.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().match(/^\d+\.\s/))
        .map(line => line.trim().replace(/^[*-]\s+/, '').replace(/^\d+\.\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT WEAKNESSES: Found', weaknessesList.length, 'weaknesses');
      
      return weaknessesList.slice(0, 5); // Limit to 5 weaknesses
    }
    
    // If no weaknesses section found with specific headings, look for bullet points after a weakness-related keyword
    const weaknessKeywordSection = markdown.match(/(weakness|improve|challenge|opportunity|gap)[^\n]*\n+((?:[*-]\s+[^\n]+\n*)+)/i);
    if (weaknessKeywordSection && weaknessKeywordSection[2]) {
      const weaknessesList = weaknessKeywordSection[2].split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[*-]\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT WEAKNESSES: Found', weaknessesList.length, 'weaknesses via keyword pattern');
      
      if (weaknessesList.length > 0) {
        return weaknessesList.slice(0, 5);
      }
    }
    
    // Last resort: Find second set of bullet points in the document
    const allBulletSections = markdown.match(/(?:[*-]\s+[^\n]+\n*){2,}/g);
    if (allBulletSections && allBulletSections.length > 1) {
      const secondBulletPoints = allBulletSections[1]; // Use the second bullet list
      const bulletList = secondBulletPoints.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[*-]\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT WEAKNESSES: Using second bullet points as fallback, found', bulletList.length, 'items');
      
      if (bulletList.length > 0) {
        return bulletList.slice(0, 5);
      }
    }
    
    console.log('EXTRACT WEAKNESSES: Could not find any weaknesses in the markdown');
    return [];
  };
  
  const extractActionsFromMarkdown = (markdown: string): string[] => {
    console.log('EXTRACT ACTIONS: Extracting action items from markdown');
    
    // Try different patterns to find actions section
    let actionsSection = null;
    
    // Pattern 1: Standard action-related headings
    const pattern1 = markdown.match(/## (Recommendations|Action Plan|Action Items|Next Steps|Strategic Action Plan)[:\s]*([\s\S]*?)(?=##|$)/i);
    if (pattern1 && pattern1[2]) {
      actionsSection = pattern1[2];
      console.log('EXTRACT ACTIONS: Found actions via pattern 1 (standard heading)');
    }
    
    // If we found an actions section, extract the bullet points
    if (actionsSection) {
      const actionsList = actionsSection.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().match(/^\d+\.\s/))
        .map(line => line.trim().replace(/^[*-]\s+/, '').replace(/^\d+\.\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT ACTIONS: Found', actionsList.length, 'actions');
      
      return actionsList.slice(0, 5); // Limit to 5 action items
    }
    
    // If no actions section found with specific headings, look for numbered lists that might indicate actions
    const numberedListSection = markdown.match(/(?:\d+\.\s+[^\n]+\n*){2,}/);
    if (numberedListSection) {
      const numberedList = numberedListSection[0].split('\n')
        .filter(line => line.trim().match(/^\d+\.\s/))
        .map(line => line.trim().replace(/^\d+\.\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT ACTIONS: Found', numberedList.length, 'actions via numbered list pattern');
      
      if (numberedList.length > 0) {
        return numberedList.slice(0, 5);
      }
    }
    
    // Look for bullet points after action-related keywords
    const actionKeywordSection = markdown.match(/(recommendation|action|next step|implement|strategic)[^\n]*\n+((?:[*-]\s+[^\n]+\n*)+)/i);
    if (actionKeywordSection && actionKeywordSection[2]) {
      const actionsList = actionKeywordSection[2].split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[*-]\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT ACTIONS: Found', actionsList.length, 'actions via keyword pattern');
      
      if (actionsList.length > 0) {
        return actionsList.slice(0, 5);
      }
    }
    
    // Last resort: Find the third or last set of bullet points in the document
    const allBulletSections = markdown.match(/(?:[*-]\s+[^\n]+\n*){2,}/g);
    if (allBulletSections && allBulletSections.length > 0) {
      // Use the third bullet list if available, otherwise use the last one
      const bulletPointsSection = allBulletSections.length > 2 ? allBulletSections[2] : allBulletSections[allBulletSections.length - 1];
      const bulletList = bulletPointsSection.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[*-]\s+/, ''))
        .filter(line => line.length > 0);
        
      console.log('EXTRACT ACTIONS: Using bullet points as fallback, found', bulletList.length, 'items');
      
      if (bulletList.length > 0) {
        return bulletList.slice(0, 5);
      }
    }
    
    console.log('EXTRACT ACTIONS: Could not find any action items in the markdown');
    return [];
  };

  // Handle tab changes
  const handleTabChange = (tabName: string) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(tabName);
      setAnimating(false);
      // Scroll to top when changing tabs
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  // Handle report sharing
  const handleShareReport = () => {
    try {
      setIsSharing(true);
      
      // Create shareable URL with reportId
      const reportId = searchParams?.get('reportId') || 
        (typeof window !== 'undefined' ? 
          sessionStorage.getItem('currentReportID') || 
          sessionStorage.getItem('reportId') || 
          localStorage.getItem('currentReportID') || 
          localStorage.getItem('reportId') : null);
      
      if (!reportId) {
        throw new Error('No report ID found to share');
      }
      
      // Create the URL to share
      const shareUrl = `${window.location.origin}/scorecard/results?reportId=${reportId}`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: `AI Efficiency Scorecard for ${userName || 'your organization'}`,
          text: `Check out this AI Efficiency Scorecard (Tier: ${userTier || 'Evaluation'})`,
          url: shareUrl
        }).catch(err => {
          console.error('Share failed:', err);
          // Fallback to clipboard if share fails
          navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        });
      } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share report:', error);
      alert('Unable to share. Please try copying the URL manually.');
    } finally {
      setIsSharing(false);
    }
  };

  // Replace the handleDownloadPdf function
  const handleDownloadPdf = async () => {
    if (!reportId) {
      toast({
        title: "Error",
        description: "Report ID not found. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    
    // Store report data in localStorage as fallback for PDF generation
    if (reportMarkdown) {
      localStorage.setItem('reportMarkdown', reportMarkdown);
    }
    if (questionAnswerHistory) {
      localStorage.setItem('questionAnswerHistory', JSON.stringify(questionAnswerHistory));
    }
    if (userTier) {
      localStorage.setItem('userAITier', userTier);
    }
    if (userName) {
      localStorage.setItem('userName', userName);
    }
    
    // We'll now use the download button component which handles the PDF generation
    setIsDownloadingPdf(true);
    
    try {
      // Programmatically click the PDF download button if needed
      const downloadButton = document.getElementById('pdf-download-button');
      if (downloadButton) {
