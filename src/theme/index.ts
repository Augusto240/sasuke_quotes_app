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
    background: '#0f0f0f',
    surface: '#181818',
    card: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#2a2a2a',
    error: '#ff5252',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
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
    primary: '#d32f2f',
    secondary: '#7b1fa2',
    background: '#fafafa',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
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