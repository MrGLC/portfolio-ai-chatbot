// Re-measure whenever any narrative section changes height (language switch,
// lazy chatbot chunk, font load) — resize alone misses those. Returns cleanup.
export function observeSections(ids: readonly string[], onChange: () => void): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {};
  const ro = new ResizeObserver(onChange);
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) ro.observe(el);
  }
  return () => ro.disconnect();
}
