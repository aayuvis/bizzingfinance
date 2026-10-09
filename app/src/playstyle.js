/* playstyle.js — the styles of the Play games of docs/12 weeks 3–5 (Market Storm's plan, the
   Market Cup's series, Main Street's drawn street, the Market Game's Exchange hall), light and
   dark. They travel WITH the games: arcade.js and marketgame.js load on demand, and so does
   this, so the first screen (≤ 1.5 MB, test/browser.mjs) carries none of it. Injected once.
   It is plain CSS in a string; edit it as CSS. */
const CSS = `
/* play.css — the Play games of docs/12 weeks 3–5: Market Storm's plan, the Market Cup's
   series, Main Street's drawn street and the Market Game's Exchange hall. Light and dark. */

/* ── Market Storm · the plan is the game (docs/12 §2.5) ── */
.gplay .stacts{display:grid;gap:8px}
/* on a phone the way out sits right under the price, above the news and the shouting: the SELL
   button must be in reach the moment the storm starts, not below the fold */
@media (max-width:640px){
  .gplay .ststage > div:first-child{order:0}
  .gplay .ststage .stchart{order:1}
  .gplay .ststage .stacts{order:2}
  .gplay .ststage .stnews,.gplay .ststage .stshout,.gplay .ststage .stplan{order:3}
  .gplay .ststage .hint,.gplay .ststage > .grow{order:4}
}
.gplay .stcard{text-align:left;display:grid;gap:8px;padding:14px 16px;border-radius:var(--r-lg,16px)}
.gplay .stfacts{margin:0;padding-left:18px;display:grid;gap:3px;font-size:14px;font-weight:600;color:var(--ink)}
.gplay .stq{display:grid;gap:7px;padding:10px;border-radius:var(--r-md,12px);background:rgb(255 252 245 / .9);box-shadow:0 6px 16px rgb(40 25 5 / .14)}
.gplay .stq .eyebrow{background:none !important;padding:0 !important}
.gplay .stq.now{box-shadow:0 0 0 3px color-mix(in srgb,var(--action) 55%,transparent),0 6px 16px rgb(40 25 5 / .14)}
.gplay .stopt{display:flex;align-items:center;gap:9px;text-align:left;min-height:44px;color:var(--ink);padding:9px 14px}
.gplay .stopt .tk{flex:none;display:inline-grid;place-items:center;min-width:22px;height:22px;border-radius:6px;background:rgb(0 0 0 / .08);font:800 11px var(--mono,ui-monospace,monospace)}
.gplay .stopt.on{border-color:var(--action);background:var(--action-tint,#e3f2f4);box-shadow:0 0 0 2px var(--action)}
.gplay .stwords{font-weight:650;font-size:14.5px;margin:4px 0 0;color:var(--ink)}
.gplay .stnews{display:grid;gap:6px}
.gplay .sthead{display:grid;gap:3px;text-align:left;padding:9px 12px;border-radius:var(--r-md,12px);background:#FFFBF2;color:#1C2A2E;
  border-left:4px solid #1C2A2E;box-shadow:0 6px 16px rgb(40 25 5 / .18);font-family:Georgia,'Times New Roman',serif}
.gplay .sthead .eyebrow{background:none !important;padding:0 !important;color:#5b4a36}
.gplay .sthead b{font-size:14.5px;line-height:1.35}
.gplay .sthead.in{animation:stshout .5s cubic-bezier(.2,1.5,.4,1) both}
.gplay .stscore{align-self:stretch;background:rgb(255 252 245 / .93);border-radius:var(--r-md,12px);padding:10px;color:var(--ink)}
.gplay .stscore .eyebrow{background:none !important}
.gplay .stmoney{text-align:center}
html[data-bz-dark] .gplay .stq,html[data-bz-dark] .gplay .stscore{background:rgb(20 24 36 / .9)}
html[data-bz-dark] .gplay .stopt,html[data-bz-dark] .gplay .stfacts,html[data-bz-dark] .gplay .stwords,html[data-bz-dark] .gplay .stscore{color:#F4EEE4}
html[data-bz-dark] .gplay .stopt{background:#1d2130;border-color:rgb(255 255 255 / .18)}
html[data-bz-dark] .gplay .stopt.on{background:color-mix(in srgb,var(--action) 35%,#141824)}
html[data-bz-dark] .gplay .sthead{background:#1d2130;color:#F4EEE4;border-left-color:#F4EEE4}
html[data-bz-dark] .gplay .sthead .eyebrow{color:#cdbfa8}
@media (prefers-reduced-motion:reduce){.gplay .sthead.in{animation:none !important}}
:root[data-motion="reduced"] .gplay .sthead.in{animation:none !important}

/* ── Main Street · a drawn street (docs/12 §2.9): every square a shopfront with an awning
   in its price band, the bills in red, chance in envelope blue, pay day in gold, and the
   road itself running round the middle with its white line ── */
.msboard .mssq{padding-top:9px}
.msboard .mssq::before{content:"";position:absolute;left:0;right:0;top:0;height:7px;border-radius:6px 6px 0 0;
  background:repeating-linear-gradient(90deg,var(--aw,#C9B48A) 0 7px,#FFF8EC 7px 12px)}
.msboard .mssq[data-tier="1"]{--aw:#5FA87A}
.msboard .mssq[data-tier="2"]{--aw:#D98E3A}
.msboard .mssq[data-tier="3"]{--aw:#B8483E}
.msboard .mssq[data-t="market"]{--aw:#3E7FB8}
.msboard .mssq[data-t="bill"]::before{background:#C8463A}
.msboard .mssq[data-t="chance"]::before{background:repeating-linear-gradient(-45deg,#3E6FB8 0 5px,#FFF8EC 5px 9px,#C8463A 9px 14px,#FFF8EC 14px 18px)}
.msboard .mssq[data-t="start"]::before{background:#E6A72A}
.msboard .mssq[data-t="rest"]::before{background:#8A9AA0}
.msboard .msmid{box-shadow:0 0 0 7px #4A4E55;outline:2px dashed rgb(255 255 255 / .85);outline-offset:3.5px;margin:9px}
html[data-bz-dark] .msboard .msmid{box-shadow:0 0 0 7px #2A2D33}
.msbuy .mscush{font-weight:650;color:var(--grow)}
.msbuy .mscush.thin{color:var(--spend)}

/* ── The Market Cup · the season you were dealt (docs/12 §2.6) ── */
.gplay .stage .cupseason{align-self:center;color:var(--ink);background:rgb(255 252 245 / .93);border-radius:var(--r-md);padding:7px 12px;max-width:36em}
html[data-bz-dark] .gplay .stage .cupseason{color:#F4EEE4;background:rgb(20 24 36 / .92)}

/* ── The Market Game · the Exchange hall (docs/12 §2.7): the Exchange Quarter painted the
   full width of the column behind every screen, centred, veiled where the paper sits ── */
.m40hall{position:relative;isolation:isolate;border-radius:var(--r-xl,22px);padding:14px;overflow:hidden;
  background:linear-gradient(180deg,rgb(255 248 236 / .55) 0%,rgb(255 248 236 / .2) 28%,rgb(255 248 236 / .55) 100%),var(--hall) center top/cover no-repeat,#3a2c1c;
  box-shadow:0 18px 40px rgb(60 40 10 / .22),inset 0 0 0 1px rgb(255 255 255 / .22)}
html[data-bz-dark] .m40hall{background:linear-gradient(180deg,rgb(10 14 26 / .6) 0%,rgb(10 14 26 / .3) 28%,rgb(10 14 26 / .7) 100%),var(--hall) center top/cover no-repeat,#141824}
.m40hall .card{background:color-mix(in srgb,var(--surface) 94%,transparent);border:0;box-shadow:0 10px 26px rgb(40 25 5 / .2)}
.m40hall .m40door{display:flex;justify-content:center;margin:-4px auto -10px}
.m40hall .m40door img{width:min(52%,260px);height:auto;filter:drop-shadow(0 10px 16px rgb(40 25 5 / .35))}
.m40hall .m40title{text-align:center;font-size:30px;color:#fff;text-shadow:0 2px 12px rgb(0 0 0 / .55)}
.m40hall .m40leave{background:rgb(255 252 245 / .9);color:var(--ink)}
html[data-bz-dark] .m40hall .m40leave{background:rgb(20 24 36 / .9);color:#F4EEE4}
.m40how ol{margin:6px 0 8px;padding-left:20px;display:grid;gap:5px;font-size:14.5px}
.m40head{border-left:4px solid var(--action) !important}
.m40steps{list-style:none;margin:0;padding:0;display:flex;justify-content:center;gap:12px}
.m40steps button{display:grid;place-items:center;padding:0;width:44px;height:44px;border-radius:50%;border:2px solid rgb(255 255 255 / .9);background:rgb(255 252 245 / .92);color:var(--ink);font-weight:800;font-size:16px;box-shadow:0 4px 12px rgb(40 25 5 / .25)}
.m40steps li.on button{background:var(--action);color:var(--action-ink,#fff);border-color:var(--action)}
.m40steps li.done:not(.on) button{background:var(--grow);color:#fff;border-color:var(--grow)}
html[data-bz-dark] .m40steps button{background:rgb(20 24 36 / .92);color:#F4EEE4}
.m40nav .btn{min-height:48px}
`;
export function playStyles() {
  if (typeof document === 'undefined' || document.getElementById('bz-play-css')) return;
  const el = document.createElement('style'); el.id = 'bz-play-css'; el.textContent = CSS;
  document.head.appendChild(el);
}
playStyles();
