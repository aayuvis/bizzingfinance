/* typepad.js — the typed-answer box and its keypad, shared by the Train games that ask a
   child to TYPE a sum rather than pick one (Smart Choices' Better Buy, the Month Planner's
   yearly step). Typing is the point: an option list leaks its answer (Times Twelve's
   "second-largest option"), a keypad does not. Keys and taps both, as everywhere.

   It looks like Save or Borrow?'s box (the .sb* classes), so the Train games read as one
   family. A decimal point is offered only in a currency that has small coins. */
import { esc } from './ui.js';
import { sign, CURRENCIES, currency } from './fmt.js';

export const hasDot = () => ((CURRENCIES[currency()] || {}).minor || 1) > 1;
/* one key into the typed string: a digit, '.', or 'del' (Backspace) */
export function padKey(typed, k, dot = hasDot()) {
  const t = String(typed || '');
  if (k === 'del') return t.slice(0, -1);
  if (k === '.') return dot && !t.includes('.') ? (t || '0') + '.' : t;
  if (!/^\d$/.test(k) || t.replace('.', '').length >= 7) return t;
  if (/\.\d\d$/.test(t)) return t;
  return (t === '0' ? '' : t) + k;
}
/* the box and the pad. `held`: {ok} once checked (the pad gives way to the caller's verdict). */
export function padHtml({ typed, held, act, check, label = 'Your answer', nudge = false, dot = hasDot() }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', dot ? '.' : '', '0', 'del'];
  return `<div class="sbtype${held ? (held.ok ? ' ok' : ' no') : ''}" role="status" aria-live="polite" aria-label="${esc(label)}">
      <span class="sbcur">${esc(sign())}</span><b class="tabnum">${esc(typed || '')}</b>${held ? '' : '<i class="sbcaret" aria-hidden="true"></i>'}</div>
    ${held ? '' : `${nudge ? '<p class="small sbnudge">Type a number first: the keys, or the pad.</p>' : ''}
    <div class="sbpad">${keys.map((k) => (k === '' ? '<span></span>'
      : `<button class="sbkey" data-act="${act}" data-arg="${k}" aria-label="${k === 'del' ? 'delete' : k === '.' ? 'point' : k}">${k === 'del' ? '⌫' : k}</button>`)).join('')}
      <button class="sbkey go" data-act="${check}">Check</button></div>`}`;
}
/* a keyboard event as a pad key, or null */
export function keyOf(e) {
  const k = e.key;
  if (/^\d$/.test(k)) return k;
  if (k === '.' || k === ',') return '.';
  if (k === 'Backspace') return 'del';
  return null;
}
