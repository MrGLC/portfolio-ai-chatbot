import { describe, it, expect } from 'vitest';
import en from '../i18n/locales/en/translation.json';
import es from '../i18n/locales/es/translation.json';

describe('proof content', () => {
  it('EN has 4 real projects with honesty markers and no fake agency labels', () => {
    const p = (en as any).home.proof.projects;
    expect(p).toHaveLength(4);
    const names = p.map((x: any) => x.name);
    expect(names).toEqual(['Primero Trader', 'Appen', 'Clinical CV', 'Interaction AI']);
    const flat = JSON.stringify(p);
    expect(flat).toContain('~60% cache hit');
    expect(flat).toContain('(designed for)');
    expect(flat).not.toContain('99.9%');
    expect((en as any).home.portfolio.branding).toBeUndefined();
  });
  it('ES mirrors the structure (4 projects, 5 hero stats)', () => {
    expect((es as any).home.proof.projects).toHaveLength(4);
    expect((es as any).home.proof.heroStats).toHaveLength(5);
    expect((es as any).home.portfolio.webDesign).toBeUndefined();
  });
});
