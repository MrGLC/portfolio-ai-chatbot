import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import '../i18n/config';
import { ThreeJsChatbot } from '../components/Chatbot/ThreeJsChatbot';
import { chatbotAPI } from '../services/api';

vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return { ...actual, Canvas: () => null };
});
vi.mock('../services/api', () => ({ chatbotAPI: { sendMessage: vi.fn() } }));

describe('ThreeJsChatbot single pending turn', () => {
  it('sends one request at a time, keeps the draft, and frees after resolve', async () => {
    let resolveA!: (v: unknown) => void;
    const send = chatbotAPI.sendMessage as unknown as ReturnType<typeof vi.fn>;
    send.mockReturnValueOnce(new Promise((r) => { resolveA = r; })).mockResolvedValue({ data: { response: 'ok' } });
    render(<ChakraProvider theme={theme}><ThreeJsChatbot /></ChakraProvider>);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    fireEvent.change(input, { target: { value: 'draft B' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

    expect(send).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('draft B');

    resolveA({ data: { response: 'ra' } });
    await waitFor(() => expect(screen.getByText('ra')).toBeInTheDocument());
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(send).toHaveBeenCalledTimes(2);
  });
});
