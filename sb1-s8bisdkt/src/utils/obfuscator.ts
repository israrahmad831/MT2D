// Simplified obfuscator for MT2D
// This file contains functions for basic code protection

// Function to generate encryption keys
const generateKey = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to encrypt strings
export const encryptString = (str: string, key: string = generateKey()): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result).replace(/=/g, '');
};

// Function to decrypt strings
export const decryptString = (str: string, key: string): string => {
  try {
    const decoded = atob(str);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    console.error('Decryption failed');
    return '';
  }
};

// Global key for encryption
export const GLOBAL_KEY = generateKey(32);

// Function to check if code is running in a development environment
export const isDevelopmentEnvironment = (): boolean => {
  try {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('stackblitz') ||
           window.location.hostname.includes('codesandbox');
  } catch (e) {
    return false;
  }
};

// Initialize protection
export const initProtection = () => {
  if (!isDevelopmentEnvironment()) {
    // Basic protection for production
    document.addEventListener('contextmenu', (e) => {
      if (!e.target || !(e.target as HTMLElement).closest('.inventory-item')) {
        e.preventDefault();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      // Prevent Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && e.key === 's') || 
        (e.ctrlKey && e.key === 'u') || 
        (e.ctrlKey && e.shiftKey && e.key === 'i') || 
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    });
  }
};