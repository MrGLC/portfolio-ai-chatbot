import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Deep Neural Network Palette
const colors = {
  brand: {
    primary: '#0D0E0E',      // Tech Black
    secondary: '#1A1A1A',    // Charcoal
    accent: '#00ABE4',       // Bright Blue
    accentCyan: '#7ACFD6',   // Cyan Blue
    text: '#F0F0F0',         // Off-White
    textSecondary: '#B3B3B3', // Muted White
    surface: '#2A2A2A',      // Surface Dark
    border: '#3A3A3A',       // Border Dark
  },
  gray: {
    50: '#F0F0F0',
    100: '#E0E0E0',
    200: '#C2C2C2',
    300: '#A3A3A3',
    400: '#858585',
    500: '#666666',
    600: '#4A4A4A',
    700: '#3A3A3A',
    800: '#2A2A2A',
    900: '#1A1A1A',
  }
};

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const fonts = {
  heading: 'Inter Display, -apple-system, BlinkMacSystemFont, sans-serif',
  body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  mono: 'IBM Plex Mono, Menlo, Monaco, Consolas, monospace',
};

const styles = {
  global: () => ({
    body: {
      bg: 'brand.primary',
      color: 'brand.text',
      lineHeight: '1.6',
    },
    '*::placeholder': {
      color: 'brand.textSecondary',
    },
    '*, *::before, *::after': {
      borderColor: 'brand.border',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: '8px',
    },
    variants: {
      primary: {
        bg: 'brand.accent',
        color: 'white',
        _hover: {
          bg: '#0096CC',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 25px rgba(0, 171, 228, 0.3)',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      },
      secondary: {
        bg: 'brand.accentCyan',
        color: 'brand.primary',
        _hover: {
          bg: '#6BB8C4',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 25px rgba(122, 207, 214, 0.3)',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      },
      ghost: {
        bg: 'transparent',
        color: 'brand.text',
        border: '1px solid',
        borderColor: 'brand.border',
        _hover: {
          bg: 'brand.surface',
          borderColor: 'brand.accent',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'brand.secondary',
        border: '1px solid',
        borderColor: 'brand.border',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        _hover: {
          borderColor: 'brand.accent',
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        },
        transition: 'all 0.3s ease',
      },
    },
  },
  Text: {
    baseStyle: {
      color: 'brand.text',
    },
    variants: {
      secondary: {
        color: 'brand.textSecondary',
      },
      accent: {
        color: 'brand.accent',
        fontWeight: '600',
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'brand.text',
      fontWeight: '700',
    },
    sizes: {
      '4xl': {
        fontSize: ['48px', '56px', '64px'],
        lineHeight: '1.1',
      },
      '3xl': {
        fontSize: ['32px', '36px', '40px'],
        lineHeight: '1.2',
      },
      '2xl': {
        fontSize: ['24px', '28px', '32px'],
        lineHeight: '1.3',
      },
    },
  },
};

const breakpoints = {
  sm: '30em',    // 480px
  md: '48em',    // 768px
  lg: '62em',    // 992px
  xl: '80em',    // 1280px
  '2xl': '96em', // 1536px
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  breakpoints,
});

export default theme;