/* gen-ids.js — which objectives the town can ask in fresh numbers, without the 70 KB of
   templates. Home only needs to know WHICH question is next (its id and title); the words
   are written by generate.js when the card is opened, so the first screen stays inside its
   budget. test/generate.mjs holds this list equal to generate.js's GEN. */
export const GEN_IDS = new Set(['EARN-1', 'EARN-2', 'EARN-3', 'EARN-4', 'EARN-5', 'EARN-6', 'EARN-7', 'EARN-8',
  'KEEP-1', 'KEEP-2', 'KEEP-3', 'KEEP-4', 'KEEP-5', 'KEEP-6', 'KEEP-7', 'KEEP-8',
  'CHOOSE-1', 'CHOOSE-2', 'CHOOSE-3', 'CHOOSE-4', 'CHOOSE-5', 'CHOOSE-6', 'CHOOSE-7', 'CHOOSE-8', 'CHOOSE-9', 'CHOOSE-10', 'CHOOSE-11', 'CHOOSE-12',
  'GROW-1', 'GROW-2', 'GROW-3', 'GROW-4', 'GROW-5', 'GROW-6', 'GROW-7', 'GROW-8',
  'OWE-1', 'OWE-2', 'OWE-3', 'OWE-4', 'OWE-5', 'OWE-6',
  'GUARD-1', 'GUARD-2', 'GUARD-3', 'GUARD-4', 'GUARD-5', 'GUARD-6']);
export const hasGen = (id) => GEN_IDS.has(id);
/* a generated card before its words are written: enough for Home and Continue */
export const genStub = (o, seed) => ({ id: `${o.id}~${seed}`, title: o.short, who: 'pip', objective: o.id, assess: true, generated: true, pending: true, drill: null });
