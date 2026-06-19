import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import theme from '../theme';
import { ErrorState } from '../components/feedback/ErrorState';

const renderWith = (ui: React.ReactElement) =>
  render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );

describe('ErrorState', () => {
  it('renders default copy', () => {
    renderWith(<ErrorState />);
    expect(screen.getByText(/something broke/i)).toBeInTheDocument();
  });

  it('renders custom message and fires retry', () => {
    const onRetry = vi.fn();
    renderWith(<ErrorState message="The projects feed is unreachable." onRetry={onRetry} />);
    expect(screen.getByText(/projects feed is unreachable/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
