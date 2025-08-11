export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
  };
  sizes: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const darkTheme: Theme = {
  colors: {
    primary: '#e31b3a',
    secondary: '#6b3e9e',
    background: '#101010',
    surface: '#181818',
    card: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#27272a',
    error: '#ff304f',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#3b82f6',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  sizes: {
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const lightTheme: Theme = {
  colors: {
    primary: '#e31b3a',
    secondary: '#6b3e9e',
    background: '#ffffff',
    surface: '#f8f9fa',
    card: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  sizes: {
    small: 12,
    medium: 16,
    large: 20,
    extraLarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};