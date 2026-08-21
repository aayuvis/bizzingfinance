/* runtime.js — the one place views and main agree on.
   Keeps the module graph acyclic: main writes here, views read. */
export const R = {
  s: null,
  render() {},
  overlay: null,      // {kind, ...} — pay day, a letter, a celebration
  game: null,         // the arcade game currently mounted
};
