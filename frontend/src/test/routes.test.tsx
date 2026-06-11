import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// r3f Canvas can't run in jsdom — replace with a no-op
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return { ...actual, Canvas: () => null };
});

// @react-three/drei also uses WebGL internals — replace with no-ops
vi.mock('@react-three/drei', () => ({
  Float: ({ children }: { children: React.ReactNode }) => children,
  MeshDistortMaterial: () => null,
  OrbitControls: () => null,
  Environment: () => null,
  Sphere: () => null,
  MeshTransmissionMaterial: () => null,
}));

// All ThreeBackground components render Canvas directly — stub the whole module
vi.mock('../components/ThreeBackground', () => ({
  AnimatedBackground: () => null,
  RedJewelBackground: () => null,
  LightPattern: () => null,
}));

// Lazy-loaded ThreeBackground components — stub the individual modules
vi.mock('../components/ThreeBackground/RedJewelBackground', () => ({
  RedJewelBackground: () => null,
}));
vi.mock('../components/ThreeBackground/AnimatedBackground', () => ({
  AnimatedBackground: () => null,
}));
vi.mock('../components/ThreeBackground/LightPattern', () => ({
  LightPattern: () => null,
}));

// ThreeJsChatbot also renders Canvas — stub it
vi.mock('../components/Chatbot/ThreeJsChatbot', () => ({
  ThreeJsChatbot: () => null,
}));

// Route definitions: [path, marker-regex, description]
// Markers are page-specific static i18n strings from en/translation.json
// that render without any backend data (no react-query required).
const routes: Array<[path: string, marker: RegExp]> = [
  // HomePage: hero title rendered from home.hero.modernTitle
  ['/', /Modern AI Excellence/i],
  // AboutPage: hero role text from about.hero.role
  ['/about', /MACHINE LEARNING ENGINEER/i],
  // ProjectsPage: hero title from projects.hero.title
  ['/projects', /Royal AI Solutions Portfolio/i],
  // ConsultingPage: hero title from consulting.hero.title
  ['/consulting', /AI Consulting Services/i],
  // ContactPage: hero title from contact.hero.title
  ['/contact', /Let's Build Your AI Solution/i],
];

describe('route smoke tests', () => {
  it.each(routes)('renders %s without crashing', async (path, marker) => {
    window.history.pushState({}, '', path);
    render(<App />);
    await waitFor(() => expect(screen.getAllByText(marker).length).toBeGreaterThan(0), {
      timeout: 3000,
    });
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
