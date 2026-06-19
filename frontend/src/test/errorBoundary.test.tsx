import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import theme from '../theme';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

// Module-level switch so retry can recover on the second render.
let shouldThrow = true;
const Bomb: React.FC = () => {
  if (shouldThrow) throw new Error('boom');
  return <div>recovered</div>;
};

const renderWith = (ui: React.ReactElement) =>
  render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );

describe('ErrorBoundary', () => {
  it('renders ErrorState when a child throws, and retry recovers', () => {
    shouldThrow = true;
    renderWith(
      <ErrorBoundary homeHref="/">
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something broke/i)).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByText(/recovered/i)).toBeInTheDocument();
  });
});
