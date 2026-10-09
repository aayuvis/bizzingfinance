/* trainstyle.js — the Train games' styles (Smart Choices, the Month Planner, Compound Climb's
   estimate), put on the page the first time one of those games opens rather than carried by the
   first screen: they ride in the arcade's chunk, as the games do (the first screen is held to
   1.5 MB, test/browser.mjs N2). Nothing here is drawn before a game is. */
const CSS = `/* ── Smart Choices (smartchoices.js) · Needs and Wants, Scam Spotter, Better Buy ── */
.scstage{gap:10px}
.scstage .sbask,.scstage .scpick{text-align:left;padding:13px 14px 11px}
.scmode{display:flex !important;gap:10px;align-items:flex-start;text-align:left;padding:12px 14px;border-radius:18px;color:var(--ink);min-height:64px}
.scmode .k,.scchip .k,.sctell .k{flex:0 0 auto;margin-top:2px}
.tcnote{border-radius:var(--r-md);padding:10px 13px;font-size:13.5px;line-height:1.45;color:var(--ink)}
.tcnote.ok{background:var(--grow-tint)}
.choices.sc3{grid-template-columns:1fr 1fr 1fr;gap:8px}
.choices.sc3 .btn{min-height:52px;padding:10px 6px;color:#fff}
.scneed{background:var(--save)}.scboth{background:var(--treasure);color:#1C2A2E !important}.scwant{background:var(--give)}
.scchip{display:flex !important;gap:9px;align-items:flex-start;text-align:left;padding:11px 14px;border-radius:18px;color:var(--ink);line-height:1.4}
.scmsg{text-align:left !important;padding:13px 15px 12px !important}
.scch{display:flex;gap:7px;align-items:center;font:700 11.5px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.scbody{font-size:15px;line-height:1.55;font-weight:600;margin:0}
.scph.tell{background:color-mix(in srgb,var(--spend) 22%,transparent);border-radius:6px;padding:1px 3px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.sctells{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.sctell{display:flex !important;gap:9px;align-items:flex-start;text-align:left;min-height:44px;padding:9px 12px;border-radius:14px;color:var(--ink);font-weight:600;font-size:14px;line-height:1.4;box-shadow:none}
.scshelf{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sctag{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;min-height:150px;padding:14px 10px 12px;border-radius:16px 16px 22px 22px;
  background:#FFF8E6;color:#1C2A2E;border:2px solid #E2C88E;box-shadow:0 10px 24px rgb(40 25 5 / .22);text-align:center}
.sctag::before{content:"";position:absolute;top:7px;left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:var(--surface);border:2px solid #E2C88E}
.sctag .k{position:absolute;top:8px;left:9px}
.sctag.sel{border-color:var(--action);box-shadow:0 0 0 3px var(--action),0 10px 24px rgb(40 25 5 / .22)}
.sctag.ok{border-color:var(--grow);box-shadow:0 0 0 3px var(--grow),0 10px 24px rgb(40 25 5 / .22)}
.sctag.no{border-color:var(--spend);box-shadow:0 0 0 3px var(--spend),0 10px 24px rgb(40 25 5 / .22)}
.sctag:disabled{opacity:1;cursor:default}
.scicons{display:flex;flex-wrap:wrap;justify-content:center;gap:2px;max-width:132px;margin-top:12px;min-height:26px}
.sclabel{font-weight:700;font-size:13.5px;line-height:1.3}
.scprice{font:800 24px var(--display);color:#1C2A2E}
.scwork{margin:6px 0 4px;padding-left:18px;font-size:13.5px;line-height:1.5}
.sctype .sbtype{margin-top:6px}
html[data-bz-dark] .sctag{background:#2B2A24;color:#F4EEE4;border-color:#8A7444}
html[data-bz-dark] .sctag .scprice{color:#F4EEE4}
html[data-bz-dark] .tcnote{color:#F4EEE4}

/* ── the Month Planner (monthplanner.js) · a month on Market Row ── */
.mpstage{gap:10px}
.mpstage .mphead,.mpstage .sbask,.mpstage .mpend{text-align:left;padding:12px 14px 10px}
.mphead .sbq{margin:2px 0 8px}
.mpbar{position:relative;height:12px}
.mpbar b{position:absolute;top:-4px;bottom:-4px;width:3px;margin-left:-1.5px;background:var(--ink);border-radius:2px}
.mpbill{position:relative}
.mpbill .big{font:800 30px var(--display);margin-top:4px}
.mpbill .small{margin:4px 0 0}
.mpbill.rolled{box-shadow:0 0 0 3px var(--spend),0 12px 30px rgb(40 25 5 / .25) !important}
.mpmoved{position:absolute;top:10px;right:10px;background:var(--spend);color:#fff;border:0}
.mpslips{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:3px}
.mpslips li.hit{font-weight:800}
.mpendsub{text-align:left;line-height:1.55}
.mpstage .choices .btn:disabled{opacity:.6}

/* ── Compound Climb's estimate (every five years) ── */
.ccask{text-align:left !important;padding:12px 14px !important}
.ccask .sbq{margin:4px 0 8px}
.ccest{display:flex;align-items:center;justify-content:center;gap:14px;margin:4px 0 10px}
.ccest .btn{min-width:52px;min-height:48px;font-size:22px;padding:0}
.ccest b{font:800 30px var(--display);min-width:3.2em;text-align:center;color:#2F6FD0}
.ccest-said{background:color-mix(in srgb,#2F6FD0 16%,var(--surface));color:var(--ink)}
html[data-bz-dark] .ccest b{color:#8DB6FF}`;
export function trainStyle() {
  if (typeof document === 'undefined' || !document.head || document.getElementById('train-css')) return;
  const el = document.createElement('style'); el.id = 'train-css'; el.textContent = CSS;
  document.head.appendChild(el);
}
