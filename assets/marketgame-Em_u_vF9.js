import{w as le,W as K,C as U,r as V,m as w,k as ce,R as he,s as X,e as c,i as J,a as pe}from"./index-BvLUEOuf.js";import{COMPANIES as B,SECTORS as F,byId as M}from"./companies-COLaXJuO.js";import{byLevel as L}from"./events-u4iye1A4.js";const Q=40,v={baseMultiple:16,multOnGrowth:.55,multOnRate:.075,multOnDisrupt:-6,multFloor:4,multCeil:45,growthFloor:4.5,growthHalfLife:10,interestSpread:1.8,shockHeal:.55,eventsPerYear:{macro:1.1,country:.9,sector:.7,company:.55}};function j(e,s){const a=e.reduce((r,t)=>r+t.w,0);let n=s()*a;for(const r of e)if(n-=r.w,n<=0)return r;return e[e.length-1]}function ue(e,s){const a=V((e||1)^523124044),n=Array.from({length:s},()=>[]),r=(t,i,l)=>{t<s&&n[t].push({...i,year:t,scope:l})};for(let t=0;t<s;t++)["macro","country"].forEach(i=>{let l=v.eventsPerYear[i];for(;l>0;)a()<Math.min(1,l)&&r(t,j(L[i],a),{kind:i}),l-=1}),F.forEach(i=>{a()<v.eventsPerYear.sector&&r(t,j(L.sector,a),{kind:"sector",sector:i.id})}),B.forEach(i=>{a()<v.eventsPerYear.company&&r(t,j(L.company,a),{kind:"company",company:i.id})});return n}function ve(e,s){return e.scope.kind==="macro"||e.scope.kind==="country"?!0:e.scope.kind==="sector"?e.scope.sector===s.sector:e.scope.company===s.id}function me(e,s=Q){const a=le(e,s*K+4),n=ue(e,s),r=V((e||1)^2007643084),t=()=>(r()+r()+r()-1.5)*2,i={};return B.forEach(l=>{const o=l.dna;let h=o.rev0,d=o.margin,f=0;const m=[],T=[];for(let p=0;p<s;p++){const b=a[Math.min(a.length-1,p*K)],g=n[p].filter($=>ve($,l));g.forEach($=>m.push({e:$,left:$.years}));let I=0,N=0,D=0,G=0;for(let $=m.length-1;$>=0;$--){const k=m[$],P=k.e.eff,C=k.left/k.e.years;I+=(P.rev||0)*C,N+=(P.margin||0)*C,D+=(P.mult||0)*C,k.left===k.e.years&&(G+=P.shock||0),k.left--,k.left<=0&&m.splice($,1)}const te=(b.growth-U.growthMean)*o.cyc,se=b.inflation*o.pricing,ae=Math.pow(.5,p/v.growthHalfLife),ne=(v.growthFloor+(o.growth-v.growthFloor)*ae+te+se)/100+I+t()*.012;h=Math.max(20,h*(1+ne));const re=b.inflation*(1-o.pricing)/100*.35,ie=o.disrupt*.0012;d=Math.max(.005,Math.min(.55,o.margin-re-ie*p+N+t()*.004));const H=h*d,_=h*o.debt,q=_*(b.rate+v.interestSpread)/100,R=H-q,oe=Math.max(0,R)*o.payout;let W=v.baseMultiple+v.multOnGrowth*o.growth+v.multOnDisrupt*o.disrupt-v.multOnRate*v.baseMultiple*(b.rate-U.rateNeutral)*o.rateSens;W*=1+D,W=Math.max(v.multFloor,Math.min(v.multCeil,W)),f=f*v.shockHeal+G;const de=Math.max(h*.05,R*W)*(1+f);T.push({year:p,revenue:h,margin:d,ebit:H,interest:q,net:R,dividend:oe,debt:_,mult:W,value:de,shock:f,rate:b.rate,inflation:b.inflation,growth:b.growth,events:g})}i[l.id]=T}),{world:a,calendar:n,years:i}}function ye(e,s){const a=e.years[s],n=a[0].value;return a.map(r=>r.value/n*100)}function fe(e,s,a){const n=e.years[s],r=M[s];if(a<=0)return[];const t=n[a-1],i=n[a],l=i.value/t.value-1,o=[],h=i.revenue/t.revenue-1,d=i.margin-t.margin,f=i.mult/t.mult-1;return Math.abs(h)>.02&&o.push({w:Math.abs(h),t:`it sold ${h>0?"more":"less"} — revenue ${h>0?"up":"down"} ${Math.abs(h*100).toFixed(0)}%`}),Math.abs(d)>.004&&o.push({w:Math.abs(d)*12,t:`it kept ${d>0?"more":"less"} of each rupee — margin ${d>0?"up":"down"} ${Math.abs(d*100).toFixed(1)} points`}),Math.abs(f)>.03&&o.push({w:Math.abs(f),t:`people would pay ${f>0?"more":"less"} per rupee of profit — the multiple went ${t.mult.toFixed(0)} to ${i.mult.toFixed(0)}`}),Math.abs(i.rate-t.rate)>.4&&o.push({w:Math.abs(i.rate-t.rate)/8*(r.dna.rateSens||1),t:`the bank rate moved ${t.rate.toFixed(2)}% to ${i.rate.toFixed(2)}%, and this one carries ${r.dna.debt.toFixed(1)}x revenue in debt`}),{move:l,reasons:o.sort((m,T)=>T.w-m.w).map(m=>m.t),events:i.events}}const u=e=>(e*100).toFixed(1)+"%",y=e=>w(Math.round(e));function we(e,s,a){const n=M[s],r=e.years[s],t=r[a],i=a>0?r[a-1]:null,l=d=>i?t[d]-i[d]:0,o=d=>i&&i[d]?t[d]/i[d]-1:0,h=F.find(d=>d.id===n.sector);return{company:n,year:a,sector:h,lines:[{k:"Revenue",v:y(t.revenue),d:i?u(o("revenue")):"",up:l("revenue")>=0},{k:"Operating profit",v:y(t.ebit),d:i?u(o("ebit")):"",up:l("ebit")>=0},{k:"Margin",v:u(t.margin),d:i?((t.margin-i.margin)*100).toFixed(1)+" pts":"",up:l("margin")>=0},{k:"Interest paid",v:y(t.interest),d:i?u(o("interest")):"",up:l("interest")<=0},{k:"Profit after interest",v:y(t.net),d:i?u(o("net")):"",up:l("net")>=0},{k:"Dividend paid",v:y(t.dividend),d:i?u(o("dividend")):"",up:l("dividend")>=0},{k:"Borrowings",v:y(t.debt),d:i?u(o("debt")):"",up:l("debt")<=0}],ratios:[{k:"Profit per rupee of sales",v:u(t.net/t.revenue),note:"Of every rupee that came in, this much was still there at the end."},{k:"Interest as a share of profit",v:t.ebit>0?u(t.interest/t.ebit):"more than it earned",note:t.ebit<=0||t.interest>t.ebit?"It did not earn enough to cover the interest. That is how businesses fail.":t.interest/t.ebit>.4?"A large slice of what it earns goes straight to the lender.":"Comfortably covered."},{k:"Borrowings against sales",v:(t.debt/t.revenue).toFixed(2)+"x",note:"How many years of sales it would take to repay everything."},{k:"Paid out to owners",v:u(t.dividend/Math.max(1,t.net)),note:"The rest was kept inside the business."},{k:"What people pay per rupee of profit",v:t.net>0?t.mult.toFixed(1)+"x":"n/a",note:t.net>0?"The multiple. It moves with the bank rate and with the mood.":"It made a loss, so there is no profit to price. That is the point."}],events:t.events,world:{rate:t.rate,inflation:t.inflation,growth:t.growth}}}const be=["It has been a year of real progress, and I want to begin by thanking every one of our people for it.","I am pleased to report a year in which the strategy we set out has done exactly what we said it would.","This was a strong year, and a satisfying one."],ge=["This was a year of two halves, and I will not pretend the second was the easier one.","We made real progress in a market that gave us very little help.","A year of building rather than harvesting."],$e=["I will not dress this up: it has been a difficult year.","This was a disappointing year, and the board takes responsibility for it.","We entered the year with confidence and we leave it wiser."];function xe(e,s,a){const n=M[s],r=e.years[s],t=r[a],i=a>0?r[a-1]:null,l=i?t.revenue/i.revenue-1:0,o=i?t.net/Math.max(1,Math.abs(i.net))-1:0,h=i?t.margin<i.margin:!1,d=g=>g[(a*7+n.id.length*3)%g.length],f=o>.08&&l>.04,m=o<-.1||t.net<0,T=d(f?be:m?$e:ge),p=[];return p.push(i?l>=0?`Revenue grew ${u(l)} to ${y(t.revenue)}.`:`Revenue fell ${u(-l)} to ${y(t.revenue)}, which is not where we wanted to be.`:`In our first year, revenue was ${y(t.revenue)}.`),h?p.push(m?`Margins came under pressure, at ${u(t.margin)} against ${u(i.margin)}.`:`We chose to invest ahead of demand, and margins reflect that at ${u(t.margin)}.`):i&&p.push(`Margins improved to ${u(t.margin)}, which reflects discipline on cost.`),t.interest/Math.max(1,t.ebit)>.45&&p.push(`Our interest bill of ${y(t.interest)} remains the single largest call on operating profit, and reducing it is a priority.`),t.dividend>0&&i&&t.dividend>=i.dividend?p.push(`The board is recommending a dividend of ${y(t.dividend)}, which we regard as a signal of confidence.`):i&&t.dividend<i.dividend*.9&&p.push(`The board has taken the difficult decision to reduce the dividend to ${y(t.dividend)} in order to protect the balance sheet.`),(t.events||[]).slice(0,2).forEach(g=>{p.push(g.scope.kind==="company"?`You will have seen that ${g.head.toLowerCase()}. We have addressed this directly.`:`The wider picture — ${g.head.toLowerCase()} — shaped the year for everyone in ${F.find(I=>I.id===n.sector).name.toLowerCase()}.`)}),{company:n,year:a,open:T,body:p,close:f?"We enter the coming year with confidence and with the balance sheet to act on it.":m?"We have a clear plan, and we expect the coming year to be one of repair.":"There is work to do, and we know what it is.",omissions:[h&&!m?'Called a margin squeeze "investment ahead of demand".':null,t.debt/t.revenue>1.5?`Did not mention that borrowings are ${(t.debt/t.revenue).toFixed(1)}x revenue.`:null,t.net<0?"Led with revenue because profit was negative.":null].filter(Boolean)}}const ke=()=>ce(he.s),S=[{id:0,name:"The long boom",from:0,years:10,blurb:"Money is cheap and everything is going up. The hard part is telling luck from judgement."},{id:1,name:"When it turned",from:10,years:10,blurb:"Rates rise, and the businesses that borrowed to grow find out what it cost."},{id:2,name:"The squeeze",from:20,years:10,blurb:"Prices climb faster than wages. Who can pass it on, and who eats it?"},{id:3,name:"The new thing",from:30,years:10,blurb:"Something arrives that makes half this list look old. Which half?"}];function Z(e,s){const a=[];return F.forEach((n,r)=>{const t=B.filter(i=>i.sector===n.id);a.push(t[(e+s*7+r*3)%t.length])}),a}function ee(e){const s=e.dna,a=[{id:"rate",t:"The bank raising interest rates",w:s.rateSens*(1+s.debt)},{id:"infl",t:"Prices rising faster than it can charge",w:(1-s.pricing)*3},{id:"slump",t:"A recession cutting what people buy",w:s.cyc*1.6},{id:"newtech",t:"Something new making it unnecessary",w:s.disrupt*3.2}],n=a.reduce((r,t)=>t.w>r.w?t:r);return{options:a,answer:n.id,why:{rate:`It carries ${s.debt.toFixed(1)}× its revenue in borrowings and a rate sensitivity of ${s.rateSens.toFixed(1)}. When money gets dearer, this one feels it first.`,infl:`It can only pass on about ${Math.round(s.pricing*100)}% of a cost rise. The rest comes straight out of the margin.`,slump:`Its earnings swing ${s.cyc.toFixed(1)}× as hard as the economy. A mild slowdown is not mild here.`,newtech:`Roughly ${Math.round(s.disrupt*100)}% of what it does could be replaced by something better. That is the risk that does not announce itself.`}[n.id]}}function Me(e){return{seed:e,act:null,year:0,phase:"pick",studied:[],assessed:{},cash:1e4,holdings:{},opened:{},log:[],score:{right:0,asked:0}}}const Y=new Map;function x(e){return Y.has(e)||Y.set(e,me(e,Q)),Y.get(e)}function Te(e){const s=x(e.seed);return Object.entries(e.holdings).reduce((a,[n,r])=>a+r*s.years[n][e.year].value,0)}function z(e){return e.cash+Te(e)}function Ce(e,s){return e.act=s,e.year=S[s].from,e.phase="study",e.studied=[],e.assessed={},e.holdings={},e.cash=1e4,e.startWorth=1e4,e.log=[],e}function Le(e,s){e.studied.includes(s)||e.studied.push(s)}function je(e,s,a){const n=M[s],r=ee(n),t=a===r.answer;return e.assessed[s]={pick:a,right:t,answer:r.answer},e.score.asked++,t&&e.score.right++,{right:t,answer:r.answer,why:r.why,label:r.options.find(i=>i.id===r.answer).t}}function Ye(e,s,a){const n=x(e.seed),r=Math.min(Math.round(a),e.cash);if(r<=0||!e.studied.includes(s))return 0;const t=n.years[s][e.year].value;return e.cash-=r,e.holdings[s]=(e.holdings[s]||0)+r/t,r}function Be(e,s){const a=x(e.seed),n=e.holdings[s]||0;if(n<=0)return 0;const r=Math.round(n*a.years[s][e.year].value);return e.holdings[s]=0,e.cash+=r,r}function Ne(e){const s=S[e.act];if(e.year>=s.from+s.years-1)return e.phase="review",null;const a=z(e);e.year++;const n=x(e.seed),r=z(e),t=n.calendar[e.year].filter(i=>i.scope.kind!=="company"||e.studied.includes(i.scope.company));return e.log.unshift({year:e.year,before:a,after:r,events:t}),e.log.length>12&&(e.log.length=12),{year:e.year,before:a,after:r,events:t}}const A=e=>e>=0?"var(--grow)":"var(--spend)",E=e=>e>=0?"▲":"▼";function De(){const e=ke();e.game||(e.game=Me(e.market&&e.market.seed||1));const s=e.game;return s.phase==="pick"?Fe():s.phase==="study"?Se(s):s.phase==="invest"?Ie(s):s.phase==="review"?ze(s):Pe(s)}function O(e,s,a){const n=e.act===null?null:S[e.act];return`<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    <h1 class="sr">The Market Game</h1>
    ${n?`<div class="card" style="border-color:var(--action)">
      <div class="row"><div class="grow"><div class="eyebrow">Act ${e.act+1} of 4 · ${c(n.name)}</div>
        <h3 style="font-size:17px;margin:1px 0">Year ${e.year-n.from+1} of ${n.years}</h3>
        <p class="small muted">${c(a||n.blurb)}</p></div>
        <div style="text-align:right"><div class="eyebrow">Worth</div>
          <div class="big" style="font-size:20px">${w(z(e))}</div></div></div>
    </div>`:""}
    ${s}</div>`}function Fe(e){return`<div class="stack">
    <button class="btn ghost" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    <h1 style="font-size:28px">The Market Game</h1>
    ${X("bo","Forty companies, forty years, and none of them exist. Everything that happens to them happens for a reason you can find. Pick a decade.")}
    ${S.map(s=>`<button class="card" data-act="mgAct" data-arg="${s.id}" style="text-align:left;width:100%">
      <div class="eyebrow">Act ${s.id+1} · years ${s.from+1}–${s.from+s.years}</div>
      <h3 style="font-size:19px;margin:3px 0 4px">${c(s.name)}</h3>
      <p class="small muted">${c(s.blurb)}</p></button>`).join("")}
    <p class="small muted" style="text-align:center">You can only buy what you have studied, and you
      can only go long. Nothing here is real money or a real company.</p>
  </div>`}function Se(e){const s=Z(e.seed,e.act),a=x(e.seed),n=e.opened.co?M[e.opened.co]:null;if(n)return O(e,We(e,n,a),"Read it, then say what would hurt it.");const r=e.studied.length>=3;return O(e,`
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Study the market</div>
        <p class="small muted">Read at least three before you may invest. The report is the truth;
          the letter is what they would like you to think.</p></div>
        <span class="pill ${r?"grow":""}">${e.studied.length}/8 read</span></div>
    </div>
    ${s.map(t=>{const i=e.studied.includes(t.id),l=e.assessed[t.id],o=F.find(h=>h.id===t.sector);return`<button class="card" data-act="mgOpen" data-arg="${t.id}" style="text-align:left;width:100%">
        <div class="row">${J("sec-"+t.sector,o.em,28)}
          <div class="grow"><b style="font-size:15px">${c(t.name)}</b>
            <span class="pill" style="margin-left:6px">${t.ticker}</span>
            <p class="small muted">${c(t.what)}</p></div>
          ${l?`<span class="pill ${l.right?"grow":""}">${l.right?"✓ assessed":"assessed"}</span>`:i?'<span class="pill">read</span>':""}
        </div></button>`}).join("")}
    <button class="btn wide" data-act="mgToInvest" ${r?"":"disabled"}>
      ${r?"Ready to invest →":`Read ${3-e.studied.length} more first`}</button>`)}function We(e,s,a){const n=e.year,r=we(a,s.id,n),t=xe(a,s.id,n),i=F.find(d=>d.id===s.sector),l=ee(s),o=e.assessed[s.id],h=ye(a,s.id).slice(Math.max(0,n-8),n+1);return`
    <div class="card">
      <div class="row">${J("sec-"+s.sector,i.em,34)}
        <div class="grow"><h3 style="font-size:19px;margin:0">${c(s.name)}</h3>
          <span class="pill">${s.ticker}</span> <span class="small muted">${c(i.name)}</span></div></div>
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
      <div class="eyebrow">Annual report · year ${n+1}</div>
      <div style="margin-top:9px">
        ${r.lines.map(d=>`<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line-soft)">
          <span class="grow small">${d.k}</span>
          <b style="font-variant-numeric:tabular-nums">${d.v}</b>
          <span class="small" style="min-width:62px;text-align:right;color:${d.up?"var(--grow)":"var(--spend)"}">${d.d}</span></div>`).join("")}
      </div>
      <div class="eyebrow" style="margin-top:13px">What those mean</div>
      ${r.ratios.map(d=>`<div style="margin-top:8px">
        <div class="row"><span class="grow small"><b>${c(d.k)}</b></span>
          <b style="font-variant-numeric:tabular-nums">${d.v}</b></div>
        <div class="small muted">${c(d.note)}</div></div>`).join("")}
    </div>

    <div class="card" style="background:var(--surface2)">
      <div class="eyebrow">Letter to shareholders</div>
      <p style="margin-top:8px;font-style:italic">${c(t.open)}</p>
      ${t.body.map(d=>`<p class="small" style="margin-top:7px">${c(d)}</p>`).join("")}
      <p class="small" style="margin-top:7px;font-style:italic">${c(t.close)}</p>
      ${o&&t.omissions.length?`<div style="margin-top:11px;background:var(--gold-tint);
        color:var(--treasure-deep);border-radius:var(--r-md);padding:10px 12px">
        <div class="eyebrow" style="color:var(--treasure-deep)">What it did not say</div>
        ${t.omissions.map(d=>`<div class="small" style="margin-top:4px">· ${c(d)}</div>`).join("")}
      </div>`:""}
    </div>

    <div class="card" style="border-color:var(--action)">
      <div class="eyebrow">Your assessment</div>
      <h3 style="font-size:17px;margin:3px 0 9px">What would hurt this company most?</h3>
      ${o?`<div style="background:${o.right?"var(--grow-tint)":"var(--spend-tint)"};
            color:${o.right?"var(--grow)":"var(--spend)"};padding:11px 13px;border-radius:var(--r-md);font-weight:700">
            ${o.right?"Yes — ":"Not quite. The biggest is "}${c(l.options.find(d=>d.id===l.answer).t.toLowerCase())}</div>
          <p class="small muted" style="margin-top:9px">${c(l.why)}</p>`:`<div class="stack" style="gap:8px">${l.options.map(d=>`<button class="opt" data-act="mgAssess" data-arg="${s.id}:${d.id}">${c(d.t)}</button>`).join("")}</div>`}
      <button class="btn wide ghost" style="margin-top:12px" data-act="mgClose">← Back to the list</button>
    </div>`}function Ie(e){const s=x(e.seed);return O(e,`
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Put your money somewhere</div>
        <p class="small muted">Only what you studied. Long only — you are buying a share of a
          business, not betting against one.</p></div>
        <div style="text-align:right"><div class="eyebrow">Cash</div>
          <div class="big" style="font-size:19px">${w(e.cash)}</div></div></div>
    </div>
    ${e.studied.map(a=>{const n=M[a],r=s.years[a][e.year].value,t=e.holdings[a]||0,i=e.assessed[a];return`<div class="card">
        <div class="row"><div class="grow"><b style="font-size:15px">${c(n.name)}</b>
          <span class="pill" style="margin-left:5px">${n.ticker}</span>
          <p class="small muted">${c(n.model)}</p></div>
          <div style="text-align:right"><div class="small muted">held</div>
            <b>${t>0?w(t*r):"—"}</b></div></div>
        ${i&&!i.right?'<p class="small" style="margin-top:6px;color:var(--spend)">You misread what its main risk was.</p>':""}
        <div class="row" style="gap:7px;margin-top:9px;flex-wrap:wrap">
          <button class="btn sm" data-act="mgBuy" data-arg="${a}:1000" ${e.cash<1e3?"disabled":""}>Buy ${w(1e3)}</button>
          <button class="btn sm ghost" data-act="mgBuy" data-arg="${a}:2500" ${e.cash<2500?"disabled":""}>${w(2500)}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="mgSell" data-arg="${a}" ${t<=0?"disabled":""}>Sell</button>
        </div></div>`}).join("")}
    <button class="btn wide" data-act="mgPlay" ${Object.values(e.holdings).every(a=>!a)?"disabled":""}>
      Start the decade →</button>`)}function Pe(e){const s=x(e.seed),a=S[e.act],n=e.log[0],r=s.years[e.studied[0]][e.year];return O(e,`
    ${n?`<div class="card" style="border-color:${n.after>=n.before?"var(--grow)":"var(--spend)"}">
      <div class="row"><div class="grow"><div class="eyebrow">Year ${n.year-a.from+1}</div>
        <h3 style="font-size:18px;margin:2px 0;color:${A(n.after-n.before)}">
          ${E(n.after-n.before)} ${w(Math.abs(n.after-n.before))}</h3></div></div>
      ${n.events.length?`<div class="stack" style="gap:8px;margin-top:10px">
        ${n.events.slice(0,4).map(t=>`<div style="background:var(--surface2);border:1px solid var(--line);
          border-radius:var(--r-md);padding:10px 12px">
          <div class="row"><span class="pill">${t.scope.kind}</span>
            <span class="pill" style="margin-left:5px">${t.tag}</span></div>
          <b style="font-size:14px;display:block;margin-top:5px">${c(t.head)}</b>
          <div class="small muted">${c(t.body)}</div></div>`).join("")}
      </div>`:'<p class="small muted" style="margin-top:8px">A quiet year. They happen.</p>'}
    </div>`:""}

    <div class="card">
      <div class="eyebrow">The world</div>
      <div class="row" style="gap:16px;margin-top:8px;flex-wrap:wrap">
        <span><div class="eyebrow">Bank rate</div><b style="font-size:16px">${r.rate.toFixed(2)}%</b></span>
        <span><div class="eyebrow">Prices</div><b style="font-size:16px">${r.inflation.toFixed(1)}%</b></span>
        <span><div class="eyebrow">The economy</div><b style="font-size:16px">${r.growth>=0?"+":""}${r.growth.toFixed(1)}%</b></span>
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What you hold</div>
      <div class="stack" style="gap:8px;margin-top:10px">
        ${e.studied.filter(t=>(e.holdings[t]||0)>0).map(t=>{const i=M[t],l=s.years[t][e.year].value,o=fe(s,t,e.year);return`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:10px 12px">
            <div class="row"><b class="grow" style="font-size:14px">${c(i.name)}</b>
              <b style="color:${A(o.move)}">${E(o.move)} ${Math.abs(o.move*100).toFixed(1)}%</b>
              <b style="margin-left:9px;font-variant-numeric:tabular-nums">${w(e.holdings[t]*l)}</b></div>
            ${o.reasons.length?`<div class="small muted" style="margin-top:5px">Because ${c(o.reasons[0])}.</div>`:""}
            <button class="btn ghost sm" style="margin-top:8px" data-act="mgSell" data-arg="${t}">Sell it</button>
          </div>`}).join("")}
        ${e.cash>0?`<div class="row"><span class="grow small muted">Cash, doing nothing</span><b>${w(e.cash)}</b></div>`:""}
      </div>
    </div>
    <button class="btn wide" data-act="mgNext">Next year →</button>`)}function ze(e){const s=S[e.act],a=z(e),n=e.startWorth||1e4,r=a/n-1,t=x(e.seed),l=Z(e.seed,e.act).map(o=>({co:o,m:t.years[o.id][e.year].value/t.years[o.id][s.from].value-1})).sort((o,h)=>h.m-o.m);return`<div class="stack">
    <div class="card" style="border-color:var(--gold);background:var(--gold-tint)">
      <div style="text-align:center"><div style="font-size:40px">${r>=0?"📈":"📉"}</div>
        <div class="eyebrow">${c(s.name)} · ten years</div>
        <h2 style="margin:4px 0 2px;font-size:26px">${w(a)}</h2>
        <p style="color:${A(r)};font-weight:800">${E(r)} ${Math.abs(r*100).toFixed(0)}% from ${w(n)}</p></div>
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
        ${l.map(o=>`<div class="row"><span class="grow small">${c(o.co.name)}</span>
          <b style="color:${A(o.m)};font-variant-numeric:tabular-nums">${E(o.m)} ${Math.abs(o.m*100).toFixed(0)}%</b>
          <span class="pill" style="margin-left:7px">${(e.holdings[o.co.id]||0)>0?"held":"—"}</span></div>`).join("")}
      </div>
    </div>
    ${X("bea",r>=0?"A good decade. Now do the next one, where the rate goes the other way, and find out how much of that was you.":"A hard decade. Everyone gets one. The question is whether the things you got wrong were the things you said would go wrong.")}
    <button class="btn wide" data-act="mgPick">Choose another decade →</button>
  </div>`}export{S as ACTS,Ne as advance,je as assess,ee as assessOptions,Ye as buy,Z as castFor,z as netWorth,Me as newGame,Te as portfolioValue,Be as sell,x as simFor,Ce as startAct,Le as study,De as viewMarketGame};
