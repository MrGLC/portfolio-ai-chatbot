import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import App from '../App';

vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return { ...actual, Canvas: () => null };
});
vi.mock('@react-three/drei', () => ({
  Float: ({ children }: { children: React.ReactNode }) => children,
  MeshDistortMaterial: () => null,
  OrbitControls: () => null,
  Environment: () => null,
  Sphere: () => null,
}));
vi.mock('../components/JewelScene', () => ({ default: () => null, JewelScene: () => null }));
vi.mock('../components/JewelScene/FieldAccent', () => ({ default: () => null, FieldAccent: () => null }));
vi.mock('../components/Chatbot/ThreeJsChatbot', () => ({ ThreeJsChatbot: () => null }));
vi.mock('../pages/AboutPage', () => ({
  AboutPage: () => {
    throw new Error('about exploded');
  },
}));

describe('per-route error boundary', () => {
  it('clears a failed page when navigating to a healthy route', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.history.pushState({}, '', '/about');
    render(<App />);
    const home = await screen.findByRole('link', { name: /back home/i }, { timeout: 3000 });
    fireEvent.click(home);
    await waitFor(() => expect(screen.getAllByText(/earns its place/i).length).toBeGreaterThan(0), {
      timeout: 3000,
    });
  });
});
