/**
 * Utility Functions
 * Helper functions for common operations
 */

import { VALIDATION } from '../constants';

// ==================== DATE UTILITIES ====================
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string'
    ? new Date(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) ? `${date}T00:00:00` : date)
    : date;
  return d.toLocaleDateString('ro-RO');
};

export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ro-RO');
};

// ==================== VALIDATION UTILITIES ====================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidBestisEmail = (email: string): boolean => {
  return email.endsWith(VALIDATION.EMAIL_DOMAIN);
};

export const validatePoints = (points: number): boolean => {
  return points >= VALIDATION.MIN_POINTS && points <= VALIDATION.MAX_POINTS;
};

export const validateTaskDescription = (description: string): boolean => {
  const trimmed = description.trim();
  return trimmed.length >= VALIDATION.MIN_TASK_LENGTH && 
         trimmed.length <= VALIDATION.MAX_TASK_LENGTH;
};

// ==================== STRING UTILITIES ====================
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export const extractNameFromEmail = (email: string): string => {
  return email.split('@')[0];
};

// ==================== CLIPBOARD UTILITIES ====================
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// ==================== TOKEN UTILITIES ====================
export const generateToken = (): string => crypto.randomUUID().split('-').join('');

// ==================== URL UTILITIES ====================
export const buildAcceptanceLink = (baseUrl: string, id: string, token: string): string => {
  return `${baseUrl}/accept-transfer?id=${id}&token=${token}`;
};

export const getQueryParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// ==================== ARRAY UTILITIES ====================
export const sortByKey = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};
