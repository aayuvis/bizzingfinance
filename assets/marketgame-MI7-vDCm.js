import{w as le,W as K,r as V,C as U,m as w,k as ce,R as he,s as X,e as c,i as J,a as pe}from"./index-jyCZiXKF.js";import{COMPANIES as B,SECTORS as F,byId as M}from"./companies-CS4VQeKL.js";import{byLevel as L,PESTEL as ue}from"./events-u4iye1A4.js";const Q=40,v={baseMultiple:16,multOnGrowth:.55,multOnRate:.075,multOnDisrupt:-6,multFloor:4,multCeil:45,growthFloor:4.5,growthHalfLife:10,interestSpread:1.8,shockHeal:.55,eventsPerYear:{macro:1.1,country:.9,sector:.7,company:.55}};function j(e,s){const n=e.reduce((o,t)=>o+t.w,0);let a=s()*n;for(const o of e)if(a-=o.w,a<=0)return o;return e[e.length-1]}function ve(e,s){const n=V((e||1)^523124044),a=Array.from({length:s},()=>[]),o=(t,r,l)=>{t<s&&a[t].push({...r,year:t,scope:l})};for(let t=0;t<s;t++)["macro","country"].forEach(r=>{let l=v.eventsPerYear[r];for(;l>0;)n()<Math.min(1,l)&&o(t,j(L[r],n),{kind:r}),l-=1}),F.forEach(r=>{n()<v.eventsPerYear.sector&&o(t,j(L.sector,n),{kind:"sector",sector:r.id})}),B.forEach(r=>{n()<v.eventsPerYear.company&&o(t,j(L.company,n),{kind:"company",company:r.id})});return a}function me(e,s){return e.scope.kind==="macro"||e.scope.kind==="country"?!0:e.scope.kind==="sector"?e.scope.sector===s.sector:e.scope.company===s.id}function ye(e,s=Q){const n=le(e,s*K+4),a=ve(e,s),o=V((e||1)^2007643084),t=()=>(o()+o()+o()-1.5)*2,r={};return B.forEach(l=>{const i=l.dna;let h=i.rev0,d=i.margin,f=0;const m=[],T=[];for(let p=0;p<s;p++){const b=n[Math.min(n.length-1,p*K)],g=a[p].filter($=>me($,l));g.forEach($=>m.push({e:$,left:$.years}));let O=0,N=0,D=0,G=0;for(let $=m.length-1;$>=0;$--){const k=m[$],E=k.e.eff,C=k.left/k.e.years;O+=(E.rev||0)*C,N+=(E.margin||0)*C,D+=(E.mult||0)*C,k.left===k.e.years&&(G+=E.shock||0),k.left--,k.left<=0&&m.splice($,1)}const te=(b.growth-U.growthMean)*i.cyc,se=b.inflation*i.pricing,ae=Math.pow(.5,p/v.growthHalfLife),ne=(v.growthFloor+(i.growth-v.growthFloor)*ae+te+se)/100+O+t()*.012;h=Math.max(20,h*(1+ne));const re=b.inflation*(1-i.pricing)/100*.35,oe=i.disrupt*.0012;d=Math.max(.005,Math.min(.55,i.margin-re-oe*p+N+t()*.004));const _=h*d,H=h*i.debt,q=H*(b.rate+v.interestSpread)/100,R=_-q,ie=Math.max(0,R)*i.payout;let I=v.baseMultiple+v.multOnGrowth*i.growth+v.multOnDisrupt*i.disrupt-v.multOnRate*v.baseMultiple*(b.rate-U.rateNeutral)*i.rateSens;I*=1+D,I=Math.max(v.multFloor,Math.min(v.multCeil,I)),f=f*v.shockHeal+G;const de=Math.max(h*.05,R*I)*(1+f);T.push({year:p,revenue:h,margin:d,ebit:_,interest:q,net:R,dividend:ie,debt:H,mult:I,value:de,shock:f,rate:b.rate,inflation:b.inflation,growth:b.growth,events:g})}r[l.id]=T}),{world:n,calendar:a,years:r}}function fe(e,s){const n=e.years[s],a=n[0].value;return n.map(o=>o.value/a*100)}function we(e,s,n){const a=e.years[s],o=M[s];if(n<=0||!a||!a[n-1])return{move:0,reasons:[],events:a&&a[Math.max(0,n)]&&a[Math.max(0,n)].events||[]};const t=a[n-1],r=a[n],l=r.value/t.value-1,i=[],h=r.revenue/t.revenue-1,d=r.margin-t.margin,f=r.mult/t.mult-1;return Math.abs(h)>.02&&i.push({w:Math.abs(h),t:`it sold ${h>0?"more":"less"} — revenue ${h>0?"up":"down"} ${Math.abs(h*100).toFixed(0)}%`}),Math.abs(d)>.004&&i.push({w:Math.abs(d)*12,t:`it kept ${d>0?"more":"less"} of each rupee — margin ${d>0?"up":"down"} ${Math.abs(d*100).toFixed(1)} points`}),Math.abs(f)>.03&&i.push({w:Math.abs(f),t:`people would pay ${f>0?"more":"less"} per rupee of profit — the multiple went ${t.mult.toFixed(0)} to ${r.mult.toFixed(0)}`}),Math.abs(r.rate-t.rate)>.4&&i.push({w:Math.abs(r.rate-t.rate)/8*(o.dna.rateSens||1),t:`the bank rate moved ${t.rate.toFixed(2)}% to ${r.rate.toFixed(2)}%, and this one carries ${o.dna.debt.toFixed(1)}x revenue in debt`}),{move:l,reasons:i.sort((m,T)=>T.w-m.w).map(m=>m.t),events:r.events}}const u=e=>(e*100).toFixed(1)+"%",y=e=>w(Math.round(e));function be(e,s,n){const a=M[s],o=e.years[s],t=o[n],r=n>0?o[n-1]:null,l=d=>r?t[d]-r[d]:0,i=d=>r&&r[d]?t[d]/r[d]-1:0,h=F.find(d=>d.id===a.sector);return{company:a,year:n,sector:h,lines:[{k:"Revenue",v:y(t.revenue),d:r?u(i("revenue")):"",up:l("revenue")>=0},{k:"Operating profit",v:y(t.ebit),d:r?u(i("ebit")):"",up:l("ebit")>=0},{k:"Margin",v:u(t.margin),d:r?((t.margin-r.margin)*100).toFixed(1)+" pts":"",up:l("margin")>=0},{k:"Interest paid",v:y(t.interest),d:r?u(i("interest")):"",up:l("interest")<=0},{k:"Profit after interest",v:y(t.net),d:r?u(i("net")):"",up:l("net")>=0},{k:"Dividend paid",v:y(t.dividend),d:r?u(i("dividend")):"",up:l("dividend")>=0},{k:"Borrowings",v:y(t.debt),d:r?u(i("debt")):"",up:l("debt")<=0}],ratios:[{k:"Profit per rupee of sales",v:u(t.net/t.revenue),note:"Of every rupee that came in, this much was still there at the end."},{k:"Interest as a share of profit",v:t.ebit>0?u(t.interest/t.ebit):"more than it earned",note:t.ebit<=0||t.interest>t.ebit?"It did not earn enough to cover the interest. That is how businesses fail.":t.interest/t.ebit>.4?"A large slice of what it earns goes straight to the lender.":"Comfortably covered."},{k:"Borrowings against sales",v:(t.debt/t.revenue).toFixed(2)+"x",note:"How many years of sales it would take to repay everything."},{k:"Paid out to owners",v:u(t.dividend/Math.max(1,t.net)),note:"The rest was kept inside the business."},{k:"What people pay per rupee of profit",v:t.net>0?t.mult.toFixed(1)+"x":"n/a",note:t.net>0?"The multiple. It moves with the bank rate and with the mood.":"It made a loss, so there is no profit to price. That is the point."}],events:t.events,world:{rate:t.rate,inflation:t.inflation,growth:t.growth}}}const ge=["It has been a year of real progress, and I want to begin by thanking every one of our people for it.","I am pleased to report a year in which the strategy we set out has done exactly what we said it would.","This was a strong year, and a satisfying one."],$e=["This was a year of two halves, and I will not pretend the second was the easier one.","We made real progress in a market that gave us very little help.","A year of building rather than harvesting."],xe=["I will not dress this up: it has been a difficult year.","This was a disappointing year, and the board takes responsibility for it.","We entered the year with confidence and we leave it wiser."];function ke(e,s,n){const a=M[s],o=e.years[s],t=o[n],r=n>0?o[n-1]:null,l=r?t.revenue/r.revenue-1:0,i=r?t.net/Math.max(1,Math.abs(r.net))-1:0,h=r?t.margin<r.margin:!1,d=g=>g[(n*7+a.id.length*3)%g.length],f=i>.08&&l>.04,m=i<-.1||t.net<0,T=d(f?ge:m?xe:$e),p=[];return p.push(r?l>=0?`Revenue grew ${u(l)} to ${y(t.revenue)}.`:`Revenue fell ${u(-l)} to ${y(t.revenue)}, which is not where we wanted to be.`:`In our first year, revenue was ${y(t.revenue)}.`),h?p.push(m?`Margins came under pressure, at ${u(t.margin)} against ${u(r.margin)}.`:`We chose to invest ahead of demand, and margins reflect that at ${u(t.margin)}.`):r&&p.push(`Margins improved to ${u(t.margin)}, which reflects discipline on cost.`),t.interest/Math.max(1,t.ebit)>.45&&p.push(`Our interest bill of ${y(t.interest)} remains the single largest call on operating profit, and reducing it is a priority.`),t.dividend>0&&r&&t.dividend>=r.dividend?p.push(`The board is recommending a dividend of ${y(t.dividend)}, which we regard as a signal of confidence.`):r&&t.dividend<r.dividend*.9&&p.push(`The board has taken the difficult decision to reduce the dividend to ${y(t.dividend)} in order to protect the balance sheet.`),(t.events||[]).slice(0,2).forEach(g=>{p.push(g.scope.kind==="company"?`You will have seen that ${g.head.toLowerCase()}. We have addressed this directly.`:`The wider picture — ${g.head.toLowerCase()} — shaped the year for everyone in ${F.find(O=>O.id===a.sector).name.toLowerCase()}.`)}),{company:a,year:n,open:T,body:p,close:f?"We enter the coming year with confidence and with the balance sheet to act on it.":m?"We have a clear plan, and we expect the coming year to be one of repair.":"There is work to do, and we know what it is.",omissions:[h&&!m?'Called a margin squeeze "investment ahead of demand".':null,t.debt/t.revenue>1.5?`Did not mention that borrowings are ${(t.debt/t.revenue).toFixed(1)}x revenue.`:null,t.net<0?"Led with revenue because profit was negative.":null].filter(Boolean)}}const Me=()=>ce(he.s),S=[{id:0,name:"The long boom",from:0,years:10,blurb:"Money is cheap and everything is going up. The hard part is telling luck from judgement."},{id:1,name:"When it turned",from:10,years:10,blurb:"Rates rise, and the businesses that borrowed to grow find out what it cost."},{id:2,name:"The squeeze",from:20,years:10,blurb:"Prices climb faster than wages. Who can pass it on, and who eats it?"},{id:3,name:"The new thing",from:30,years:10,blurb:"Something arrives that makes half this list look old. Which half?"}];function Z(e,s){const n=[];return F.forEach((a,o)=>{const t=B.filter(r=>r.sector===a.id);n.push(t[(e+s*7+o*3)%t.length])}),n}const Te=[{id:"rate",t:"The bank raising interest rates"},{id:"infl",t:"Its costs rising faster than it can charge"},{id:"slump",t:"A recession cutting what people buy"},{id:"newtech",t:"Rivals, or new tastes, taking its customers"},{id:"rule",t:"One ruling, accident or failure it cannot undo"}];function ee(e){const s=e.dna,n=e.hurt,a=`Its sheet says it: “${e.risk}”`,o={rate:`${a} It carries ${s.debt.toFixed(1)}× its revenue in borrowings and a rate sensitivity of ${s.rateSens.toFixed(1)}: when money gets dearer, this one feels it first.`,infl:`${a} It can pass on only about ${Math.round(s.pricing*100)}% of a cost rise; the rest comes straight out of the margin.`,slump:`${a} Its earnings swing ${s.cyc.toFixed(1)}× as hard as the economy, so a mild slowdown is not mild here.`,newtech:`${a} Its customers can go elsewhere, and nothing in the accounts warns you before they do.`,rule:`${a} One decision or one bad event it cannot control can undo years of profit.`}[n];return{options:Te.slice(),answer:n,why:o}}function Fe(e){return{seed:e,act:null,year:0,phase:"pick",studied:[],assessed:{},cash:1e4,holdings:{},opened:{},log:[],score:{right:0,asked:0}}}const Y=new Map;function x(e){return Y.has(e)||Y.set(e,ye(e,Q)),Y.get(e)}function Se(e){const s=x(e.seed);return Object.entries(e.holdings).reduce((n,[a,o])=>n+o*s.years[a][e.year].value,0)}function W(e){return e.cash+Se(e)}function Ye(e,s){return e.act=s,e.year=S[s].from,e.phase="study",e.studied=[],e.assessed={},e.holdings={},e.cash=1e4,e.startWorth=1e4,e.log=[],e.score={right:0,asked:0},e}function Be(e,s){e.studied.includes(s)||e.studied.push(s)}function Ne(e,s,n){const a=M[s],o=ee(a),t=n===o.answer;return e.assessed[s]={pick:n,right:t,answer:o.answer},e.score.asked++,t&&e.score.right++,{right:t,answer:o.answer,why:o.why,label:o.options.find(r=>r.id===o.answer).t}}function De(e,s,n){const a=x(e.seed),o=Math.min(Math.round(n),e.cash);if(o<=0||!e.studied.includes(s))return 0;const t=a.years[s][e.year].value;return e.cash-=o,e.holdings[s]=(e.holdings[s]||0)+o/t,o}function Ge(e,s){const n=x(e.seed),a=e.holdings[s]||0;if(a<=0)return 0;const o=Math.round(a*n.years[s][e.year].value);return e.holdings[s]=0,e.cash+=o,o}function _e(e){const s=S[e.act];if(e.year>=s.from+s.years-1)return e.phase="review",null;const n=W(e);e.year++;const a=x(e.seed),o=W(e),t=a.calendar[e.year].filter(r=>r.scope.kind!=="company"||e.studied.includes(r.scope.company));return e.log.unshift({year:e.year,before:n,after:o,events:t}),e.log.length>12&&(e.log.length=12),{year:e.year,before:n,after:o,events:t}}const Ie={macro:"The whole economy",country:"The country",sector:"Its industry",company:"This company"},P=e=>e>=0?"var(--grow)":"var(--spend)",z=e=>e>=0?"▲":"▼";function He(){const e=Me();e.game||(e.game=Fe(e.market&&e.market.seed||1));const s=e.game;return s.phase==="pick"?Oe():s.phase==="study"?Ee(s):s.phase==="invest"?Pe(s):s.phase==="review"?Ae(s):ze(s)}function A(e,s,n){const a=e.act===null?null:S[e.act];return`<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    <h1 class="sr">The Market Game</h1>
    ${a?`<div class="card" style="border-color:var(--action)">
      <div class="row"><div class="grow"><div class="eyebrow">Act ${e.act+1} of 4 · ${c(a.name)}</div>
        <h3 style="font-size:17px;margin:1px 0">Year ${e.year-a.from+1} of ${a.years}</h3>
        <p class="small muted">${c(n||a.blurb)}</p></div>
        <div style="text-align:right"><div class="eyebrow">Worth</div>
          <div class="big" style="font-size:20px">${w(W(e))}</div></div></div>
    </div>`:""}
    ${s}</div>`}function Oe(e){return`<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    <h1 style="font-size:28px">The Market Game</h1>
    ${X("bo","Forty companies, forty years, and none of them exist. Everything that happens to them happens for a reason you can find. Pick a decade.")}
    ${S.map(s=>`<button class="card" data-act="mgAct" data-arg="${s.id}" style="text-align:left;width:100%">
      <div class="eyebrow">Act ${s.id+1} · years ${s.from+1}–${s.from+s.years}</div>
      <h3 style="font-size:19px;margin:3px 0 4px">${c(s.name)}</h3>
      <p class="small muted">${c(s.blurb)}</p></button>`).join("")}
    <p class="small muted" style="text-align:center">You can only buy what you have studied, and you
      can only go long. Nothing here is real money or a real company.</p>
  </div>`}function Ee(e){const s=Z(e.seed,e.act),n=x(e.seed),a=e.opened.co?M[e.opened.co]:null;if(a)return A(e,We(e,a,n),"Read it, then say what would hurt it.");const o=e.studied.length>=3;return A(e,`
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Study the market</div>
        <p class="small muted">Read at least three before you may invest. The report is the truth;
          the letter is what they would like you to think.</p></div>
        <span class="pill ${o?"grow":""}">${e.studied.length}/8 read</span></div>
    </div>
    ${s.map(t=>{const r=e.studied.includes(t.id),l=e.assessed[t.id],i=F.find(h=>h.id===t.sector);return`<button class="card" data-act="mgOpen" data-arg="${t.id}" style="text-align:left;width:100%">
        <div class="row">${J("sec-"+t.sector,i.em,28)}
          <div class="grow"><b style="font-size:15px">${c(t.name)}</b>
            <span class="pill" style="margin-left:6px">${t.ticker}</span>
            <p class="small muted">${c(t.what)}</p></div>
          ${l?`<span class="pill ${l.right?"grow":""}">${l.right?"✓ assessed":"assessed"}</span>`:r?'<span class="pill">read</span>':""}
        </div></button>`}).join("")}
    <button class="btn wide" data-act="mgToInvest" ${o?"":"disabled"}>
      ${o?"Ready to invest →":`Read ${3-e.studied.length} more first`}</button>`)}function We(e,s,n){const a=e.year,o=be(n,s.id,a),t=ke(n,s.id,a),r=F.find(d=>d.id===s.sector),l=ee(s),i=e.assessed[s.id],h=fe(n,s.id).slice(Math.max(0,a-8),a+1);return`
    <div class="card">
      <div class="row">${J("sec-"+s.sector,r.em,34)}
        <div class="grow"><h3 style="font-size:19px;margin:0">${c(s.name)}</h3>
          <span class="pill">${s.ticker}</span> <span class="small muted">${c(r.name)}</span></div></div>
      <p style="margin-top:10px">${c(s.what)}</p>
      <div class="sep" style="margin:11px 0"></div>
      <div class="small"><b>How it earns</b> — ${c(s.how)}</div>
      <div class="small" style="margin-top:5px"><b>Who pays</b> — ${c(s.who)}</div>
      <div class="small" style="margin-top:5px"><b>What could hurt it</b> — ${c(s.risk)}</div>
      <div class="small muted" style="margin-top:8px">Model: ${c(s.model)}</div>
      ${h.length>1?pe(h,300,44,"var(--action)"):""}
      <p class="small muted">${h.length>2?`Its price over the last ${h.length-1} years.`:h.length===2?"Its price over the last year.":"Its first year: no price history yet."}</p>
    </div>

    <div class="card">
      <div class="eyebrow">Annual report · year ${a+1}</div>
      <div style="margin-top:9px">
        ${o.lines.map(d=>`<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line-soft)">
          <span class="grow small">${d.k}</span>
          <b style="font-variant-numeric:tabular-nums">${d.v}</b>
          <span class="small" style="min-width:62px;text-align:right;color:${d.up?"var(--grow)":"var(--spend)"}">${d.d}</span></div>`).join("")}
      </div>
      <div class="eyebrow" style="margin-top:13px">What those mean</div>
      ${o.ratios.map(d=>`<div style="margin-top:8px">
        <div class="row"><span class="grow small"><b>${c(d.k)}</b></span>
          <b style="font-variant-numeric:tabular-nums">${d.v}</b></div>
        <div class="small muted">${c(d.note)}</div></div>`).join("")}
    </div>

    <div class="card" style="background:var(--surface2)">
      <div class="eyebrow">Letter to shareholders</div>
      <p style="margin-top:8px;font-style:italic">${c(t.open)}</p>
      ${t.body.map(d=>`<p class="small" style="margin-top:7px">${c(d)}</p>`).join("")}
      <p class="small" style="margin-top:7px;font-style:italic">${c(t.close)}</p>
      ${i&&t.omissions.length?`<div style="margin-top:11px;background:var(--gold-tint);
        color:var(--treasure-deep);border-radius:var(--r-md);padding:10px 12px">
        <div class="eyebrow" style="color:var(--treasure-deep)">What it did not say</div>
        ${t.omissions.map(d=>`<div class="small" style="margin-top:4px">· ${c(d)}</div>`).join("")}
      </div>`:""}
    </div>

    <div class="card" style="border-color:var(--action)">
      <div class="eyebrow">Your assessment</div>
      <h3 style="font-size:17px;margin:3px 0 9px">What would hurt this company most?</h3>
      ${i?`<div style="background:${i.right?"var(--grow-tint)":"var(--spend-tint)"};
            color:${i.right?"var(--grow)":"var(--spend)"};padding:11px 13px;border-radius:var(--r-md);font-weight:700">
            ${i.right?"Yes — ":"Not quite. The biggest is "}${c(l.options.find(d=>d.id===l.answer).t.toLowerCase())}</div>
          <p class="small muted" style="margin-top:9px">${c(l.why)}</p>`:`<div class="stack" style="gap:8px">${l.options.map(d=>`<button class="opt" data-act="mgAssess" data-arg="${s.id}:${d.id}">${c(d.t)}</button>`).join("")}</div>`}
      <button class="btn wide ghost" style="margin-top:12px" data-act="mgClose">← Back to the list</button>
    </div>`}function Pe(e){const s=x(e.seed);return A(e,`
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Put your money somewhere</div>
        <p class="small muted">Only what you studied. Long only — you are buying a share of a
          business, not betting against one.</p></div>
        <div style="text-align:right"><div class="eyebrow">Cash</div>
          <div class="big" style="font-size:19px">${w(e.cash)}</div></div></div>
    </div>
    ${e.studied.map(n=>{const a=M[n],o=s.years[n][e.year].value,t=e.holdings[n]||0,r=e.assessed[n];return`<div class="card">
        <div class="row"><div class="grow"><b style="font-size:15px">${c(a.name)}</b>
          <span class="pill" style="margin-left:5px">${a.ticker}</span>
          <p class="small muted">${c(a.model)}</p></div>
          <div style="text-align:right"><div class="small muted">held</div>
            <b>${t>0?w(t*o):"—"}</b></div></div>
        ${r&&!r.right?'<p class="small" style="margin-top:6px;color:var(--spend)">You misread what its main risk was.</p>':""}
        <div class="row" style="gap:7px;margin-top:9px;flex-wrap:wrap">
          <button class="btn sm" data-act="mgBuy" data-arg="${n}:1000" ${e.cash<1e3?"disabled":""}>Buy ${w(1e3)}</button>
          <button class="btn sm ghost" data-act="mgBuy" data-arg="${n}:2500" ${e.cash<2500?"disabled":""}>${w(2500)}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="mgSell" data-arg="${n}" ${t<=0?"disabled":""}>Sell</button>
        </div></div>`}).join("")}
    <button class="btn wide" data-act="mgPlay" ${Object.values(e.holdings).every(n=>!n)?"disabled":""}>
      Start the decade →</button>`)}function ze(e){const s=x(e.seed),n=S[e.act],a=e.log[0],o=s.years[e.studied[0]][e.year];return A(e,`
    ${a?`<div class="card" style="border-color:${a.after>=a.before?"var(--grow)":"var(--spend)"}">
      <div class="row"><div class="grow"><div class="eyebrow">Year ${a.year-n.from+1}</div>
        <h3 style="font-size:18px;margin:2px 0;color:${P(a.after-a.before)}">
          ${z(a.after-a.before)} ${w(Math.abs(a.after-a.before))}</h3></div></div>
      ${a.events.length?`<div class="stack" style="gap:8px;margin-top:10px">
        ${a.events.slice(0,4).map(t=>`<div style="background:var(--surface2);border:1px solid var(--line);
          border-radius:var(--r-md);padding:10px 12px">
          <div class="row"><span class="pill">${c(Ie[t.scope.kind]||t.scope.kind)}</span>
            <span class="pill" style="margin-left:5px">${c(ue[t.tag]||t.tag)}</span></div>
          <b style="font-size:14px;display:block;margin-top:5px">${c(t.head)}</b>
          <div class="small muted">${c(t.body)}</div></div>`).join("")}
      </div>`:'<p class="small muted" style="margin-top:8px">A quiet year. They happen.</p>'}
    </div>`:""}

    <div class="card">
      <div class="eyebrow">The world</div>
      <div class="row" style="gap:16px;margin-top:8px;flex-wrap:wrap">
        <span><div class="eyebrow">Bank rate</div><b style="font-size:16px">${o.rate.toFixed(2)}%</b></span>
        <span><div class="eyebrow">Prices</div><b style="font-size:16px">${o.inflation.toFixed(1)}%</b></span>
        <span><div class="eyebrow">The economy</div><b style="font-size:16px">${o.growth>=0?"+":""}${o.growth.toFixed(1)}%</b></span>
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What you hold</div>
      <div class="stack" style="gap:8px;margin-top:10px">
        ${e.studied.filter(t=>(e.holdings[t]||0)>0).map(t=>{const r=M[t],l=s.years[t][e.year].value,i=Object.assign({move:0,reasons:[]},we(s,t,e.year));return`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:10px 12px">
            <div class="row"><b class="grow" style="font-size:14px">${c(r.name)}</b>
              <b style="color:${P(i.move)}">${z(i.move)} ${Math.abs(i.move*100).toFixed(1)}%</b>
              <b style="margin-left:9px;font-variant-numeric:tabular-nums">${w(e.holdings[t]*l)}</b></div>
            ${i.reasons.length?`<div class="small muted" style="margin-top:5px">Because ${c(i.reasons[0])}.</div>`:""}
            <button class="btn ghost sm" style="margin-top:8px" data-act="mgSell" data-arg="${t}">Sell it</button>
          </div>`}).join("")}
        ${e.cash>0?`<div class="row"><span class="grow small muted">Cash, doing nothing</span><b>${w(e.cash)}</b></div>`:""}
      </div>
    </div>
    <button class="btn wide" data-act="mgNext">Next year →</button>`)}function Ae(e){const s=S[e.act],n=W(e),a=e.startWorth||1e4,o=n/a-1,t=x(e.seed),l=Z(e.seed,e.act).map(i=>({co:i,m:t.years[i.id][e.year].value/t.years[i.id][s.from].value-1})).sort((i,h)=>h.m-i.m);return`<div class="stack">
    <div class="card" style="border-color:var(--gold);background:var(--gold-tint)">
      <div style="text-align:center"><div style="font-size:40px">${o>=0?"📈":"📉"}</div>
        <div class="eyebrow">${c(s.name)} · ten years</div>
        <h2 style="margin:4px 0 2px;font-size:26px">${w(n)}</h2>
        <p style="color:${P(o)};font-weight:800">${z(o)} ${Math.abs(o*100).toFixed(0)}% from ${w(a)}</p></div>
    </div>
    <div class="card">
      <div class="eyebrow">How well you read them</div>
      <h3 style="font-size:20px;margin:4px 0">${e.score.right} of ${e.score.asked} right</h3>
      <p class="small muted">This is the number that matters. Money over ten years is partly the
        decade you were handed; whether you could see what would hurt a business is yours.</p>
    </div>
    <div class="card">
      <div class="eyebrow">What the decade did</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${l.map(i=>`<div class="row"><span class="grow small">${c(i.co.name)}</span>
          <b style="color:${P(i.m)};font-variant-numeric:tabular-nums">${z(i.m)} ${Math.abs(i.m*100).toFixed(0)}%</b>
          <span class="pill" style="margin-left:7px">${(e.holdings[i.co.id]||0)>0?"held":"—"}</span></div>`).join("")}
      </div>
    </div>
    ${X("bea",o>=0?"A good decade. Now do the next one, where the rate goes the other way, and find out how much of that was you.":"A hard decade. Everyone gets one. The question is whether the things you got wrong were the things you said would go wrong.")}
    <button class="btn wide" data-act="mgPick">Choose another decade →</button>
  </div>`}export{S as ACTS,Te as ASSESS,Ie as SCOPE_WORD,_e as advance,Ne as assess,ee as assessOptions,De as buy,Z as castFor,W as netWorth,Fe as newGame,Se as portfolioValue,Ge as sell,x as simFor,Ye as startAct,Be as study,He as viewMarketGame};
