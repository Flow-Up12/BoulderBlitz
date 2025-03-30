/**
 * Formats a large number into a human-readable string with appropriate suffix
 * @param num The number to format
 * @returns Formatted string (e.g., 1K, 1M, 1B)
 */
export function formatCoins(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q', 'QD', 'S'];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const scaledNum = num / Math.pow(1000, magnitude);
  
  // Determine if we need to show decimals
  const formattedValue = magnitude > 0 && scaledNum < 10 
    ? scaledNum.toFixed(1) 
    : Math.floor(scaledNum).toString();
  
  return `${formattedValue}${suffixes[magnitude] || ''}`;
}

/**
 * Format a number with appropriate suffix (K, M, B, T) for display
 */
export const formatNumber = (num: number): string => {
  if (!num) {
    return '0';
  }
  if (num < 1000) {
    return num.toFixed(num % 1 === 0 ? 0 : 1);
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else {
    return (num / 1000000000000).toFixed(1) + 'T';
  }
};

/**
 * Format a time duration in seconds to a readable format
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats a number in scientific notation for use in CPC display
 * @param num The number to format
 * @returns Formatted string in scientific notation (e.g., 1.23e+6)
 */
export function formatScientific(num: number): string {
  if (num < 10000) {
    // For small numbers, use regular formatting with up to 2 decimal places
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  
  // For large numbers, use scientific notation
  const exponent = Math.floor(Math.log10(num));
  const mantissa = num / Math.pow(10, exponent);
  
  // Format mantissa to have 2 decimal places
  return `${mantissa.toFixed(2)}e+${exponent}`;
} 