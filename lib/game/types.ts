// Declaration merging with React's namespace
import React from 'react';

declare module 'react' {
  // Add missing types
  export interface ReactNode {
    // Empty interface to avoid errors
  }
} 