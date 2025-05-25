import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to check if auto-complete feature should be enabled
export const isAutoCompleteEnabled = (): boolean => {
  // Debug logging to help identify environment issues
  console.log(`[DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[DEBUG] NEXT_PUBLIC_ENABLE_AUTO_COMPLETE: ${process.env.NEXT_PUBLIC_ENABLE_AUTO_COMPLETE}`);
  
  // FIXED: Handle both client and server side rendering properly
  // Client-side: window is defined
  if (typeof window !== 'undefined') {
    // Check for environment variable in a string-safe way with fallbacks
    const envValue = process.env.NEXT_PUBLIC_ENABLE_AUTO_COMPLETE;
    
    // If explicitly set to 'true' as a string, enable it
    if (envValue === 'true') {
      console.log('[DEBUG] Auto-complete ENABLED by environment variable (client-side)');
      return true;
    }
    
    // If in development mode and not explicitly disabled
    if (process.env.NODE_ENV === 'development' && envValue !== 'false') {
      console.log('[DEBUG] Auto-complete ENABLED in development mode (client-side)');
      return true;
    }
    
    console.log('[DEBUG] Auto-complete DISABLED (client-side)');
    return false;
  }
  
  // Server-side: Default to environment check
  const isDev = process.env.NODE_ENV === 'development';
  const envEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTO_COMPLETE === 'true';
  const isEnabled = isDev || envEnabled;
  
  console.log(`[DEBUG] Auto-complete ${isEnabled ? 'ENABLED' : 'DISABLED'} (server-side)`);
  return isEnabled;
}; 