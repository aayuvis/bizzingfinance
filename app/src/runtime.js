/* runtime.js — the one place main and the views agree on.
   Keeps the module graph acyclic: main writes here, everything else reads. */
export const R = {
  s: null,          // the household
  render() {},
  overlay: null,    // {kind, ...} — a letter, pay day, a level, the More sheet
  game: null,       // the arcade game currently mounted
  shelf: '',        // a sub-shelf inside Learn
  query: '',        // glossary search
  fields: {},       // uncommitted form input, so a re-render doesn't lose it
  gate: false,      // the grown-ups' area is unlocked — in memory only, never saved
  mode: null,       // 'light' | 'dark' | null (follow the system)
};
