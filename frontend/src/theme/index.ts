import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Royal Portfolio Palette - Luxury Red/Cream/Gold Theme
const colors = {
  brand: {
    primary: '#FBF7F0',       // Cream Light (main background - 60%)
    secondary: '#DC143C',     // Royal Red (secondary surfaces - 30%)
    accent: '#FFD700',        // Golden Yellow (accent elements - 10%)
    accentLight: '#FFED4E',   // Golden Yellow Light
    text: '#1A1A1A',          // Dark Charcoal (main text)
    textSecondary: '#666666', // Gray (secondary text)
    surface: '#FFFFFF',       // White (cards/modals)
    border: '#E8D4B8',        // Cream Dark (borders)
    
    // Additional shades for depth
    redDark: '#B91C3C',       // Royal Red Dark
    redDarker: '#8B0020',     // Royal Red Darker
    redLight: '#E85D75',      // Royal Red Light
    cream: '#F5E6D3',         // Regular Cream
    creamDark: '#E8D4B8',     // Cream Dark
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
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
    // Add custom scrollbar styling
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'brand.cream',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'brand.secondary',
      borderRadius: '4px',
      _hover: {
        bg: 'brand.redDark',
      },
    },
    '::selection': {
      bg: 'brand.redLight',
      color: 'white',
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
        bg: 'brand.accent',
        color: 'brand.text',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        _hover: {
          bg: 'brand.accentLight',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.25)',
        },
        _active: {
          transform: 'translateY(0)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
      secondary: {
        bg: 'brand.secondary',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        _hover: {
          bg: 'brand.redDark',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(220, 20, 60, 0.25)',
        },
        _active: {
          transform: 'translateY(0)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
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

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  breakpoints,
});

export default theme;