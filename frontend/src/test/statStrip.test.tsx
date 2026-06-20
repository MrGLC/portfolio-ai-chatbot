// frontend/src/test/statStrip.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import theme from '../theme';
import { StatStrip } from '../pages/home/StatStrip';

describe('StatStrip', () => {
  it('renders all five credibility figures', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider theme={theme}><StatStrip /></ChakraProvider>
      </I18nextProvider>
    );
    for (const f of ['3+', '5', '100+', '250K+', '9.01']) {
      expect(screen.getByText(f)).toBeInTheDocument();
    }
  });
});
