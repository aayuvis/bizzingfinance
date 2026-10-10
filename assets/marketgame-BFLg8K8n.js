import{w as ye,W as Q,r as B,C as Z,m as w,R as P,k as te,B as W,e as h,s as se,p as fe,a as we,i as be,b as ge}from"./index-CVYnfAQZ.js";import"./playstyle-DQAXYTtu.js";import{COMPANIES as H,SECTORS as E,byId as k}from"./companies-CS4VQeKL.js";import{byLevel as z,PESTEL as $e}from"./events-u4iye1A4.js";const ae=40,y={baseMultiple:16,multOnGrowth:.55,multOnRate:.075,multOnDisrupt:-6,multFloor:4,multCeil:45,growthFloor:4.5,growthHalfLife:10,interestSpread:1.8,shockHeal:.55,eventsPerYear:{macro:1.1,country:.9,sector:.7,company:.55}};function Y(e,s){const a=e.reduce((r,t)=>r+t.w,0);let n=s()*a;for(const r of e)if(n-=r.w,n<=0)return r;return e[e.length-1]}function xe(e,s){const a=B((e||1)^523124044),n=Array.from({length:s},()=>[]),r=(t,o,l)=>{t<s&&n[t].push({...o,year:t,scope:l})};for(let t=0;t<s;t++)["macro","country"].forEach(o=>{let l=y.eventsPerYear[o];for(;l>0;)a()<Math.min(1,l)&&r(t,Y(z[o],a),{kind:o}),l-=1}),E.forEach(o=>{a()<y.eventsPerYear.sector&&r(t,Y(z.sector,a),{kind:"sector",sector:o.id})}),H.forEach(o=>{a()<y.eventsPerYear.company&&r(t,Y(z.company,a),{kind:"company",company:o.id})});return n}function ke(e,s){return e.scope.kind==="macro"||e.scope.kind==="country"?!0:e.scope.kind==="sector"?e.scope.sector===s.sector:e.scope.company===s.id}function Me(e,s=ae){const a=ye(e,s*Q+4),n=xe(e,s),r=B((e||1)^2007643084),t=()=>(r()+r()+r()-1.5)*2,o={};return H.forEach(l=>{const d=l.dna;let c=d.rev0,i=d.margin,p=0;const v=[],b=[];for(let u=0;u<s;u++){const g=a[Math.min(a.length-1,u*Q)],$=n[u].filter(x=>ke(x,l));$.forEach(x=>v.push({e:x,left:x.years}));let O=0,q=0,K=0,U=0;for(let x=v.length-1;x>=0;x--){const T=v[x],I=T.e.eff,j=T.left/T.e.years;O+=(I.rev||0)*j,q+=(I.margin||0)*j,K+=(I.mult||0)*j,T.left===T.e.years&&(U+=I.shock||0),T.left--,T.left<=0&&v.splice(x,1)}const de=(g.growth-Z.growthMean)*d.cyc,le=g.inflation*d.pricing,ce=Math.pow(.5,u/y.growthHalfLife),he=(y.growthFloor+(d.growth-y.growthFloor)*ce+de+le)/100+O+t()*.012;c=Math.max(20,c*(1+he));const pe=g.inflation*(1-d.pricing)/100*.35,ue=d.disrupt*.0012;i=Math.max(.005,Math.min(.55,d.margin-pe-ue*u+q+t()*.004));const V=c*i,X=c*d.debt,J=X*(g.rate+y.interestSpread)/100,C=V-J,me=Math.max(0,C)*d.payout;let F=y.baseMultiple+y.multOnGrowth*d.growth+y.multOnDisrupt*d.disrupt-y.multOnRate*y.baseMultiple*(g.rate-Z.rateNeutral)*d.rateSens;F*=1+K,F=Math.max(y.multFloor,Math.min(y.multCeil,F)),p=p*y.shockHeal+U;const ve=Math.max(c*.05,C*F)*(1+p);b.push({year:u,revenue:c,margin:i,ebit:V,interest:J,net:C,dividend:me,debt:X,mult:F,value:ve,shock:p,rate:g.rate,inflation:g.inflation,growth:g.growth,events:$})}o[l.id]=b}),{world:a,calendar:n,years:o}}function Te(e,s){const a=e.years[s],n=a[0].value;return a.map(r=>r.value/n*100)}function Se(e,s,a){const n=e.years[s],r=k[s];if(a<=0||!n||!n[a-1])return{move:0,reasons:[],events:n&&n[Math.max(0,a)]&&n[Math.max(0,a)].events||[]};const t=n[a-1],o=n[a],l=o.value/t.value-1,d=[],c=o.revenue/t.revenue-1,i=o.margin-t.margin,p=o.mult/t.mult-1;return Math.abs(c)>.02&&d.push({w:Math.abs(c),t:`it sold ${c>0?"more":"less"} — revenue ${c>0?"up":"down"} ${Math.abs(c*100).toFixed(0)}%`}),Math.abs(i)>.004&&d.push({w:Math.abs(i)*12,t:`it kept ${i>0?"more":"less"} of each rupee — margin ${i>0?"up":"down"} ${Math.abs(i*100).toFixed(1)} points`}),Math.abs(p)>.03&&d.push({w:Math.abs(p),t:`people would pay ${p>0?"more":"less"} per rupee of profit — the multiple went ${t.mult.toFixed(0)} to ${o.mult.toFixed(0)}`}),Math.abs(o.rate-t.rate)>.4&&d.push({w:Math.abs(o.rate-t.rate)/8*(r.dna.rateSens||1),t:`the bank rate moved ${t.rate.toFixed(2)}% to ${o.rate.toFixed(2)}%, and this one carries ${r.dna.debt.toFixed(1)}x revenue in debt`}),{move:l,reasons:d.sort((v,b)=>b.w-v.w).map(v=>v.t),events:o.events}}const m=e=>(e*100).toFixed(1)+"%",f=e=>w(Math.round(e));function Fe(e,s,a){const n=k[s],r=e.years[s],t=r[a],o=a>0?r[a-1]:null,l=i=>o?t[i]-o[i]:0,d=i=>o&&o[i]?t[i]/o[i]-1:0,c=E.find(i=>i.id===n.sector);return{company:n,year:a,sector:c,lines:[{k:"Revenue",v:f(t.revenue),d:o?m(d("revenue")):"",up:l("revenue")>=0},{k:"Operating profit",v:f(t.ebit),d:o?m(d("ebit")):"",up:l("ebit")>=0},{k:"Margin",v:m(t.margin),d:o?((t.margin-o.margin)*100).toFixed(1)+" pts":"",up:l("margin")>=0},{k:"Interest paid",v:f(t.interest),d:o?m(d("interest")):"",up:l("interest")<=0},{k:"Profit after interest",v:f(t.net),d:o?m(d("net")):"",up:l("net")>=0},{k:"Dividend paid",v:f(t.dividend),d:o?m(d("dividend")):"",up:l("dividend")>=0},{k:"Borrowings",v:f(t.debt),d:o?m(d("debt")):"",up:l("debt")<=0}],ratios:[{k:"Profit per rupee of sales",v:m(t.net/t.revenue),note:"Of every rupee that came in, this much was still there at the end."},{k:"Interest as a share of profit",v:t.ebit>0?m(t.interest/t.ebit):"more than it earned",note:t.ebit<=0||t.interest>t.ebit?"It did not earn enough to cover the interest. That is how businesses fail.":t.interest/t.ebit>.4?"A large slice of what it earns goes straight to the lender.":"Comfortably covered."},{k:"Borrowings against sales",v:(t.debt/t.revenue).toFixed(2)+"x",note:"How many years of sales it would take to repay everything."},{k:"Paid out to owners",v:m(t.dividend/Math.max(1,t.net)),note:"The rest was kept inside the business."},{k:"What people pay per rupee of profit",v:t.net>0?t.mult.toFixed(1)+"x":"n/a",note:t.net>0?"The multiple. It moves with the bank rate and with the mood.":"It made a loss, so there is no profit to price. That is the point."}],events:t.events,world:{rate:t.rate,inflation:t.inflation,growth:t.growth}}}const Ee=["It has been a year of real progress, and I want to begin by thanking every one of our people for it.","I am pleased to report a year in which the strategy we set out has done exactly what we said it would.","This was a strong year, and a satisfying one."],Oe=["This was a year of two halves, and I will not pretend the second was the easier one.","We made real progress in a market that gave us very little help.","A year of building rather than harvesting."],Ie=["I will not dress this up: it has been a difficult year.","This was a disappointing year, and the board takes responsibility for it.","We entered the year with confidence and we leave it wiser."];function We(e,s,a){const n=k[s],r=e.years[s],t=r[a],o=a>0?r[a-1]:null,l=o?t.revenue/o.revenue-1:0,d=o?t.net/Math.max(1,Math.abs(o.net))-1:0,c=o?t.margin<o.margin:!1,i=$=>$[(a*7+n.id.length*3)%$.length],p=d>.08&&l>.04,v=d<-.1||t.net<0,b=i(p?Ee:v?Ie:Oe),u=[];return u.push(o?l>=0?`Revenue grew ${m(l)} to ${f(t.revenue)}.`:`Revenue fell ${m(-l)} to ${f(t.revenue)}, which is not where we wanted to be.`:`In our first year, revenue was ${f(t.revenue)}.`),c?u.push(v?`Margins came under pressure, at ${m(t.margin)} against ${m(o.margin)}.`:`We chose to invest ahead of demand, and margins reflect that at ${m(t.margin)}.`):o&&u.push(`Margins improved to ${m(t.margin)}, which reflects discipline on cost.`),t.interest/Math.max(1,t.ebit)>.45&&u.push(`Our interest bill of ${f(t.interest)} remains the single largest call on operating profit, and reducing it is a priority.`),t.dividend>0&&o&&t.dividend>=o.dividend?u.push(`The board is recommending a dividend of ${f(t.dividend)}, which we regard as a signal of confidence.`):o&&t.dividend<o.dividend*.9&&u.push(`The board has taken the difficult decision to reduce the dividend to ${f(t.dividend)} in order to protect the balance sheet.`),(t.events||[]).slice(0,2).forEach($=>{u.push($.scope.kind==="company"?`You will have seen that ${$.head.toLowerCase()}. We have addressed this directly.`:`The wider picture — ${$.head.toLowerCase()} — shaped the year for everyone in ${E.find(O=>O.id===n.sector).name.toLowerCase()}.`)}),{company:n,year:a,open:b,body:u,close:p?"We enter the coming year with confidence and with the balance sheet to act on it.":v?"We have a clear plan, and we expect the coming year to be one of repair.":"There is work to do, and we know what it is.",omissions:[c&&!v?'Called a margin squeeze "investment ahead of demand".':null,t.debt/t.revenue>1.5?`Did not mention that borrowings are ${(t.debt/t.revenue).toFixed(1)}x revenue.`:null,t.net<0?"Led with revenue because profit was negative.":null].filter(Boolean)}}const Pe=()=>te(P.s),S=[{id:0,name:"The long boom",from:0,years:10,blurb:"Money is cheap and everything is going up. The hard part is telling luck from judgement."},{id:1,name:"When it turned",from:10,years:10,blurb:"Rates rise, and the businesses that borrowed to grow find out what it cost."},{id:2,name:"The squeeze",from:20,years:10,blurb:"Prices climb faster than wages. Who can pass it on, and who eats it?"},{id:3,name:"The new thing",from:30,years:10,blurb:"Something arrives that makes half this list look old. Which half?"}];function ne(e,s){const a=[];return E.forEach((n,r)=>{const t=H.filter(o=>o.sector===n.id);a.push(t[(e+s*7+r*3)%t.length])}),a}const ee=3;function oe(e,s){const a=B((e>>>0^40503*(s+1))>>>0),n=ne(e,s).slice();for(let t=n.length-1;t>0;t--){const o=Math.floor(a()*(t+1));[n[t],n[o]]=[n[o],n[t]]}const r=[];return n.forEach(t=>{r.length<ee&&!r.some(o=>o.hurt===t.hurt)&&r.push(t)}),n.forEach(t=>{r.length<ee&&!r.includes(t)&&r.push(t)}),r.map(t=>t.id)}function re(){return 1+Math.floor(Math.random()*2147483646)}const Ae=[{id:"rate",t:"The bank raising interest rates"},{id:"infl",t:"Its costs rising faster than it can charge"},{id:"slump",t:"A recession cutting what people buy"},{id:"newtech",t:"Rivals, or new tastes, taking its customers"},{id:"rule",t:"One ruling, accident or failure it cannot undo"}];function G(e){const s=e.dna,a=e.hurt,n=`Its sheet says it: “${e.risk}”`,r={rate:`${n} It carries ${s.debt.toFixed(1)}× its revenue in borrowings and a rate sensitivity of ${s.rateSens.toFixed(1)}: when money gets dearer, this one feels it first.`,infl:`${n} It can pass on only about ${Math.round(s.pricing*100)}% of a cost rise; the rest comes straight out of the margin.`,slump:`${n} Its earnings swing ${s.cyc.toFixed(1)}× as hard as the economy, so a mild slowdown is not mild here.`,newtech:`${n} Its customers can go elsewhere, and nothing in the accounts warns you before they do.`,rule:`${n} One decision or one bad event it cannot control can undo years of profit.`}[a];return{options:Ae.slice(),answer:a,why:r}}function Le(e=re()){return{seed:e,act:null,year:0,phase:"pick",studied:[],assessed:{},sheets:[],sheet:0,cash:1e4,holdings:{},opened:{},log:[],score:{right:0,asked:0}}}const D=new Map;function M(e){return D.has(e)||D.set(e,Me(e,ae)),D.get(e)}function Ne(e){const s=M(e.seed);return Object.entries(e.holdings).reduce((a,[n,r])=>a+r*s.years[n][e.year].value,0)}function A(e){return e.cash+Ne(e)}function Xe(e,s,a=re()){e.seed=a,e.paidThis=!1,e.payNote=null,e.sheets=oe(a,s),e.sheet=0,e.opened={};const n=P.s&&te(P.s);return n&&(n.rounds||(n.rounds={}),n.rounds.m40={seed:a,act:s,t:Date.now()}),e.act=s,e.year=S[s].from,e.phase="study",e.studied=[],e.assessed={},e.holdings={},e.cash=1e4,e.startWorth=1e4,e.log=[],e.score={right:0,asked:0},e}function ie(e,s){e.studied.includes(s)||e.studied.push(s)}function Je(e,s,a){const n=k[s],r=G(n),t=a===r.answer;return e.assessed[s]={pick:a,right:t,answer:r.answer},e.score.asked++,t&&e.score.right++,{right:t,answer:r.answer,why:r.why,label:r.options.find(o=>o.id===r.answer).t}}const L=e=>(e.sheets||[]).length>0&&e.sheets.every(s=>e.assessed[s]);function Qe(e){return L(e)?(e.phase="invest",e.opened={},!0):!1}function Ze(e,s=1){const a=(e.sheets||[]).length;a&&(e.sheet=Math.max(0,Math.min(a-1,(e.sheet||0)+s)),ie(e,e.sheets[e.sheet]))}function et(e,s,a){const n=M(e.seed),r=Math.min(Math.round(a),e.cash);if(r<=0||!e.assessed[s]||!L(e))return 0;const t=n.years[s][e.year].value;return e.cash-=r,e.holdings[s]=(e.holdings[s]||0)+r/t,r}function tt(e,s){const a=M(e.seed),n=e.holdings[s]||0;if(n<=0)return 0;const r=Math.round(n*a.years[s][e.year].value);return e.holdings[s]=0,e.cash+=r,r}function st(e){const s=S[e.act];if(e.year>=s.from+s.years-1)return e.phase="review",null;const a=A(e);e.year++;const n=M(e.seed),r=A(e),t=n.calendar[e.year].filter(o=>o.scope.kind!=="company"||e.studied.includes(o.scope.company));return e.log.unshift({year:e.year,before:a,after:r,events:t}),e.log.length>12&&(e.log.length=12),{year:e.year,before:a,after:r,events:t}}const Re={macro:"The whole economy",country:"The country",sector:"Its industry",company:"This company"},N=e=>e>=0?"var(--grow)":"var(--spend)",R=e=>e>=0?"▲":"▼";function at(){const e=Pe();e.game||(e.game=Le());const s=e.game;s.phase==="study"&&!(s.sheets&&s.sheets.length)&&(s.sheets=oe(s.seed,s.act),s.sheet=0);const a=s.phase==="pick"?ze():s.phase==="study"?Ye(s):s.phase==="invest"?Be(s):s.phase==="review"?Ge(s):He(s);return Ce(a,s.phase==="pick")}function Ce(e,s){const a=fe((we[3]||{}).id||"exchange",!!P.dark);return`<div class="m40hall${s?" front":""}" style="--hall:url(${a})">
    ${e}</div>`}function _(e,s,a){const n=e.act===null?null:S[e.act];return`<div class="stack">
    <button class="btn ghost m40leave" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    <h1 class="sr">The Market Game</h1>
    ${n?`<div class="card m40head">
      <div class="row"><div class="grow"><div class="eyebrow">Act ${e.act+1} of 4 · ${h(n.name)}</div>
        <h3 style="font-size:17px;margin:1px 0">${e.phase==="study"?`Sheet ${(e.sheet||0)+1} of ${(e.sheets||[]).length}`:`Year ${e.year-n.from+1} of ${n.years}`}</h3>
        <p class="small muted">${h(a||n.blurb)}</p></div>
        <div style="text-align:right"><div class="eyebrow">Worth</div>
          <div class="big" style="font-size:20px">${w(A(e))}</div></div></div>
    </div>`:""}
    ${s}</div>`}const je=[["Pick a decade","Four decades, four different worlds. Each one deals you three companies."],["Read three sheets","What it does, its report, its letter. On each, say what could hurt it most."],["Then the money","Only once all three are answered: put your money behind what you read."],["Ten years","A year a turn. Things happen, and every move has a reason you can find."],["The review","How well you read them comes first. The money comes second, because it is partly the decade."]];function ze(e){return`<div class="stack">
    <button class="btn ghost m40leave" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    ${W.exchange?`<div class="m40door"><img src="${W.exchange.src}" alt="" aria-hidden="true" width="${W.exchange.w}" height="${W.exchange.h}"></div>`:""}
    <h1 class="m40title">The Market Game</h1>
    <section class="card m40how" aria-labelledby="m40how-h">
      <div class="eyebrow" id="m40how-h">How to play</div>
      <ol>${je.map(([s,a])=>`<li><b>${h(s)}.</b> ${h(a)}</li>`).join("")}</ol>
      <p class="small muted">Long only, and nothing here is real money or a real company: forty made-up firms, the town's own forty years. Nothing is advice.</p>
    </section>
    ${se("bo","Forty companies, forty years, and none of them exist. Everything that happens to them happens for a reason you can find. Pick a decade.")}
    ${S.map(s=>`<button class="card m40act" data-act="mgAct" data-arg="${s.id}" style="text-align:left;width:100%">
      <div class="eyebrow">Act ${s.id+1} · years ${s.from+1}–${s.from+s.years}</div>
      <h3 style="font-size:19px;margin:3px 0 4px">${h(s.name)}</h3>
      <p class="small muted">${h(s.blurb)}</p></button>`).join("")}
  </div>`}function Ye(e){const s=M(e.seed),a=e.sheets[e.sheet||0],n=k[a];ie(e,a);const r=e.sheets.filter(o=>e.assessed[o]).length,t=`<ol class="m40steps" aria-label="Three sheets">${e.sheets.map((o,l)=>`<li class="${l===e.sheet?"on":""}${e.assessed[o]?" done":""}">
    <button data-act="mgSheet" data-arg="${l}" aria-label="Sheet ${l+1}${e.assessed[o]?", answered":""}">${e.assessed[o]?"✓":l+1}</button></li>`).join("")}</ol>`;return _(e,`${t}${De(e,n,s)}
    <div class="row m40nav" style="gap:8px">
      ${e.sheet>0?`<button class="btn ghost grow" data-act="mgSheet" data-arg="${e.sheet-1}">← Sheet ${e.sheet}</button>`:""}
      ${e.sheet<e.sheets.length-1?`<button class="btn grow${e.assessed[a]?"":" ghost"}" data-act="mgSheet" data-arg="${e.sheet+1}">Sheet ${e.sheet+2} →</button>`:`<button class="btn grow" data-act="mgToInvest" ${L(e)?"":"disabled"}>${L(e)?"Now put money behind what you read →":`Answer ${e.sheets.length-r} more first`}</button>`}
    </div>`,"Read it, then say what would hurt it. No money moves until all three are answered.")}function De(e,s,a){const n=e.year,r=Fe(a,s.id,n),t=We(a,s.id,n),o=E.find(i=>i.id===s.sector),l=G(s),d=e.assessed[s.id],c=Te(a,s.id).slice(Math.max(0,n-8),n+1);return`
    <div class="card">
      <div class="row">${be("sec-"+s.sector,o.em,34)}
        <div class="grow"><h3 style="font-size:19px;margin:0">${h(s.name)}</h3>
          <span class="pill">${s.ticker}</span> <span class="small muted">${h(o.name)}</span></div></div>
      <p style="margin-top:10px">${h(s.what)}</p>
      <div class="sep" style="margin:11px 0"></div>
      <div class="small"><b>How it earns</b> — ${h(s.how)}</div>
      <div class="small" style="margin-top:5px"><b>Who pays</b> — ${h(s.who)}</div>
      <div class="small" style="margin-top:5px"><b>What could hurt it</b> — ${h(s.risk)}</div>
      <div class="small muted" style="margin-top:8px">Model: ${h(s.model)}</div>
      ${c.length>1?ge(c,300,44,"var(--action)"):""}
      <p class="small muted">${c.length>2?`Its price over the last ${c.length-1} years.`:c.length===2?"Its price over the last year.":"Its first year: no price history yet."}</p>
    </div>

    <div class="card">
      <div class="eyebrow">Annual report · year ${n+1}</div>
      <div style="margin-top:9px">
        ${r.lines.map(i=>`<div class="row" style="padding:5px 0;border-bottom:1px solid var(--line-soft)">
          <span class="grow small">${i.k}</span>
          <b style="font-variant-numeric:tabular-nums">${i.v}</b>
          <span class="small" style="min-width:62px;text-align:right;color:${i.up?"var(--grow)":"var(--spend)"}">${i.d}</span></div>`).join("")}
      </div>
      <div class="eyebrow" style="margin-top:13px">What those mean</div>
      ${r.ratios.map(i=>`<div style="margin-top:8px">
        <div class="row"><span class="grow small"><b>${h(i.k)}</b></span>
          <b style="font-variant-numeric:tabular-nums">${i.v}</b></div>
        <div class="small muted">${h(i.note)}</div></div>`).join("")}
    </div>

    <div class="card" style="background:var(--surface2)">
      <div class="eyebrow">Letter to shareholders</div>
      <p style="margin-top:8px;font-style:italic">${h(t.open)}</p>
      ${t.body.map(i=>`<p class="small" style="margin-top:7px">${h(i)}</p>`).join("")}
      <p class="small" style="margin-top:7px;font-style:italic">${h(t.close)}</p>
      ${d&&t.omissions.length?`<div style="margin-top:11px;background:var(--gold-tint);
        color:var(--treasure-deep);border-radius:var(--r-md);padding:10px 12px">
        <div class="eyebrow" style="color:var(--treasure-deep)">What it did not say</div>
        ${t.omissions.map(i=>`<div class="small" style="margin-top:4px">· ${h(i)}</div>`).join("")}
      </div>`:""}
    </div>

    <div class="card" style="border-color:var(--action)">
      <div class="eyebrow">Your assessment</div>
      <h3 style="font-size:17px;margin:3px 0 9px">What would hurt this company most?</h3>
      ${d?`<div style="background:${d.right?"var(--grow-tint)":"var(--spend-tint)"};
            color:${d.right?"var(--grow)":"var(--spend)"};padding:11px 13px;border-radius:var(--r-md);font-weight:700">
            ${d.right?"Yes — ":"Not quite. The biggest is "}${h(l.options.find(i=>i.id===l.answer).t.toLowerCase())}</div>
          <p class="small muted" style="margin-top:9px">${h(l.why)}</p>`:`<div class="stack" style="gap:8px">${l.options.map(i=>`<button class="opt" data-act="mgAssess" data-arg="${s.id}:${i.id}">${h(i.t)}</button>`).join("")}</div>`}
    </div>`}function Be(e){const s=M(e.seed);return _(e,`
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Put your money somewhere</div>
        <p class="small muted">Only the three you read. Long only — you are buying a share of a
          business, not betting against one.</p></div>
        <div style="text-align:right"><div class="eyebrow">Cash</div>
          <div class="big" style="font-size:19px">${w(e.cash)}</div></div></div>
    </div>
    ${e.sheets.map(a=>{const n=k[a],r=s.years[a][e.year].value,t=e.holdings[a]||0,o=e.assessed[a];return`<div class="card">
        <div class="row"><div class="grow"><b style="font-size:15px">${h(n.name)}</b>
          <span class="pill" style="margin-left:5px">${n.ticker}</span>
          <p class="small muted">${h(n.model)}</p></div>
          <div style="text-align:right"><div class="small muted">held</div>
            <b>${t>0?w(t*r):"—"}</b></div></div>
        ${o&&!o.right?'<p class="small" style="margin-top:6px;color:var(--spend)">You misread what its main risk was.</p>':""}
        <div class="row" style="gap:7px;margin-top:9px;flex-wrap:wrap">
          <button class="btn sm" data-act="mgBuy" data-arg="${a}:1000" ${e.cash<1e3?"disabled":""}>Buy ${w(1e3)}</button>
          <button class="btn sm ghost" data-act="mgBuy" data-arg="${a}:2500" ${e.cash<2500?"disabled":""}>${w(2500)}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="mgSell" data-arg="${a}" ${t<=0?"disabled":""}>Sell</button>
        </div></div>`}).join("")}
    <button class="btn wide" data-act="mgPlay" ${Object.values(e.holdings).every(a=>!a)?"disabled":""}>
      Start the decade →</button>`)}function He(e){const s=M(e.seed),a=S[e.act],n=e.log[0],r=s.years[e.studied[0]][e.year];return _(e,`
    ${n?`<div class="card" style="border-color:${n.after>=n.before?"var(--grow)":"var(--spend)"}">
      <div class="row"><div class="grow"><div class="eyebrow">Year ${n.year-a.from+1}</div>
        <h3 style="font-size:18px;margin:2px 0;color:${N(n.after-n.before)}">
          ${R(n.after-n.before)} ${w(Math.abs(n.after-n.before))}</h3></div></div>
      ${n.events.length?`<div class="stack" style="gap:8px;margin-top:10px">
        ${n.events.slice(0,4).map(t=>`<div style="background:var(--surface2);border:1px solid var(--line);
          border-radius:var(--r-md);padding:10px 12px">
          <div class="row"><span class="pill">${h(Re[t.scope.kind]||t.scope.kind)}</span>
            <span class="pill" style="margin-left:5px">${h($e[t.tag]||t.tag)}</span></div>
          <b style="font-size:14px;display:block;margin-top:5px">${h(t.head)}</b>
          <div class="small muted">${h(t.body)}</div></div>`).join("")}
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
        ${e.studied.filter(t=>(e.holdings[t]||0)>0).map(t=>{const o=k[t],l=s.years[t][e.year].value,d=Object.assign({move:0,reasons:[]},Se(s,t,e.year));return`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:10px 12px">
            <div class="row"><b class="grow" style="font-size:14px">${h(o.name)}</b>
              <b style="color:${N(d.move)}">${R(d.move)} ${Math.abs(d.move*100).toFixed(1)}%</b>
              <b style="margin-left:9px;font-variant-numeric:tabular-nums">${w(e.holdings[t]*l)}</b></div>
            ${d.reasons.length?`<div class="small muted" style="margin-top:5px">Because ${h(d.reasons[0])}.</div>`:""}
            <button class="btn ghost sm" style="margin-top:8px" data-act="mgSell" data-arg="${t}">Sell it</button>
          </div>`}).join("")}
        ${e.cash>0?`<div class="row"><span class="grow small muted">Cash, doing nothing</span><b>${w(e.cash)}</b></div>`:""}
      </div>
    </div>
    <button class="btn wide" data-act="mgNext">Next year →</button>`)}function Ge(e){const s=S[e.act],a=A(e),n=e.startWorth||1e4,r=a/n-1,t=M(e.seed),l=ne(e.seed,e.act).map(c=>({co:c,m:t.years[c.id][e.year].value/t.years[c.id][s.from].value-1})).sort((c,i)=>i.m-c.m),d=(e.sheets||[]).map(c=>{const i=k[c],p=e.assessed[c],v=G(i),b=p&&v.options.find(u=>u.id===p.pick);return`<li class="${p&&p.right?"met":""}"><span class="gtick" aria-hidden="true">${p&&p.right?"✓":"·"}</span>
      <span><b>${h(i.name)}</b> — you said “${h(b?b.t.toLowerCase():"nothing")}”.${p&&p.right?"":` Its sheet says: “${h(i.risk)}”`}</span></li>`}).join("");return`<div class="stack">
    <button class="btn ghost m40leave" style="align-self:flex-start" data-act="nav" data-arg="play">← Leave</button>
    <div class="card m40read" style="border-color:var(--action)">
      <div class="eyebrow">How well you read them · ${h(s.name)}</div>
      <h2 style="font-size:24px;margin:4px 0">${e.score.right} of ${e.score.asked} right</h2>
      <div class="goals"><ul>${d}</ul></div>
      <p class="small muted" style="margin-top:8px">This is the number that matters. Whether you could see what would hurt a business is yours.</p>
      ${e.payNote?`<p class="small m40pay" style="margin-top:6px;font-weight:700">${e.payNote.capped?h(e.payNote.line):e.payNote.paid?`Earned ${w(e.payNote.paid)} for how well you read them, straight into your wallet.`:"Nothing read right this decade, so nothing earned. The next decade is a fresh start."}</p>`:""}
    </div>
    <div class="card m40money">
      <div class="eyebrow">The money · second, and partly the decade you were handed</div>
      <div class="row" style="margin-top:6px;gap:10px"><span class="grow" style="font-size:22px;font-weight:800">${w(a)}</span>
        <b style="color:${N(r)}">${R(r)} ${Math.abs(r*100).toFixed(0)}% from ${w(n)}</b></div>
      <div class="eyebrow" style="margin-top:12px">What the decade did</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${l.map(c=>`<div class="row"><span class="grow small">${h(c.co.name)}</span>
          <b style="color:${N(c.m)};font-variant-numeric:tabular-nums">${R(c.m)} ${Math.abs(c.m*100).toFixed(0)}%</b>
          <span class="pill" style="margin-left:7px">${(e.holdings[c.co.id]||0)>0?"held":"—"}</span></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:8px">Forty made-up companies and the town's own forty years. Nothing here is advice.</p>
    </div>
    ${se("bea",e.score.right>=2?"You read them well. Now play the next decade, where the rate goes the other way, and find out how much of the money was you and how much was the decade.":"The money will come and go with the decade. The reading is the part you can get better at: go back to a sheet and find the line that says what could hurt it.")}
    <button class="btn wide" data-act="mgPick">Choose another decade →</button>
  </div>`}export{S as ACTS,Ae as ASSESS,je as HOWTO,Re as SCOPE_WORD,ee as SHEETS,st as advance,Je as assess,G as assessOptions,et as buy,ne as castFor,re as freshSeed,A as netWorth,Le as newGame,Ze as nextSheet,Ne as portfolioValue,L as readAll,tt as sell,oe as sheetsFor,M as simFor,Xe as startAct,ie as study,Qe as toInvest,at as viewMarketGame};
