import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import theme from '../theme';
import { ChapterLabel } from '../components/JewelScene/ChapterLabel';

const renderWith = (chapterId: string | null) =>
  render(
    <I18nextProvider i18n={i18n}>
      <ChakraProvider theme={theme}>
        <ChapterLabel chapterId={chapterId} />
      </ChakraProvider>
    </I18nextProvider>
  );

describe('ChapterLabel', () => {
  it('shows the mapped label for each chapter', () => {
    renderWith('story-hero');
    expect(screen.getByText('Raw stone')).toBeInTheDocument();
  });
  it('maps the AI chapter to "The model"', () => {
    renderWith('story-chatbot');
    expect(screen.getByText('The model')).toBeInTheDocument();
  });
  it('renders nothing when chapterId is null', () => {
    const { container } = renderWith(null);
    expect(container.textContent).toBe('');
  });
});
