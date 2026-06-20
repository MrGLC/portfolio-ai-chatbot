// frontend/src/test/metricsSection.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n/config';
import theme from '../theme';
import { HomePage } from '../pages/HomePage';

// JewelScene + chatbot are canvas — stub like the route tests do.
import { vi } from 'vitest';
vi.mock('../components/JewelScene', () => ({ default: () => null, JewelScene: () => null }));
vi.mock('../components/Chatbot/ThreeJsChatbot', () => ({ ThreeJsChatbot: () => null }));

const renderHome = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <ChakraProvider theme={theme}>
        <MemoryRouter><HomePage /></MemoryRouter>
      </ChakraProvider>
    </I18nextProvider>
  );

describe('metrics section', () => {
  it('shows real project cards with hard stats, not the fake agency grid', async () => {
    renderHome();
    expect(await screen.findByText('Primero Trader')).toBeInTheDocument();
    expect(screen.getByText('Appen')).toBeInTheDocument();
    expect(screen.getByText(/87% precision/i)).toBeInTheDocument();
    expect(screen.getByText(/250K\+ contributors/i)).toBeInTheDocument();
    expect(screen.queryByText(/Web Design/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Project 1$/)).not.toBeInTheDocument();
  });
});
