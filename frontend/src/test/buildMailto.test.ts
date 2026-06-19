import { describe, it, expect } from 'vitest';
import { buildMailto } from '../lib/buildMailto';

describe('buildMailto', () => {
  it('targets the correct recipient', () => {
    const url = buildMailto({ name: 'Ana', email: 'a@b.com', message: 'Hola' });
    expect(url.startsWith('mailto:ingbmluisgomez@gmail.com?')).toBe(true);
  });

  it('encodes name into the subject and message into the body', () => {
    const url = buildMailto({ name: 'Ana Díaz', email: 'a@b.com', message: 'Necesito ML' });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('Ana Díaz');
    expect(decoded).toContain('Necesito ML');
    expect(decoded).toContain('a@b.com');
  });

  it('omits optional fields that are empty', () => {
    const url = buildMailto({ name: 'Ana', email: 'a@b.com', message: 'Hi', company: '' });
    expect(decodeURIComponent(url)).not.toContain('Company:');
  });
});
