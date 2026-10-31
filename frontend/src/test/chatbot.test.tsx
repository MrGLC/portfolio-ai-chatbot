import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import '../i18n/config';
import { ThreeJsChatbot } from '../components/Chatbot/ThreeJsChatbot';
import { chatbotAPI } from '../services/api';
import { jewelBus } from '../components/JewelScene/jewelBus';

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

describe('ThreeJsChatbot jewel activity ownership', () => {
  const send = chatbotAPI.sendMessage as unknown as ReturnType<typeof vi.fn>;
  const ui = <ChakraProvider theme={theme}><ThreeJsChatbot /></ChakraProvider>;
  const ask = (text: string) => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: text } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
  };
  afterEach(() => { vi.useRealTimers(); send.mockReset(); });

  it.each(['resolve', 'reject'] as const)('a late %s from an unmounted instance does not touch the new turn', async (mode) => {
    vi.useFakeTimers();
    let settleA!: (v: unknown) => void;
    send.mockReturnValueOnce(new Promise((res, rej) => { settleA = mode === 'resolve' ? res : rej; }))
      .mockReturnValueOnce(new Promise(() => {}));
    const first = render(ui);
    ask('A');
    first.unmount();
    render(ui);
    ask('B');
    expect(jewelBus.get()).toBe('thinking');

    await act(async () => { settleA(mode === 'resolve' ? { data: { response: 'ra' } } : new Error('x')); });
    act(() => { vi.advanceTimersByTime(900); });
    expect(jewelBus.get()).toBe('thinking');
    expect(screen.queryByText('ra')).toBeNull();
  });

  it('starting a turn cancels the previous answer\'s idle timer', async () => {
    vi.useFakeTimers();
    send.mockResolvedValueOnce({ data: { response: 'ra' } }).mockReturnValueOnce(new Promise(() => {}));
    render(ui);
    ask('A');
    await act(async () => {});
    expect(jewelBus.get()).toBe('answering');
    ask('B');
    act(() => { vi.advanceTimersByTime(900); });
    expect(jewelBus.get()).toBe('thinking');
  });
});
