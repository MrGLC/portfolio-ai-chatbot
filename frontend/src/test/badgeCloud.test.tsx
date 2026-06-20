// frontend/src/test/badgeCloud.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import theme from '../theme';
import { BadgeCloud } from '../pages/home/BadgeCloud';

describe('BadgeCloud', () => {
  it('renders the synthesis line, a domain badge, and a stack token', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider theme={theme}><BadgeCloud /></ChakraProvider>
      </I18nextProvider>
    );
    expect(screen.getByText(/same systems brain/i)).toBeInTheDocument();
    expect(screen.getByText('Computer Vision')).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
  });
});
