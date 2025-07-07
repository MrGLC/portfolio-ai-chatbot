import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Royal Portfolio Palette - Enhanced with Design System
const colors = {
  // Primary Palette from design system
  cream: {
    50: '#FFFEF7',
    100: '#FFFAED',
    200: '#FFF5DB',
    300: '#FFEDC2',
    400: '#FFE4A8',
    500: '#F5E6D3',
    600: '#E8D5B7',
    700: '#D4C4A8',
    800: '#C0B299',
    900: '#A69B87',
  },
  red: {
    50: '#FEF2F2',
    100: '#FDE5E5',
    200: '#FACCCC',
    300: '#F5A3A3',
    400: '#EF7A7A',
    500: '#DC143C',
    600: '#C41E3A',
    700: '#A91B30',
    800: '#8F1626',
    900: '#74121D',
  },
  yellow: {
    50: '#FFFEF0',
    100: '#FFFDE0',
    200: '#FFFBC2',
    300: '#FFF894',
    400: '#FFF566',
    500: '#FFD700',
    600: '#E6C200',
    700: '#CCAD00',
    800: '#B39900',
    900: '#998500',
  },
  
  // Brand colors
  brand: {
    primary: '#F5E6D3',       // Cream (60%)
    secondary: '#DC143C',     // Royal Red (30%)
    accent: '#FFD700',        // Golden Yellow (10%)
    text: '#1A1A1A',
    textSecondary: '#525252',
    surface: '#FFFFFF',
    border: '#E5E5E5',
    // Legacy mappings
    accentLight: '#FFF566',
    redDark: '#A91B30',
    redDarker: '#74121D',
    redLight: '#F5A3A3',
    cream: '#F5E6D3',
    creamDark: '#E8D5B7',
  },
  
  gray: {
    50: '#F7F7F7',
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  }
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const fonts = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'IBM Plex Mono', Menlo, Monaco, Consolas, monospace",
};

const styles = {
  global: () => ({
    body: {
      bg: 'cream.500',
      color: 'brand.text',
      lineHeight: '1.5',
      fontFamily: 'body',
    },
    '*::placeholder': {
      color: 'gray.500',
    },
    '*, *::before, *::after': {
      borderColor: 'gray.200',
    },
    // Custom scrollbar with royal theme
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'cream.100',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'red.500',
      borderRadius: 'full',
      border: '2px solid',
      borderColor: 'cream.100',
      _hover: {
        bg: 'red.600',
      },
    },
    '::selection': {
      bg: 'yellow.200',
      color: 'red.900',
    },
    // Royal gradient patterns
    '.royal-gradient': {
      background: 'linear-gradient(135deg, var(--chakra-colors-cream-500) 0%, var(--chakra-colors-red-500) 50%, var(--chakra-colors-yellow-500) 100%)',
    },
    '.royal-gradient-subtle': {
      background: 'linear-gradient(135deg, var(--chakra-colors-cream-500) 0%, var(--chakra-colors-cream-100) 100%)',
    },
    '.royal-gradient-accent': {
      background: 'linear-gradient(90deg, var(--chakra-colors-red-500) 0%, var(--chakra-colors-yellow-500) 100%)',
    },
    // Pixelated effect class
    '.pixelated': {
      imageRendering: 'pixelated',
      filter: 'contrast(1.1) saturate(1.2)',
    },
    // Enhanced micro-interactions
    '.hover-lift': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'royal',
      },
    },
    '.hover-glow': {
      transition: 'all 0.3s ease',
      _hover: {
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
      },
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '500',
      borderRadius: '6px',
      textTransform: 'none',
      letterSpacing: '0.02em',
      fontSize: 'md',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      _focus: {
        boxShadow: 'none',
      },
    },
    variants: {
      primary: {
        bg: 'red.500',
        color: 'white',
        boxShadow: 'md',
        _hover: {
          bg: 'red.600',
          transform: 'translateY(-2px)',
          boxShadow: 'royal',
        },
        _active: {
          bg: 'red.700',
          transform: 'translateY(0)',
        },
      },
      secondary: {
        bg: 'yellow.500',
        color: 'gray.900',
        boxShadow: 'md',
        _hover: {
          bg: 'yellow.600',
          transform: 'translateY(-2px)',
          boxShadow: 'golden',
        },
        _active: {
          bg: 'yellow.700',
          transform: 'translateY(0)',
        },
      },
      royal: {
        bgGradient: 'linear(to-r, red.500, yellow.500)',
        color: 'white',
        boxShadow: 'lg',
        _hover: {
          bgGradient: 'linear(to-r, red.600, yellow.600)',
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: 'royal',
        },
        _active: {
          transform: 'translateY(0) scale(1)',
        },
      },
      outline: {
        bg: 'transparent',
        color: 'brand.secondary',
        border: '2px solid',
        borderColor: 'brand.secondary',
        _hover: {
          bg: 'brand.secondary',
          color: 'white',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(220, 20, 60, 0.25)',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'brand.text',
        _hover: {
          bg: 'brand.cream',
        },
        _active: {
          bg: 'brand.creamDark',
        },
      },
      link: {
        bg: 'transparent',
        color: 'brand.secondary',
        textDecoration: 'none',
        fontWeight: '400',
        _hover: {
          color: 'brand.redDark',
          textDecoration: 'none',
        },
      },
    },
    sizes: {
      sm: {
        fontSize: 'sm',
        px: 4,
        py: 2,
        h: 'auto',
      },
      md: {
        fontSize: 'md',
        px: 6,
        py: 3,
        h: 'auto',
      },
      lg: {
        fontSize: 'lg',
        px: 8,
        py: 4,
        h: 'auto',
      },
    },
    defaultProps: {
      variant: 'primary',
      size: 'md',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'brand.surface',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
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
        color: 'brand.secondary',
        fontWeight: '600',
      },
      luxury: {
        fontFamily: 'heading',
        fontSize: 'sm',
        fontWeight: '300',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'brand.secondary',
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'brand.text',
      fontWeight: '700',
      fontFamily: 'heading',
      letterSpacing: '-0.02em',
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
  Link: {
    baseStyle: {
      color: 'brand.secondary',
      _hover: {
        color: 'brand.accent',
        textDecoration: 'none',
      },
      transition: 'color 0.3s ease',
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'brand.cream',
          borderRadius: '8px',
          _hover: {
            bg: 'brand.cream',
          },
          _focus: {
            bg: 'white',
            borderColor: 'brand.secondary',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
          },
        },
      },
      outline: {
        field: {
          borderColor: 'brand.border',
          _hover: {
            borderColor: 'brand.secondary',
          },
          _focus: {
            borderColor: 'brand.secondary',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Textarea: {
    variants: {
      filled: {
        bg: 'brand.cream',
        borderRadius: '8px',
        _hover: {
          bg: 'brand.cream',
        },
        _focus: {
          bg: 'white',
          borderColor: 'brand.secondary',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-secondary)',
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  IconButton: {
    baseStyle: {
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      _focus: {
        boxShadow: 'none',
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

// Royal shadows from design system
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  royal: '0 8px 32px rgba(220, 20, 60, 0.15)',
  golden: '0 8px 32px rgba(255, 215, 0, 0.15)',
};

// Border radii from design system
const radii = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  shadows,
  radii,
  styles,
  components,
  breakpoints,
});

export default theme;