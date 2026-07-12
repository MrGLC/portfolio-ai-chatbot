// Chat → jewel activity bridge. Module-level store: the chat writes, the rig's
// frame loop polls get() (never subscribes — no setState in frame loops), and
// React consumers may subscribe. Decoupled: if nobody ever set()s, gem idles.
export type ChatActivity = 'idle' | 'thinking' | 'answering';

let current: ChatActivity = 'idle';
const subs = new Set<(a: ChatActivity) => void>();

export const jewelBus = {
  get(): ChatActivity {
    return current;
  },
  set(a: ChatActivity): void {
    if (a === current) return;
    current = a;
    for (const fn of subs) fn(a);
  },
  subscribe(fn: (a: ChatActivity) => void): () => void {
    subs.add(fn);
    return () => subs.delete(fn);
  },
};
