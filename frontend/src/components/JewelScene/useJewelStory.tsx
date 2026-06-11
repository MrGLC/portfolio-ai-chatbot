import React, { createContext, useContext, useRef } from 'react';
import type { TargetName } from './morphTargets';

export interface JewelStoryState {
  from: TargetName;
  to: TargetName;
  progress: number; // 0..1 blend from -> to
}

type Listener = (event: 'state' | 'pulse', state: JewelStoryState) => void;

// Plain controller (unit-testable, no React). The rig reads state via subscription
// inside useFrame — no React re-renders on progress changes.
export class JewelStoryController {
  state: JewelStoryState = { from: 'gem', to: 'gem', progress: 0 };
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  setTarget(name: TargetName): void {
    this.state = { from: this.state.to, to: name, progress: 0 };
    this.emit('state');
  }

  setProgress(p: number): void {
    const clamped = Math.min(1, Math.max(0, p));
    if (clamped === 1) {
      this.state = { from: this.state.to, to: this.state.to, progress: 0 };
    } else {
      this.state = { ...this.state, progress: clamped };
    }
    this.emit('state');
  }

  pulse(): void {
    this.emit('pulse');
  }

  private emit(kind: 'state' | 'pulse') {
    this.listeners.forEach((fn) => fn(kind, this.state));
  }
}

const JewelStoryContext = createContext<JewelStoryController | null>(null);

export const JewelStoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const controller = useRef(new JewelStoryController());
  return <JewelStoryContext.Provider value={controller.current}>{children}</JewelStoryContext.Provider>;
};

export function useJewelStory(): JewelStoryController {
  const ctx = useContext(JewelStoryContext);
  if (!ctx) throw new Error('useJewelStory must be used inside JewelStoryProvider');
  return ctx;
}
