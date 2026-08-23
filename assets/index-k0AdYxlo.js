(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();function u(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}const wt=Object.create(null);function x(e,a){wt[e]=a}function Ne(e,a,t){const o=wt[e];o?o(a,t):console.warn("no action:",e)}function ba(e){const a=t=>{const o=t.target.closest("[data-act]");if(!o||!e.contains(o))return;const s=o.getAttribute("data-act");if(s==="noop"){t.stopPropagation();return}t.preventDefault(),Ne(s,o.getAttribute("data-arg"),t)};e.addEventListener("click",a),e.addEventListener("keydown",t=>{if(t.key!=="Enter"&&t.key!==" ")return;const o=t.target.closest("[data-act]");o&&o.tagName!=="BUTTON"&&o.tagName!=="INPUT"&&a(t)})}let ne=null,kt=!0;function $t(e){kt=!!e}function wa(){if(!ne)try{ne=new(window.AudioContext||window.webkitAudioContext)}catch{ne=!1}return ne&&ne.state==="suspended"&&ne.resume(),ne}function X(e,a,t,o,s){const n=wa();if(!n||!kt)return;const i=n.currentTime+(s||0),c=n.createOscillator(),r=n.createGain();c.type=t||"sine",c.frequency.setValueAtTime(e,i),r.gain.setValueAtTime(0,i),r.gain.linearRampToValueAtTime(o??.14,i+.012),r.gain.exponentialRampToValueAtTime(1e-4,i+a),c.connect(r),r.connect(n.destination),c.start(i),c.stop(i+a+.02)}const y={click(){X(520,.07,"triangle",.06)},coin(){X(880,.09,"triangle",.11),X(1320,.13,"triangle",.09,.06)},good(){X(660,.1,"sine",.12),X(990,.16,"sine",.1,.08)},bad(){X(220,.16,"sawtooth",.07),X(170,.2,"sawtooth",.06,.08)},level(){[523,659,784,1047].forEach((e,a)=>X(e,.24,"triangle",.11,a*.09))},bell(){[784,1175].forEach((e,a)=>X(e,.8,"sine",.1,a*.14))}};let dt=null;function C(e){document.querySelectorAll(".toast").forEach(t=>t.remove());const a=document.createElement("div");a.className="toast",a.textContent=e,a.setAttribute("role","status"),document.body.appendChild(a),clearTimeout(dt),dt=setTimeout(()=>a.remove(),2400)}const ka=["#F0B429","#0E6B78","#178A4C","#C4453C","#8A5BD6","#2E7FA8"];function ge(e){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const a=document.createElement("div");a.className="conf",a.setAttribute("aria-hidden","true");let t="";for(let o=0;o<(e||40);o++){const s=(2.4+o%6*.35).toFixed(2);t+=`<i style="left:${o*37%100}%;background:${ka[o%6]};animation-duration:${s}s;animation-delay:${(o*.13%1.2).toFixed(2)}s"></i>`}a.innerHTML=t,document.body.appendChild(a),setTimeout(()=>a.remove(),4200)}function oe(e,a,t){return Math.max(a,Math.min(t,e))}function te(e){let a=e>>>0||1;return function(){return a^=a<<13,a>>>=0,a^=a>>17,a^=a<<5,a>>>=0,a/4294967296}}function xe(e,a,t,o){if(!e||e.length<2)return"";const s=Math.min(...e),n=Math.max(...e),i=n-s||1,c=e.map((k,b)=>{const T=b/(e.length-1)*(a-2)+1,p=t-3-(k-s)/i*(t-6);return T.toFixed(1)+","+p.toFixed(1)}),r=`M1,${t} L${c.join(" L")} L${a-1},${t} Z`;return`<svg class="spark" viewBox="0 0 ${a} ${t}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${r}" fill="${o}" opacity=".14"></path>
    <polyline points="${c.join(" ")}" fill="none" stroke="${o}" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"></polyline>
    <circle cx="${c[c.length-1].split(",")[0]}" cy="${c[c.length-1].split(",")[1]}" r="2.6" fill="${o}"></circle>
  </svg>`}const L={INR:{sign:"₹",locale:"en-IN",name:"Rupees",coins:[1,2,5,10,20],notes:[10,20,50,100,200,500]},USD:{sign:"$",locale:"en-US",name:"Dollars",coins:[1,5,10,25],notes:[1,5,10,20,50,100]},GBP:{sign:"£",locale:"en-GB",name:"Pounds",coins:[1,2,5,10,20,50],notes:[5,10,20,50]},EUR:{sign:"€",locale:"de-DE",name:"Euro",coins:[1,2,5,10,20,50],notes:[5,10,20,50,100]},AED:{sign:"د.إ",locale:"en-AE",name:"Dirham",coins:[25,50],notes:[5,10,20,50,100]}},Ue={INR:10,USD:.25,GBP:.2,EUR:.25,AED:1};let se="INR";function Ae(e){L[e]&&(se=e)}function $a(){return se}function xt(){return L[se].sign}function ct(e,a,t){return a===t?e:e/Ue[a]*Ue[t]}function f(e){const a=e*Ue[se];return a>=100?Math.round(a/10)*10:Math.round(a)}function h(e,a){const t=L[se],o=Math.round(e),s=new Intl.NumberFormat(t.locale,{maximumFractionDigits:0}).format(Math.abs(o)),n=t.sign+s;return o<0?"−"+n:n}const Tt=864e5;function he(e){return Math.floor((e-new Date(e).getTimezoneOffset()*6e4)/Tt)}function xa(e){return new Date(e).toLocaleDateString(L[se].locale,{day:"numeric",month:"short"})}function Re(e){return new Date(e).toLocaleDateString(L[se].locale,{weekday:"long"})}const we=(e,a,t)=>`<svg viewBox="0 0 64 64" role="img" aria-label="${e}"><rect width="64" height="64" fill="${a}"/>${t}</svg>`,ke=(e,a,t,o)=>`
  <circle cx="${e}" cy="${t}" r="${o}" fill="#25201C"/>
  <circle cx="${a}" cy="${t}" r="${o}" fill="#25201C"/>
  <circle cx="${e+o*.4}" cy="${t-o*.45}" r="${o*.36}" fill="#fff"/>
  <circle cx="${a+o*.4}" cy="${t-o*.45}" r="${o*.36}" fill="#fff"/>`,H={pip:{name:"Pip",role:"your neighbour on Market Row",svg:we("Pip the squirrel","#FBEBD6",`
      <path d="M50 46c10-4 12-18 5-25-6-6-14-2-13 5 1 6 8 5 8 10 0 4-4 6-8 6z" fill="#C9752F"/>
      <path d="M49 44c7-4 8-14 3-19-4-4-9-1-8 3 1 5 6 5 6 9 0 3-2 5-5 6z" fill="#E29350"/>
      <ellipse cx="30" cy="44" rx="17" ry="16" fill="#D98338"/>
      <ellipse cx="30" cy="49" rx="11" ry="10" fill="#F6DEBE"/>
      <circle cx="30" cy="27" r="15" fill="#E29350"/>
      <path d="M19 17c-3-5 0-9 4-8s5 6 3 9zM41 17c3-5 0-9-4-8s-5 6-3 9z" fill="#E29350"/>
      <path d="M20 16c-1-3 0-4 2-4s3 3 2 5zM40 16c1-3 0-4-2-4s-3 3-2 5z" fill="#F2B183"/>
      <ellipse cx="30" cy="33" rx="9" ry="7" fill="#F6DEBE"/>
      ${ke(25,35,25,3.2)}
      <path d="M30 31c-1.6 0-2.6-1-2.6-2 0-.9 1-1.6 2.6-1.6s2.6.7 2.6 1.6c0 1-1 2-2.6 2z" fill="#2A2320"/>
      <path d="M26 35q4 3 8 0" stroke="#2A2320" stroke-width="1.4" fill="none" stroke-linecap="round"/>`)},mags:{name:"Mags",role:"Bizzington's best salesperson",svg:we("Mags the magpie","#E6EAF2",`
      <path d="M44 50c8-6 10-16 6-24l8 22z" fill="#2B3350"/>
      <ellipse cx="30" cy="42" rx="16" ry="17" fill="#2B3350"/>
      <ellipse cx="28" cy="46" rx="9" ry="11" fill="#F2F4F9"/>
      <circle cx="30" cy="24" r="13" fill="#2B3350"/>
      <path d="M22 30q8 6 16 0-2 8-8 8t-8-8z" fill="#3E4A75"/>
      ${ke(25,35,22,3)}
      <path d="M30 26l10 4-10 4z" fill="#E8B33F"/>
      <circle cx="47" cy="35" r="5" fill="#F0B429"/>
      <circle cx="45.4" cy="33.4" r="1.6" fill="#FFF0C4"/>`)},bo:{name:"Bo",role:"thinks it goes up",svg:we("Bo the bull calf","#E7F1E4",`
      <ellipse cx="32" cy="44" rx="18" ry="16" fill="#B58C64"/>
      <circle cx="32" cy="28" r="15" fill="#C99B70"/>
      <path d="M17 20c-6-3-9 2-6 6 2 3 6 3 8 0zM47 20c6-3 9 2 6 6-2 3-6 3-8 0z" fill="#EFE3CE"/>
      <ellipse cx="32" cy="36" rx="10" ry="8" fill="#F1DCC4"/>
      <circle cx="28.5" cy="36" r="1.7" fill="#7A5B3C"/><circle cx="35.5" cy="36" r="1.7" fill="#7A5B3C"/>
      ${ke(26,38,25,3)}
      <path d="M25 15q7-4 14 0" stroke="#8E6A48" stroke-width="2" fill="none" stroke-linecap="round"/>`)},bea:{name:"Bea",role:"thinks it goes down",svg:we("Bea the bear cub","#EFE7E0",`
      <circle cx="18" cy="18" r="7" fill="#6E5445"/><circle cx="46" cy="18" r="7" fill="#6E5445"/>
      <circle cx="18" cy="18" r="3.4" fill="#A98B77"/><circle cx="46" cy="18" r="3.4" fill="#A98B77"/>
      <ellipse cx="32" cy="44" rx="18" ry="16" fill="#7C6152"/>
      <circle cx="32" cy="30" r="16" fill="#8A6B5A"/>
      <ellipse cx="32" cy="38" rx="10" ry="8" fill="#D9C3B2"/>
      <path d="M32 35c-2 0-3.2-1.2-3.2-2.4 0-1.1 1.4-1.9 3.2-1.9s3.2.8 3.2 1.9c0 1.2-1.2 2.4-3.2 2.4z" fill="#3A2C24"/>
      <path d="M28 40q4 3 8 0" stroke="#3A2C24" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      ${ke(26,38,27,3)}`)},nana:{name:"Nana Bizz",role:"retired, from the shuttered shop",svg:we("Nana Bizz the tortoise","#E4EFE8",`
      <ellipse cx="42" cy="46" rx="20" ry="15" fill="#4E7A55"/>
      <ellipse cx="42" cy="46" rx="20" ry="15" fill="none" stroke="#3B5F42" stroke-width="2"/>
      <path d="M30 44h24M42 33v26M34 36l16 18M50 36L34 54" stroke="#3B5F42" stroke-width="1.6" opacity=".5"/>
      <circle cx="26" cy="28" r="14" fill="#7FA86F"/>
      <ellipse cx="26" cy="34" rx="8" ry="6" fill="#A5C795"/>
      ${ke(20,32,25,3.1)}
      <circle cx="20" cy="25" r="7" fill="none" stroke="#2F3A33" stroke-width="1.3"/>
      <circle cx="32" cy="25" r="7" fill="none" stroke="#2F3A33" stroke-width="1.3"/>
      <path d="M27 25h1" stroke="#2F3A33" stroke-width="1.3"/>
      <path d="M22 34q4 2.5 8 0" stroke="#2F3A33" stroke-width="1.4" fill="none" stroke-linecap="round"/>`)}};function Ta(e,a){return`<span class="who" style="">${(H[e]||H.pip).svg}</span>`}function R(e,a){const t=H[e]||H.pip;return`<div class="say">${Ta(e)}<div class="bub"><span class="nm">${t.name}</span>${a}</div></div>`}const Pe=[{key:"place",x:20,sub:"place",name:"Your place",lv:1,blurb:"where you live, and what it costs you every single week"},{key:"wallet",x:175,sub:"wallet",name:"Your stall",lv:1,blurb:"Market Row — where the money you earn actually sits"},{key:"jars",x:330,sub:"jars",name:"The Jar Shed",lv:6,blurb:"four jars, and a rule that splits your pay day by itself"},{key:"goals",x:485,sub:"goals",name:"The Build Yard",lv:8,blurb:"name a thing and watch it go up floor by floor"},{key:"bank",x:640,sub:"bank",name:"The Bank",lv:11,blurb:"the clock strikes interest, in public, every pay day"},{key:"exchange",x:795,sub:"portfolio",name:"The Exchange",lv:16,blurb:"Bo and Bea keep the board and neither of them knows"},{key:"shop",x:950,sub:"business",name:"Nana Bizz's shop",lv:23,blurb:"shuttered since she retired. Yours when you are ready"}],je=1115,Oe=348,g=250;function Aa(e,a,t){return`<g>
    <rect x="${e+a/2-30}" y="${g-54}" width="60" height="24" rx="12" fill="#1C2A2E" opacity=".82"/>
    <text x="${e+a/2}" y="${g-37}" text-anchor="middle" font-size="12.5" font-weight="700"
      fill="#EAE2CE" font-family="ui-monospace,monospace">🔒 Lv ${t}</text>
  </g>`}function Ma(e,a,t,o){return`<text x="${e+a/2}" y="${g+22}" text-anchor="middle" font-size="12.5" font-weight="800"
    fill="var(--ink)" opacity="${o?".85":".5"}">${u(t)}</text>`}function Sa(e,a){const t=["#B9A98C","#C6B58F","#D3BE96","#E0C79E","#E8CFA8"][a]||"#B9A98C",o=["#8A6A4E","#96745A","#A57E5E","#B0866A","#B8563F"][a]||"#8A6A4E",s=a>=2?2:1,n=s===2?118:78;let i="";return(s===2?[g-108,g-62]:[g-66]).forEach(r=>{const k=a>=2?3:a>=1?2:1;for(let b=0;b<k;b++)i+=`<rect x="${e+22+b*32}" y="${r}" width="22" height="24" rx="3" fill="#F6E9C8"/>
        <rect x="${e+22+b*32}" y="${r}" width="22" height="24" rx="3" fill="none" stroke="${o}" stroke-width="2"/>`}),`<g>
    <rect x="${e+8}" y="${g-n}" width="114" height="${n}" fill="${t}" rx="3"/>
    <path d="M${e} ${g-n} L${e+65} ${g-n-34} L${e+130} ${g-n} Z" fill="${o}"/>
    ${i}
    <rect x="${e+52}" y="${g-34}" width="26" height="34" rx="2" fill="${o}"/>
    <circle cx="${e+73}" cy="${g-17}" r="2" fill="#F0B429"/>
    ${a>=3?`<rect x="${e+96}" y="${g-n-26}" width="12" height="26" fill="${o}"/>
      <ellipse cx="${e+102}" cy="${g-n-32}" rx="9" ry="6" fill="rgba(255,255,255,.5)"/>`:""}
    ${a>=4?`<rect x="${e+6}" y="${g-14}" width="118" height="14" rx="4" fill="#7FA86F"/>
      <circle cx="${e+22}" cy="${g-16}" r="6" fill="#5F8A52"/><circle cx="${e+110}" cy="${g-16}" r="5" fill="#5F8A52"/>`:""}
  </g>`}function Ea(e,a){const t=a?"#B07A45":"#6E6A5E",o=a?"#C8524A":"#5E5A52";return`<g>
    <rect x="${e+8}" y="${g-62}" width="114" height="62" fill="${t}" rx="3"/>
    <rect x="${e+8}" y="${g-72}" width="114" height="12" fill="${a?"#8E5F35":"#57544B"}" rx="2"/>
    <path d="M${e} ${g-72} L${e+65} ${g-112} L${e+130} ${g-72} Z" fill="${o}"/>
    <path d="M${e+12} ${g-74} l14-24 14 24z" fill="${a?"#E8D9B8":"#6E6A5E"}"/>
    ${a?`<circle cx="${e+34}" cy="${g-46}" r="7" fill="#E0603C"/><circle cx="${e+52}" cy="${g-46}" r="7" fill="#F0B429"/><circle cx="${e+70}" cy="${g-46}" r="7" fill="#7CA84F"/>`:""}
    <rect x="${e+88}" y="${g-52}" width="26" height="52" fill="${a?"#7A5230":"#4E4B44"}" rx="2"/>
  </g>`}function za(e,a,t){const o=a?"#D8C79E":"#6E6A5E";let s="";if(a){const n=["#C4453C","#2E7FA8","#178A4C","#8A5BD6"];t.forEach((i,c)=>{const r=e+17+c*25,k=38*Math.max(.08,Math.min(1,i));s+=`<rect x="${r}" y="${g-80}" width="21" height="42" rx="5" fill="#F4F9FA" opacity=".92"/>
        <rect x="${r+2}" y="${g-38-k}" width="17" height="${k}" rx="4" fill="${n[c]}"/>
        <rect x="${r}" y="${g-80}" width="21" height="6" rx="3" fill="#CFDDDF"/>`})}return`<g>
    <rect x="${e+6}" y="${g-92}" width="118" height="92" fill="${o}" rx="3"/>
    <path d="M${e} ${g-92} L${e+65} ${g-124} L${e+130} ${g-92} Z" fill="${a?"#7E9C6A":"#5E5A52"}"/>
    <rect x="${e+14}" y="${g-80}" width="102" height="46" rx="4" fill="${a?"#3E3226":"#4E4B44"}" opacity=".25"/>
    ${s}
    <rect x="${e+52}" y="${g-34}" width="26" height="34" fill="${a?"#8E6238":"#4E4B44"}" rx="2"/>
  </g>`}function Ba(e,a,t){const s=Math.floor(t*4+.001);let n="";for(let i=0;i<4;i++){const c=g-26-(i+1)*26,r=i<s;n+=`<rect x="${e+22}" y="${c}" width="86" height="24" rx="2"
      fill="${r?a?"#C9A87A":"#6E6A5E":"none"}"
      stroke="${a?"rgba(255,255,255,.5)":"rgba(255,255,255,.25)"}" stroke-width="1.4" stroke-dasharray="${r?"0":"4 4"}"/>`,r&&a&&(n+=`<rect x="${e+32}" y="${c+6}" width="14" height="12" fill="#F0B429" opacity=".9"/>
      <rect x="${e+58}" y="${c+6}" width="14" height="12" fill="#F0B429" opacity=".55"/>`)}return`<g>
    <rect x="${e+10}" y="${g-26}" width="110" height="26" fill="${a?"#A98C63":"#6E6A5E"}" rx="2"/>
    ${n}
    <path d="M${e+14} ${g} L${e+14} ${g-118} M${e+116} ${g} L${e+116} ${g-118} M${e+14} ${g-58} L${e+116} ${g-58}"
      stroke="${a?"#8A6A3E":"#57544B"}" stroke-width="4" stroke-linecap="round"/>
    ${a&&s>=4?`<path d="M${e+46} ${g-132} l18-8 v10 z" fill="#C8524A"/><rect x="${e+44}" y="${g-134}" width="3" height="22" fill="#8A6A3E"/>`:""}
  </g>`}function ja(e,a,t){const o=a?"#DCD3C0":"#6E6A5E",s=t%12*30;return`<g>
    <rect x="${e+8}" y="${g-86}" width="114" height="86" fill="${o}" rx="2"/>
    <rect x="${e}" y="${g-96}" width="130" height="12" fill="${a?"#C6BBA4":"#5E5A52"}" rx="2"/>
    ${[0,1,2,3].map(n=>`<rect x="${e+18+n*26}" y="${g-84}" width="12" height="84" fill="${a?"#EFE9DA":"#7A7669"}"/>`).join("")}
    <rect x="${e+44}" y="${g-156}" width="42" height="62" fill="${a?"#CFC5AE":"#5E5A52"}" rx="2"/>
    <path d="M${e+40} ${g-156} L${e+65} ${g-176} L${e+90} ${g-156} Z" fill="${a?"#3E6E77":"#4E4B44"}"/>
    <circle cx="${e+65}" cy="${g-132}" r="15" fill="${a?"#FBF7EC":"#8A8678"}" stroke="${a?"#8A5B00":"#57544B"}" stroke-width="2"/>
    ${a?`<path d="M${e+65} ${g-132} v-9" stroke="#3A2E1A" stroke-width="2" stroke-linecap="round"
        transform="rotate(${s} ${e+65} ${g-132})"/>
      <path d="M${e+65} ${g-132} l7 4" stroke="#3A2E1A" stroke-width="2" stroke-linecap="round"/>`:""}
    <rect x="${e+54}" y="${g-42}" width="22" height="42" rx="10" fill="${a?"#6E5233":"#4E4B44"}"/>
  </g>`}function Ca(e,a,t){const o=a?"#C8D8DA":"#6E6A5E";return`<g>
    <rect x="${e+6}" y="${g-104}" width="118" height="104" fill="${o}" rx="3"/>
    <rect x="${e+16}" y="${g-94}" width="98" height="52" rx="3" fill="${a?"#22383C":"#4E4B44"}"/>
    ${a?`<polyline points="${e+22},${g-56} ${e+40},${g-68} ${e+56},${g-60} ${e+74},${g-80} ${e+108},${g-86}"
      fill="none" stroke="${t?"#5BC98C":"#EC8B81"}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`:""}
    <path d="M${e} ${g-104} L${e+65} ${g-130} L${e+130} ${g-104} Z" fill="${a?"#3E6E77":"#5E5A52"}"/>
    <rect x="${e+52}" y="${g-36}" width="26" height="36" fill="${a?"#7A5230":"#4E4B44"}" rx="2"/>

  </g>`}function Ia(e,a){const t=a?"#E8CFA8":"#6E6A5E";return`<g>
    <rect x="${e+6}" y="${g-98}" width="118" height="98" fill="${t}" rx="3"/>
    <path d="M${e} ${g-98} L${e+65} ${g-128} L${e+130} ${g-98} Z" fill="${a?"#B8563F":"#5E5A52"}"/>
    ${a?`<rect x="${e+18}" y="${g-78}" width="94" height="44" rx="3" fill="#FBF3E2"/>
         <rect x="${e+18}" y="${g-86}" width="94" height="10" fill="#C8524A"/>
         <text x="${e+65}" y="${g-50}" text-anchor="middle" font-size="13" font-weight="800" fill="#8A5B00" font-family="Georgia,serif">BIZZ &amp; CO</text>
         <rect x="${e+52}" y="${g-32}" width="26" height="32" fill="#7A5230" rx="2"/>`:`<rect x="${e+18}" y="${g-78}" width="94" height="60" rx="3" fill="#4E4B44"/>
         ${[0,1,2,3,4].map(o=>`<rect x="${e+20}" y="${g-76+o*12}" width="90" height="9" fill="#6E6A5E"/>`).join("")}`}
  </g>`}function Ra(e,a){return`<g><rect x="${e-1.5}" y="18" width="3" height="14" fill="#7A6A50"/>
    <circle cx="${e}" cy="38" r="7.5" fill="${a?"#F0B429":"rgba(140,140,130,.5)"}"/>
    ${a?`<circle cx="${e}" cy="38" r="13" fill="#F0B429" opacity=".2"/>`:""}</g>`}function Na(e,a){return a>=e.lv}function Pa(e){const a=e,t=e.learn.level,o=["spend","save","grow","give"].map(T=>{const p=a.money.jars.spend+a.money.jars.save+a.money.jars.grow+a.money.jars.give;return p>0?a.money.jars[T]/Math.max(p,1)*2:0}),s=a.money.goals.find(T=>!T.done),n=s?Math.min(1,s.saved/s.target):0,i=a.market.lastMove>=0,c=a.streak.days.length,r=new Date().getHours(),k=[0,1,2,3,4,5,6].map(T=>Ra(120+T*118,T<Math.min(7,c))).join(""),b=T=>{const p=Na(T,t);let m="";return T.key==="place"?m=Sa(T.x,e.home&&e.home.tier||0):T.key==="wallet"?m=Ea(T.x,p):T.key==="jars"?m=za(T.x,p,o):T.key==="goals"?m=Ba(T.x,p,n):T.key==="bank"?m=ja(T.x,p,r):T.key==="exchange"?m=Ca(T.x,p,i):m=Ia(T.x,p),`<g class="hot" data-act="town" data-arg="${T.key}" role="button" tabindex="0"
        aria-label="${u(T.name)}${p?"":" — locked until level "+T.lv}">
      <rect class="bldg-glow" x="${T.x-4}" y="${g-190}" width="138" height="196" rx="10" fill="#F0B429" opacity="0"/>
      <g opacity="${p?1:.42}">${m}</g>
      ${p?"":Aa(T.x,130,T.lv)}
      ${Ma(T.x,130,T.name,p)}
    </g>`};return`<svg viewBox="0 0 ${je} ${Oe}" preserveAspectRatio="xMidYMax meet" aria-label="Bizzington">
    <style>
      .bob{animation:bzf-bob 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
      .glow{animation:bzf-glow 4.2s ease-in-out infinite}
      .ping{animation:bzf-ping 1.9s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
      @keyframes bzf-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
      @keyframes bzf-glow{0%,100%{opacity:.2}50%{opacity:.42}}
      @keyframes bzf-ping{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}
      @media (prefers-reduced-motion:reduce){.bob,.glow,.ping{animation:none}}
    </style>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/>
      </linearGradient>
    </defs>
    <rect width="${je}" height="${Oe}" fill="url(#sky)"/>
    <circle cx="852" cy="62" r="26" fill="#F0B429" opacity=".55"/>
    <g fill="rgba(255,255,255,.6)">
      <ellipse cx="150" cy="70" rx="34" ry="15"/><ellipse cx="178" cy="62" rx="24" ry="17"/>
      <ellipse cx="520" cy="52" rx="28" ry="13"/><ellipse cx="546" cy="46" rx="20" ry="14"/>
    </g>
    <g stroke="rgba(40,60,64,.35)" stroke-width="1.6" fill="none" stroke-linecap="round">
      <path d="M300 82 q7-6 14 0 q7-6 14 0"/><path d="M352 62 q6-5 12 0 q6-5 12 0"/>
    </g>
    <path d="M0 210 q90-46 190-10 t180-4 q100-40 200 2 t210-6 v140 H0z" fill="rgba(80,110,100,.18)"/>
    ${k}
    <rect x="0" y="${g}" width="${je}" height="${Oe-g}" fill="var(--ground)"/>
    <rect x="0" y="${g+28}" width="${je}" height="6" fill="var(--road)" opacity=".7"/>
    ${Pe.map(b).join("")}
    <g aria-hidden="true" transform="translate(301,204) scale(.72)"><g class="bob">
      <ellipse cx="16" cy="62" rx="16" ry="4" fill="rgba(0,0,0,.14)"/>
      <path d="M30 44c8-3 10-14 4-19-5-5-11-2-10 4 1 5 6 4 6 8 0 3-3 5-6 5z" fill="#C9752F"/>
      <ellipse cx="16" cy="44" rx="12" ry="14" fill="#D98338"/>
      <ellipse cx="16" cy="48" rx="7" ry="8" fill="#F6DEBE"/>
      <circle cx="16" cy="22" r="11" fill="#E29350"/>
      <path d="M8 14c-2-4 0-7 3-6s4 5 2 7zM24 14c2-4 0-7-3-6s-4 5-2 7z" fill="#E29350"/>
      <ellipse cx="16" cy="26" rx="7" ry="5" fill="#F6DEBE"/>
      <circle cx="12" cy="20" r="2.2" fill="#25201C"/><circle cx="20" cy="20" r="2.2" fill="#25201C"/>
      <path d="M16 25c-1.2 0-2-.8-2-1.5s.8-1.2 2-1.2 2 .5 2 1.2-.8 1.5-2 1.5z" fill="#2A2320"/>
    </g></g>
    <g class="hot" data-act="postbox" role="button" tabindex="0" aria-label="Open the postbox">
      <ellipse cx="52" cy="322" rx="28" ry="6" fill="rgba(0,0,0,.13)"/>
      <rect x="48" y="288" width="7" height="34" rx="2" fill="#6B5B44"/>
      <rect x="26" y="272" width="54" height="36" rx="10" fill="${a.postbox.answered?"#9C978A":"#C4453C"}"/>
      <rect x="26" y="272" width="54" height="11" rx="5" fill="rgba(255,255,255,.2)"/>
      <rect x="36" y="288" width="34" height="5" rx="2.5" fill="rgba(0,0,0,.42)"/>
      ${a.postbox.answered?"":`<g class="ping"><circle cx="83" cy="272" r="11" fill="#F0B429"/>
        <text x="83" y="277" text-anchor="middle" font-size="14" font-weight="800" fill="#5A3D00">1</text></g>`}
      <text x="52" y="338" text-anchor="middle" font-size="12" font-weight="800" fill="var(--ink)" opacity=".7">Postbox</text>
    </g>
  </svg>`}const ue=(()=>{const e=[];for(let a=1;a<=30;a++)e.push(Math.round(24*(a-1)+1.3*(a-1)*(a-1)));return e})(),Te=[{at:1,name:"Saver",em:"🪙",of:"what money is, and how it arrives"},{at:6,name:"Budgeter",em:"🫙",of:"a plan, and the sellers who test it"},{at:11,name:"Banker",em:"🏛️",of:"interest, safety, and what borrowing costs"},{at:16,name:"Investor",em:"📈",of:"risk, time, and never owning one thing"},{at:23,name:"Founder",em:"🏪",of:"revenue, cost, and the difference between them"}];function Fa(e){let a=1;for(let t=1;t<ue.length;t++)e>=ue[t]&&(a=t+1);return Math.min(a,ue.length)}function _e(e){let a=Te[0];return Te.forEach(t=>{e>=t.at&&(a=t)}),a.name}function Je(e){let a=Te[0];return Te.forEach(t=>{e>=t.at&&(a=t)}),a}const ie=[{id:"c1",title:"What money even is",rank:"Saver",em:"🪙",lv:1,blurb:"Where money comes from, and why anyone accepts a piece of paper for a mango.",cards:[{id:"c1a",title:"Money is an agreement",who:"nana",teach:"A note is a piece of paper. It buys bread because <b>everyone agrees it does</b> — not because the paper is worth anything. Different places agree on different money, which is why the notes change when you cross a border.",eg:"The same slice of cake costs a different number in every country. The cake did not change.",drill:{q:"Why will the shopkeeper hand over a mango for a note?",opts:["The paper is worth a mango","Everyone has agreed the note can be swapped for things","The government sends her a mango later","The note is made of gold"],a:1,why:"Money works because of shared agreement. That is also why a note from another country is no use at your corner shop."}},{id:"c1b",title:"Needs and wants",who:"pip",teach:"A <b>need</b> is something you would be in trouble without. A <b>want</b> is something that makes life nicer. Both are allowed! The trick is knowing which one you are looking at <i>before</i> you pay.",eg:"Rain is coming. An umbrella is a need today and a want in May.",drill:{q:"Which of these changes from a want to a need depending on the day?",opts:["A birthday cake","An umbrella","A gold chain","A video game"],a:1,why:'Lots of things move between the two columns. That is why "needs vs wants" is a question, not a list.'}},{id:"c1c",title:"Where money comes from",who:"pip",teach:"Money arrives because somebody <b>traded something they had for something they wanted</b>. Usually that is time and skill: you do work, someone pays. Nobody is given money for nothing — and if a message says they will, read chapter five twice.",eg:"Pip carries crates for the grain seller. The grain seller has money and no time. Both end up better off.",drill:{q:"Mrs Rao pays you to deliver flyers. What did you actually sell her?",opts:["Paper","Your time and effort","Nothing — it was a gift","Her own flyers"],a:1,why:'Wages are a trade. Knowing that is what stops "free money" offers from ever sounding normal.'}},{id:"c1d",title:"Price is not value",who:"mags",teach:"The <b>price</b> is what the seller asks. The <b>value</b> is what it is worth <i>to you</i>. They are almost never the same number, and the gap between them is where every good and bad decision lives.",eg:"Mags will sell you a shiny button for a whole week of wages. The price is real. The value is up to you.",drill:{q:"Two shops sell the same water bottle at very different prices. What must be true?",opts:["The dearer one is always better made","Price does not only depend on the thing itself","The cheaper one is broken","One of them is breaking the law"],a:1,why:"Location, timing, and who is buying all move a price. The bottle is the same bottle."}}]},{id:"c2",title:"Earning it",rank:"Saver",em:"🧺",lv:3,blurb:"What you are really selling when somebody pays you, and how to be worth asking twice.",cards:[{id:"c2a",title:"You are selling time",who:"pip",teach:"Nearly every job is the same trade underneath: somebody has money and not enough <b>time</b>, and you have time and not enough money. The price is what your hour is worth to <i>them</i>, not what it feels like to you.",eg:"Two hours stacking crates pays the same whether it felt long or short. The clock is the product.",drill:{q:"Why does the grain seller pay for an hour of crate-stacking?",opts:["She enjoys company","Her own hour is worth more spent elsewhere","Crates cannot be moved by owners","It is the law"],a:1,why:"People buy time when their own is worth more doing something else. That idea comes back in every job you will ever have."}},{id:"c2b",title:"Being worth asking twice",who:"nana",teach:"The first job comes from luck. The second comes from how you did the first. Turning up, finishing, and saying what went wrong are worth more over a year than being the fastest.",eg:"Nana rehired the same boy for eleven years. He was never the quickest. He always said when a crate was cracked.",drill:{q:"What most affects whether you get asked back?",opts:["Being the fastest","Being reliable and honest about problems","Charging the least","Knowing the owner"],a:1,why:"Reputation is the thing that compounds fastest in a working life, and it is the only one you build for free."}},{id:"c2c",title:"Gifts are not wages",who:"pip",teach:"Money you were <b>given</b> and money you <b>earned</b> spend exactly the same — but they are not the same to plan with. A gift arrives once. A wage arrives again if you keep doing the thing.",eg:"A birthday 500 is lovely. It is not an income, and a plan built on it falls over next month.",drill:{q:"Why is it risky to plan a monthly budget around gift money?",opts:["Gifts are taxed","It arrives once and may not come again","Gifts are worth less","You must give it back"],a:1,why:"A budget is built on what repeats. One-off money is best pointed at one-off things — a goal, not a habit."}},{id:"c2d",title:"More than one tap",who:"mags",teach:"People who only have one way of getting money are one bad week away from having none. Selling something you no longer use, doing a second small job, or being paid for a thing you would do anyway — these are extra taps.",eg:"Mags sells buttons, mends umbrellas, and finds things. Two of those go badly most months. She is never broke.",drill:{q:"Why does having more than one source of income help?",opts:["It earns more in total","One of them stopping no longer means nothing arrives","It is easier work","It avoids tax"],a:1,why:"This is diversification, three chapters early and applied to earning instead of investing. It is the same idea both times."}}]},{id:"c3",title:"Making a plan",rank:"Budgeter",em:"🫙",lv:6,blurb:"Income, outgo, and the four jars that stop the month being a surprise.",cards:[{id:"c3a",title:"In, out, and what is left",who:"pip",teach:"A budget is only two columns: money <b>in</b> and money <b>out</b>. What is left over is the only part you get to choose about. If out is bigger than in, the difference has to come from somewhere — savings, or someone else.",eg:"In: 200 on pay day. Out: 60 phone, 40 bus. Left: 100. That 100 is the interesting number.",drill:{q:"Money in is 200. Money out is 240. What has to be true?",opts:["Nothing, it balances","The gap comes out of savings or a loan","The bank fixes it","You earned 240"],a:1,why:"A shortfall never vanishes. It moves — usually onto next month."}},{id:"c3b",title:"The four jars",who:"nana",teach:"Split what comes in, the moment it arrives: <b>Spend</b> for now, <b>Save</b> for something soon, <b>Grow</b> for far away, <b>Give</b> for someone else. Splitting first is the whole trick — anything left in one pile gets spent as one pile.",eg:"Nana has done 40 / 30 / 20 / 10 for sixty years and has never once made a spreadsheet.",drill:{q:"Why split the money the moment it arrives, instead of at the end of the week?",opts:["It earns more that way","Because what sits in one pile gets spent as one pile","The bank requires it","It makes the total bigger"],a:1,why:'This is "pay yourself first". It works because it removes the decision, not because it changes the maths.'}},{id:"c3c",title:"What it really cost",who:"mags",teach:'Every yes is also a no. Buying the shiny thing is not just "minus 600" — it is <b>also</b> the trip you now cannot take, or the goal that just moved three weeks further away. Grown-ups call that <i>opportunity cost</i>.',eg:"Mags never mentions the second half of the price. That is not lying — it is just selling.",drill:{q:"You spend your whole Save jar on a game. What did it cost?",opts:["The price of the game","The price, plus whatever the Save jar was for","Nothing, it was your money","Only the tax"],a:1,why:"Opportunity cost is the part of the price that is not on the label."}},{id:"c3d",title:"How many weeks?",who:"pip",teach:"A goal turns into a plan the moment you divide. <b>Price ÷ what you save each week = weeks.</b> If the answer is horrifying, you have three honest choices: save more each week, want something cheaper, or wait longer.",eg:'A 900 skateboard, saving 60 a week, is 15 weeks. Not "someday". Fifteen.',drill:{q:"It costs 800. You put away 50 a week. Roughly how long?",opts:["4 weeks","8 weeks","16 weeks","40 weeks"],a:2,why:"800 ÷ 50 = 16. Dividing turns a wish into a date, which is why the Build Yard shows weeks, not encouragement."}}]},{id:"c4",title:"Sellers and their tricks",rank:"Budgeter",em:"🪧",lv:8,blurb:'Urgency, "free", the small monthly one, and why the shop is arranged like that.',cards:[{id:"c4a",title:"Hurry is a tool",who:"mags",teach:'"Today only." "Last one." "Ends at midnight." These are not facts about the thing — they are <b>tools that stop you thinking</b>, and they work because a decision made fast feels like a decision made bravely.',eg:'Mags has said "the last one" about the same tray of buttons for six years.',drill:{q:"A shop says the offer ends in one hour. What is the safest first move?",opts:["Buy immediately","Notice the hurry is part of the sale, then decide","Argue about the price","Assume it is a scam"],a:1,why:"Urgency is not proof of a bargain, and it is not proof of a scam either. It is a technique — and naming it gives you your thinking back."}},{id:"c4b",title:"Free is never free",who:"nana",teach:"If you are not paying money, something else is being paid: your attention, your details, your time, or a much bigger payment later. Free samples, free games, free trials — all real, all paid for somehow.",eg:"The free trial that needs a card is not selling you a trial. It is selling you the forgetting.",drill:{q:"A game is free to play but sells extras. Who is it built to please?",opts:["Everybody equally","The players most likely to spend","The players who never spend","Nobody in particular"],a:1,why:"Knowing who a thing is designed for tells you what it will try to make you do."}},{id:"c4c",title:"The small monthly one",who:"pip",teach:"A subscription is a decision you make <b>once</b> and pay for <b>forever</b>. Small numbers are the point: 30 a month does not feel like 360 a year, but that is exactly what it is.",eg:"Four small monthly things nobody remembers signing up for is most of a week of wages, every year.",drill:{q:"Something costs 25 a month. What is the honest way to see it?",opts:["25","300 a year, until you cancel","Free after the first month","A one-off 25"],a:1,why:"Multiply every subscription by twelve before you agree to it. Then cancel the ones you would not buy at that price."}},{id:"c4d",title:"The shop is a machine",who:"mags",teach:"Sweets at the till, milk at the back, the dearest thing at eye height — none of that is an accident. A shop is <b>arranged to make buying easy</b>, which is fine, so long as you know that is what it is.",eg:"You walked past eleven things to reach the bread. That was the plan.",drill:{q:"Why is milk usually at the back of the shop?",opts:["It stays cooler there","So you walk past everything else","It is heavy","Nobody buys it"],a:1,why:"A shop is designed, and so is a website. Noticing the design is most of the defence."}}]},{id:"c5",title:"Keeping it safe",rank:"Banker",em:"🛡️",lv:11,blurb:"Banks, secrets, and the messages that will actually reach you this year.",cards:[{id:"c5a",title:"What a bank is for",who:"nana",teach:"A bank keeps money safer than a tin under a bed, lets you pay without carrying notes, and <b>pays you a little for leaving it there</b> — because while it sits, the bank lends it to somebody else.",eg:"Your money does not sit in a drawer with your name on it. It is out working, and the bank owes you it back.",drill:{q:"How does a bank afford to pay you interest?",opts:["The government pays it","It lends your money to others for more than it pays you","It sells shares","It charges the shops"],a:1,why:"A bank sits between savers and borrowers and keeps the gap. Knowing that makes both sides of interest obvious."}},{id:"c5b",title:"The three secrets",who:"pip",teach:"A PIN, a password, and a one-time code are <b>yours alone</b>. Nobody real ever needs them — not the bank, not the police, not a helpful stranger, not a friend. Anybody asking is telling you what they are.",eg:"The real bank already knows your account. That is how it is your bank.",drill:{q:"Someone says they are from your bank and asks for the code they just texted you. What is true?",opts:["Give it if the number matches","A real bank never needs that code from you","Give half of it","Ask them to text again"],a:1,why:"The one-time code exists to prove it is you. Handing it over is handing over the proof."}},{id:"c5c",title:"The shape of a scam",who:"nana",teach:"Scams differ in story and are identical in shape: <b>a reward or a fright, a hurry, and a secret</b>. You have won. Your account is at risk. Do not tell anyone. When you see the shape, the story stops mattering.",eg:"Prize, panic, or a friend in trouble — always in a rush, always just between us.",drill:{q:"Which combination should always stop you?",opts:["A good deal in a busy shop","Urgency plus secrecy plus money","A message with spelling mistakes","An offer from someone new"],a:1,why:"Bad spelling is a weak clue and honest strangers exist. Hurry plus secrecy plus money is the reliable one."}},{id:"c5d",title:"Telling someone is the answer",who:"pip",teach:`The reason scams work on grown-ups too is <b>embarrassment</b>. The instruction "don't tell anyone" is not protecting you, it is protecting them. Telling somebody is not the thing you do after failing — it is the move itself.`,eg:"A friend who really needs help can wait sixty seconds while you check with an adult. Someone who cannot, is not your friend.",drill:{q:"You already sent money and feel silly. What is the best next step?",opts:["Say nothing and hope","Tell a grown-up straight away","Send more to fix it","Block and forget it"],a:1,why:"Fast telling is what limits the damage — and being able to say it out loud is the skill worth more than the money."}}]},{id:"c6",title:"Borrowing",rank:"Banker",em:"🤝",lv:13,blurb:"What credit costs, why it exists, and why it is never a verdict on a person.",cards:[{id:"c6a",title:"Interest, both ways",who:"nana",teach:"Interest is <b>rent on money</b>. Leave money with a bank and they pay you rent for using it. Borrow money and you pay rent for using theirs. Same idea, and which side you are on makes all the difference.",eg:"Borrowing is not shameful — it is a tool with a price on it. Always find the price before you agree.",drill:{q:"What is the honest way to describe interest on a loan?",opts:["A punishment for being bad with money","The rent you pay for using somebody else’s money","A tax","A fee the shop keeps"],a:1,why:"Credit is a tool with a price, never a moral failing. Knowing the price is the skill."}},{id:"c6b",title:"The number that matters",who:"pip",teach:"Sellers quote the <b>monthly payment</b> because it is small. The number that tells you the truth is <b>everything you will hand over in total</b>, minus what you borrowed. That gap is what it cost.",eg:"Borrow 1,000, pay back 110 a month for a year: you handed over 1,320. It cost 320.",drill:{q:"You borrow 500 and repay 60 a month for ten months. What did borrowing cost?",opts:["60","100","500","Nothing"],a:1,why:"60 × 10 = 600, less the 500 you borrowed = 100. Always do that multiplication before you sign anything."}},{id:"c6c",title:"Good reasons and bad ones",who:"nana",teach:"Borrowing for a thing that <b>earns or lasts</b> — a tool, a course, a roof — can be sensible even with the rent on top. Borrowing for a thing that is gone by Friday means paying rent on a memory.",eg:"A loan for the umbrella stock made Nana money. A loan for the festival did not, and she would do it again anyway.",drill:{q:"Which is the more defensible reason to borrow?",opts:["A weekend away","A tool that lets you take on paid work","A better phone than your friend’s","Because the offer was there"],a:1,why:"Not a rule about fun — a question. Will this still be worth something when the repayments are still arriving?"}},{id:"c6d",title:"Trust is a memory",who:"pip",teach:"Lenders keep a record of whether people paid them back. A good record makes borrowing cheaper later; a bad one makes it dearer. It is a <b>memory of what happened</b>, not a score of what kind of person you are — and it can be rebuilt.",eg:"Bizzington calls it a trust score. It goes up every time you repay and never says anything about you.",drill:{q:"What does a lender’s record of you actually describe?",opts:["How much money you have","Whether past borrowing was repaid","How hard you work","Whether you deserve help"],a:1,why:"Plenty of good people have bad records after a bad year. It measures history, and history can be added to."}}]},{id:"c7",title:"Money that grows",rank:"Investor",em:"📈",lv:16,blurb:"Compounding, risk, and why nobody sensible owns just one thing.",cards:[{id:"c7a",title:"The snowball",who:"pip",teach:"Interest lands on your money — and then next time, it lands on <b>your money plus the interest</b>. That is compounding. It is boring for a year and then it is not boring at all.",eg:"100 growing 10% a year: 110, then 121, then 133. The steps get bigger while you do nothing.",drill:{q:"Why does the second year add more than the first?",opts:["The rate went up","There is more money for the rate to land on","The bank felt generous","Prices rose"],a:1,why:"Growth stacking on growth is the whole idea. Time does the heavy lifting, which is why starting early beats starting big."}},{id:"c7b",title:"Risk and return",who:"bo",teach:"Things that <i>might</i> grow a lot can also fall a lot — those are the same sentence, not two different ones. Safe things grow slowly. Anybody promising big returns with no risk is either confused or lying.",eg:"Bo says it will go up. Bea says it will go down. Neither of them knows, and both of them are certain.",drill:{q:'Somebody offers a "guaranteed" way to double your money in a month. What is the safe read?',opts:["Take it quickly before it goes","Guaranteed and doubling do not belong in the same sentence","Ask them to do it twice","Only put in half"],a:1,why:"High return with no risk is the oldest shape a scam takes."}},{id:"c7c",title:"Never just one",who:"bea",teach:"Owning a slice of <b>many</b> things means no single piece of bad news can wreck you. Owning one thing means your whole week depends on somebody else’s Tuesday. Spreading out is the only free thing in this entire subject.",eg:"A basket of the whole market is dull, and dull wins more often than exciting does.",drill:{q:"Why spread money across many things instead of the one you like best?",opts:["It grows faster","One piece of bad news can no longer sink everything","It costs less","The best one is hard to find"],a:1,why:"Diversification does not raise your top score. It raises your worst one — and the worst one is what ends games."}},{id:"c7d",title:"Time is the ingredient",who:"nana",teach:"Money you need <b>next month</b> must be somewhere safe, even if it grows by almost nothing. Money you will not touch for <b>ten years</b> can sit through bad weather, because it has time to come back.",eg:"The bus fare and the retirement fund are not the same money and must not live in the same place.",drill:{q:"You need the money in three weeks. Where does it belong?",opts:["Whatever grew most last year","Somewhere safe and boring","Split across four companies","The one your friend likes"],a:1,why:"How soon you need it decides where it goes — before any question about what might grow fastest."}}]},{id:"c8",title:"Running something",rank:"Founder",em:"🏪",lv:23,blurb:"Revenue, cost, profit — and the week you learn those are three different words.",cards:[{id:"c8a",title:"Three different words",who:"nana",teach:"<b>Revenue</b> is everything that came in. <b>Cost</b> is what you paid to make it happen. <b>Profit</b> is what is left. A busy shop with no profit is a very tiring hobby.",eg:"Sold 40 umbrellas at 20 = 800 in. They cost 8 each = 320 out. Profit 480.",drill:{q:"A stall takes 1,000 and spent 900 on stock. What is the profit?",opts:["1,000","100","900","1,900"],a:1,why:"Revenue is the number people brag about. Profit is the number that decides whether you are still open next year."}},{id:"c8b",title:"Setting a price",who:"mags",teach:'Price too low and you sell out and earn nothing. Price too high and you carry the stock home. The right price is not "cost plus a bit" — it is <b>the most people will happily pay</b>, which you only find by trying.',eg:"Mags raised buttons from 8 to 12 and sold two fewer. She made more money and went home earlier.",drill:{q:"You raise the price and sell a few less, but take more money overall. What should you do?",opts:["Go back to the old price","Keep the new price","Halve the price","Stop selling them"],a:1,why:"What matters is total profit, not how many you shifted. Selling more is not the goal; keeping more is."}},{id:"c8c",title:"Cash is not profit",who:"pip",teach:"You can be <b>profitable and broke at the same time</b>. Profit is on paper over a month; cash is what is in your hand on Tuesday when the stock must be paid for and the customers have not come yet.",eg:"Nana's best-ever month nearly closed the shop: the restock was due before the sales landed.",drill:{q:"Your shop is profitable but you cannot pay for stock this week. What is the problem?",opts:["You are not profitable really","Money comes in later than it goes out","The price is wrong","You sold too much"],a:1,why:"Timing kills more small businesses than pricing does. Profit is an opinion about a month; cash is a fact about today."}},{id:"c8d",title:"The stuff that arrives anyway",who:"nana",teach:"Rent and licences arrive whether you sold anything or not — those are <b>fixed</b>. Stock costs only arrive when you sell — those are <b>variable</b>. A quiet week hurts because the fixed ones do not care.",eg:"Two hundred rent a month is seven a day, before you have sold a single thing.",drill:{q:"Which cost still arrives in a week you sell nothing?",opts:["Stock","Rent","Wrapping paper","Nothing does"],a:1,why:"Knowing your fixed costs tells you the smallest week you can survive — the single most useful number a small business owner has."}}]}],fe=ie.flatMap(e=>e.cards.map(a=>({...a,ch:e.id})));function Xe(e){let a=2166136261;for(let o=0;o<e.id.length;o++)a^=e.id.charCodeAt(o),a=Math.imul(a,16777619);const t=e.drill.opts.map((o,s)=>s);for(let o=t.length-1;o>0;o--){a=Math.imul(a^a>>>15,2246822507),a>>>=0;const s=a%(o+1),n=t[o];t[o]=t[s],t[s]=n}return{order:t,opts:t.map(o=>e.drill.opts[o]),answer:t.indexOf(e.drill.a)}}const ht=[{id:"l1",from:"pip",title:"Crates need carrying",body:"The grain seller has forty crates and no time. It is an hour of work. Want it?",choices:[{label:"Take the job",wallet:6,xp:8,note:"An hour of your time, traded."},{label:"Not today",xp:3,note:"Turning down work is a real choice, and sometimes the right one."}]},{id:"l2",from:"mags",title:"Shiny! Today only!",body:"A genuine brass button, previously owned by somebody important, probably. Half a week of your wages. The LAST one.",choices:[{label:"Buy the button",wallet:-10,xp:4,note:'You bought it. That is allowed — but "last one, today only" is a pressure tool, and now you have met one.'},{label:"Walk away",xp:10,badge:"cool-head",note:"Urgency is a sales technique. You noticed, which is most of the defence."}]},{id:"l3",from:"scam",title:"YOU HAVE WON 5,000!",scam:!0,body:"Congratulations!! You are our lucky winner!! To release your prize just send a small handling fee of 200 to the address below. Reply within 2 hours.",choices:[{label:"Pay the fee",wallet:-20,xp:6,note:"The prize never arrives. Nobody who is giving you money needs money from you first. That cost 20 — cheap, here."},{label:"Bin it and tell a grown-up",xp:14,badge:"scam-spotter",safe:!0,note:"Right on both counts: a prize you did not enter is not a prize, and telling someone is part of the answer."}]},{id:"l4",from:"nana",title:"A question, not a task",body:"Ask someone at home tonight: what is the first thing they ever saved up for, and how long did it take? Then come back and tell me.",choices:[{label:"I asked them",xp:16,badge:"asked-home",note:"Good. Every family does money differently, and yours is the one you live in."},{label:"Later",xp:2,note:"It will keep."}]},{id:"l5",from:"pip",title:"The pizza problem",body:"Chhoti wants to split a big pizza — that is 15 each. The bus home is 4 each way. You have 22.",choices:[{label:"Split it, walk home",wallet:-15,xp:12,note:"You made the trade knowingly. That is the whole skill."},{label:"Skip the pizza",xp:10,note:"Also right. There is no wrong answer here — only an unplanned one."},{label:"Split it and worry later",wallet:-15,xp:5,note:"You got home, but the walk was not a decision — it was a surprise. Surprises are what a budget removes."}]},{id:"l6",from:"scam",title:"is this you?? 😭",scam:!0,body:"hey its me i lost my phone im on my cousins account. im stuck and i need 300 rly quick, ill pay you back tomorrow promise. dont tell anyone its embarrassing",choices:[{label:"Send it — they sound desperate",wallet:-30,xp:6,note:'This is the most common scam that reaches children. "Do not tell anyone" is the tell. A real friend can wait sixty seconds while you check.'},{label:"Check with them another way first",xp:15,badge:"scam-spotter",safe:!0,note:"Exactly. Call the number you already have. Secrecy plus urgency plus money is always the same shape."}]},{id:"l7",from:"pip",title:"Bulk deal at the grain stall",body:"Six weeks of chalk for the price of four — but you have to buy all six now. You have the money, just.",choices:[{label:"Buy the six",wallet:-12,xp:12,note:"Cheaper per week. It also empties your pocket today, which is the part the deal does not mention."},{label:"Buy one week",wallet:-3,xp:8,note:"Dearer per week, but you kept your options. Both answers are defensible."}]},{id:"l8",from:"bea",title:"Everything is red today",body:"The board is down. Every single line. Bo says buy, I say run. What are you going to do?",choices:[{label:"Sell everything",xp:6,note:"You turned a paper fall into a real one. Everyone does this once — the point is to have done it here, with play money."},{label:"Do nothing",xp:15,badge:"steady-hand",note:"Sitting still is a decision, and on a red day it is usually the hard one."}]},{id:"l9",from:"scam",title:"FREE 10,000 COINS — 1 STEP",scam:!0,body:"GENERATOR WORKING 2026!! Just enter your account name and password on the site below and get UNLIMITED coins instantly. 100% safe no ban.",choices:[{label:"Try it",wallet:-25,xp:6,note:"There is no generator. What there is, is a page collecting passwords — and the account it takes is yours."},{label:"Close it",xp:14,badge:"scam-spotter",safe:!0,note:"Free things that need your password are not free and are not things."}]},{id:"l10",from:"nana",title:"The shop needs a decision",body:"Rain is forecast on market day. Umbrellas cost me 8 each and sell for 20 — but only if it rains. If it stays dry I am stuck with them.",choices:[{label:"Buy ten umbrellas",xp:12,note:"A bet on the weather with real cost attached. Businesses make it every week."},{label:"Buy three",xp:14,note:"Smaller bet, smaller loss, smaller win. You just discovered position sizing without anyone using the words."}]},{id:"l11",from:"mags",title:"I could take that off your hands",body:"That old thing you never use? I will give you 5 for it. Right now. Cash.",choices:[{label:"Sell it",wallet:5,xp:10,note:"Selling what you do not use is income. Most people never think of it as income."},{label:"Keep it",xp:5,note:"Fine — but notice you just valued it above 5."}]},{id:"l12",from:"pip",title:"Pay day is Friday",body:"Reminder: wages land Friday, and the phone plan goes out the same morning. Do you know what will be left?",choices:[{label:"Yes — I checked",xp:12,note:"Knowing the number before it happens is the entire difference between a budget and a hope."},{label:"No idea",xp:4,note:"Open the Jar Shed before Friday, then."}]},{id:"l13",from:"mags",title:"Only 30 a month!",body:"The Bizzington Button Club. New button every month, cancel any time*, just 30 a month. (*by letter, in person, on a Tuesday.)",choices:[{label:"Join — it is only 30",wallet:-30,xp:8,note:"30 a month is 360 a year. Small monthly numbers are the whole technique; multiply by twelve before you agree."},{label:"Work out the year first",xp:15,badge:"times-twelve",note:"360 a year, and cancelling needs a Tuesday. You read the small print, which almost nobody does."}]},{id:"l14",from:"pip",title:"Chhoti wants to borrow",body:"She is 40 short for the trip and says she will pay you back on Friday. She has paid you back before. You have it, but it is your Save jar.",choices:[{label:"Lend it",wallet:-40,xp:13,note:"Lending to friends is fine and it is a real risk. Ask yourself first: if it never comes back, is the friendship still fine?"},{label:"Explain why not",xp:13,note:"Saying no honestly is a skill, and it protects the friendship better than a grudge does."},{label:"Lend half",wallet:-20,xp:15,note:"Smaller stake, same kindness. Most good money answers are a size, not a yes or a no."}]},{id:"l15",from:"scam",title:"EARN 2,000/WEEK FROM HOME",scam:!0,body:"Simple work, no experience, start today! Small one-time registration fee of 150 to receive your starter kit. Limited places for your area.",choices:[{label:"Register",wallet:-15,xp:6,note:"A job that charges you to start is not a job. Real work pays you; it does not invoice you."},{label:"Delete it",xp:14,badge:"scam-spotter",safe:!0,note:"Money should flow towards the worker. Any offer reversing that arrow is the scam."}]},{id:"l16",from:"nana",title:"The roof, and the rainy-day tin",body:"My roof went last winter. It did not care that I had plans. I keep a tin with one month of costs in it and I have refilled it nine times in sixty years.",choices:[{label:"Start a rainy-day tin",xp:16,badge:"rainy-day",note:"An emergency fund is the least exciting and most protective thing in this whole app. Boring is the point."},{label:"Nothing will go wrong",xp:4,note:"It might not. The tin costs nothing while you are right, and everything while you are not."}]},{id:"l17",from:"bo",title:"A tip, just for you",body:"My cousin knows a man whose brother says Rocket Rickshaws are about to TRIPLE. Everyone is in. You should put the lot in. Can't lose!",choices:[{label:"Put it all in",xp:6,note:`"Everyone is in" and "can't lose" are the two most expensive sentences in money. Bo means well. Bo is also always certain.`},{label:"Put in a little, spread the rest",xp:15,badge:"diversified",note:"You can take a small swing without betting the week on somebody's cousin's brother."},{label:"Ignore it",xp:13,note:"A tip that reaches you has reached everybody. That is what makes it not a tip."}]},{id:"l18",from:"pip",title:"The price went up",body:"The chalk that was 10 last year is 12 now. Same chalk, same stall, same seller.",choices:[{label:"That is inflation",xp:14,badge:"noticed-inflation",note:"Prices drifting up over time is normal. It is also why money left in a tin quietly buys less each year."},{label:"He is cheating me",xp:6,note:"Sometimes! But usually his costs rose too. Prices carry information about the whole chain behind them."}]},{id:"l19",from:"mags",title:"It broke. Obviously.",body:"Your umbrella has turned inside out and died. A new one is 25. Also, I *did* offer you the cover for 3 a month.",choices:[{label:"Buy a new one",wallet:-25,xp:10,note:"Sometimes paying for the loss is cheaper than paying for cover. That is a calculation, not a mistake."},{label:"Ask what cover would have cost",xp:14,note:"3 a month is 36 a year to protect a 25 umbrella. Insurance is worth it for things you could not replace — not for things you could."}]},{id:"l20",from:"nana",title:"Where the Give jar went",body:"The school down the road lost its roof too. I put a little in every month for years without noticing, and this month it mattered.",choices:[{label:"Give from the Give jar",xp:15,badge:"gave",note:"Generosity works the same way saving does: small, regular, and invisible until the week it is not."},{label:"Keep it for now",xp:6,note:"A fair answer. The jar is yours and it will still be there."}]},{id:"l21",from:"scam",title:"Your account will be CLOSED",scam:!0,body:"URGENT: unusual activity detected. Your account is suspended. Confirm your PIN and the code we just sent to restore access within 30 minutes or funds will be frozen.",choices:[{label:"Confirm the details",wallet:-35,xp:6,note:"A real bank never asks for your PIN or a one-time code. The code exists to prove it is you — giving it away hands over the proof."},{label:"Ring the bank on the number you already have",xp:16,badge:"scam-spotter",safe:!0,note:"Perfect. Fright plus a countdown plus a secret is the shape. Always go back through a number you found yourself."}]},{id:"l22",from:"pip",title:"You got paid for the flyers",body:"Mrs Rao says you did it properly and she has two more streets next week if you want them.",choices:[{label:"Take next week too",wallet:8,xp:14,badge:"asked-back",note:"Being asked back is worth more than the fee. Reputation is the fastest-compounding thing you own."},{label:"Just take the pay",wallet:8,xp:8,note:"Fair enough. The money is the same; the second street was the interesting part."}]}],At=[{id:"crates",em:"📦",name:"Stack crates",units:6,who:"the grain seller"},{id:"flyers",em:"📄",name:"Deliver flyers",units:5,who:"Mrs Rao"},{id:"sweep",em:"🧹",name:"Sweep Market Row",units:3,who:"the market office"},{id:"mend",em:"🧵",name:"Mend umbrellas",units:8,who:"Mags",lv:6},{id:"books",em:"📒",name:"Do Nana's books",units:12,who:"Nana Bizz",lv:11}],Me=[{id:"room",em:"🚪",name:"A room above the stall",rent:4,bills:[],food:10,deposit:0,blurb:"Dry, small, and yours. Nothing to manage yet."},{id:"window",em:"🪟",name:"A room with a window",rent:7,bills:[{name:"Phone",units:2}],food:10,deposit:14,blurb:"Your first real bill — and it arrives whether or not you worked."},{id:"flat",em:"🏢",name:"A small flat",rent:12,bills:[{name:"Phone",units:2},{name:"Power",units:3},{name:"Water",units:1}],food:10,deposit:24,blurb:"Enough bills that a plan beats remembering."},{id:"kitchen",em:"🍳",name:"A flat with a kitchen",rent:15,bills:[{name:"Phone",units:2},{name:"Power",units:4},{name:"Water",units:2}],food:4,deposit:36,perk:"kitchen",blurb:"Dearer rent, more bills — and it costs you less, because you can cook."},{id:"house",em:"🏡",name:"A little house, bought",rent:0,bills:[{name:"Phone",units:2},{name:"Power",units:5},{name:"Water",units:2},{name:"Internet",units:3},{name:"Upkeep",units:3}],food:4,deposit:120,perk:"kitchen",owned:!0,mortgage:{units:320,weeks:40},blurb:"Rent is forever. A mortgage ends. The first thing you own instead of rent."}],Mt=[{id:"lantern",em:"🏮",name:"Festival lantern",units:8,desc:"Hangs over your stall. Purely lovely."},{id:"cap",em:"🧢",name:"Market cap",units:12,desc:"Pip has one. Pip thinks it suits him."},{id:"awning",em:"⛱️",name:"Striped awning",units:16,desc:"Your stall, but smarter."},{id:"sign",em:"🪧",name:"Painted sign",units:24,desc:"Your name, in gold leaf, above your own stall."},{id:"cat",em:"🐈",name:"A shop cat",units:30,desc:"Does nothing. Sits. Worth it, arguably."},{id:"brass",em:"🔆",name:"Mags's brass button",units:60,desc:"Previously owned by somebody important, probably."},{id:"clock",em:"🕰️",name:"Brass stall clock",units:45,desc:"Tells the time. Loudly, and slightly wrong."},{id:"kite",em:"🪁",name:"A very good kite",units:20,desc:"No financial merit whatsoever."}],U=[{id:"basket",name:"Whole Market Basket",kind:"fund",em:"🧺",vol:.03,drift:.0075,desc:"A slice of every shop in town. Dull by design."},{id:"grain",name:"Sunrise Grains",kind:"steady",em:"🌾",vol:.016,drift:.004,desc:"People eat in good years and bad. Rarely exciting."},{id:"chai",name:"Chai Chain Co",kind:"growth",em:"🫖",vol:.052,drift:.009,desc:"Opening shops fast. Fast can go both ways."},{id:"rocket",name:"Rocket Rickshaws",kind:"wild",em:"🛺",vol:.105,drift:.0125,desc:"Might be the future. Might be a rickshaw."}];function St(e){const a={};return U.forEach((t,o)=>{const s=te(9301+o*7919);let n=100;const i=[n];for(let c=0;c<e;c++){const r=(s()+s()+s()-1.5)*2*t.vol,k=c===Math.floor(e*.55)?-t.vol*3.1:0;n=Math.max(6,n*(1+t.drift+r+k)),i.push(n)}a[t.id]=i}),a}const Y=[{id:"chai",em:"🫖",name:"Chai",cost:2,sells:5,best:"cold",desc:"Sells all year. Sells twice as well when it is cold."},{id:"umbrella",em:"☂️",name:"Umbrellas",cost:8,sells:20,best:"rain",desc:"Enormous margin, and only if it rains."},{id:"ice",em:"🍧",name:"Ice golas",cost:3,sells:9,best:"hot",desc:"Melts. Literally a deadline."},{id:"rope",em:"🪢",name:"Rope & twine",cost:4,sells:8,best:"any",desc:"Nobody is excited. Somebody always needs it."}],ce=[{id:"rain",em:"🌧️",name:"Rain all day",mult:{umbrella:2.6,chai:1.4,ice:.2,rope:1}},{id:"hot",em:"☀️",name:"Blazing hot",mult:{umbrella:.15,chai:.7,ice:2.8,rope:1}},{id:"cold",em:"🌬️",name:"Cold wind",mult:{umbrella:.6,chai:2.2,ice:.3,rope:1.1}},{id:"fair",em:"⛅",name:"Fair and mild",mult:{umbrella:.5,chai:1,ice:1.2,rope:1.1}}],Ke=[["Budget","A plan for money before you spend it.","Two columns — in and out — and whatever is left is the part you choose about."],["Income","Money coming in.","Wages, a gift, interest, or something you sold. A budget is built on the parts that repeat."],["Expense","Money going out.","Fixed ones arrive whether you like it or not; variable ones follow what you do."],["Opportunity cost","The thing you could have had instead.","The half of the price that is never on the label."],["Interest","Rent on money.","You are paid it for lending; you pay it for borrowing. Same idea, opposite sides."],["Compounding","Growth landing on earlier growth.","Boring for a year, then not boring at all. Time does the work."],["Principal","The amount you started with.","The sum you borrowed or invested, before any interest."],["Inflation","Prices drifting up over time.","Which is why money in a tin quietly buys less each year."],["Saving","Keeping money for something soon.","Safe, boring, and reachable when you need it."],["Investing","Putting money somewhere it might grow.","Might. Things that can rise a lot can fall a lot — same sentence."],["Risk","How wrong this could go.","Not a reason to avoid something. A reason to size it properly."],["Return","What you got back, over what you put in.","Usually a percentage, usually quoted by someone who wants something."],["Diversification","Not owning just one thing.","It does not raise your best outcome. It raises your worst, and the worst is what ends games."],["Share","A small piece of a company.","Own one and you own a sliver of everything that company does."],["Fund","A basket holding many things at once.","One purchase, lots of eggs, lots of baskets."],["Index fund","A fund holding a whole market.","Deliberately unexciting. Very hard to beat over a long time."],["Dividend","A share of profits paid to owners.","Some companies pay them, some reinvest instead. Neither is automatically better."],["Fee","What it costs to use a service.","Invisible in real life, which is exactly why this app puts it on screen."],["Volatility","How much something jumps about.","High volatility is not the same as high risk of loss, but they travel together."],["Bear market","A long stretch of falling prices.","Bea is right roughly as often as Bo is."],["Bull market","A long stretch of rising prices.","Everyone feels clever. That is the dangerous part."],["Credit","Borrowed money.","A tool with a price on it, never a verdict on a person."],["Debt","Money you owe.","Ordinary, common, and worth understanding rather than being ashamed of."],["Loan term","How long you have to repay.","A longer term means smaller payments and more total cost. Both, always."],["Trust score","A record of whether past borrowing was repaid.","A memory of what happened, not a score of what kind of person you are."],["Emergency fund","Money kept for the thing you did not plan.","Costs nothing while you are lucky and everything while you are not."],["Insurance","Paying a little so a disaster costs less.","Worth it for what you could not replace. Rarely worth it for what you could."],["Premium","What insurance costs you.","Multiply the monthly one by twelve before deciding."],["Tax","Money collected to pay for shared things.","Roads, schools, hospitals. It comes out before you ever see it."],["Revenue","Everything a business takes in.","The number people brag about."],["Cost","What a business paid to make it happen.","Fixed costs arrive anyway; variable ones follow the sales."],["Profit","Revenue minus cost.","The number that decides whether you are still open next year."],["Margin","Profit as a share of the price.","A big margin on nothing sold is still nothing."],["Cash flow","Money actually moving, and when.","You can be profitable and broke at the same time. Timing is its own subject."],["Inventory","The stock you are holding.","Money you have already spent, sitting in a box, hoping."],["Subscription","A payment that repeats until stopped.","A decision made once and paid for forever. Always times twelve."],["Wage","Money paid for work done.","You are usually selling time — and, over years, reputation."],["Value","What a thing is worth to you.","Different from price, and the gap is where every decision lives."],["Scam","A lie designed to take your money.","Reward or fright, plus a hurry, plus a secret. Always the same shape."],["Phishing","A fake message fishing for your details.","Real organisations already know who you are. That is what makes them real."],["One-time code","A number texted to prove it is you.","Nobody legitimate ever needs it from you. It is the proof, not a password."],["Net worth","Everything you have, added up.","Wallet plus jars plus bank plus investments. The number this whole town is drawing."],["Currency","The money a place has agreed on.","₹, $, £, €, د.إ — different agreements, same idea."],["Exchange rate","What one currency is worth in another.","It moves. That is why the same holiday costs differently in different years."]],Z={"first-coin":{em:"🪙",name:"First earnings",desc:"Money you traded your time for."},"scam-spotter":{em:"🛡️",name:"Scam spotter",desc:"You saw the shape, not the story."},"cool-head":{em:"🧊",name:"Cool head",desc:'Said no to a "today only".'},"asked-home":{em:"🏡",name:"Asked at home",desc:"Every family does money differently."},"steady-hand":{em:"🪨",name:"Steady hand",desc:"Did nothing on a red day. Hardest move there is."},"jars-set":{em:"🫙",name:"Split it first",desc:"Paid yourself before you paid anyone else."},"goal-built":{em:"🏗️",name:"Built it",desc:"Finished a goal in the Build Yard."},"rainy-day":{em:"☔",name:"Rainy-day tin",desc:"Money set aside for the thing you did not plan."},"times-twelve":{em:"🗓️",name:"Times twelve",desc:"Worked out what a monthly thing costs in a year."},"noticed-inflation":{em:"📈",name:"Noticed the drift",desc:"Same chalk, bigger number."},gave:{em:"🤲",name:"Gave some",desc:"The Give jar did its job."},"asked-back":{em:"🔁",name:"Asked back",desc:"Worth hiring twice. Worth more than the fee."},"borrowed-well":{em:"🤝",name:"Repaid in full",desc:"Took a loan, knew the cost, cleared it."},diversified:{em:"🧺",name:"Never just one",desc:"Kept a Market Cup season spread out."},shopkeeper:{em:"🏪",name:"Open for business",desc:"Traded a day at Bizz & Co and counted it honestly."},"profit-day":{em:"💹",name:"In the black",desc:"A trading day that made more than it cost."},"chapter-c1":{em:"📗",name:"What money is",desc:"Chapter one, done."},"chapter-c2":{em:"📗",name:"Earning it",desc:"Chapter two, done."},"chapter-c3":{em:"📘",name:"Making a plan",desc:"Chapter three, done."},"chapter-c4":{em:"📘",name:"Sellers' tricks",desc:"Chapter four, done."},"chapter-c5":{em:"📙",name:"Keeping it safe",desc:"Chapter five, done."},"chapter-c6":{em:"📙",name:"Borrowing",desc:"Chapter six, done."},"chapter-c7":{em:"📕",name:"Money that grows",desc:"Chapter seven, done."},"chapter-c8":{em:"📕",name:"Running something",desc:"Chapter eight, done."},"moved-in":{em:"🔑",name:"Keys of your own",desc:"Moved somewhere better and could still afford Friday."},homeowner:{em:"🏡",name:"Bought it",desc:"Stopped renting. A mortgage ends; rent does not."},"indep-10":{em:"🌱",name:"One tenth",desc:"A tenth of your life is paid for by your money."},"indep-25":{em:"🌿",name:"A quarter",desc:"Your money covers a quarter of your week."},"indep-50":{em:"🌳",name:"Halfway",desc:"Half your life, paid for without working."},"indep-100":{em:"🏛️",name:"Independent",desc:"Your money pays for your life. You work because you choose to."},"held-the-storm":{em:"⛈️",name:"Held through it",desc:"Sat still while everything was red."},"exact-change":{em:"🪙",name:"Exact change",desc:"Counted it right, at speed."},climbed:{em:"🗼",name:"Over the line",desc:"Fifteen years of compounding, and still standing."},"main-street":{em:"🎲",name:"Main Street",desc:"Your shops paid for your life. Nobody went bankrupt."}},Ce="bzf_profile",ut="bzf_v1",Le="bzf_device",Wa=2;function Ie(e,a){try{const t=localStorage.getItem(e);return t?JSON.parse(t):a}catch{return a}}function qe(e,a){try{return localStorage.setItem(e,JSON.stringify(a)),!0}catch(t){return console.warn("storage unavailable",t),!1}}let Ye=null;const Et={loadProfile(){let e=Ie(Ce,null);if(!e){const a=Ie(ut,null);a&&(e=a)}return e?Da(e):null},saveProfile(e){clearTimeout(Ye),Ye=setTimeout(()=>qe(Ce,e),150)},saveNow(e){clearTimeout(Ye),qe(Ce,e)},loadDevice(e,a){const t=Ie(Le,{});return t[e]===void 0?a:t[e]},saveDevice(e,a){const t=Ie(Le,{});t[e]=a,qe(Le,t)},wipe(){try{localStorage.removeItem(Ce),localStorage.removeItem(ut)}catch{}}};function Da(e){for(e.v||(e.v=1);e.v<Wa&&e.v===1;)e=Oa(e);return e}function Oa(e){const a={id:"k1",name:e.child&&e.child.name||"Friend",band:e.child&&e.child.band||"builder",currency:e.child&&e.child.currency||"INR",created:e.child&&e.child.created||Date.now(),money:e.money,learn:e.learn,market:e.market,streak:e.streak,postbox:e.postbox,shop:e.shop||{owned:[]},badges:e.badges||[],history:e.history||[]};return{v:2,parent:{created:Date.now(),gate:!1},kids:[a],active:0,settings:e.settings||{sound:!0},clock:{lastSeen:Date.now()}}}const Fe=60;function zt(e,a,t){Ae(t);const o=Date.now();return{id:"k"+o.toString(36),name:e||"Friend",band:a||"builder",currency:t||"INR",created:o,money:{wallet:f(12),jars:{spend:0,save:0,grow:0,give:0},rules:{spend:40,save:30,grow:20,give:10},goals:[],txns:[{id:"t0",t:o,kind:"in",amt:f(12),label:"Starting float from Nana",cat:"gift"}],wage:f(20),bills:[],nextPay:tt(o,5),bank:{balance:0,rate:.02,opened:!1,loan:null,trust:50,repaid:0}},learn:{xp:0,level:1,done:{},openCard:null,drill:null},market:{series:St(Fe),step:8,lastMove:1,holdings:{},best:null},biz:null,streak:{days:[he(o)],last:he(o)},postbox:{day:he(o),idx:0,answered:!1,log:[]},shop:{owned:[],cooling:{}},jobs:{},home:{tier:0,since:o,mortgage:null},badges:[],history:[{t:o,v:f(12)}],family:{allowance:null,payWeekday:5,chores:[],coolOff:!1}}}function Se(e){return Me[e.home&&e.home.tier||0]}function ve(e){const a=Se(e),t=[];return a.rent>0&&t.push({name:"Rent",units:a.rent,amt:f(a.rent)}),a.bills.forEach(o=>t.push({name:o.name,units:o.units,amt:f(o.units)})),t.push({name:a.perk==="kitchen"?"Food (you cook)":"Food",units:a.food,amt:f(a.food)}),e.home.mortgage&&t.push({name:"Mortgage",units:0,amt:e.home.mortgage.perWeek}),e.money.bills=t,t}function me(e){return ve(e).reduce((a,t)=>a+t.amt,0)}function Bt(e){return Math.round(e.money.wage*(1+(e.learn.level-1)*.055))}function re(e){return e.family.allowance!=null?e.family.allowance:Bt(e)}function Ze(e){const a=e.money.bank.balance*e.money.bank.rate,t=be(e)*.0075,o=e.biz&&e.biz.log.length?e.biz.log.slice(0,4).reduce((s,n)=>s+n.profit,0)/Math.min(4,e.biz.log.length)*3:0;return Math.max(0,Math.round(a+t+o))}function Qe(e){const a=me(e);return a<=0?0:Math.min(2,Ze(e)/a)}function jt(e){const a=Qe(e)*100,t=[];return[[10,"indep-10"],[25,"indep-25"],[50,"indep-50"],[100,"indep-100"]].forEach(([o,s])=>{a>=o&&F(e,s)&&t.push(s)}),t}function et(e,a){const t=Me[a];if(!t||a!==e.home.tier+1)return{ok:!1,why:"Not the next one along"};const o=f(t.deposit);return e.money.wallet+e.money.jars.save<o?{ok:!1,why:"Deposit is "+o,deposit:o}:{ok:!0,deposit:o}}function Ct(e,a){const t=Me[a],o=f(t.deposit);let s=o-e.money.wallet;if(s>0){const n=Math.min(s,e.money.jars.save);e.money.jars.save-=n,e.money.wallet+=n,s-=n}if(s>0)return!1;if(e.money.wallet-=o,o>0&&P(e,"out",o,"Deposit on "+t.name,"home"),t.mortgage){const n=f(t.mortgage.units);e.home.mortgage={owed:n,perWeek:Math.ceil(n/t.mortgage.weeks),weeks:t.mortgage.weeks,paid:0},F(e,"homeowner")}return e.home.tier=a,e.home.since=Date.now(),ve(e),F(e,"moved-in"),W(e),!0}function It(){return{v:2,parent:{created:Date.now(),gate:!1},kids:[],active:0,ui:{nav:"home",sub:"wallet"},settings:{sound:!0},clock:{lastSeen:Date.now()}}}function Q(e){return e.kids[e.active]}function tt(e,a){const t=new Date(e);t.setHours(9,0,0,0);const o=(a-t.getDay()+7)%7||7;return t.setDate(t.getDate()+o),t.getTime()}function Rt(e){const a=Date.now(),t=e.clock&&e.clock.lastSeen||0;return a<t?t:(e.clock.lastSeen=a,a)}function Nt(e){return Date.now()<(e.clock&&e.clock.lastSeen||0)-6e4}function P(e,a,t,o,s){e.money.txns.unshift({id:"x"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:Date.now(),kind:a,amt:Math.round(t),label:o,cat:s||"other"}),e.money.txns.length>200&&(e.money.txns.length=200)}function Ee(e,a,t,o){const s=Math.round(a);return s<=0?0:(e.money.wallet+=s,P(e,"in",s,t,o||"wage"),F(e,"first-coin"),s)}function Pt(e,a,t,o){const s=Math.round(a);return e.band==="sprout"&&s>e.money.wallet?!1:(e.money.wallet-=s,P(e,"out",s,t,o||"spend"),!0)}function We(e){const a=e.money.jars;return a.spend+a.save+a.grow+a.give}function be(e){return Math.round(U.reduce((a,t)=>a+(e.market.holdings[t.id]||0)*e.market.series[t.id][e.market.step],0))}function Ft(e){return e.biz?Math.round(e.biz.cash):0}function Wt(e){return e.money.bank.loan?Math.round(e.money.bank.loan.owed):0}function Dt(e){const a=Se(e);return a.owned?Math.round(f(a.mortgage?a.mortgage.units:0)*1.15-(e.home.mortgage?e.home.mortgage.owed:0)):0}function ye(e){return Math.round(e.money.wallet+We(e)+e.money.bank.balance+be(e)+Ft(e)+Dt(e)-Wt(e))}function W(e){const a=e.history,t=ye(e);(!a.length||a[a.length-1].v!==t)&&a.push({t:Date.now(),v:t}),a.length>120&&a.splice(0,a.length-120)}function at(e){const a=he(Date.now());return At.filter(t=>!t.lv||e.learn.level>=t.lv).map(t=>({...t,done:e.jobs[t.id]===a,amt:f(t.units)}))}function Ot(e,a){const t=he(Date.now()),o=At.find(n=>n.id===a);if(!o||e.jobs[a]===t)return 0;e.jobs[a]=t;const s=Ee(e,f(o.units),o.name+" for "+o.who,"job");return W(e),s}function nt(e,a){return Rt(a)>=e.money.nextPay}function Lt(e){return Math.max(0,Math.ceil((e.money.nextPay-Date.now())/Tt))}function qt(e,a){const t={wage:0,bills:[],interest:0,split:null,loan:0,chores:[]},o=re(e);if(e.money.wallet+=o,P(e,"in",o,"Pay day — wages","wage"),t.wage=o,(e.family.chores||[]).forEach(n=>{n.done&&(e.money.wallet+=n.amt,P(e,"in",n.amt,n.name,"chore"),t.chores.push(n),n.done=!1)}),e.money.bills.forEach(n=>{e.money.wallet-=n.amt,P(e,"out",n.amt,n.name,"bill"),t.bills.push(n)}),e.money.bank.opened&&e.money.bank.balance>0){const n=Math.round(e.money.bank.balance*e.money.bank.rate);n>0&&(e.money.bank.balance+=n,P(e,"in",n,"Bank interest","interest"),t.interest=n)}const s=e.money.bank.loan;if(s){const n=Math.min(s.perWeek,Math.max(0,e.money.wallet));n>0?(e.money.wallet-=n,s.owed=Math.max(0,s.owed-n),s.paid+=n,P(e,"out",n,"Loan repayment","loan"),t.loan=n,e.money.bank.trust=Math.min(100,e.money.bank.trust+3)):(e.money.bank.trust=Math.max(0,e.money.bank.trust-8),s.missed=(s.missed||0)+1),s.owed<=0&&(e.money.bank.loan=null,e.money.bank.repaid++,e.money.bank.trust=Math.min(100,e.money.bank.trust+8),F(e,"borrowed-well"),t.loanCleared=!0)}if(e.learn.level>=6&&e.money.wallet>0){const n=e.money.wallet,i=e.money.rules,c={spend:Math.round(n*i.spend/100),save:Math.round(n*i.save/100),grow:Math.round(n*i.grow/100),give:Math.round(n*i.give/100)};Object.keys(c).forEach(r=>{e.money.jars[r]+=c[r]}),e.money.wallet=n-(c.spend+c.save+c.grow+c.give),t.split=c,F(e,"jars-set")}if(e.money.goals.forEach(n=>{if(n.done||!n.auto)return;const i=Math.min(n.auto,e.money.jars.save);i>0&&(e.money.jars.save-=i,n.saved+=i,Jt(e,n))}),e.home.mortgage){const n=e.home.mortgage,i=t.bills.find(c=>c.name==="Mortgage");i&&(n.owed=Math.max(0,n.owed-i.amt),n.paid+=i.amt),n.owed<=0&&(e.home.mortgage=null,t.mortgageCleared=!0,ve(e))}return t.independence=jt(e),e.money.nextPay=tt(Date.now(),e.family.payWeekday==null?5:e.family.payWeekday),e.market.step=Math.min(Fe,e.market.step+1),e.market.lastMove=Yt(e),F(e,"payday"),W(e),t}function Yt(e){const a=e.market.series.basket,t=e.market.step;return t>0?a[t]-a[t-1]:0}function Gt(e,a){e.family.payWeekday=a,e.money.nextPay=tt(Date.now(),a)}function Ht(e,a){e.money.nextPay=Date.now()-1,a.clock.lastSeen=Date.now()}function Ut(e,a,t){const o=Math.min(Math.round(t),e.money.wallet);return o<=0?0:(e.money.wallet-=o,e.money.jars[a]+=o,P(e,"out",o,"Into the "+a+" jar","jar"),W(e),o)}function Kt(e,a,t){const o=Math.min(Math.round(t),e.money.jars[a]);return o<=0?0:(e.money.jars[a]-=o,e.money.wallet+=o,P(e,"in",o,"Out of the "+a+" jar","jar"),W(e),o)}function Vt(e,a,t){e.money.goals.push({id:"g"+Date.now().toString(36),name:a,target:Math.round(t),saved:0,auto:0,done:!1,t:Date.now()})}function _t(e,a,t){const o=e.money.goals.find(n=>n.id===a);if(!o)return 0;const s=Math.min(Math.round(t),e.money.jars.save);return s<=0?0:(e.money.jars.save-=s,o.saved+=s,Jt(e,o),W(e),s)}function ot(e,a){const t=e.money.goals.find(s=>s.id===a);if(!t||t.saved<=0)return 0;const o=t.saved;return t.saved=0,t.done=!1,e.money.wallet+=o,P(e,"in",o,'Took back from "'+t.name+'"',"jar"),W(e),o}function La(e,a){ot(e,a),e.money.goals=e.money.goals.filter(t=>t.id!==a)}function Jt(e,a){!a.done&&a.saved>=a.target&&(a.done=!0,F(e,"goal-built"))}function st(e,a){const t=Math.max(1,Math.round(re(e)*e.money.rules.save/100));return Math.ceil(Math.max(0,a.target-a.saved)/t)}function Xt(e,a){const t=Math.min(Math.round(a),e.money.jars.save);return t<=0?0:(e.money.jars.save-=t,e.money.bank.balance+=t,e.money.bank.opened=!0,P(e,"out",t,"Into the bank","bank"),W(e),t)}function Zt(e,a){const t=Math.min(Math.round(a),e.money.bank.balance);return t<=0?0:(e.money.bank.balance-=t,e.money.jars.save+=t,P(e,"in",t,"Out of the bank","bank"),W(e),t)}function it(e,a,t){const o=f(a),s=.01+(60-Math.min(60,e.money.bank.trust))*5e-4,n=Math.round(o*(1+s*t)),i=Math.ceil(n/t);return{amount:o,weeks:t,rate:s,total:n,perWeek:i,cost:n-o}}function Qt(e,a){return e.money.bank.loan?!1:(e.money.bank.loan={amount:a.amount,owed:a.total,perWeek:a.perWeek,weeks:a.weeks,paid:0,missed:0,t:Date.now(),cost:a.cost},e.money.wallet+=a.amount,P(e,"in",a.amount,"Loan from the bank","loan"),W(e),!0)}function ea(e,a){const t=e.money.bank.loan;if(!t)return 0;const o=Math.min(Math.round(a),e.money.wallet,t.owed);return o<=0?0:(e.money.wallet-=o,t.owed-=o,t.paid+=o,P(e,"out",o,"Loan repayment","loan"),t.owed<=0&&(e.money.bank.loan=null,e.money.bank.repaid++,e.money.bank.trust=Math.min(100,e.money.bank.trust+10),F(e,"borrowed-well")),W(e),o)}function ta(e,a,t){const o=Math.min(Math.round(t),e.money.jars.grow);if(o<=0)return 0;const s=e.market.series[a][e.market.step];return e.money.jars.grow-=o,e.market.holdings[a]=(e.market.holdings[a]||0)+o/s,P(e,"out",o,"Bought "+U.find(n=>n.id===a).name,"invest"),W(e),o}function aa(e,a){const t=e.market.holdings[a]||0;if(t<=0)return 0;const o=Math.round(t*e.market.series[a][e.market.step]);return e.market.holdings[a]=0,e.money.jars.grow+=o,P(e,"in",o,"Sold "+U.find(s=>s.id===a).name,"invest"),W(e),o}function na(e){const a=U.filter(t=>(e.market.holdings[t.id]||0)>1e-4);return a.length?a.some(t=>t.id==="basket")?Math.max(4,a.length):a.length:0}function oa(e){return e.biz||(e.biz={cash:f(40),day:1,rent:f(6),stock:{},prices:{},weather:"fair",open:!1,log:[],best:0},Y.forEach(a=>{e.biz.prices[a.id]=f(a.sells),e.biz.stock[a.id]=0})),e.biz}function sa(e,a,t){const o=e.biz,s=Y.find(i=>i.id===a),n=f(s.cost)*t;return n>o.cash?!1:(o.cash-=n,o.stock[a]=(o.stock[a]||0)+t,!0)}function ia(e,a,t){const o=e.biz,s=Y.find(i=>i.id===a),n=Math.max(1,Math.round(f(s.cost)*.5));o.prices[a]=Math.max(n,o.prices[a]+t)}function ra(e){const a=e.biz,t=ce[Math.floor(pt(a.day*7919+13)*ce.length)];a.weather=t.id;let o=0,s={},n={};Y.forEach(r=>{const k=a.stock[r.id]||0;if(!k)return;const b=9*(t.mult[r.id]||1),T=f(r.sells),p=Math.pow(T/Math.max(1,a.prices[r.id]),1.6),m=Math.max(0,Math.round(b*p*(.75+pt(a.day*31+r.id.length)*.5))),w=Math.min(k,m);s[r.id]=w,o+=w*a.prices[r.id],a.stock[r.id]=k-w,r.id==="ice"&&a.stock[r.id]>0&&(n[r.id]=a.stock[r.id],a.stock[r.id]=0)});const i=a.rent;a.cash+=o-i;const c=o-i;return a.log.unshift({day:a.day,weather:t.id,revenue:o,rent:i,profit:c,sold:s,spoiled:n}),a.log.length>20&&(a.log.length=20),a.day++,a.best=Math.max(a.best,c),F(e,"shopkeeper"),c>0&&F(e,"profit-day"),W(e),{weather:t,revenue:o,rent:i,profit:c,sold:s,spoiled:n}}function pt(e){let a=e>>>0||1;return a^=a<<13,a>>>=0,a^=a>>17,a^=a<<5,a>>>=0,a/4294967296}function la(e){const a=e.biz;if(!a)return 0;const t=f(20),o=Math.max(0,Math.round(a.cash-t));return o<=0?0:(a.cash-=o,e.money.wallet+=o,P(e,"in",o,"Drawn from Bizz & Co","business"),W(e),o)}function De(e,a){const t=e.learn.level;return e.learn.xp+=a,e.learn.level=Fa(e.learn.xp),{gained:a,leveled:e.learn.level>t,from:t,level:e.learn.level,rank:_e(e.learn.level)}}function da(e){const a=e.learn.level,t=ue[a-1],o=ue[a]==null?t+200:ue[a];return{lo:t,hi:o,pct:Math.min(1,(e.learn.xp-t)/Math.max(1,o-t)),need:Math.max(0,o-e.learn.xp)}}function F(e,a){return!a||e.badges.includes(a)?!1:(e.badges.push(a),!0)}function rt(e){const a=he(Date.now());return e.streak.last===a?!1:(e.streak.last===a-1?e.streak.days.push(a):e.streak.days=[a],e.streak.last=a,e.postbox.day!==a&&(e.postbox.day=a,e.postbox.idx+=1,e.postbox.answered=!1),!0)}function ca(e,a){const t=e.currency;if(t===a)return;const o=i=>Math.round(ct(i,t,a)),s=e.money;if(s.wallet=o(s.wallet),s.wage=o(s.wage),["spend","save","grow","give"].forEach(i=>{s.jars[i]=o(s.jars[i])}),s.bills.forEach(i=>{i.amt=o(i.amt)}),s.goals.forEach(i=>{i.target=o(i.target),i.saved=o(i.saved),i.auto=o(i.auto||0)}),s.txns.forEach(i=>{i.amt=o(i.amt)}),s.bank.balance=o(s.bank.balance),s.bank.loan){const i=s.bank.loan;i.amount=o(i.amount),i.owed=o(i.owed),i.perWeek=o(i.perWeek),i.paid=o(i.paid),i.cost=o(i.cost)}const n=ct(1,t,a);Object.keys(e.market.holdings).forEach(i=>{e.market.holdings[i]*=n}),e.family.allowance!=null&&(e.family.allowance=o(e.family.allowance)),(e.family.chores||[]).forEach(i=>{i.amt=o(i.amt)}),e.biz&&(e.biz.cash=o(e.biz.cash),e.biz.rent=o(e.biz.rent),Object.keys(e.biz.prices).forEach(i=>{e.biz.prices[i]=o(e.biz.prices[i])}),e.biz.log.forEach(i=>{i.revenue=o(i.revenue),i.rent=o(i.rent),i.profit=o(i.profit)})),e.history.forEach(i=>{i.v=o(i.v)}),e.currency=a,Ae(a)}function ha(e){Et.saveProfile(e)}function ua(){const e=Et.loadProfile();return e?(e.clock||(e.clock={lastSeen:Date.now()}),e.kids.forEach(a=>{(!a.market||!a.market.series)&&(a.market={series:St(Fe),step:8,lastMove:1,holdings:{},best:null}),a.market.holdings||(a.market.holdings={}),a.jobs||(a.jobs={}),a.shop.cooling||(a.shop.cooling={}),a.family||(a.family={allowance:null,payWeekday:5,chores:[],coolOff:!1}),a.money.bank.trust==null&&(a.money.bank.trust=50,a.money.bank.repaid=0,a.money.bank.loan=null),a.home||(a.home={tier:0,since:Date.now(),mortgage:null},ve(a))}),e.ui||(e.ui={nav:"home",sub:"wallet"}),e.active>=e.kids.length&&(e.active=0),e.kids[e.active]&&Ae(e.kids[e.active].currency),e):null}const qa=Object.freeze(Object.defineProperty({__proto__:null,MARKET_STEPS:Fe,addGoal:Vt,addXP:De,badge:F,bankIn:Xt,bankOut:Zt,bizBuy:sa,bizCashOut:la,bizPrice:ia,bizTrade:ra,bizValue:Ft,buyAsset:ta,canMove:et,changeCurrency:ca,checkIndependence:jt,clockSuspect:Nt,daysToPay:Lt,debt:Wt,doJob:Ot,dropGoal:La,earn:Ee,fromJar:Kt,fundGoal:_t,holdingsValue:be,homeEquity:Dt,homeOf:Se,independence:Qe,jarTotal:We,jobsToday:at,kid:Q,load:ua,loanOffer:it,marketMove:Yt,moveHome:Ct,netWorth:ye,newChild:zt,newState:It,now:Rt,openBiz:oa,passiveWeekly:Ze,payDue:nt,protoSkipWeek:Ht,raidGoal:ot,refreshBills:ve,repayLoan:ea,runPayDay:qt,save:ha,sellAsset:aa,setPayWeekday:Gt,spend:Pt,spread:na,stamp:W,takeLoan:Qt,toJar:Ut,touchDay:rt,txn:P,wageFor:Bt,weeklyCost:me,weeklyIncome:re,weeksToGoal:st,xpBar:da},Symbol.toStringTag,{value:"Module"})),l={s:null,render(){},overlay:null,game:null,shelf:"",query:"",fields:{},mode:null},G=()=>Q(l.s);function Ya(e){const a=e.step||0,t=s=>`<div class="stack" style="max-width:520px;margin:5vh auto 0">${s}</div>`,o=l.s?l.s.kids.length===0:!0;return t(a===0?`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 12px;border-radius:50%;overflow:hidden;border:1px solid var(--line)">${H.pip.svg}</div>
        <h1 style="font-size:32px">${o?'Welcome to <em style="font-style:italic">Bizzington</em>':"A new stall on Market Row"}</h1>
        <p class="muted" style="margin-top:8px">${o?"A town where you get a stall, a wallet, and every mistake is made with money that isn't real.":"Another child, their own town, their own money. Nothing is shared between them."}</p>
      </div>
      ${R("nana",o?"I am shutting up my shop at the end of the road, and the smallest stall on Market Row is going spare. What shall I call you?":"Another one! There is always a stall going. What is this one called?")}
      <div class="card stack">
        <label class="eyebrow" for="nm">Name</label>
        <input id="nm" data-field="name" value="${u(e.name||"")}" placeholder="Type a name" autocomplete="off"
          style="padding:13px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-size:16px;font-weight:700;width:100%">
        <button class="btn wide" data-act="obNext">Next →</button>
        ${o?"":'<button class="small muted" style="text-align:center;width:100%" data-act="obCancel">Cancel</button>'}
      </div>`:a===1?`
      ${R("pip",`Good to meet you, <b>${u(e.name)}</b>. How old are you? It changes what the street shows — no debt and no market before they are taught.`)}
      <div class="card stack">
        <button class="opt" data-act="obBand" data-arg="sprout"><b>8 to 10</b><br><span class="small muted">Sprout — coins, earning, saving. Nothing can go negative.</span></button>
        <button class="opt" data-act="obBand" data-arg="builder"><b>11 and up</b><br><span class="small muted">Builder — budgets, the bank, the Exchange, a shop of your own.</span></button>
      </div>`:`
    ${R("pip","Last one. Which money do you count in? You can change it later and the town converts — it does not start over.")}
    <div class="card stack">
      ${Object.keys(L).map(s=>`<button class="opt" data-act="obCur" data-arg="${s}">
        <b style="font-size:18px">${L[s].sign}</b> &nbsp;${L[s].name}
        <span class="small muted"> · ${new Intl.NumberFormat(L[s].locale).format(12e5)}</span></button>`).join("")}
    </div>`)}function Ga(){const e=G(),a=nt(e,l.s),t=Lt(e),o=e.money.goals.find(T=>!T.done),s=e.band==="sprout",n=Ua(e),i=s?`<div class="strip two">
        <div><div class="k">Wallet</div><div class="v">${h(e.money.wallet)}</div></div>
        <div><div class="k">Saved up</div><div class="v">${h(e.money.jars.save+e.money.jars.grow)}</div></div></div>`:`<div class="strip">
        <div><div class="k">Wallet</div><div class="v">${h(e.money.wallet)}</div></div>
        <div><div class="k">Jars</div><div class="v">${h(We(e))}</div></div>
        <div><div class="k">Invested</div><div class="v">${h(e.money.bank.balance+be(e))}</div></div>
        <div><div class="k">Net worth</div><div class="v" style="color:var(--action)">${h(ye(e))}</div></div></div>`,c=Qe(e),r=me(e),k=Ze(e),b=Se(e);return`<div class="stack">
    ${i}
    ${s?"":`<button class="card" data-act="sub" data-arg="place" style="display:block;width:100%;text-align:left">
      <div class="row"><span style="font-size:24px">${b.em}</span><div class="grow">
        <div class="eyebrow">Independence · what your money earns ÷ what your life costs</div>
        <p style="font-weight:800;font-size:15px">${h(k)} a week towards ${h(r)}</p></div>
        <div class="big" style="font-size:24px;color:${c>=1?"var(--grow)":"var(--action)"}">${Math.round(c*100)}%</div></div>
      <div class="bar" style="margin-top:9px;height:11px"><i style="width:${Math.min(100,c*100)}%;background:${c>=1?"var(--grow)":"var(--action)"}"></i></div>
      <p class="small muted" style="margin-top:7px">${c>=1?"Your money pays for your life. You work because you choose to.":c>=.5?"Half your week is paid for without working. Keep going.":c>=.1?"A tenth of your life pays for itself. That first tenth is the slow one.":"Nothing pays for itself yet. Every subscription you cancel moves this as much as a good year in the market."}</p>
    </button>`}
    <div class="town">
      <div class="town-scroll">${Pa(e)}</div>
      <div class="town-cap"><span>🔥 ${e.streak.days.length}</span><span>Lv ${e.learn.level} · ${_e(e.learn.level)}</span></div>
    </div>

    ${a?`<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint)">
          <div class="eyebrow" style="color:var(--treasure-deep)">The bell is ringing</div>
          <h3 style="margin:2px 0 4px">It's pay day in Bizzington</h3>
          <p class="small" style="color:var(--treasure-deep)">Wages in, bills out, jars filled. The whole street is busy.</p>
          <button class="btn wide" style="margin-top:12px" data-act="payday">🔔 Ring the bell</button>
        </div>`:`<div class="card row">
          <div class="grow"><div class="eyebrow">Pay day</div>
          <p style="font-weight:700">${t===0?"Later today":t+" day"+(t===1?"":"s")+" — "+Re(e.money.nextPay)}</p>
          <p class="small muted">${h(re(e))} in, ${h(me(e))} straight back out.</p></div>
          <button class="btn ghost sm" data-act="sub" data-arg="jars">Check the jars</button>
        </div>`}

    <div class="grid2">
      <button class="card" data-act="postbox" style="text-align:left;border-color:${e.postbox.answered?"var(--line)":"var(--spend)"}">
        <div class="row"><span style="font-size:26px">📬</span><div class="grow">
          <div class="eyebrow">The postbox</div>
          <p style="font-weight:800">${e.postbox.answered?"Emptied for today":"There's a letter"}</p>
          <p class="small muted">${e.postbox.answered?"Another one tomorrow.":"One a day. Thirty seconds."}</p></div></div>
      </button>
      <button class="card" data-act="${n.act}" data-arg="${n.arg||""}" style="text-align:left">
        <div class="row"><span style="font-size:26px">${n.em}</span><div class="grow">
          <div class="eyebrow">Today</div>
          <p style="font-weight:800">${u(n.title)}</p>
          <p class="small muted">${u(n.sub)}</p></div></div>
      </button>
    </div>

    ${o?`<button class="card" data-act="sub" data-arg="goals" style="display:block;width:100%;text-align:left">
      <div class="row"><div class="grow"><div class="eyebrow">In the Build Yard</div>
        <h3 style="margin:2px 0">${u(o.name)}</h3></div>
        <div style="text-align:right"><div class="big">${h(o.saved)}</div>
        <div class="small muted">of ${h(o.target)}</div></div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${Math.min(100,o.saved/o.target*100)}%;background:var(--save)"></i></div>
      <p class="small muted" style="margin-top:7px">${o.saved>=o.target?"Finished — the roof is on.":st(e,o)+" more pay days at your current Save rate."}</p>
    </button>`:""}

    ${R("pip",Ha(e))}
  </div>`}function Ha(e){const a=e.learn.level;return a<6?"Your stall's open. There's work on Market Row most days — and learn a card or two, because the shed round the back has four jars in it and they change everything.":a<8?"Shed is yours. Split the money the moment it lands, before it has a chance to become one big pile.":a<11?"Build Yard next. Name something you want and it starts going up floor by floor. Fair warning: raid the fund and the scaffolding comes back down.":a<16?"Bank's open. The clock strikes every pay day and a little interest lands. Boring. Boring is exactly the point.":a<23?"Exchange is open — Bo and Bea are already arguing. Buy from the Grow jar, never the Spend jar.":"Nana's shutters came off. That's your shop now. Buy for less than you sell for, and count the difference honestly."}function Ua(e){const a=fe.find(o=>!e.learn.done[o.id]),t=at(e).filter(o=>!o.done);return a&&(e.learn.level<6||!t.length)?{em:ie.find(o=>o.id===a.ch).em,title:a.title,sub:"Three minutes with "+H[a.who].name+".",act:"card",arg:a.id}:t.length?{em:t[0].em,title:t[0].name,sub:"For "+t[0].who+" — "+h(t[0].amt)+".",act:"sub",arg:"wallet"}:a?{em:"📗",title:a.title,sub:"Three minutes with "+H[a.who].name+".",act:"card",arg:a.id}:!e.money.goals.length&&e.learn.level>=8?{em:"🏗️",title:"Name a goal",sub:"It becomes a building you can watch go up.",act:"sub",arg:"goals"}:{em:"🎮",title:"Play a round",sub:"Wages, straight into the same wallet.",act:"nav",arg:"arcade"}}function Ka(){const e=G();if(e.learn.openCard){const o=fe.find(s=>s.id===e.learn.openCard);if(o)return Va(o)}if(l.shelf==="words")return _a();const a=da(e),t=Je(e.learn.level);return`<div class="stack">
    <div class="card">
      <div class="row"><div class="grow">
        <div class="eyebrow">${t.em} ${t.name} · level ${e.learn.level} of 30</div>
        <h2 style="margin:2px 0 0">${e.learn.xp} XP</h2>
        <p class="small muted">Learning ${u(t.of)}.</p></div>
        <div class="small muted" style="text-align:right">${a.need} XP to<br>level ${e.learn.level+1}</div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${a.pct*100}%"></i></div>
      <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">
        ${Te.map(o=>`<span class="pill ${e.learn.level>=o.at?"gold":""}">${o.em} ${o.name}<span style="font-family:var(--mono);opacity:.7"> L${o.at}</span></span>`).join("")}
      </div>
    </div>
    <div class="grid2">
      <button class="card" data-act="shelf" data-arg="words" style="text-align:left">
        <div class="row"><span style="font-size:24px">📖</span><div class="grow">
        <p style="font-weight:800">Money Words</p><p class="small muted">${Ke.length} terms, in plain English.</p></div></div></button>
      <button class="card" data-act="nav" data-arg="arcade" style="text-align:left">
        <div class="row"><span style="font-size:24px">🎮</span><div class="grow">
        <p style="font-weight:800">Practise it</p><p class="small muted">Six games. Wages into the same wallet.</p></div></div></button>
    </div>
    ${R("pip","Every card ends with one question. Get it right and the town grows. Get it wrong and I tell you why — that counts too.")}
    <div class="chapts">
      ${ie.map(o=>{const s=o.cards.filter(i=>e.learn.done[i.id]).length,n=e.learn.level<o.lv;return`<div class="card pad0" ${n?'style="opacity:.62"':""}>
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft)">
            <span style="font-size:24px">${n?"🔒":o.em}</span>
            <div class="grow"><h3 style="font-size:18px">${u(o.title)}</h3>
            <p class="small muted">${n?"Opens at level "+o.lv+" · "+o.rank:u(o.blurb)}</p></div>
            <span class="pill ${s===o.cards.length?"grow":""}">${s}/${o.cards.length}</span>
          </div>
          ${n?"":o.cards.map(i=>{const c=e.learn.done[i.id];return`<button data-act="card" data-arg="${i.id}" style="display:flex;gap:11px;align-items:center;width:100%;padding:11px 16px;border-top:1px solid var(--line-soft)">
              <span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;font-size:12px;font-weight:800;background:${c?"var(--grow)":"var(--tint)"};color:${c?"#fff":"var(--muted)"}">${c?"✓":""}</span>
              <span class="grow" style="font-weight:700;font-size:14.5px">${u(i.title)}</span>
              <span class="small muted">${H[i.who].name}</span></button>`}).join("")}
        </div>`}).join("")}
    </div>
  </div>`}function Va(e){const a=G(),t=a.learn.drill,o=Xe(e);return`<div class="stack">
    <button class="small muted" data-act="closeCard">← All chapters</button>
    <div class="card stack">
      <div class="eyebrow">${u(ie.find(s=>s.id===e.ch).title)}</div>
      <h2>${u(e.title)}</h2>
      ${R(e.who,e.teach)}
      <div style="background:var(--tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px;border-left:3px solid var(--action)">
        <span class="eyebrow">For instance</span><br>${u(e.eg)}</div>
    </div>
    <div class="card stack">
      <div class="eyebrow">One question</div>
      <h3 style="font-size:18px">${u(e.drill.q)}</h3>
      <div class="stack" style="gap:8px">
        ${o.opts.map((s,n)=>{let i="";return t&&t.card===e.id&&(i=n===o.answer?" ok":n===t.pick?" no":""),`<button class="opt${i}" data-act="answer" data-arg="${n}" ${t&&t.card===e.id?"disabled":""}>
            <span class="k">${"ABCD"[n]}</span>${u(s)}</button>`}).join("")}
      </div>
      ${t&&t.card===e.id?`<div style="background:${t.right?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:12px 14px;font-size:14px">
          <b>${t.right?"That’s it.":"Not quite — and this is the useful bit:"}</b> ${u(e.drill.why)}</div>
        <button class="btn wide" data-act="cardDone" data-arg="${e.id}">Take it back to town →</button>`:""}
    </div>
  </div>`}function _a(){const e=(l.query||"").toLowerCase(),a=Ke.filter(t=>!e||t[0].toLowerCase().includes(e)||t[1].toLowerCase().includes(e));return`<div class="stack">
    <button class="small muted" data-act="shelf" data-arg="">← Learn</button>
    <div class="card">
      <div class="eyebrow">Money Words</div>
      <input data-field="query" data-live="1" value="${u(l.query||"")}" placeholder="Search ${Ke.length} terms"
        style="margin-top:8px;padding:11px 13px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650;width:100%">
    </div>
    ${a.length===0?'<div class="card"><p class="muted">Nothing by that name yet.</p></div>':""}
    <div class="card pad0">
      ${a.map((t,o)=>`<div style="padding:13px 16px;${o?"border-top:1px solid var(--line-soft)":""}">
        <b style="font-size:15px">${u(t[0])}</b>
        <p style="font-size:14px;margin-top:2px">${u(t[1])}</p>
        <p class="small muted" style="margin-top:3px">${u(t[2])}</p></div>`).join("")}
    </div>
  </div>`}function Ja(){const e=G(),a=e.learn.level,t={place:"Home",wallet:"Wallet",jars:"Jars",goals:"Goals",bank:"Bank",portfolio:"Exchange",business:"Your shop"},o=Pe.map(c=>({k:c.sub,n:t[c.sub]||c.name,lv:c.lv}));let s=l.s.ui.sub;o.find(c=>c.k===s&&a>=c.lv)||(s="wallet");const n=`<div style="display:flex;gap:7px;flex-wrap:wrap;padding:11px;background:var(--tint);border-radius:var(--r-md);border:1px solid var(--line-soft)">
    ${o.map(c=>{const r=a>=c.lv;return`<button data-act="${r?"sub":"locked"}" data-arg="${r?c.k:c.lv}"
        style="padding:7px 12px;border-radius:999px;font-size:13px;font-weight:800;border:1px ${r?"solid":"dashed"} var(--line);
        background:${s===c.k?"var(--action)":r?"var(--surface)":"transparent"};
        color:${s===c.k?"var(--action-ink)":r?"var(--ink)":"var(--muted)"}">
        ${r?"":"🔒 "}${c.n}${r?"":` <span style="font-family:var(--mono);font-size:11px">L${c.lv}</span>`}</button>`}).join("")}</div>`,i=s==="place"?Za():s==="jars"?Qa():s==="goals"?en():s==="bank"?tn():s==="portfolio"?an():s==="business"?nn():Xa();return`<div class="stack">${n}${i}</div>`}function Xa(){const e=G(),a=at(e);return`<div class="stack">
    <div class="card">
      <div class="eyebrow">In your pocket</div>
      <div class="big" style="font-size:38px;color:var(--treasure-deep)">${h(e.money.wallet)}</div>
      <p class="small muted">${e.band==="sprout"?"This can never go below zero — debt comes later, when it is taught.":"Everything below is dated, because a statement you cannot read is a statement you cannot argue with."}</p>
    </div>
    <div class="card">
      <div class="eyebrow">Work going on Market Row today</div>
      <p class="small muted" style="margin:3px 0 10px">Each job once a day. You are selling an hour, not a thing.</p>
      <div class="stack" style="gap:8px">
        ${a.map(t=>`<div class="row" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="font-size:20px">${t.em}</span>
          <span class="grow"><b style="font-size:14px">${u(t.name)}</b><br><span class="small muted">for ${u(t.who)}</span></span>
          ${t.done?'<span class="pill grow">done today</span>':`<button class="btn sm" data-act="job" data-arg="${t.id}">${h(t.amt)}</button>`}
        </div>`).join("")}
      </div>
    </div>
    <div class="card pad0">
      <div style="padding:12px 16px;border-bottom:1px solid var(--line-soft);display:flex;align-items:center">
        <span class="eyebrow grow">Every movement</span>
        <button class="small muted" data-act="print">🖨 Statement</button></div>
      ${e.money.txns.slice(0,18).map(t=>`<div style="display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line-soft)">
        <span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:13px;flex:0 0 auto;background:${t.kind==="in"?"var(--grow-tint)":"var(--spend-tint)"};color:${t.kind==="in"?"var(--grow)":"var(--spend)"}">${t.kind==="in"?"↓":"↑"}</span>
        <span class="grow" style="font-weight:650;font-size:14px">${u(t.label)}<br><span class="small muted">${xa(t.t)}</span></span>
        <span class="tabnum" style="font-weight:800;color:${t.kind==="in"?"var(--grow)":"var(--ink)"}">${t.kind==="in"?"+":"−"}${h(t.amt)}</span>
      </div>`).join("")}
    </div>
  </div>`}function Za(){const e=G(),a=Se(e),t=ve(e),o=me(e),s=re(e),n=s-o,i=Me[e.home.tier+1],c=i?et(e,e.home.tier+1):null,r=e.home.mortgage;return`<div class="stack">
    <div class="card">
      <div class="row"><span style="font-size:34px">${a.em}</span><div class="grow">
        <div class="eyebrow">You live here</div>
        <h2 style="font-size:21px;margin:2px 0 3px">${u(a.name)}</h2>
        <p class="small muted">${u(a.blurb)}</p></div></div>
    </div>

    <div class="card">
      <div class="eyebrow">Every pay day, whether the week went well or not</div>
      <div class="stack" style="gap:6px;margin-top:9px">
        <div class="row"><span class="grow" style="font-weight:800;color:var(--grow)">Money in <span class="small muted" style="font-weight:600">· level ${e.learn.level} wage</span></span>
          <b style="color:var(--grow)">+${h(s)}</b></div>
        ${t.map(k=>`<div class="row"><span class="grow muted">${u(k.name)}</span><b>−${h(k.amt)}</b></div>`).join("")}
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">What's left to live on</span>
          <span class="big" style="font-size:22px;color:${n>0?"var(--ink)":"var(--spend)"}">${h(n)}</span></div>
      </div>
      <p class="small muted" style="margin-top:9px">${n>0?"That leftover is the only part you get to choose about. Everything above it already has a name.":"Costs are bigger than income. That gap has to come from somewhere — savings, or somebody else."}</p>
    </div>

    ${r?`<div class="card" style="border-color:var(--save)">
      <div class="eyebrow">Your mortgage</div>
      <div class="row" style="margin-top:3px"><div class="grow">
        <div class="big" style="font-size:24px">${h(r.owed)}</div>
        <p class="small muted">left to pay · ${h(r.perWeek)} every pay day</p></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.round(r.paid/(r.paid+r.owed)*100)}%;background:var(--save)"></i></div>
      <p class="small muted" style="margin-top:7px">This one ends. Rent never does — that is the whole difference between renting and owning.</p>
    </div>`:""}

    ${i?`<div class="card">
      <div class="eyebrow">Next along the street</div>
      <div class="row" style="margin-top:4px"><span style="font-size:28px">${i.em}</span>
        <div class="grow"><b style="font-size:16px">${u(i.name)}</b>
          <p class="small muted">${u(i.blurb)}</p></div></div>
      <div class="stack" style="gap:5px;margin-top:11px;font-size:14px">
        <div class="row"><span class="grow muted">Deposit, once</span><b>${h(f(i.deposit))}</b></div>
        <div class="row"><span class="grow muted">Every week after that</span>
          <b>${h(f(i.rent)+i.bills.reduce((k,b)=>k+f(b.units),0)+f(i.food))}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Which would leave you</span>
          <b style="color:${s-(f(i.rent)+i.bills.reduce((k,b)=>k+f(b.units),0)+f(i.food))>0?"var(--ink)":"var(--spend)"}">
            ${h(s-(f(i.rent)+i.bills.reduce((k,b)=>k+f(b.units),0)+f(i.food)))} a week</b></div>
      </div>
      <button class="btn wide" style="margin-top:12px" data-act="move" data-arg="${e.home.tier+1}" ${c.ok?"":"disabled"}>
        ${c.ok?"Take it →":"Need "+h(c.deposit||0)+" for the deposit"}</button>
      <p class="small muted" style="margin-top:8px">Nobody stops you moving somewhere you can barely afford. The number is right there, and the choice is yours.</p>
    </div>`:`<div class="card" style="text-align:center;padding:24px">
      <div style="font-size:34px">🏡</div>
      <h3 style="margin:8px 0 4px">You own where you live</h3>
      <p class="muted small">Top of the street. The only thing left to grow is what your money earns while you sleep.</p></div>`}

    ${R("nana",e.home.tier===0?"A room of your own and rent going out on Friday. Everything else in this town is built on that one fact.":"Notice what changed when you moved — not just the rent. Every room you add adds a bill behind it.")}
  </div>`}const O={spend:["Spend","var(--spend)","for now"],save:["Save","var(--save)","for soon"],grow:["Grow","var(--grow)","for far away"],give:["Give","var(--give)","for someone else"]};function Qa(){const e=G(),a=e.money.jars,t=e.money.rules,o=Math.max(1,...Object.values(a)),s=t.spend+t.save+t.grow+t.give;return`<div class="stack">
    ${R("nana","Split it the moment it lands. What sits in one pile gets spent as one pile — that is the entire trick, and it is sixty years old.")}
    <div class="card">
      <div class="jars">
        ${Object.keys(O).map(n=>`<div class="jar">
          <div class="jarglass"><div class="jarfill" style="height:${Math.max(4,a[n]/o*100)}%;background:${O[n][1]};opacity:.85"></div></div>
          <div class="jarlbl">${O[n][0]}<br><span class="jaramt">${h(a[n])}</span></div>
          <div class="row" style="gap:4px">
            <button class="btn ghost sm" style="padding:5px 9px" data-act="jarOut" data-arg="${n}" aria-label="Take out of ${O[n][0]}">−</button>
            <button class="btn sm" style="padding:5px 9px" data-act="jarIn" data-arg="${n}" aria-label="Put into ${O[n][0]}">+</button>
          </div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:12px">Buttons move ${h(f(2))} at a time, out of your wallet (${h(e.money.wallet)}).</p>
    </div>
    ${e.learn.level<11?`<div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on ${Re(e.money.nextPay)}</div>
      <p class="small muted">Every twenty coins that arrive, split like this:</p>
      <div class="stack" style="gap:9px">
        ${Object.keys(O).map(n=>{const i=Math.round(t[n]/5);return`<div class="row" style="gap:9px">
            <span style="width:58px;font-weight:800;font-size:13.5px;color:${O[n][1]}">${O[n][0]}</span>
            <span class="grow" style="display:flex;gap:3px;flex-wrap:wrap">
              ${Array.from({length:20},(c,r)=>`<i style="width:13px;height:13px;border-radius:50%;display:block;background:${r<i?O[n][1]:"var(--line)"}"></i>`).join("")}
            </span>
            <div class="stepper"><button data-act="rule" data-arg="${n}:-5" aria-label="less ${O[n][0]}">−</button>
            <span class="n">${i}</span>
            <button data-act="rule" data-arg="${n}:5" aria-label="more ${O[n][0]}">+</button></div>
          </div>`}).join("")}
      </div>
      <p class="small ${s===100?"muted":""}" style="${s===100?"":"color:var(--spend);font-weight:700"}">
        ${s===100?"Twenty coins, all spoken for. Good.":"That is "+Math.round(s/5)+" coins out of twenty. Every coin has to go somewhere."}</p>
    </div>`:`<div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on ${Re(e.money.nextPay)}</div>
      ${Object.keys(O).map(n=>`<div class="row">
        <span style="width:58px;font-weight:800;font-size:13.5px;color:${O[n][1]}">${O[n][0]}</span>
        <div class="grow bar"><i style="width:${t[n]}%;background:${O[n][1]}"></i></div>
        <div class="stepper"><button data-act="rule" data-arg="${n}:-5" aria-label="less ${O[n][0]}">−</button>
        <span class="n">${t[n]}%</span>
        <button data-act="rule" data-arg="${n}:5" aria-label="more ${O[n][0]}">+</button></div>
      </div>`).join("")}
      <p class="small" style="${s===100?"color:var(--muted)":"color:var(--spend);font-weight:700"}">
        ${s===100?"Adds to 100%. Good.":"Adds to "+s+"%. It has to be 100 — the money has to go somewhere."}</p>
    </div>`}
  </div>`}function en(){const e=G();return`<div class="stack">
    ${R("pip","Name the thing and price it. Dividing turns a wish into a date — and the yard shows the date, not encouragement.")}
    <div class="card stack">
      <div class="eyebrow">Start something</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="goalName" placeholder="What do you want?" value="${u(l.fields.goalName||"")}"
          style="flex:2 1 150px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="goalAmt" inputmode="numeric" placeholder="${xt()}" value="${u(l.fields.goalAmt||"")}"
          style="flex:1 1 90px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn" data-act="addGoal">Add</button>
      </div>
    </div>
    ${e.money.goals.length===0?`<div class="card" style="text-align:center;padding:26px">
        <div style="font-size:34px">🏗️</div><p class="muted" style="margin-top:6px">The yard is empty. Nothing is being built.</p></div>`:""}
    ${e.money.goals.map(a=>{const t=Math.min(1,a.saved/a.target);return`<div class="card">
        <div class="row"><div class="grow"><h3 style="font-size:18px">${u(a.name)}${a.done?' <span class="pill grow">built</span>':""}</h3>
          <p class="small muted">${a.done?"Finished.":st(e,a)+" pay days at your Save rate"}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:20px">${h(a.saved)}</div>
          <div class="small muted">of ${h(a.target)}</div></div></div>
        <div class="bar" style="margin-top:10px"><i style="width:${t*100}%;background:var(--save)"></i></div>
        <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
          <button class="btn sm" data-act="fundGoal" data-arg="${a.id}" ${e.money.jars.save<=0||a.done?"disabled":""}>Put in ${h(Math.min(f(5),Math.max(0,e.money.jars.save)))} from Save</button>
          <button class="btn ghost sm" data-act="autoGoal" data-arg="${a.id}">${a.auto?"Auto "+h(a.auto)+"/week":"Auto-save each week"}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="raidGoal" data-arg="${a.id}" ${a.saved<=0?"disabled":""}>Take it back</button>
        </div>
        ${a.saved>0&&!a.done?'<p class="small muted" style="margin-top:8px">Taking it back is allowed. The scaffolding comes down on the town, though — that part is the lesson.</p>':""}
      </div>`}).join("")}
  </div>`}function tn(){const e=G(),a=e.money.bank,t=a.loan,o=it(e,40,8),s=[1,2,5,10].map(n=>({y:n,v:Math.round(Math.max(a.balance,f(50))*Math.pow(1+a.rate,n*52))}));return`<div class="stack">
    ${R("nana","Interest is rent on money. Leave it here and the bank pays you rent for using it. Borrow, and you pay. Same idea — the only question is which side you are standing on.")}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">In the vault</div>
        <div class="big" style="font-size:32px;color:var(--save)">${h(a.balance)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Every pay day</div>
        <div class="big" style="font-size:20px">${(a.rate*100).toFixed(0)}%</div></div></div>
      <p class="small muted" style="margin-top:8px">Next pay day this adds <b>${h(Math.round(a.balance*a.rate))}</b> — that is ${h(a.balance)} × ${(a.rate*100).toFixed(0)}%, shown rather than hidden.</p>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
        <button class="btn sm" data-act="bankIn" ${e.money.jars.save<=0?"disabled":""}>Deposit ${h(Math.min(f(10),Math.max(0,e.money.jars.save)))} from Save</button>
        <button class="btn ghost sm" data-act="bankOut" ${a.balance<=0?"disabled":""}>Take some out</button>
      </div>
    </div>

    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Trust score</div>
        <div class="big" style="font-size:24px">${a.trust}<span class="small muted"> / 100</span></div></div>
        <div style="text-align:right" class="small muted">${a.repaid} loan${a.repaid===1?"":"s"}<br>repaid in full</div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${a.trust}%;background:${a.trust>60?"var(--grow)":a.trust>30?"var(--treasure)":"var(--spend)"}"></i></div>
      <p class="small muted" style="margin-top:7px">A memory of whether past borrowing came back — never a score of what kind of person you are. It goes up every time you repay, and it can always be rebuilt.</p>
    </div>

    ${t?`<div class="card" style="border-color:var(--spend)">
      <div class="eyebrow" style="color:var(--spend)">You are borrowing</div>
      <div class="row" style="margin-top:4px"><div class="grow">
        <div class="big" style="font-size:26px">${h(t.owed)}</div>
        <p class="small muted">still to repay of ${h(t.amount+t.cost)} · ${h(t.perWeek)} goes out each pay day</p></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.round(t.paid/(t.amount+t.cost)*100)}%;background:var(--spend)"></i></div>
      <button class="btn wide" style="margin-top:11px" data-act="repay" ${e.money.wallet<=0?"disabled":""}>Pay off ${h(Math.min(e.money.wallet,t.owed))} now</button>
      <p class="small muted" style="margin-top:8px">Paying early costs you nothing extra here and clears it sooner. Missing a pay day costs trust, not dignity.</p>
    </div>`:`<div class="card">
      <div class="eyebrow">Borrowing</div>
      <h3 style="font-size:18px;margin:3px 0 6px">${h(o.amount)} over ${o.weeks} pay days</h3>
      <div class="stack" style="gap:5px;font-size:14px">
        <div class="row"><span class="grow muted">You receive</span><b>${h(o.amount)}</b></div>
        <div class="row"><span class="grow muted">You pay back, each pay day</span><b>${h(o.perWeek)}</b></div>
        <div class="row"><span class="grow muted">You hand over in total</span><b>${h(o.total)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">So borrowing costs</span>
          <span class="big" style="font-size:20px;color:var(--spend)">${h(o.cost)}</span></div>
      </div>
      <button class="btn wide" style="margin-top:12px" data-act="loan">Take the loan</button>
      <p class="small muted" style="margin-top:8px">The total is shown before you agree, which is the whole of chapter six. A higher trust score makes the same loan cheaper.</p>
    </div>`}

    <div class="card">
      <div class="eyebrow">The snowball, on this balance</div>
      <div class="grid3" style="margin-top:8px">
        ${s.map(n=>`<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">${n.y} year${n.y>1?"s":""}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${h(n.v)}</div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own made-up rate compounding weekly — not a real bank's, and not a forecast.</p>
    </div>
  </div>`}function an(){const e=G(),a=e.market.step,t=be(e),o=na(e);return`<div class="stack">
    ${R(e.market.lastMove>=0?"bo":"bea",e.market.lastMove>=0?"Up on the week! I said it would be. I say that every week.":"Down on the week. I said so. I also say that every week — one of us is always right and neither of us knows.")}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Your holdings</div>
        <div class="big" style="font-size:30px;color:var(--grow)">${h(t)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Grow jar</div>
        <div class="big" style="font-size:20px">${h(e.money.jars.grow)}</div></div></div>
      <p class="small muted" style="margin-top:6px">${o===0?"Nothing owned yet. Buy from the Grow jar — that is money you will not need soon.":o===1?"One thing. Your whole week now depends on somebody else’s Tuesday.":"Spread across "+o+". Bad news in one can no longer sink the lot."}</p>
    </div>
    ${U.map(s=>{const n=e.market.series[s.id],i=n[a],c=n[Math.max(0,a-1)],r=(i-c)/c,k=e.market.holdings[s.id]||0;return`<div class="card">
        <div class="row"><span style="font-size:22px">${s.em}</span>
          <div class="grow"><b style="font-size:15px">${u(s.name)}</b>
          <p class="small muted">${u(s.desc)}</p></div>
          <div style="text-align:right"><div style="font-weight:800;font-variant-numeric:tabular-nums">${h(i)}</div>
          <div class="small" style="color:${r>=0?"var(--grow)":"var(--spend)"};font-weight:700">${r>=0?"▲":"▼"} ${Math.abs(r*100).toFixed(1)}%</div></div></div>
        ${xe(n.slice(0,a+1),300,40,r>=0?"var(--grow)":"var(--spend)")}
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:4px">
          <span class="pill">${k>0?"you hold "+h(k*i):"not held"}</span>
          <span class="grow"></span>
          <button class="btn sm" data-act="buy" data-arg="${s.id}" ${e.money.jars.grow<f(5)?"disabled":""}>Buy ${h(f(5))}</button>
          <button class="btn ghost sm" data-act="sell" data-arg="${s.id}" ${k<=0?"disabled":""}>Sell all</button>
        </div></div>`}).join("")}
    <div class="card">
      <div class="eyebrow">⏳ The Time Machine</div>
      <p class="small muted" style="margin:4px 0 10px">The only place in Bizzington where the clock is compressed — because compounding cannot be felt at human speed, and a child who never feels it has not learned it.</p>
      <div class="grid3">
        ${[1,5,10,30].map(s=>`<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">in ${s} year${s>1?"s":""}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${h(Math.round(t*Math.pow(1.07,s)))}</div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own simulated rate. Not advice, not a forecast, and not any real market.</p>
    </div>
  </div>`}function nn(){const e=G();if(!e.biz)return`<div class="stack">
      ${R("nana","Shutters are off. I have left you forty in the till and the rent is due whether anybody comes or not. Buy for less than you sell for, and count the difference honestly.")}
      <div class="card" style="text-align:center;padding:26px">
        <div style="font-size:40px">🏪</div>
        <h3 style="margin:8px 0 4px">Bizz &amp; Co</h3>
        <p class="muted small">Stock it, price it, open the doors, and find out what the weather thinks of your plan.</p>
        <button class="btn wide" style="margin-top:14px" data-act="openBiz">Take the keys</button>
      </div></div>`;const a=e.biz,t=a.log[0];ce.find(s=>s.id===a.weather);const o=Y.reduce((s,n)=>s+(a.stock[n.id]||0)*f(n.cost),0);return`<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Day ${a.day} · Bizz &amp; Co</div>
        <div class="big" style="font-size:30px">${h(a.cash)}</div>
        <p class="small muted">in the till · ${h(o)} sitting in stock · rent ${h(a.rent)} a day</p></div></div>
      <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
        <button class="btn" data-act="bizTrade">Open for the day →</button>
        <button class="btn ghost sm" data-act="bizCashOut" ${a.cash<=f(20)?"disabled":""}>Take the profit home</button>
      </div>
    </div>
    ${t?`<div class="card" style="border-color:${t.profit>=0?"var(--grow)":"var(--spend)"}">
      <div class="eyebrow">Yesterday · ${u(ce.find(s=>s.id===t.weather).name)} ${ce.find(s=>s.id===t.weather).em}</div>
      <div class="stack" style="gap:5px;margin-top:6px;font-size:14px">
        <div class="row"><span class="grow muted">Revenue — everything that came in</span><b>${h(t.revenue)}</b></div>
        <div class="row"><span class="grow muted">Rent — arrives whether you sold anything</span><b>−${h(t.rent)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Profit</span>
          <span class="big" style="font-size:20px;color:${t.profit>=0?"var(--grow)":"var(--spend)"}">${t.profit>=0?"+":"−"}${h(Math.abs(t.profit))}</span></div>
      </div>
      ${Object.keys(t.spoiled||{}).length?`<p class="small" style="color:var(--spend);margin-top:8px;font-weight:650">
        ${Object.keys(t.spoiled).map(s=>t.spoiled[s]+" "+Y.find(n=>n.id===s).name.toLowerCase()+" melted").join(", ")} — stock you paid for and cannot sell.</p>`:""}
    </div>`:R("pip","Nothing has happened yet. Buy some stock, set your prices, then open the doors.")}
    <div class="card">
      <div class="eyebrow">Stock and prices</div>
      <p class="small muted" style="margin:3px 0 10px">Buy low, price it yourself. Put the price up and fewer people buy — the question is whether you end the day with more.</p>
      <div class="stack" style="gap:10px">
        ${Y.map(s=>{const n=a.stock[s.id]||0,i=f(s.cost),c=a.prices[s.id],r=c-i;return`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:11px">
            <div class="row"><span style="font-size:20px">${s.em}</span>
              <span class="grow"><b style="font-size:14.5px">${u(s.name)}</b><br>
                <span class="small muted">${u(s.desc)}</span></span>
              <span class="pill">${n} in stock</span></div>
            <div class="row" style="margin-top:9px;gap:8px;flex-wrap:wrap">
              <button class="btn ghost sm" data-act="bizBuy" data-arg="${s.id}" ${i*5>a.cash?"disabled":""}>Buy 5 for ${h(i*5)}</button>
              <span class="small muted">${h(i)} each</span>
              <span class="grow"></span>
              <span class="small muted">sell at</span>
              <div class="stepper">
                <button data-act="bizPrice" data-arg="${s.id}:-1" aria-label="lower the price of ${u(s.name)}">−</button>
                <span class="n">${h(c)}</span>
                <button data-act="bizPrice" data-arg="${s.id}:1" aria-label="raise the price of ${u(s.name)}">+</button></div>
            </div>
            <p class="small ${r>0?"muted":""}" style="margin-top:6px;${r>0?"":"color:var(--spend);font-weight:700"}">
              ${r>0?"Margin "+h(r)+" each — before the rent.":"You are selling below what it cost you."}</p>
          </div>`}).join("")}
      </div>
    </div>
    ${a.log.length>1?`<div class="card">
      <div class="eyebrow">The last few days</div>
      <div class="stack" style="gap:5px;margin-top:8px">
        ${a.log.slice(0,8).map(s=>`<div class="row" style="font-size:13.5px">
          <span style="width:52px" class="muted">Day ${s.day}</span>
          <span style="width:26px">${ce.find(n=>n.id===s.weather).em}</span>
          <span class="grow muted">${h(s.revenue)} in</span>
          <b style="color:${s.profit>=0?"var(--grow)":"var(--spend)"}">${s.profit>=0?"+":"−"}${h(Math.abs(s.profit))}</b></div>`).join("")}
      </div></div>`:""}
  </div>`}function on(){const e=G(),a=Date.now();return`<div class="stack">
    ${R("mags","Everything here is lovely and none of it is necessary. I have written what else the money could have been under each price, which my old boss said was commercial suicide.")}
    ${Mt.map(t=>{const o=f(t.units),s=e.shop.owned.includes(t.id),n=Math.max(1,(e.family.allowance!=null?e.family.allowance:e.money.wage)*e.money.rules.spend/100),i=Math.max(1,Math.round(o/n)),c=Math.round(o*Math.pow(1.07,10)),r=e.shop.cooling[t.id],k=r&&a<r,b=k?Math.ceil((r-a)/36e5):0,T=e.money.wallet+e.money.jars.spend>=o;return`<div class="card">
        <div class="row"><span style="font-size:28px">${t.em}</span>
          <div class="grow"><b style="font-size:15.5px">${u(t.name)}</b>
            <p class="small muted">${u(t.desc)}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:19px">${h(o)}</div></div></div>
        <div style="background:var(--treasure-tint);color:var(--treasure-deep);border-radius:var(--r-md);padding:9px 12px;margin-top:10px;font-size:13px;font-weight:650">
          That's <b>${i} week${i>1?"s":""}</b> of your Spend jar — or <b>${h(c)}</b> in ten years if it went in the Grow jar instead.</div>
        <div class="row" style="margin-top:10px"><span class="grow"></span>
          ${s?'<span class="pill grow">yours</span>':k?`<span class="pill">think it over · ${b}h left</span>`:e.family.coolOff&&!r?`<button class="btn ghost sm" data-act="cool" data-arg="${t.id}">Think it over →</button>`:`<button class="btn sm" data-act="buyItem" data-arg="${t.id}" ${T?"":"disabled"}>Buy it anyway</button>`}
        </div></div>`}).join("")}
    <p class="small muted" style="text-align:center">Nothing here costs real money, and there is no path from this screen to a payment form. That is a rule, not an oversight.</p>
  </div>`}function sn(){const e=G(),a=e.history.map(n=>n.v),t=e.postbox.log.filter(n=>n.scam&&n.safe).length,o=e.postbox.log.filter(n=>n.scam).length,s=Je(e.learn.level);return`<div class="stack">
    <div class="card">
      <div class="eyebrow">Net worth, every decision so far</div>
      <div class="big" style="font-size:32px;color:var(--action)">${h(ye(e))}</div>
      ${xe(a.length>1?a:[0,ye(e)],300,54,"var(--action)")}
      <p class="small muted">The one chart a card app can't draw: it only has your last statement, and this has every decision since you opened your stall.</p>
    </div>
    <div class="grid3">
      <div class="card"><div class="eyebrow">Streak</div><div class="big">🔥 ${e.streak.days.length}</div><p class="small muted">days in a row</p></div>
      <div class="card"><div class="eyebrow">Rank</div><div class="big" style="font-size:20px">${s.em} ${s.name}</div><p class="small muted">level ${e.learn.level} of 30</p></div>
      <div class="card"><div class="eyebrow">Letters</div><div class="big">${e.postbox.log.length}</div><p class="small muted">${o?t+" of "+o+" scams spotted":"no scams yet"}</p></div>
    </div>
    <div class="card">
      <div class="eyebrow">Chapters</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${ie.map(n=>{const i=n.cards.filter(c=>e.learn.done[c.id]).length;return`<div class="row" style="font-size:13.5px"><span style="width:22px">${n.em}</span>
            <span class="grow">${u(n.title)}</span>
            <div class="bar" style="width:88px"><i style="width:${i/n.cards.length*100}%;background:${i===n.cards.length?"var(--grow)":"var(--action)"}"></i></div>
            <span class="muted tabnum" style="width:34px;text-align:right">${i}/${n.cards.length}</span></div>`}).join("")}
      </div>
    </div>
    <button class="card" data-act="nav" data-arg="parents" style="display:block;width:100%;text-align:left">
      <div class="row"><span style="font-size:24px">👪</span><div class="grow">
        <p style="font-weight:800">The grown-up's page</p>
        <p class="small muted">What they learned, what they decided, Family Mode, and a printable week.</p></div>
        <span class="muted">→</span></div>
    </button>
  </div>`}function rn(){const e=G(),a=l.s,t=ln(e);return`<div class="stack">
    <div class="card">
      <div class="eyebrow">For the grown-up</div>
      <h2 style="margin:2px 0 4px">${u(e.name)}'s week</h2>
      <p class="small muted">Observation, never a grade on the child. The simulator is a window into instincts no quiz gives you.</p>
    </div>

    <div class="card">
      <div class="eyebrow">What they learned</div>
      <div class="stack" style="gap:6px;margin-top:8px">
        ${t.learned.length?t.learned.map(o=>`<p class="small">📗 ${u(o)}</p>`).join(""):'<p class="small muted">Nothing new this week.</p>'}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What they decided</div>
      <div class="stack" style="gap:8px;margin-top:8px">
        ${t.decisions.map(o=>`<div class="row" style="align-items:flex-start;gap:9px">
          <span style="font-size:15px">${o.em}</span><p class="small grow">${o.t}</p></div>`).join("")}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">Talk together</div>
      <div class="stack" style="gap:7px;margin-top:8px">
        ${t.prompts.map(o=>`<p class="small">💬 ${u(o)}</p>`).join("")}
      </div>
      <button class="btn ghost wide" style="margin-top:12px" data-act="print">🖨 Printable weekly page</button>
    </div>

    <div class="card stack">
      <div class="eyebrow">Family Mode — entirely manual, no bank connection</div>
      <p class="small muted">Mirror a real allowance and real jobs into the town, so the wallet tracks their actual life. Nothing here touches real money, and it never can.</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
        <span class="small grow">Weekly allowance</span>
        <div class="stepper">
          <button data-act="allow" data-arg="-1" aria-label="less allowance">−</button>
          <span class="n">${e.family.allowance==null?"off":h(e.family.allowance)}</span>
          <button data-act="allow" data-arg="1" aria-label="more allowance">+</button></div>
      </div>
      <p class="small muted">${e.family.allowance==null?"Off — the town pays its own wage of "+h(e.money.wage)+". Some households have no allowance and the app must never assume one.":"On — replaces the town wage on pay day."}</p>
      <div class="sep"></div>
      <div class="row"><span class="small grow">Pay day falls on</span>
        <select data-field="payday" data-live="1" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface2);font-weight:700">
          ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((o,s)=>`<option value="${s}" ${e.family.payWeekday===s?"selected":""}>${o}</option>`).join("")}
        </select></div>
      <div class="row"><span class="small grow">"Think it over" before big buys</span>
        <button class="btn ${e.family.coolOff?"":"ghost"} sm" data-act="coolOff">${e.family.coolOff?"On":"Off"}</button></div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Jobs at home</div>
      <p class="small muted">Anything here that is ticked pays into the town on pay day. You tick it; the app never checks.</p>
      ${(e.family.chores||[]).map((o,s)=>`<div class="row" style="gap:9px">
        <button class="btn ${o.done?"":"ghost"} sm" data-act="chore" data-arg="${s}">${o.done?"✓":""}</button>
        <span class="grow" style="font-weight:650">${u(o.name)}</span>
        <span class="tabnum muted">${h(o.amt)}</span>
        <button class="small muted" data-act="choreDel" data-arg="${s}" aria-label="remove">✕</button></div>`).join("")}
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="choreName" placeholder="Job" value="${u(l.fields.choreName||"")}"
          style="flex:2 1 130px;min-width:0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="choreAmt" inputmode="numeric" placeholder="${xt()}" value="${u(l.fields.choreAmt||"")}"
          style="flex:1 1 80px;min-width:0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn sm" data-act="choreAdd">Add</button>
      </div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Children in this household</div>
      ${a.kids.map((o,s)=>`<div class="row" style="gap:9px">
        <span class="grow" style="font-weight:${s===a.active?800:650}">${u(o.name)}
          <span class="small muted"> · level ${o.learn.level} · ${o.band==="sprout"?"Sprout":"Builder"}</span></span>
        ${s===a.active?'<span class="pill grow">playing</span>':`<button class="btn ghost sm" data-act="switchKid" data-arg="${s}">Switch to</button>`}
      </div>`).join("")}
      <button class="btn ghost wide" data-act="addKid">+ Add another child</button>
      <p class="small muted">Each child has their own town, their own money and their own ladder. Nothing is shared, and no child can see another's.</p>
    </div>

    <div class="card stack">
      <div class="eyebrow">Settings</div>
      <div class="row"><span class="small grow">Currency</span>
        <select data-field="cur" data-live="1" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface2);font-weight:700">
          ${Object.keys(L).map(o=>`<option value="${o}" ${e.currency===o?"selected":""}>${L[o].sign} ${L[o].name}</option>`).join("")}
        </select></div>
      <p class="small muted">Changing it converts the town rather than resetting it.</p>
      <div class="row"><span class="small grow">Mode</span>
        <button class="btn ghost sm" data-act="band">${e.band==="sprout"?"Sprout (8–10)":"Builder (11+)"}</button></div>
      <div class="row"><span class="small grow">Sound</span>
        <button class="btn ${a.settings.sound?"":"ghost"} sm" data-act="sound">${a.settings.sound?"On":"Off"}</button></div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Prototype tools</div>
      <p class="small muted">Pay day is a real week away, and the clock is client-side in this build. The shipping build takes it from the server so it cannot be advanced by winding the device forward.</p>
      <button class="btn ghost wide" data-act="skipWeek">⏩ Jump to the next pay day</button>
      <button class="btn ghost wide" data-act="grantXP">＋ Add 200 XP (to see further up the street)</button>
      <button class="btn ghost wide" style="color:var(--spend)" data-act="wipe">Start this household over</button>
    </div>
  </div>`}function ln(e){const a=Date.now()-6048e5,t=fe.filter(b=>e.learn.done[b.id]).slice(-5).map(b=>b.title),o=e.money.txns.filter(b=>b.t>=a),s=[],n=o.filter(b=>b.cat==="shop");n.length&&s.push({em:"🛍️",t:`Bought ${n.length} thing${n.length>1?"s":""} from Mags after being shown what else the money could have been.`});const i=o.filter(b=>/Took back from/.test(b.label));i.length&&s.push({em:"🏗️",t:`Raided a goal fund ${i.length} time${i.length>1?"s":""} — worth asking what it was for.`});const c=e.postbox.log.filter(b=>b.scam&&!b.safe).length;c&&s.push({em:"🛡️",t:`Fell for ${c} scam letter${c>1?"s":""} here, with play money. The cheapest place in the world to learn it.`});const r=o.filter(b=>b.cat==="job");r.length&&s.push({em:"🧺",t:`Took ${r.length} job${r.length>1?"s":""} on Market Row rather than waiting for pay day.`}),e.money.jars.grow>0&&s.push({em:"🌱",t:`Has ${h(e.money.jars.grow)} in the Grow jar — money deliberately set aside for far away.`}),e.money.rules.save+e.money.rules.grow>=50&&s.push({em:"📊",t:`Set the pay-day rule to keep ${e.money.rules.save+e.money.rules.grow}% back. Their choice, not a default.`}),e.money.bank.loan&&s.push({em:"🤝",t:"Is repaying a loan and can see the total cost of it on screen."}),s.length||s.push({em:"🌤️",t:"Nothing yet — a pay day or two will fill this in."});const k=[];return n.length&&k.push("Ask what they nearly bought and didn't."),e.money.goals.length&&k.push(`Ask how many weeks are left on "${e.money.goals[0].name}" — they will know.`),c&&k.push("Ask them what the scam letter was trying to make them feel."),k.push("Ask what the first thing you ever saved up for was. It is one of the app's own questions."),{learned:t,decisions:s,prompts:k}}function dn(){const e=G();return`<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Badges</div>
        <h2 style="margin:2px 0 0">${Object.keys(Z).filter(t=>e.badges.includes(t)).length} of ${Object.keys(Z).length}</h2></div></div>
      <div class="grid3" style="margin-top:12px">
        ${Object.keys(Z).map(t=>{const o=Z[t],s=e.badges.includes(t);return`<div style="background:${s?"var(--treasure-tint)":"var(--tint)"};border-radius:var(--r-md);padding:12px;text-align:center;opacity:${s?1:.45}">
            <div style="font-size:24px">${s?o.em:"🔒"}</div>
            <div style="font-weight:800;font-size:13px;margin-top:3px">${u(o.name)}</div>
            <div class="small muted" style="font-size:11.5px;line-height:1.35">${s?u(o.desc):"not yet"}</div></div>`}).join("")}
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">People you've met</div>
      <div class="grid3" style="margin-top:10px">
        ${Object.keys(H).map(t=>`<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center">
          <div style="width:54px;height:54px;margin:0 auto;border-radius:50%;overflow:hidden">${H[t].svg}</div>
          <div style="font-weight:800;font-size:13.5px;margin-top:5px">${u(H[t].name)}</div>
          <div class="small muted" style="font-size:11.5px;line-height:1.35">${u(H[t].role)}</div></div>`).join("")}
      </div>
    </div>
    <div class="card">
      <div class="eyebrow">The town museum · money of the world</div>
      <p class="small muted" style="margin:4px 0 10px">Real notes and coins, unlocked as you climb — a quiet way to teach that money is an agreement rather than a law of nature.</p>
      <div class="grid3">
        ${Object.keys(L).map((t,o)=>{const s=e.currency===t||e.learn.level>=(o+1)*4;return`<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center;opacity:${s?1:.4}">
            <div style="font-size:22px;font-weight:800">${s?L[t].sign:"🔒"}</div>
            <div style="font-weight:700;font-size:12.5px">${s?u(L[t].name):"level "+(o+1)*4}</div></div>`}).join("")}
      </div>
    </div>
  </div>`}const cn=()=>Q(l.s),K=[{t:"start",n:"Pay day",em:"🔔"},{t:"biz",n:"Chai cart",em:"🫖",cost:60,inc:6},{t:"chance",n:"Chance",em:"✉️"},{t:"biz",n:"Flower stall",em:"💐",cost:80,inc:8},{t:"bill",n:"Bus fares",em:"🚌",amt:10},{t:"biz",n:"Bread oven",em:"🍞",cost:100,inc:10},{t:"biz",n:"Fix-it shed",em:"🔧",cost:120,inc:12},{t:"chance",n:"Chance",em:"✉️"},{t:"biz",n:"Book barrow",em:"📚",cost:140,inc:14},{t:"rest",n:"Sit down",em:"🪑"},{t:"biz",n:"Tea rooms",em:"🍰",cost:160,inc:17},{t:"market",n:"The Basket",em:"🧺",cost:50,inc:4},{t:"biz",n:"Print shop",em:"🖨️",cost:180,inc:19},{t:"chance",n:"Chance",em:"✉️"},{t:"bill",n:"Phone bill",em:"📱",amt:14},{t:"biz",n:"Bike repair",em:"🚲",cost:200,inc:22},{t:"biz",n:"Corner shop",em:"🏪",cost:220,inc:24},{t:"chance",n:"Chance",em:"✉️"},{t:"biz",n:"The cinema",em:"🎬",cost:260,inc:30},{t:"bill",n:"Rent day",em:"🏠",amt:20}],mt=[{id:"crack",em:"📱",t:"Your screen is cracked",body:"Thirty to fix it — unless you took the cover when it was offered.",run:(e,a)=>a.insured?{note:"Your cover paid for it. That is what it was for.",cash:0}:{note:"No cover, so you pay the lot.",cash:-30}},{id:"insure",em:"🛡️",t:"Cover, fifteen",body:"Fifteen now, and anything that breaks for the rest of the game is covered.",choices:[{label:"Take the cover · 15",run:(e,a)=>(a.insured=!0,{note:"Covered. It may never pay off, and that is not the same as wasted.",cash:-15})},{label:"Chance it",run:()=>({note:"Nothing happens today. Sometimes that is the right call.",cash:0})}]},{id:"sub",em:"🔁",t:"A club you forgot joining",body:"Twelve now, and two every lap until you notice.",choices:[{label:"Cancel it · costs 12 today",run:(e,a)=>({note:"Twelve now instead of two a lap forever. Cancelling is almost always the cheap option.",cash:-12})},{label:"Leave it running",run:(e,a)=>(a.expenses+=2,{note:"Your expenses just went up by two a lap. Small numbers are the whole technique.",cash:0})}]},{id:"bonus",em:"🎉",t:"A job done properly",body:"Word got round. Somebody paid you forty for the trouble.",run:()=>({note:"Being worth asking twice pays better than being fastest.",cash:40})},{id:"rise",em:"📈",t:"Prices went up",body:"Same everything, bigger numbers. Your expenses rise by three a lap.",run:(e,a)=>(a.expenses+=3,{note:"That is inflation, and it does not undo itself.",cash:0})},{id:"lend",em:"🤝",t:"A friend is short",body:"Twenty-five would get them through the week.",choices:[{label:"Lend it",run:(e,a)=>(a.owed=(a.owed||0)+25,{note:"Lent. You get it back on your next pay day — probably.",cash:-25})},{label:"Explain why not",run:()=>({note:"Saying no honestly protects a friendship better than a grudge does.",cash:0})}]},{id:"found",em:"🪙",t:"Money in an old coat",body:"Fifteen, and no idea when it went in there.",run:()=>({note:"Free money is rare and this is not a strategy.",cash:15})},{id:"repair",em:"🔨",t:"The roof again",body:"Twenty-five, or fifty if you have nothing set aside.",run:(e,a)=>a.cash>=60?{note:"You had enough to fix it straight away, so it cost less.",cash:-25}:{note:"Fixing it late costs more. That is what an emergency fund is for.",cash:-50}}],yt=18,hn=140,Ge=[{name:"Mags",who:"mags",buy:(e,a)=>e.cash>=a.cost,insure:!1,line:"If I can afford it I am having it."},{name:"Bo",who:"bo",buy:(e,a)=>a.cost>=hn&&e.cash-a.cost>=60,insure:!0,line:"I am holding out for a big one."}],un=220,gt=60,pn=24,ft=8;function mn(){const e=te(60607),a=(d,S,A)=>({name:d,who:S,human:A,pos:0,cash:un,own:[],expenses:pn,insured:!1,laps:0,owed:0}),t={players:[a("You","pip",!0),a("Mags","mags",!1),a("Bo","bo",!1)],turn:0,phase:"roll",die:0,log:[],card:null,sq:null,done:!1,winner:null,moves:0};let o=0;const s=()=>t.players[t.turn],n=d=>d.own.reduce((S,A)=>S+K[A].inc,0),i=d=>d.expenses>0?n(d)/d.expenses:0,c=d=>t.players.find(S=>S.own.includes(d)),r=d=>{t.log.unshift(d),t.log.length>5&&(t.log.length=5)},k=()=>{o&&(clearTimeout(o),o=0)},b=()=>{const d=t.players.filter(S=>i(S)>=1);return d.length?(t.done=!0,t.winner=d.sort((S,A)=>i(A)-i(S))[0],T(),!0):t.players[0].laps>=ft?(t.done=!0,t.winner=t.players.slice().sort((S,A)=>i(A)-i(S))[0],T(),!0):!1},T=()=>{k();const d=t.players[0];t.mine=i(d);const S=cn(),A=Math.max(4,Math.round(n(d)/2)+(t.winner===d?14:0));t.won=f(A),Ee(S,t.won,"Main Street","wage"),W(S),t.winner===d&&F(S,"main-street"),y.level(),l.render()},p=d=>{for(;d.cash<0&&d.own.length;){const S=d.own.slice().sort((j,N)=>K[j].cost-K[N].cost)[0];d.own.splice(d.own.indexOf(S),1);const A=Math.round(K[S].cost/2);d.cash+=A,r(`${d.name} had to sell ${K[S].n} for ${A} — half what it cost.`),d.human&&y.bad()}d.cash<0&&(d.cash=0,d.skip=1,r(`${d.name} had a week they would rather forget, and misses a turn.`))},m=d=>{d.laps++,d.cash+=gt+n(d),d.cash-=d.expenses,d.owed&&(d.cash+=Math.round(d.owed*1.2),r(`${d.name} was paid back, with a bit on top.`),d.owed=0),r(`${d.name} passed pay day: +${gt+n(d)}, −${d.expenses}.`),d.name==="Mags"&&(d.cash-=yt,r(`Mags bought something shiny on the way past — ${yt}.`)),p(d)},w=d=>{const S=d.pos,A=K[S];if(t.sq=S,A.t==="bill")return d.cash-=A.amt,r(`${d.name} paid ${A.n} — ${A.amt}.`),p(d),B();if(A.t==="rest")return r(`${d.name} sat down for five minutes.`),B();if(A.t==="start")return r(`${d.name} landed on pay day.`),B();if(A.t==="chance"){const D=mt[Math.floor(e()*mt.length)];if(t.card=D,d.human&&D.choices){t.phase="card",l.render();return}const J=(D.choices?D.choices[Ge.find(de=>de.name===d.name)&&Ge.find(de=>de.name===d.name).insure?0:1]:D).run(t,d);return d.cash+=J.cash||0,r(`${d.name} — ${D.t}. ${J.note}`),p(d),t.card=null,B()}const j=c(S);if(!j){if(d.human){t.phase="decide",l.render();return}const D=Ge.find(le=>le.name===d.name);return D&&D.buy(d,A)&&d.cash>=A.cost?(d.cash-=A.cost,d.own.push(S),r(`${d.name} bought ${A.n} for ${A.cost}.`)):r(`${d.name} passed on ${A.n}.`),B()}if(j===d)return r(`${d.name} looked in on ${A.n}.`),B();if(A.t==="market")return r(`${d.name} browsed the Basket. Funds don't charge rent.`),B();const N=A.inc*2;return d.cash-=N,j.cash+=N,r(`${d.name} spent ${N} at ${j.human?"your":j.name+"'s"} ${A.n}.`),p(d),B()},B=()=>{if(!b()){if(t.phase="roll",t.turn=(t.turn+1)%t.players.length,t.card=null,s().skip){s().skip=0,r(`${s().name} sits this one out.`),l.render(),o=setTimeout(B,700);return}l.render(),s().human||(o=setTimeout(M,520))}},M=()=>{if(t.done)return;const d=s();t.die=1+Math.floor(e()*6),t.phase="moving",t.moves=t.die,y.click(),l.render();const S=()=>{d.pos=(d.pos+1)%K.length,d.pos===0&&m(d),t.moves--,l.render(),t.moves>0?o=setTimeout(S,125):o=setTimeout(()=>w(d),190)};o=setTimeout(S,190)},v=d=>{if(t.phase!=="decide")return;const S=s(),A=K[t.sq];d?S.cash<A.cost?r("Not enough — and nothing lends to you here."):(S.cash-=A.cost,S.own.push(t.sq),r(`You bought ${A.n}. It pays ${A.inc} every lap, forever.`),y.coin()):r(`You passed on ${A.n}.`),t.phase="roll",B()},z=d=>{if(t.phase!=="card")return;const S=s(),A=t.card,j=A.choices[+d].run(t,S);S.cash+=j.cash||0,r(`${A.t} — ${j.note}`),p(S),t.card=null,t.phase="roll",(j.cash||0)<0?y.bad():y.good(),B()},I=d=>d<=5?{r:6,c:1+d}:d<=10?{r:6-(d-5),c:6}:d<=15?{r:1,c:6-(d-10)}:{r:1+(d-15),c:1};return{id:"mn",mount(){},stop:k,key(d){if(t.done){d.key==="Enter"&&(l.game=null,l.render());return}if(t.phase==="roll"&&s().human&&(d.key==="Enter"||d.key===" "))d.preventDefault(),M();else if(t.phase==="decide")(d.key==="y"||d.key==="Y")&&v(!0),(d.key==="n"||d.key==="N")&&v(!1);else if(t.phase==="card"&&t.card&&t.card.choices){const S=parseInt(d.key,10);S>=1&&S<=t.card.choices.length&&z(S-1)}},act(d,S){d==="mnRoll"?M():d==="mnBuy"?v(!0):d==="mnPass"?v(!1):d==="mnCard"?z(S):d==="mnEnd"&&(l.game=null,l.render())},view(){if(t.done){const j=t.players[0];return`<div class="stack">
          <div class="hud"><span class="box">Main Street</span><span class="grow"></span>
            <button class="btn ghost sm" data-act="gquit">Leave</button></div>
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${t.winner===j?"🏆":"🎗️"}</div>
            <h2>${t.winner===j?"Your street pays for your life":t.winner.name+" got there first"}</h2>
            <p class="muted">${Math.round(t.mine*100)}% of your expenses covered by what you own.</p>
            <div class="lead">
              ${t.players.slice().sort((N,D)=>i(D)-i(N)).map((N,D)=>`
                <div class="leadrow ${N.human?"me":""}">
                  <span>${D+1}</span>
                  <span>${u(N.name)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                    owns ${N.own.length} · earns ${N.own.reduce((le,J)=>le+K[J].inc,0)} a lap · spends ${N.expenses}</span></span>
                  <span class="p" style="font-size:17px">${Math.round(i(N)*100)}%</span></div>`).join("")}
            </div>
            ${R("nana","Nobody went bankrupt and nobody had to. You win this one when the things you own pay for the life you lead — that is the only definition of rich worth chasing.")}
            <p class="small muted">Earned ${h(t.won)}.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`}const d=s(),S=K.map((j,N)=>{const{r:D,c:le}=I(N),J=c(N),de=t.players.filter(Be=>Be.pos===N),va=t.sq===N&&t.phase!=="roll";return`<div style="grid-row:${D};grid-column:${le};position:relative;border:1px solid var(--line);
          border-radius:7px;padding:4px 3px;font-size:9.5px;line-height:1.15;text-align:center;overflow:hidden;
          background:${va?"var(--action-tint)":J?J.human?"var(--grow-tint)":"var(--tint)":"var(--surface)"};
          ${J?`box-shadow:inset 0 -3px 0 ${J.human?"var(--grow)":J.who==="mags"?"var(--give)":"var(--treasure)"}`:""}">
          <div style="font-size:14px">${j.em}</div>
          <div style="font-weight:700">${u(j.n)}</div>
          ${j.cost?`<div class="mono" style="opacity:.65">${j.cost}</div>`:""}
          ${de.length?`<div style="position:absolute;top:2px;right:2px;display:flex;gap:1px">
            ${de.map(Be=>`<span style="width:8px;height:8px;border-radius:50%;display:block;background:${Be.human?"var(--action)":Be.who==="mags"?"var(--give)":"var(--treasure)"}"></span>`).join("")}</div>`:""}
        </div>`}).join(""),A=`<div style="grid-row:2/6;grid-column:2/6;display:flex;flex-direction:column;gap:8px;
        padding:10px;background:var(--tint);border-radius:10px;overflow:auto">
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${t.players.map(j=>`<span class="pill ${j===d?"gold":""}" style="font-size:10px">
            ${u(j.name)} ${j.cash}</span>`).join("")}
        </div>
        <div>
          <div class="row"><span class="eyebrow grow">Your street pays</span>
            <span class="small" style="font-weight:800">${n(t.players[0])} / ${t.players[0].expenses}</span></div>
          <div class="bar" style="margin-top:4px"><i style="width:${Math.min(100,i(t.players[0])*100)}%;background:var(--grow)"></i></div>
        </div>
        ${t.phase==="decide"?(()=>{const j=K[t.sq];return`<div style="background:var(--surface);border-radius:9px;padding:10px;text-align:center">
            <div style="font-size:22px">${j.em}</div>
            <b style="font-size:13px">${u(j.n)}</b>
            <p class="small muted" style="margin:3px 0 7px">${j.cost} now · ${j.inc} every lap, forever</p>
            <div class="row" style="gap:6px">
              <button class="btn sm grow" data-act="mnBuy" ${d.cash<j.cost?"disabled":""}>Buy · Y</button>
              <button class="btn ghost sm grow" data-act="mnPass">Pass · N</button></div></div>`})():""}
        ${t.phase==="card"&&t.card?`<div style="background:var(--surface);border-radius:9px;padding:10px">
          <div style="font-size:20px;text-align:center">${t.card.em}</div>
          <b style="font-size:12.5px">${u(t.card.t)}</b>
          <p class="small muted" style="margin:3px 0 7px">${u(t.card.body)}</p>
          <div class="stack" style="gap:5px">
            ${t.card.choices.map((j,N)=>`<button class="opt" style="padding:7px 9px;font-size:12px" data-act="mnCard" data-arg="${N}">${N+1} · ${u(j.label)}</button>`).join("")}
          </div></div>`:""}
        ${t.phase==="roll"?`<button class="btn wide" data-act="mnRoll" ${d.human?"":"disabled"}>
          ${d.human?"Roll · ⏎":d.name+" is thinking…"}</button>`:""}
        ${t.phase==="moving"?`<div style="text-align:center;font-family:var(--display);font-weight:800;font-size:28px">🎲 ${t.die}</div>`:""}
        <div class="stack" style="gap:3px;margin-top:auto">
          ${t.log.slice(0,3).map(j=>`<p class="small muted" style="font-size:11px;line-height:1.35">${u(j)}</p>`).join("")}
        </div>
      </div>`;return`<div class="stack">
        <div class="hud"><span class="box">Lap ${t.players[0].laps+1} / ${ft}</span>
          <span class="box">You ${d===t.players[0]?"· your turn":""} ${t.players[0].cash}</span>
          <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>
        <div class="stage" style="padding:10px">
          <div style="display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(6,1fr);
            gap:4px;aspect-ratio:1;max-width:520px;width:100%;margin:0 auto">
            ${S}${A}
          </div>
          <p class="hint">Enter to roll, Y/N to buy. You win when what you own pays for what you spend — nobody has to go bankrupt.</p>
        </div></div>`}}}const ee=()=>Q(l.s),He=[{id:"cr",em:"🪙",name:"Change Rush",keys:"← →",lv:1,kind:"action",blurb:"Coins are falling and you need exactly the right amount. Catch one too many and you have overpaid."},{id:"nw",em:"⚖️",name:"Needs vs Wants",keys:"← →",lv:1,kind:"action",blurb:"Sort it before the bell. Some are both, and those are the good ones."},{id:"ss",em:"🛡️",name:"Scam Spotter",keys:"← →",lv:1,kind:"action",blurb:"Real message or trap? They are designed to look identical."},{id:"bb",em:"💸",name:"Budget Blitz",keys:"1 2",lv:6,kind:"action",blurb:"A month of money, and the bills arrive one at a time."},{id:"cc",em:"🗼",name:"Compound Climb",keys:"hold space",lv:11,kind:"action",blurb:"Hold to grow the tower. Hold longer for more — and past a point it can go backwards, and you can be wiped out."},{id:"sr",em:"🫖",name:"Stall Rush",keys:"1–4 · R",lv:6,kind:"action",blurb:"Sixty seconds of customers. Serve them, restock, and find out whether busy and profitable are the same thing."},{id:"st",em:"⛈️",name:"Market Storm",keys:"space",lv:16,kind:"action",blurb:"Everything is red and everyone is shouting sell. The winning move is to do nothing, and it is much harder than it sounds."},{id:"mc",em:"🏆",name:"The Market Cup",keys:"↑↓←→ ⏎",lv:16,kind:"action",blurb:"Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying."},{id:"mn",em:"🎲",name:"Main Street",keys:"⏎ · Y/N",lv:8,kind:"board",blurb:"The board game. Buy the shops, collect the rent, and win when your street pays for your life — nobody goes bankrupt."},{id:"tt",em:"🗓️",name:"Times Twelve",keys:"1–4",lv:6,kind:"drill",blurb:"Small monthly numbers, turned into the number that is actually true."},{id:"sn",em:"❄️",name:"The Snowball",keys:"1–4",lv:11,kind:"drill",blurb:"Guess where compounding lands. Nobody guesses high enough."}];function yn(){if(l.game)return l.game.view();const e=ee(),a=t=>{const o=e.learn.level>=t.lv;return`<button class="card" data-act="${o?"game":"locked"}" data-arg="${o?t.id:t.lv}" style="text-align:left;width:100%;${o?"":"opacity:.6"}">
      <div class="row"><span style="font-size:30px">${o?t.em:"🔒"}</span>
        <div class="grow"><b style="font-size:16px">${u(t.name)}</b>
          <p class="small muted">${o?u(t.blurb):"Opens at level "+t.lv}</p></div>
        <span class="pill">${o?t.keys:"L"+t.lv}</span></div></button>`};return`<div class="stack">
    ${R("pip","Wages from in here land in the same wallet as everything else. There is no second, magic money — that is on purpose.")}
    <div class="eyebrow">The board game · about ten minutes, and nobody goes bankrupt</div>
    ${He.filter(t=>t.kind==="board").map(a).join("")}
    <div class="eyebrow" style="margin-top:6px">A few minutes each</div>
    ${He.filter(t=>t.kind==="action").map(a).join("")}
    <div class="eyebrow" style="margin-top:6px">Quick drills — a minute each, no reflexes required</div>
    ${He.filter(t=>t.kind==="drill").map(a).join("")}
    ${e.market.best?`<div class="card"><div class="eyebrow">Best Market Cup finish</div>
      <p style="font-weight:800">${u(e.market.best)}</p></div>`:""}
  </div>`}function gn(e){const a={cr:En,nw:vn,ss:wn,bb:kn,cc:Mn,sr:Sn,st:zn,tt:$n,sn:xn,mc:Tn,mn}[e];a&&(l.game&&l.game.stop&&l.game.stop(),l.game=a(),y.click())}function _(){l.game&&l.game.stop&&l.game.stop(),l.game=null}function q(e){return`<div class="hud">${e.map(a=>`<span class="box">${a}</span>`).join("")}
    <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>`}function ae(e,a){const t=f(e);return t>0&&(Ee(ee(),t,a,"wage"),W(ee()),y.coin()),t}function ze(e,a,t,o,s,n){return`<div class="stage" style="justify-content:center;text-align:center">
    <div style="font-size:44px">${e}</div>
    <h2>${u(a)}</h2>
    <p class="muted">${t}</p>
    ${s?R(n||"pip",s):""}
    <p class="small muted">Earned ${h(o)}, straight into your wallet.</p>
    <button class="btn wide" data-act="gquit">Back to the arcade</button></div>`}function pe(e,a){const t=te(a);for(let o=e.length-1;o>0;o--){const s=Math.floor(t()*(o+1)),n=e[o];e[o]=e[s],e[s]=n}return e}function pa(e){const a=pe(e.items.slice(),e.seed),t={i:0,right:0,note:null,done:!1},o=s=>{if(t.done)return;const n=a[t.i],i=n.a===s||n.a==="both";i?(t.right++,y.good()):y.bad(),t.note={ok:i,text:n.note||(i?"Yes.":e.wrongNote(n))},t.i++,t.i>=a.length&&(t.done=!0,t.won=ae(Math.round(t.right*e.pay),e.name)),l.render()};return{id:e.id,key(s){if(t.done){s.key==="Enter"&&(_(),l.render());return}s.key==="ArrowLeft"?o(e.left.side):s.key==="ArrowRight"&&o(e.right.side)},act(s){s===e.left.act?o(e.left.side):s===e.right.act&&o(e.right.side)},view(){if(t.done)return`<div class="stack">${q(["Done"])}
        ${ze(t.right>=a.length-1?"🏅":"👍",t.right+" of "+a.length,"",t.won,e.outro(t.right,a.length),e.who)}</div>`;const s=a[t.i];return`<div class="stack">
        ${q([`${t.i+1} / ${a.length}`,`✓ ${t.right}`])}
        <div class="stage">
          ${e.card(s)}
          ${t.note?`<div style="background:${t.note.ok?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${u(t.note.text)}</div>`:""}
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" style="background:${e.left.color}" data-act="${e.left.act}">← ${e.left.label}</button>
            <button class="btn" style="background:${e.right.color}" data-act="${e.right.act}">${e.right.label} →</button>
          </div>
          <p class="hint">${u(e.hint)}</p>
        </div></div>`}}}const fn=[{em:"🍚",t:"Rice for the week",a:"need"},{em:"🎮",t:"A new game",a:"want"},{em:"🧥",t:"A winter coat",a:"need"},{em:"☂️",t:"An umbrella, and it is raining",a:"both",note:"Today it is a need. In May it is a want. That is the whole card."},{em:"🚌",t:"The bus fare to school",a:"need"},{em:"🍫",t:"Chocolate at the till",a:"want"},{em:"📱",t:"A phone, and your family shares one",a:"both",note:"Depends entirely on the household. There is no universal answer, and pretending there is would be the mistake."},{em:"👟",t:"Shoes that still fit",a:"want",note:"They still fit. That makes them a want today."},{em:"💊",t:"Medicine you were prescribed",a:"need"},{em:"🎧",t:"Headphones",a:"want"},{em:"💧",t:"Clean water",a:"need"},{em:"🎂",t:"A cake for your sister",a:"both",note:"Nobody starves without it. It might still be the best thing you buy all month."}];function vn(){return pa({id:"nw",name:"Needs vs Wants",items:fn,seed:7717,pay:.7,who:"pip",hint:"Arrow keys, or tap. Some are both — either answer counts.",left:{side:"need",act:"nwNeed",label:"Need",color:"var(--save)"},right:{side:"want",act:"nwWant",label:"Want",color:"var(--give)"},card:e=>`<div class="gcard"><span class="em">${e.em}</span><span class="nm">${u(e.t)}</span></div>`,wrongNote:e=>e.a==="need"?"That one you would be in trouble without.":"Lovely, but you would survive the week.",outro:()=>"The ones that were <b>both</b> are the point. A list of needs that never changes is a list somebody else wrote for you."})}const bn=[{t:"Your parcel could not be delivered. Pay the £1.99 redelivery fee here to reschedule.",a:"scam",note:"A tiny fee is the hook — it is not about the £1.99, it is about your card details."},{t:"Hi, it's Nani. Are you free on Sunday? Ask your mother and let me know.",a:"safe",note:"No money, no hurry, no secret. Just Sunday."},{t:"CONGRATULATIONS! You are today's selected winner. Claim within 2 hours!",a:"scam",note:"A prize you never entered, and a countdown. Reward plus hurry."},{t:"Your library book is due back on Friday. No action needed if you have returned it.",a:"safe",note:'"No action needed" is almost never how a scam opens.'},{t:"BANK ALERT: suspicious login. Reply with your PIN to secure your account NOW.",a:"scam",note:"No real bank ever asks for your PIN. Fright plus hurry plus a secret."},{t:"hey it's me, new number! lost my phone. can you send 200 quick, don't tell mum",a:"scam",note:`New number, urgent money, and "don't tell". The secrecy is the tell.`},{t:"Your school trip form is due Monday. Paper copies are at the office.",a:"safe",note:"Boring, specific, and asks for nothing but a form."},{t:"FREE V-BUCKS GENERATOR — just log in with your username and password!",a:"scam",note:"There is no generator. There is a page collecting passwords."},{t:"Your order of one pencil case has shipped. Track it in the app you ordered from.",a:"safe",note:"It points you back to the app you already use rather than a new link."},{t:"INVESTMENT OPPORTUNITY: guaranteed to double in 30 days. Only 5 places left!",a:"scam",note:"Guaranteed and doubling do not belong in the same sentence — and there are always exactly five places left."}];function wn(){return pa({id:"ss",name:"Scam Spotter",items:bn,seed:3391,pay:1.1,who:"nana",hint:"Arrow keys, or tap. Half of these are perfectly ordinary.",left:{side:"safe",act:"ssSafe",label:"Looks fine",color:"var(--grow)"},right:{side:"scam",act:"ssScam",label:"It's a trap",color:"var(--spend)"},card:e=>`<div class="gcard" style="text-align:left"><span class="em" style="display:block;text-align:center">📱</span>
      <p style="font-size:15px;line-height:1.5;font-weight:650">${u(e.t)}</p></div>`,wrongNote:e=>e.a==="scam"?"That one was a trap.":"That one was real. Suspecting everything is its own kind of expensive.",outro:(e,a)=>e===a?"All of them. The shape is always the same: a reward or a fright, a hurry, and a secret.":"Look for the <b>shape</b>, not the story: a reward or a fright, plus a hurry, plus a secret."})}function kn(){const e=ee(),a=re(e)*4,o=pe([{n:"Rent on the stall",u:14,must:!0},{n:"Food for the month",u:22,must:!0},{n:"Bus pass",u:8,must:!0},{n:"A film with friends",u:6,must:!1},{n:"Phone plan",u:6,must:!0},{n:"Mags's brass button",u:12,must:!1},{n:"Sister’s birthday cake",u:5,must:!1},{n:"New shoes — the old ones leak",u:10,must:!0}].slice(),4423),s={i:0,left:a,missed:[],paid:[],done:!1},n=i=>{if(s.done)return;const c=o[s.i],r=f(c.u);i?r>s.left?(y.bad(),C("Not enough left — and that is the lesson"),s.missed.push(c)):(s.left-=r,s.paid.push(c),y.click()):(c.must?y.bad():y.good(),s.missed.push(c)),s.i++,s.i>=o.length&&(s.done=!0,s.mustMissed=s.missed.filter(k=>k.must).length,s.won=ae(Math.max(0,10-s.mustMissed*4)+(s.left>0?4:0),"Budget Blitz")),l.render()};return{id:"bb",key(i){i.key==="1"?n(!0):i.key==="2"?n(!1):i.key==="Enter"&&s.done&&(_(),l.render())},act(i){i==="bbPay"?n(!0):i==="bbSkip"&&n(!1)},view(){if(s.done)return`<div class="stack">${q(["Month over"])}
        ${ze(s.mustMissed===0?"🎯":"😬",h(s.left)+" left over",s.mustMissed===0?"Everything you actually needed got paid.":s.mustMissed+" thing"+(s.mustMissed>1?"s":"")+" you needed went unpaid. Those do not disappear — they move to next month.",s.won,"Leftover money is not a prize. It is the part of the month you get to choose about.","nana")}</div>`;const i=o[s.i],c=f(i.u);return`<div class="stack">
        ${q([`Left ${h(s.left)}`,`${s.i+1} / ${o.length}`])}
        <div class="stage">
          <div class="gcard"><span class="em">🧾</span><span class="nm">${u(i.n)}</span>
            <div class="big" style="margin-top:6px">${h(c)}</div></div>
          <div class="bar"><i style="width:${oe(s.left/a*100,0,100)}%;background:${s.left>a*.25?"var(--grow)":"var(--spend)"}"></i></div>
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" data-act="bbPay">1 · Pay it</button>
            <button class="btn ghost" data-act="bbSkip">2 · Skip it</button></div>
          <p class="hint">Keys 1 and 2, or tap. Nothing tells you which ones you truly need.</p>
        </div></div>`}}}function ma(e){const a=e.build(),t={i:0,right:0,pick:null,done:!1},o=n=>{t.done||t.pick!=null||(t.pick=n,n===a[t.i].a?(t.right++,y.good()):y.bad(),l.render())},s=()=>{t.pick!=null&&(t.pick=null,t.i++,t.i>=a.length&&(t.done=!0,t.won=ae(Math.round(t.right*e.pay),e.name)),l.render())};return{id:e.id,key(n){if(t.done){n.key==="Enter"&&(_(),l.render());return}if(n.key==="Enter"){s();return}const i=parseInt(n.key,10);i>=1&&i<=a[t.i].opts.length&&o(i-1)},act(n,i){n===e.pickAct?o(+i):n===e.nextAct&&s()},view(){if(t.done)return`<div class="stack">${q(["Done"])}
        ${ze(t.right>=a.length-1?"🏅":"👍",t.right+" of "+a.length,"",t.won,e.outro,e.who)}</div>`;const n=a[t.i];return`<div class="stack">
        ${q([`${t.i+1} / ${a.length}`,`✓ ${t.right}`])}
        <div class="stage">
          <div class="gcard"><span class="em">${e.em}</span>
            <p style="font-size:15.5px;line-height:1.45;font-weight:700">${n.q}</p></div>
          <div class="stack" style="gap:8px">
            ${n.opts.map((i,c)=>{let r="";return t.pick!=null&&(r=c===n.a?" ok":c===t.pick?" no":""),`<button class="opt${r}" data-act="${e.pickAct}" data-arg="${c}" ${t.pick!=null?"disabled":""}>
                <span class="k">${c+1}</span>${i}</button>`}).join("")}
          </div>
          ${t.pick!=null?`<div style="background:${t.pick===n.a?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${n.why}</div>
            <button class="btn wide" data-act="${e.nextAct}">Next →</button>`:""}
          <p class="hint">Number keys, or tap. Enter for the next one.</p>
        </div></div>`}}}function $n(){return ma({id:"tt",name:"Times Twelve",em:"🗓️",pay:1.2,who:"pip",pickAct:"ttPick",nextAct:"ttNext",outro:"Multiply every monthly thing by twelve <b>before</b> you agree to it. Then cancel the ones you would not buy at that price.",build(){const e=te(5150),a=[];pe([15,25,30,40,60,12,20].slice(),991).slice(0,4).forEach(i=>{const c=i*12,r=pe([c,i*10,i*6,c+i],Math.round(e()*1e6)+i);a.push({q:`A club costs <b>${h(f(i))} a month</b>. What is that in a year?`,opts:r.map(k=>h(f(k))),a:r.indexOf(c),why:`${h(f(i))} × 12 = <b>${h(f(c))}</b>. Small monthly numbers are the entire technique.`})}),[8,15,25].forEach(i=>{const c=i*52,r=pe([c,i*12,i*30,i*100],i*77);a.push({q:`You spend <b>${h(f(i))} a week</b> on snacks. In a year?`,opts:r.map(k=>h(f(k))),a:r.indexOf(c),why:`${h(f(i))} × 52 = <b>${h(f(c))}</b>. A week is a small unit and a year is not.`})});const s=45,n=480;return a.push({q:`One shop wants <b>${h(f(s))} a month</b>. Another wants <b>${h(f(n))} once a year</b>. Which costs less?`,opts:[h(f(s))+" a month",h(f(n))+" a year","They are the same","Not enough information"],a:1,why:`${h(f(s))} × 12 = ${h(f(s*12))}, which is more than ${h(f(n))}. The yearly one wins — and it is quoted that way precisely because it looks bigger.`}),a}})}function xn(){return ma({id:"sn",name:"The Snowball",em:"❄️",pay:1.6,who:"nana",pickAct:"snPick",nextAct:"snNext",outro:"Almost nobody guesses high enough, because we all quietly add instead of multiplying. Time is the ingredient, not the amount.",build(){return[{p:100,r:.1,y:10},{p:100,r:.07,y:20},{p:500,r:.05,y:10},{p:1e3,r:.1,y:20},{p:200,r:.08,y:30},{p:100,r:.1,y:30}].map((a,t)=>{const o=Math.round(a.p*Math.pow(1+a.r,a.y)),s=Math.round(a.p*(1+a.r*a.y)),n=pe([o,s,Math.round(a.p*(1+a.r*a.y*.5)),Math.round(o*2.1)],700+t*13);return{q:`<b>${h(f(a.p))}</b> growing <b>${(a.r*100).toFixed(0)}% a year</b> for <b>${a.y} years</b>. Where does it land?`,opts:n.map(i=>h(f(i))),a:n.indexOf(o),why:`<b>${h(f(o))}</b>. Adding ${(a.r*100).toFixed(0)}% ${a.y} times would only reach ${h(f(s))} — the extra is growth landing on earlier growth.`}})}})}function Tn(){const o=te(120),s=[];for(let p=0;p<6;p++){const m={};U.forEach(w=>{const B=(o()+o()+o()-1.5)*2*w.vol*1;m[w.id]=w.drift*3.6+B+(p===3?-w.vol*1.5:0)}),s.push(m)}const n={round:0,sel:0,done:!1,churn:0,divSum:0,alloc:{basket:0,grain:0,chai:0,rocket:0},me:1e3,log:[1e3],bots:{Chaser:1e3,Panicker:1e3,"Boring Bella":1e3},botHold:{Chaser:"basket",Panicker:"chai","Boring Bella":"basket"},botStat:{Chaser:{div:0,churn:100},Panicker:{div:0,churn:100},"Boring Bella":{div:0,churn:100}}},i=()=>100-(n.alloc.basket+n.alloc.grain+n.alloc.chai+n.alloc.rocket),c=(p,m)=>{if(n.done)return;const w=oe(n.alloc[p]+m,0,n.alloc[p]+i());if(w===n.alloc[p]){y.bad();return}n.churn+=Math.abs(w-n.alloc[p]),n.alloc[p]=w,y.click(),l.render()},r=()=>{let p=0;return n.alloc.basket>=15&&(p+=4),["grain","chai","rocket"].forEach(m=>{n.alloc[m]>=15&&(p+=1)}),Math.min(4,p)},k=(p,m,w)=>{const B=Math.round((p/1e3-1)*100),M=Math.round(m*7),v=Math.max(0,30-Math.round(w/8));return{ret:B,div:M,steady:v,total:B+M+v}},b=()=>{if(n.done)return;n.divSum+=r();const p=s[n.round];let m=0;U.forEach(z=>{m+=n.alloc[z.id]/100*p[z.id]}),n.me=Math.round(n.me*(1+m)),n.log.push(n.me);const w=z=>z==="cash"?0:z==="basket"?4:1;Object.keys(n.bots).forEach(z=>{n.botStat[z].div+=w(n.botHold[z])});const B=U.slice().sort((z,I)=>p[I.id]-p[z.id])[0].id;n.bots.Chaser=Math.round(n.bots.Chaser*(1+p[n.botHold.Chaser])),B!==n.botHold.Chaser&&(n.botStat.Chaser.churn+=100),n.botHold.Chaser=B;const M=n.botHold.Panicker;n.bots.Panicker=Math.round(n.bots.Panicker*(1+(M==="cash"?0:p[M])));const v=M!=="cash"&&p[M]<0?"cash":"chai";v!==M&&(n.botStat.Panicker.churn+=100),n.botHold.Panicker=v,n.bots["Boring Bella"]=Math.round(n.bots["Boring Bella"]*(1+p.basket)),n.round++,n.round>=6?T():y.click(),l.render()},T=()=>{n.done=!0;const p=ee();n.score=k(n.me,n.divSum/6,n.churn),n.table=[{who:"You",v:n.me,sc:n.score}].concat(Object.keys(n.bots).map(w=>({who:w,v:n.bots[w],sc:k(n.bots[w],n.botStat[w].div/6,n.botStat[w].churn)}))).sort((w,B)=>B.sc.total-w.sc.total),n.place=n.table.findIndex(w=>w.who==="You")+1,n.byReturn=n.table.slice().sort((w,B)=>B.v-w.v)[0].who,n.won=ae(Math.max(4,Math.round(n.score.total/6)),"The Market Cup"),n.score.div>=24&&F(p,"diversified");const m=`${n.place}${["st","nd","rd","th"][Math.min(n.place-1,3)]} of 4 · cup score ${n.score.total}`;p.market.best||(p.market.best=m),y.level()};return{id:"mc",key(p){if(n.done){p.key==="Enter"&&(_(),l.render());return}const m=U.map(w=>w.id);p.key==="ArrowDown"?(n.sel=(n.sel+1)%m.length,l.render()):p.key==="ArrowUp"?(n.sel=(n.sel+m.length-1)%m.length,l.render()):p.key==="ArrowRight"?c(m[n.sel],10):p.key==="ArrowLeft"?c(m[n.sel],-10):p.key==="Enter"&&b()},act(p,m){if(p==="mcAdj"){const[w,B]=m.split(":");c(w,+B)}else p==="mcNext"?b():p==="mcSel"&&(n.sel=U.findIndex(w=>w.id===m),l.render())},view(){if(n.done){const p=n.score;return`<div class="stack">${q(["Cup over"])}
          <div class="stage">
            <div style="text-align:center"><div style="font-size:42px">${n.place===1?"🏆":"🎗️"}</div>
            <h2>${n.place===1?"You won the Cup":n.place+" of 4"}</h2>
            <p class="muted">Cup score ${p.total} · ended on ${n.me} from 1000.</p></div>
            <div class="lead">
              ${n.table.map((m,w)=>`<div class="leadrow ${m.who==="You"?"me":""}">
                <span>${w+1}</span>
                <span>${u(m.who)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                  ${m.sc.ret>=0?"+":""}${m.sc.ret} return · ${m.sc.div} spread · ${m.sc.steady} nerve</span></span>
                <span class="p" style="font-size:17px">${m.sc.total}</span></div>`).join("")}
            </div>
            <p class="small muted">Ranked on cup score. On money alone <b>${u(n.byReturn)}</b> finished top —
              which is exactly why money alone is not the scoreboard.</p>
            <div class="card" style="box-shadow:none">
              <div class="eyebrow">Your cup score — and this is the part that matters</div>
              <div class="grid3" style="margin-top:8px">
                <div><div class="small muted">Return</div><div style="font-weight:800">${p.ret>=0?"+":""}${p.ret}</div></div>
                <div><div class="small muted">Spread out</div><div style="font-weight:800">${p.div}</div></div>
                <div><div class="small muted">Kept your nerve</div><div style="font-weight:800">${p.steady}</div></div>
              </div>
              <div class="sep" style="margin:10px 0"></div>
              <div class="row"><span class="grow" style="font-weight:800">Total</span><span class="big" style="font-size:22px">${p.total}</span></div>
            </div>
            ${R(n.table[0].who==="Boring Bella"?"bea":"bo",n.table[0].who==="Boring Bella"?"Bella bought the whole basket in week one and then went home. She does that every season, and she is very hard to beat.":"You beat Bella this time. Run another six weeks and see whether that keeps happening — that question <b>is</b> the game.")}
            <p class="small muted">Earned ${h(n.won)}. Fictional companies, real market behaviour, nothing here is advice.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`}return`<div class="stack">
        ${q([`Week ${n.round+1} / 6`,`${n.me}`,`cash ${i()}%`])}
        <div class="stage">
          <p class="small muted">Split 100% across what you fancy. What you leave in cash is safe and grows by nothing.</p>
          <div class="alloc">
            ${U.map((p,m)=>`<div class="alrow ${m===n.sel?"sel":""}" data-act="mcSel" data-arg="${p.id}" role="button" tabindex="0">
              <div><b style="font-size:14px">${p.em} ${u(p.name)}</b>
                <div class="small muted">${p.kind==="fund"?"a slice of every shop":p.kind==="steady"?"slow and dull":p.kind==="growth"?"growing, bumpy":"anybody’s guess"}</div></div>
              <div class="stepper">
                <button data-act="mcAdj" data-arg="${p.id}:-10" aria-label="less ${u(p.name)}">−</button>
                <span class="n">${n.alloc[p.id]}%</span>
                <button data-act="mcAdj" data-arg="${p.id}:10" aria-label="more ${u(p.name)}">+</button></div></div>`).join("")}
          </div>
          ${xe(n.log,300,40,"var(--action)")}
          <button class="btn wide" data-act="mcNext">Play the week →</button>
          <p class="hint">Arrows to move and change, Enter to play the week. Or just tap.</p>
        </div></div>`}}}const An=["nwNeed","nwWant","ssSafe","ssScam","bbPay","bbSkip","ttPick","ttNext","snPick","snNext","mcAdj","mcNext","mcSel","crLane","crGo","stSell","stPlan","stGo","ccHold","ccRelease","srServe","srStock","mnRoll","mnBuy","mnPass","mnCard","mnEnd"];function Mn(){const n={year:0,money:100,charge:0,holding:!1,done:!1,hist:[100],last:null,ruined:!1,peak:100};let i=0,c=0,r=null,k=null;const b=te(8821),T=()=>{i&&cancelAnimationFrame(i),i=0},p=()=>{n.done||(n.done=!0,T(),n.won=ae(Math.max(3,Math.round(n.money/22)),"Compound Climb"),n.money>=420&&F(ee(),"climbed"),y.level(),l.render())},m=()=>{if(n.done||!n.holding)return;n.holding=!1;const v=n.charge/100,z=v*.22,I=v*v*.34,d=z+(b()+b()-1)*I,S=n.money;if(n.money=Math.max(0,n.money*(1+d)),n.hist.push(Math.round(n.money)),n.peak=Math.max(n.peak,n.money),n.last={pct:d,before:S,after:n.money},n.year++,n.charge=0,n.money<20){n.ruined=!0,p();return}if(d<0?y.bad():y.coin(),n.year>=15){p();return}l.render()},w=()=>{!n.done&&!n.holding&&(n.holding=!0,n.charge=0)},B=v=>{if(n.done)return;const z=Math.min(60,v-(c||v));c=v,n.holding&&(n.charge=Math.min(100,n.charge+z*.075)),M();const I=document.getElementById("ccCharge");I&&(I.style.width=n.charge.toFixed(1)+"%"),i=requestAnimationFrame(B)},M=()=>{if(!r)return;const v=getComputedStyle(document.documentElement),z=(A,j)=>(v.getPropertyValue(A)||j).trim()||j;r.clearRect(0,0,360,320),r.fillStyle=z("--tint","#EDF2F2"),r.fillRect(0,0,360,320);const I=Math.max(420*1.15,n.peak*1.1),d=A=>306-A/I*280;r.setLineDash([5,5]),r.strokeStyle=z("--grow","#178A4C"),r.lineWidth=1.5,r.beginPath(),r.moveTo(0,d(420)),r.lineTo(360,d(420)),r.stroke(),r.setLineDash([]),r.fillStyle=z("--grow","#178A4C"),r.font="600 11px system-ui",r.textAlign="left",r.fillText("target",6,d(420)-6);const S=Math.max(6,320/15);n.hist.forEach((A,j)=>{const N=20+j*S,D=j===0||A>=n.hist[j-1];r.fillStyle=D?z("--action","#0E6B78"):z("--spend","#C4453C"),r.globalAlpha=j===n.hist.length-1?1:.75,r.fillRect(N,d(A),S-3,306-d(A))}),r.globalAlpha=1,r.fillStyle=z("--ink","#16262A"),r.font="800 15px system-ui",r.textAlign="right",r.fillText(String(Math.round(n.money)),352,Math.max(16,d(n.money)-8))};return{id:"cc",mount(){if(k=document.getElementById("ccCanvas"),!k)return;const v=Math.min(window.devicePixelRatio||1,2);k.width=360*v,k.height=320*v,r=k.getContext("2d"),r&&r.setTransform(v,0,0,v,0,0),!n.done&&!i&&(c=0,i=requestAnimationFrame(B));const z=document.getElementById("ccBtn");z&&(z.onpointerdown=I=>{I.preventDefault(),w()},z.onpointerup=I=>{I.preventDefault(),m()},z.onpointerleave=()=>{n.holding&&m()})},stop:T,key(v){if(n.done){v.key==="Enter"&&(_(),l.render());return}(v.key===" "||v.key==="Spacebar")&&v.type==="keydown"&&w()},keyup(v){(v.key===" "||v.key==="Spacebar")&&m()},act(v){v==="ccHold"?w():v==="ccRelease"&&m()},view(){if(n.done){const z=n.money>=420;return`<div class="stack">${q(["Fifteen years"])}
          ${ze(n.ruined?"💀":z?"🗼":"📈",n.ruined?"Wiped out in year "+n.year:Math.round(n.money)+" from 100",n.ruined?'Nothing left to compound. That is the half of "high return" nobody puts on the poster.':z?"Over the line.":"Short of the line, and still "+(n.money/100).toFixed(1)+"× what you started with.",n.won,n.ruined?"Growth needs something left to grow. A swing big enough to double you is big enough to end you.":"The middle charge usually wins. Not the safe one, not the wild one — the one you can survive fifteen times in a row.","nana")}</div>`}const v=n.last;return`<div class="stack">
        ${q([`Year ${n.year+1} / 15`,`${Math.round(n.money)}`,"target 420"])}
        <div class="stage" style="min-height:0;padding:12px">
          <canvas id="ccCanvas" style="width:100%;max-width:420px;margin:0 auto;height:auto;aspect-ratio:360/320;border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          ${v?`<div style="background:${v.pct>=0?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:10px 12px;font-size:13.5px;text-align:center">
            Year ${n.year}: <b>${v.pct>=0?"+":""}${(v.pct*100).toFixed(1)}%</b> · ${Math.round(v.before)} → ${Math.round(v.after)}</div>`:""}
          <div>
            <div class="row"><span class="eyebrow grow">This year's growth</span>
              <span class="small muted">longer = more, and wilder</span></div>
            <div class="bar" style="height:16px;margin-top:5px">
              <i id="ccCharge" style="width:${n.charge}%;background:linear-gradient(90deg,var(--grow),var(--treasure) 55%,var(--spend))"></i></div>
          </div>
          <button class="btn wide" id="ccBtn" style="padding:18px" data-act="noop">HOLD TO GROW</button>
          <p class="hint">Hold space or the button, let go to lock the year in. Steady beats spectacular — usually.</p>
        </div></div>`}}}function Sn(){const t={t:0,revenue:0,spent:0,served:0,lost:0,stock:{chai:3,ice:3,umbrella:2,rope:2},q:[],done:!1,spawn:900,restock:0,msg:""};let o=0,s=0,n=0;const i=te(3312),c=Y.map(m=>m.id),r=()=>{o&&cancelAnimationFrame(o),o=0},k=()=>{t.done||(t.done=!0,r(),t.profit=t.revenue-t.spent,t.won=ae(Math.max(2,Math.round(t.profit/14)),"Stall Rush"),t.profit>0&&F(ee(),"profit-day"),y.level(),l.render())},b=m=>{if(t.done)return;const w=t.q.findIndex(M=>M.want===m);if(w<0){y.bad(),t.msg="Nobody is waiting for that",l.render();return}if(!t.stock[m]){y.bad(),t.msg="Out of "+m+" — restock costs time",l.render();return}const B=Y.find(M=>M.id===m);t.stock[m]--,t.q.splice(w,1),t.revenue+=f(B.sells),t.served++,t.msg="",y.coin(),l.render()},T=()=>{if(t.done||t.restock>0)return;let m=0;if(Y.forEach(w=>{const B=3-(t.stock[w.id]||0);B>0&&(t.stock[w.id]+=B,m+=f(w.cost)*B)}),!m){t.msg="Everything is already stocked",l.render();return}t.spent+=m,t.restock=2600,t.msg="Restocked for "+h(m)+" — and the queue did not wait",y.click(),l.render()},p=m=>{if(t.done)return;const w=Math.min(60,m-(s||m));s=m,t.t+=w,t.restock=Math.max(0,t.restock-w),t.spawn-=w;let B=!1;t.spawn<=0&&t.q.length<4&&(t.spawn=900+i()*700,t.q.push({id:++n,want:c[Math.floor(i()*c.length)],patience:1}),B=!0);for(let v=t.q.length-1;v>=0;v--)t.q[v].patience-=w/9e3,t.q[v].patience<=0&&(t.q.splice(v,1),t.lost++,B=!0,y.bad());if(t.t>=6e4){k();return}const M=document.getElementById("srTime");M&&(M.textContent=Math.ceil((6e4-t.t)/1e3)),t.q.forEach(v=>{const z=document.getElementById("srP"+v.id);z&&(z.style.width=Math.max(0,v.patience*100)+"%")}),B&&l.render(),o=requestAnimationFrame(p)};return{id:"sr",mount(){!t.done&&!o&&(s=0,o=requestAnimationFrame(p))},stop:r,key(m){if(t.done){m.key==="Enter"&&(_(),l.render());return}const w=parseInt(m.key,10);w>=1&&w<=c.length?b(c[w-1]):(m.key==="r"||m.key==="R")&&T()},act(m,w){m==="srServe"?b(w):m==="srStock"&&T()},view(){return t.done?`<div class="stack">${q(["Closed"])}
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${t.profit>0?"💹":"📉"}</div>
            <h2>${t.profit>=0?"+":"−"}${h(Math.abs(t.profit))} profit</h2>
            <div class="card" style="box-shadow:none">
              <div class="grid3">
                <div><div class="small muted">Took</div><div style="font-weight:800;color:var(--grow)">${h(t.revenue)}</div></div>
                <div><div class="small muted">Spent on stock</div><div style="font-weight:800">${h(t.spent)}</div></div>
                <div><div class="small muted">Served</div><div style="font-weight:800">${t.served}</div></div>
              </div>
            </div>
            <p class="small muted">${t.lost} customer${t.lost===1?"":"s"} gave up waiting.</p>
            ${R("nana",t.revenue>0&&t.profit<=0?"You were rushed off your feet and you are down on the day. Busy and profitable are two different words, and only one of them pays the rent.":"Revenue is the number people brag about. That one at the top is the one that decides whether you are open next year.")}
            <p class="small muted">Earned ${h(t.won)}.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`:`<div class="stack">
        ${q([`<span id="srTime">${Math.ceil((6e4-t.t)/1e3)}</span>s`,`took ${h(t.revenue)}`,`stock ${h(t.spent)}`,`lost ${t.lost}`])}
        <div class="stage">
          <div class="eyebrow">The queue</div>
          <div class="stack" style="gap:7px;min-height:132px">
            ${t.q.length?t.q.map(m=>{const w=Y.find(B=>B.id===m.want);return`<div class="row" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
                <span style="font-size:22px">${w.em}</span>
                <span class="grow"><b style="font-size:14px">${u(w.name)}</b>
                  <div class="bar" style="height:5px;margin-top:5px"><i id="srP${m.id}" style="width:${m.patience*100}%;background:var(--treasure);transition:none"></i></div></span>
                <span class="pill">${h(f(w.sells))}</span></div>`}).join(""):'<p class="small muted">Nobody yet. They come in waves.</p>'}
          </div>
          ${t.msg?`<p class="small" style="color:var(--spend);font-weight:650;text-align:center">${u(t.msg)}</p>`:""}
          <div class="choices" style="grid-template-columns:repeat(4,1fr)">
            ${Y.map((m,w)=>`<button class="btn ${t.stock[m.id]?"":"ghost"}" data-act="srServe" data-arg="${m.id}"
              style="flex-direction:column;gap:1px;padding:8px 3px;font-size:11px;line-height:1.15">
              <span style="font-size:18px">${m.em}</span>
              <span style="font-weight:800">${u(m.name)}</span>
              <span style="opacity:.75;font-family:var(--mono);font-size:10.5px">${w+1} · ${t.stock[m.id]||0} left</span></button>`).join("")}
          </div>
          <button class="btn ghost wide" data-act="srStock" ${t.restock>0?"disabled":""}>
            ${t.restock>0?"Restocking…":"R · Restock everything"}</button>
          <p class="hint">Number keys to serve, R to restock. Restocking costs money and takes time you do not have.</p>
        </div></div>`}}}function En(){const a=L[$a()].coins.slice(0,5),t=4,o=360,s=300,n={target:0,got:0,lives:3,round:1,score:0,lane:1,drops:[],t:0,spawn:0,done:!1,flash:0,msg:""};let i=0,c=0,r=null,k=null;const b=()=>{const M=2+Math.floor(Math.random()*3);let v=0;for(let z=0;z<M;z++)v+=a[Math.floor(Math.random()*a.length)];n.target=v,n.got=0,n.drops=[],n.spawn=0};b();const T=()=>{n.done||(n.done=!0,B(),n.won=ae(Math.round(n.score*.5),"Change Rush"),n.round>4&&F(ee(),"exact-change"),l.render())},p=M=>{n.got+=M,n.got===n.target?(n.score+=4+n.round,n.round++,n.flash=1,n.msg="Exact!",y.coin(),b()):n.got>n.target?(n.lives--,n.flash=-1,n.msg="Overpaid by "+h(n.got-n.target),y.bad(),b(),n.lives<=0&&T()):y.click()},m=M=>{if(n.done)return;const v=Math.min(50,M-(c||M));if(c=M,n.t+=v,n.spawn-=v,n.spawn<=0){n.spawn=620-Math.min(320,n.round*40);const I=n.target-n.got,d=a.filter(A=>A<=I),S=d.length&&Math.random()<.55?d[Math.floor(Math.random()*d.length)]:a[Math.floor(Math.random()*a.length)];n.drops.push({lane:Math.floor(Math.random()*t),y:-20,v:S})}const z=.075+n.round*.012;n.drops.forEach(I=>{I.y+=z*v});for(let I=n.drops.length-1;I>=0;I--){const d=n.drops[I];d.y>s-44&&d.y<s-18&&d.lane===n.lane?(p(d.v),n.drops.splice(I,1)):d.y>s+24&&n.drops.splice(I,1)}n.flash&&(n.flash*=.93),w(),i=requestAnimationFrame(m)},w=()=>{if(!r)return;const M=getComputedStyle(document.documentElement),v=(I,d)=>(M.getPropertyValue(I)||d).trim()||d;r.clearRect(0,0,o,s),r.fillStyle=v("--tint","#EDF2F2"),r.fillRect(0,0,o,s),r.strokeStyle=v("--line","#DCE5E4"),r.lineWidth=1;for(let I=1;I<t;I++)r.beginPath(),r.moveTo(I*(o/t),0),r.lineTo(I*(o/t),s),r.stroke();n.drops.forEach(I=>{const d=I.lane*(o/t)+o/t/2;r.beginPath(),r.arc(d,I.y,15,0,Math.PI*2),r.fillStyle=v("--treasure","#F0B429"),r.fill(),r.fillStyle="#5A3D00",r.font="700 13px system-ui",r.textAlign="center",r.textBaseline="middle",r.fillText(String(I.v),d,I.y+1)});const z=n.lane*(o/t)+o/t/2;r.fillStyle=n.flash>.1?v("--grow","#178A4C"):n.flash<-.1?v("--spend","#C4453C"):v("--action","#0E6B78"),r.beginPath(),r.moveTo(z-34,s-34),r.lineTo(z+34,s-34),r.lineTo(z+26,s-6),r.lineTo(z-26,s-6),r.closePath(),r.fill()},B=()=>{i&&cancelAnimationFrame(i),i=0};return{id:"cr",mount(){if(k=document.getElementById("crCanvas"),!k)return;const M=Math.min(window.devicePixelRatio||1,2);k.width=o*M,k.height=s*M,r=k.getContext("2d"),r&&r.setTransform(M,0,0,M,0,0),n.done||(c=0,B(),i=requestAnimationFrame(m)),k.onpointerdown=v=>{const z=k.getBoundingClientRect();n.lane=oe(Math.floor((v.clientX-z.left)/z.width*t),0,t-1)}},stop:B,key(M){if(n.done){M.key==="Enter"&&(_(),l.render());return}M.key==="ArrowLeft"?n.lane=Math.max(0,n.lane-1):M.key==="ArrowRight"&&(n.lane=Math.min(t-1,n.lane+1))},act(M,v){M==="crLane"&&(n.lane=oe(+v,0,t-1))},view(){return n.done?`<div class="stack">${q(["Done"])}
        ${ze(n.round>4?"🏅":"🪙",n.round-1+" exact","Score "+n.score+".",n.won,"Overpaying is the one that costs you. A shop will take too much money all day long and never mention it.","mags")}</div>`:`<div class="stack">
        ${q([`Need ${h(n.target)}`,`Got ${h(n.got)}`,"❤️".repeat(Math.max(0,n.lives))])}
        <div class="stage" style="min-height:0;padding:12px">
          <div class="bar"><i style="width:${Math.min(100,n.got/n.target*100)}%;background:${n.got>n.target?"var(--spend)":"var(--action)"}"></i></div>
          <canvas id="crCanvas" style="width:100%;max-width:400px;margin:0 auto;height:auto;aspect-ratio:${o}/${s};border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          <div class="choices" style="grid-template-columns:repeat(4,1fr);max-width:400px;margin:0 auto;width:100%">
            ${[0,1,2,3].map(M=>`<button class="btn ${n.lane===M?"":"ghost"}" data-act="crLane" data-arg="${M}" aria-label="lane ${M+1}">${M+1}</button>`).join("")}
          </div>
          <p class="hint">${n.msg?u(n.msg)+" · ":""}Arrow keys, or tap a lane. Stop at exactly the amount.</p>
        </div></div>`}}}const vt=[["bea","It is down again. I told you. GET OUT."],["bea","Everyone is selling. Everyone."],["mags","Sell me yours cheap and I will look after it for you."],["bea","This one is not coming back. This one is different."],["bo","I am buying more, but I would say that."],["bea","Down eleven percent. ELEVEN."],["mags","My cousin sold at the top. You could have been my cousin."],["bea","It has never been this bad. Well — it has, but still."]];function zn(){const t={t:0,panic:0,val:1e3,low:1e3,line:[1e3,1e3,1e3],done:!1,sold:!1,shout:null,shoutT:0,calmT:0};let o=0,s=0;const n=te(4477),i=()=>{o&&cancelAnimationFrame(o),o=0},c=b=>{t.done||(t.done=!0,t.sold=b,i(),t.after=Math.round(1e3*1.12),t.soldAt=Math.round(t.val),t.won=ae(b?3:14,"Market Storm"),b||F(ee(),"held-the-storm"),b?y.bad():y.level(),l.render())},r=b=>{if(t.done)return;const T=Math.min(60,b-(s||b));s=b,t.t+=T;const p=t.t/42e3,m=(n()-.5)*22;if(t.val=Math.max(520,1e3*(1-.34*Math.sin(Math.min(1,p)*Math.PI*.92))+m),t.low=Math.min(t.low,t.val),t.line.length<120&&t.t-(t.lastPt||0)>350&&(t.lastPt=t.t,t.line.push(Math.round(t.val))),t.panic=oe(t.panic+T*.0022,0,100),t.shoutT-=T,t.calmT=Math.max(0,t.calmT-T),t.shoutT<=0&&(t.shoutT=3400,t.shout=vt[Math.floor(n()*vt.length)],t.panic=oe(t.panic+11,0,100),l.render()),t.panic>=100){c(!0);return}if(t.t>=42e3){c(!1);return}const w=document.getElementById("stPanic");w&&(w.style.width=t.panic.toFixed(1)+"%");const B=document.getElementById("stVal");B&&(B.textContent=Math.round(t.val));const M=document.getElementById("stTime");M&&(M.textContent=Math.ceil((42e3-t.t)/1e3));const v=document.getElementById("stChart");v&&(v.innerHTML=xe(t.line,300,62,"var(--spend)")),o=requestAnimationFrame(r)},k=()=>{t.done||t.calmT>0||(t.panic=oe(t.panic-26,0,100),t.calmT=2600,y.good(),l.render())};return{id:"st",mount(){!t.done&&!o&&(s=0,o=requestAnimationFrame(r))},stop:i,key(b){if(t.done){b.key==="Enter"&&(_(),l.render());return}(b.key===" "||b.key==="Spacebar")&&(b.preventDefault(),k())},act(b){b==="stSell"?c(!0):b==="stPlan"&&k()},view(){if(t.done)return`<div class="stack">${q(["Storm over"])}
          <div class="stage" style="text-align:center;justify-content:center">
            <div style="font-size:44px">${t.sold?"📉":"⛰️"}</div>
            <h2>${t.sold?"You sold":"You held"}</h2>
            <p class="muted">${t.sold?"Locked in "+t.soldAt+" from 1000. The fall became a loss the moment you sold.":"It bottomed at "+Math.round(t.low)+" and came back to "+t.after+"."}</p>
            <div class="card" style="box-shadow:none">
              <div class="grid3">
                <div><div class="small muted">Started</div><div style="font-weight:800">1000</div></div>
                <div><div class="small muted">Worst moment</div><div style="font-weight:800;color:var(--spend)">${Math.round(t.low)}</div></div>
                <div><div class="small muted">${t.sold?"You got":"Ended"}</div>
                  <div style="font-weight:800;color:${t.sold?"var(--spend)":"var(--grow)"}">${t.sold?t.soldAt:t.after}</div></div>
              </div>
            </div>
            ${R(t.sold?"bea":"nana",t.sold?"I talked you into it, and I am always this certain, and I am wrong about half the time. Have another go.":"A fall is not a loss until you sell. Sitting still is the hardest thing in this whole subject and you just did it.")}
            <p class="small muted">Earned ${h(t.won)}. Fictional market, real behaviour, nothing here is advice.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;const b=t.shout;return`<div class="stack">
        ${q([`<span id="stTime">${Math.ceil((42e3-t.t)/1e3)}</span>s left`,`<span id="stVal">${Math.round(t.val)}</span> / 1000`])}
        <div class="stage">
          <div>
            <div class="row"><span class="eyebrow grow">Panic</span>
              <span class="small muted">${t.calmT>0?"reading your plan…":"space, or the small button"}</span></div>
            <div class="bar" style="height:14px;margin-top:5px">
              <i id="stPanic" style="width:${t.panic}%;background:linear-gradient(90deg,var(--treasure),var(--spend));transition:width .2s linear"></i></div>
          </div>
          <div id="stChart">${xe(t.line,300,62,"var(--spend)")}</div>
          ${b?R(b[0],u(b[1])):R("bo","It is going to be fine. Probably. I say that every week too.")}
          <div class="card" style="box-shadow:none;border-style:dashed">
            <div class="eyebrow">Your plan, in your words</div>
            <p style="font-weight:650;font-size:14.5px">"I'm in for five years. I won't sell before then unless the company stops making anything."</p>
          </div>
          <div class="grow"></div>
          <button class="btn wide" style="background:var(--spend)" data-act="stSell">SELL EVERYTHING</button>
          <button class="btn ghost wide" data-act="stPlan" ${t.calmT>0?"disabled":""}>Re-read my plan · space</button>
          <p class="hint">Doing nothing is the move. It will not feel like one.</p>
        </div></div>`}}}const bt=document.getElementById("app");let V={step:0},Ve=!1;const $e=[{k:"home",n:"Home",g:"🏘️"},{k:"learn",n:"Learn",g:"📗"},{k:"money",n:"Money",g:"🪙"},{k:"arcade",n:"Arcade",g:"🎮"},{k:"store",n:"Store",g:"🛒"},{k:"progress",n:"Progress",g:"📈"},{k:"collection",n:"Collection",g:"🏅"}],ya=["home","learn","money","arcade"];function Bn(){if(!l.s||!l.s.kids.length)return;const e=l.s.ui,a="#/"+e.nav+(e.nav==="money"?"/"+e.sub:"");location.hash!==a&&(Ve=!0,location.hash=a,Ve=!1)}function ga(){const e=(location.hash||"").replace(/^#\/?/,"").split("/");return!e[0]||$e.map(t=>t.k).concat(["parents"]).indexOf(e[0])<0?!1:(l.s.ui.nav=e[0],e[0]==="money"&&e[1]&&(l.s.ui.sub=e[1]),!0)}function $(){const e=l.s;if(!e||!e.kids.length||l.adding){bt.innerHTML=`<div class="content">${Ya(V)}</div>`;return}const a=Q(e),t=a.band==="sprout",o=t?$e.filter(i=>ya.includes(i.k)):$e,s=e.ui.nav==="learn"?Ka():e.ui.nav==="money"?Ja():e.ui.nav==="arcade"?yn():e.ui.nav==="store"?on():e.ui.nav==="progress"?sn():e.ui.nav==="parents"?rn():e.ui.nav==="collection"?dn():Ga(),n=t?o:$e.slice(0,4).concat([{k:"more",n:"More",g:"⋯"}]);bt.innerHTML=`
    <header class="topbar">
      <div class="topbar-in">
        <button class="brand" data-act="nav" data-arg="home"><em>Bizzing</em> Finance</button>
        <button class="chip money" data-act="nav" data-arg="money"
          title="Your money — this opens the town's ledger, not the shop">${h(a.money.wallet)}</button>
        <span class="chip streak" title="Days in a row">🔥 ${a.streak.days.length}</span>
        <button class="iconbtn" data-act="mode" aria-label="Light or dark">${l.mode==="dark"?"☾":"☀"}</button>
        <button class="iconbtn" data-act="nav" data-arg="parents" aria-label="Grown-up's page">👪</button>
      </div>
      <nav class="nav" aria-label="Sections">
        ${o.map(i=>`<button class="navbtn" data-act="nav" data-arg="${i.k}"
          aria-current="${e.ui.nav===i.k?"page":"false"}">${i.n}</button>`).join("")}
      </nav>
    </header>
    <main class="content">${Nt(e)?jn():""}${s}</main>
    <nav class="tabbar" aria-label="Primary">
      ${n.map(i=>`<button data-act="${i.k==="more"?"more":"nav"}" data-arg="${i.k}"
        aria-current="${e.ui.nav===i.k?"page":"false"}"><span class="gl">${i.g}</span><span>${i.n}</span></button>`).join("")}
    </nav>
    ${l.overlay?Cn():""}`,l.game&&l.game.mount&&l.game.mount(),Bn(),ha(e)}l.render=$;function jn(){return`<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint);margin-bottom:14px">
    <div class="eyebrow" style="color:var(--treasure-deep)">The town clock</div>
    <p class="small" style="color:var(--treasure-deep)">This device's clock has gone backwards, so Bizzington is holding
      the date it last saw. Pay day cannot be replayed by winding a clock back — in the shipping build the time comes
      from the server and this cannot happen at all.</p></div>`}function Cn(){const e=l.overlay,a=Q(l.s),t=(o,s)=>`<div class="ov" data-act="closeOv"><div class="ovbox" data-act="noop" role="dialog" aria-modal="true">${o}</div></div>`;if(e.kind==="letter"){const o=e.letter,s=o.from==="scam"?null:H[o.from];return t(`
      <div class="row" style="gap:11px;margin-bottom:12px">
        <span style="width:46px;height:46px;flex:0 0 auto;border-radius:50%;overflow:hidden;border:1px solid var(--line);display:block;background:var(--surface2)">
          ${s?s.svg:'<div style="display:grid;place-items:center;height:100%;font-size:22px">✉️</div>'}</span>
        <div class="grow"><div class="eyebrow">${s?u(s.name):"Sender unknown"}</div>
        <h3 style="font-size:19px">${u(o.title)}</h3></div></div>
      <p style="font-size:15px;line-height:1.6;background:var(--tint);border-radius:var(--r-md);padding:13px 15px">${u(o.body)}</p>
      ${e.result?`<div style="margin-top:12px;background:${e.result.good?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:13px 15px;font-size:14px">${u(e.result.note)}</div>
           <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
             ${e.result.money?`<span class="pill gold">${e.result.money>0?"+":"−"}${h(Math.abs(e.result.money))}</span>`:""}
             <span class="pill grow">+${e.result.xp} XP</span>
             ${e.result.badge?`<span class="pill gold">${Z[e.result.badge].em} ${u(Z[e.result.badge].name)}</span>`:""}</div>
           <button class="btn wide" style="margin-top:14px" data-act="closeOv">Back to the street</button>`:`<div class="stack" style="gap:8px;margin-top:14px">
            ${o.choices.map((n,i)=>`<button class="opt" data-act="letterPick" data-arg="${i}">${u(n.label)}</button>`).join("")}
           </div>`}`)}if(e.kind==="payday"){const o=e.res;return t(`
      <div style="text-align:center"><div style="font-size:44px">🔔</div>
        <div class="eyebrow">The bell rang</div>
        <h2 style="margin:4px 0 10px">Pay day in Bizzington</h2></div>
      <div class="stack" style="gap:7px">
        <div class="row"><span class="grow">Wages</span><b style="color:var(--grow)">+${h(o.wage)}</b></div>
        ${o.chores.map(s=>`<div class="row"><span class="grow muted">${u(s.name)}</span><b style="color:var(--grow)">+${h(s.amt)}</b></div>`).join("")}
        ${o.bills.map(s=>`<div class="row"><span class="grow muted">${u(s.name)}</span><b>−${h(s.amt)}</b></div>`).join("")}
        ${o.interest?`<div class="row"><span class="grow">Bank interest</span><b style="color:var(--grow)">+${h(o.interest)}</b></div>`:""}
        ${o.loan?`<div class="row"><span class="grow muted">Loan repayment</span><b>−${h(o.loan)}</b></div>`:""}
        ${o.split?`<div class="sep"></div><div class="eyebrow">Your rule split it before you could think about it</div>
          ${Object.keys(o.split).map(s=>`<div class="row"><span class="grow muted">${s[0].toUpperCase()+s.slice(1)} jar</span><b>${h(o.split[s])}</b></div>`).join("")}`:""}
      </div>
      <div class="sep" style="margin:12px 0"></div>
      <div class="row"><span class="grow" style="font-weight:800">In your pocket now</span><span class="big" style="font-size:22px">${h(a.money.wallet)}</span></div>
      ${o.loanCleared?'<div style="margin-top:10px;background:var(--grow-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px"><b>Loan cleared.</b> Your trust score went up, and the next one will be cheaper.</div>':""}
      ${o.mortgageCleared?'<div style="margin-top:10px;background:var(--grow-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px"><b>Mortgage cleared.</b> You own where you live outright. Rent would still be going out today.</div>':""}
      ${(o.independence||[]).map(s=>`<div style="margin-top:10px;background:var(--treasure-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px">
        <b>${Z[s].em} ${u(Z[s].name)}</b> — ${u(Z[s].desc)}</div>`).join("")}
      ${R("pip",o.split?"Split before you could think about it. That is the point of a rule.":"Open the Jar Shed and set a rule — then this happens by itself.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Out into the market →</button>`)}if(e.kind==="level"){const o=Pe.find(n=>n.lv>e.from&&n.lv<=e.level),s=Je(e.level);return t(`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 8px;border-radius:50%;overflow:hidden">${H.pip.svg}</div>
        <div class="eyebrow">Level ${e.level} · ${s.em} ${s.name}</div>
        <h2 style="margin:4px 0 8px;font-size:28px">${o?u(o.name)+" is open":"Level "+e.level}</h2>
        <p class="muted">${o?u(o.blurb):"Learning "+u(s.of)+"."}</p>
        ${o?`<button class="btn wide" style="margin-top:16px" data-act="goPlace" data-arg="${o.key}">Go and look →</button>`:""}
        <button class="${o?"small muted":"btn wide"}" style="margin-top:10px;width:100%;text-align:center" data-act="closeOv">${o?"Later":"Keep going"}</button>
      </div>`)}if(e.kind==="biz"){const o=e.day,s=o.weather;return t(`
      <div style="text-align:center"><div style="font-size:42px">${s.em}</div>
        <div class="eyebrow">${u(s.name)}</div>
        <h2 style="margin:4px 0 10px">Day's trading</h2></div>
      <div class="stack" style="gap:6px">
        ${Y.filter(n=>o.sold[n.id]).map(n=>`<div class="row"><span class="grow muted">${n.em} ${o.sold[n.id]} × ${u(n.name)}</span><b style="color:var(--grow)">+${h(o.sold[n.id]*Q(l.s).biz.prices[n.id])}</b></div>`).join("")||'<p class="small muted">Nothing sold. It happens — the rent still arrived.</p>'}
        <div class="sep"></div>
        <div class="row"><span class="grow">Revenue</span><b>${h(o.revenue)}</b></div>
        <div class="row"><span class="grow muted">Rent</span><b>−${h(o.rent)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Profit</span>
          <span class="big" style="font-size:22px;color:${o.profit>=0?"var(--grow)":"var(--spend)"}">${o.profit>=0?"+":"−"}${h(Math.abs(o.profit))}</span></div>
      </div>
      ${Object.keys(o.spoiled||{}).length?`<div style="margin-top:11px;background:var(--spend-tint);border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">
        ${Object.keys(o.spoiled).map(n=>o.spoiled[n]+" "+Y.find(i=>i.id===n).name.toLowerCase()).join(", ")} melted overnight — stock you had already paid for.</div>`:""}
      ${R("nana",o.profit>=0?"Revenue is the number people brag about. That one at the bottom is the one that decides whether you are open next year.":"A loss is information, not a verdict. Look at what the weather wanted and what you had on the counter.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Close up →</button>`)}if(e.kind==="moved"){const o=e.home,s=re(a)-me(a);return t(`
      <div style="text-align:center"><div style="font-size:46px">${o.em}</div>
        <div class="eyebrow">Keys</div>
        <h2 style="margin:4px 0 8px;font-size:26px">${u(o.name)}</h2>
        <p class="muted">${u(o.blurb)}</p></div>
      <div class="stack" style="gap:6px;margin-top:14px">
        ${a.money.bills.map(n=>`<div class="row"><span class="grow muted">${u(n.name)}</span><b>−${h(n.amt)}</b></div>`).join("")}
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Left each week</span>
          <span class="big" style="font-size:21px;color:${s>0?"var(--grow)":"var(--spend)"}">${h(s)}</span></div>
      </div>
      ${R("nana",s>0?"Every room you add adds a bill behind it. That is not a warning — it is just the arithmetic, and now you have seen it.":"That is more going out than coming in. It is survivable for a while and it is not survivable forever. Worth knowing now.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Settle in →</button>`)}if(e.kind==="more"){const o=$e.filter(s=>!ya.includes(s.k)).concat([{k:"parents",n:"Grown-up's page",g:"👪"}]);return t(`<div class="eyebrow" style="margin-bottom:10px">Everything else</div>
      <div class="stack" style="gap:8px">
        ${o.map(s=>`<button class="opt" data-act="nav" data-arg="${s.k}">${s.g} &nbsp;${s.n}</button>`).join("")}
      </div>`)}return""}const E=()=>Q(l.s);x("noop",()=>{});x("closeOv",()=>{l.overlay=null,$()});x("more",()=>{l.overlay={kind:"more"},$()});x("nav",e=>{l.overlay=null,l.shelf="",l.game&&_(),l.s.ui.nav=e,l.s.kids.length&&(E().learn.openCard=null),y.click(),$(),window.scrollTo(0,0)});x("sub",e=>{l.overlay=null,l.s.ui.nav="money",l.s.ui.sub=e,y.click(),$(),window.scrollTo(0,0)});x("shelf",e=>{l.shelf=e||"",l.query="",$(),window.scrollTo(0,0)});x("locked",e=>{C(`Opens at level ${e} — keep learning`),y.bad()});x("mode",()=>{l.mode=l.mode==="dark"?"light":"dark",document.documentElement.setAttribute("data-mode",l.mode);try{localStorage.setItem("bzf_mode",l.mode)}catch{}$()});x("sound",()=>{l.s.settings.sound=!l.s.settings.sound,$t(l.s.settings.sound),y.click(),$()});x("obNext",()=>{const e=(l.fields.name||"").trim();if(!e){C("Type a name first");return}V.name=e,V.step=1,y.click(),$()});x("obBand",e=>{V.band=e,V.step=2,y.click(),$()});x("obCancel",()=>{V={step:0},l.adding=!1,$()});x("obCur",e=>{l.s||(l.s=It());const a=zt(V.name,V.band,e);l.s.kids.push(a),l.s.active=l.s.kids.length-1,l.s.ui={nav:"home",sub:"wallet"},Ae(e),l.fields={},V={step:0},l.adding=!1,y.level(),ge(40),$()});x("town",e=>{const a=Pe.find(t=>t.key===e);if(a){if(E().learn.level<a.lv){C(`${a.name} opens at level ${a.lv}`),y.bad();return}Ne("sub",a.sub)}});x("goPlace",e=>{l.overlay=null,Ne("town",e)});x("card",e=>{l.s.ui.nav="learn",l.shelf="",E().learn.openCard=e,E().learn.drill=null,y.click(),$(),window.scrollTo(0,0)});x("closeCard",()=>{E().learn.openCard=null,E().learn.drill=null,$()});x("answer",e=>{const a=E(),t=fe.find(n=>n.id===a.learn.openCard);if(!t||a.learn.drill&&a.learn.drill.card===t.id)return;const o=+e,s=o===Xe(t).answer;a.learn.drill={card:t.id,pick:o,right:s},s?y.good():y.bad(),$()});x("cardDone",e=>{const a=E(),t=fe.find(c=>c.id===e);if(!t)return;const o=!!(a.learn.drill&&a.learn.drill.right),s=!a.learn.done[e];a.learn.done[e]=!0;const n=De(a,s?o?22:12:2),i=ie.find(c=>c.id===t.ch);i.cards.every(c=>a.learn.done[c.id])&&F(a,"chapter-"+i.id),a.learn.openCard=null,a.learn.drill=null,n.leveled?lt(n):(C("+"+n.gained+" XP"),$())});function lt(e){y.level(),ge(50),l.overlay={kind:"level",level:e.level,from:e.from},$()}x("postbox",()=>{const e=E();if(e.postbox.answered){C("Emptied — another one tomorrow");return}l.overlay={kind:"letter",letter:ht[e.postbox.idx%ht.length],result:null},y.click(),$()});x("letterPick",e=>{const a=E(),t=l.overlay.letter,o=t.choices[+e];let s=0;if(o.wallet){const i=f(Math.abs(o.wallet));o.wallet>0?(Ee(a,i,t.title,"letter"),s=i):(Pt(a,i,t.title,"letter"),s=-i)}const n=De(a,o.xp||0);o.badge&&F(a,o.badge),a.postbox.answered=!0,a.postbox.log.push({id:t.id,scam:!!t.scam,safe:!!o.safe,t:Date.now()}),W(a),l.overlay.result={note:o.note,money:s,xp:o.xp||0,badge:o.badge,good:!(t.scam&&!o.safe)},s>0?y.coin():t.scam&&!o.safe?y.bad():y.good(),$(),n.leveled&&setTimeout(()=>lt(n),900)});x("payday",()=>{const e=E();if(!nt(e,l.s)){C("Not yet — the bell rings on "+Re(e.money.nextPay));return}l.overlay={kind:"payday",res:qt(e,l.s)},y.bell(),ge(30),$()});x("skipWeek",()=>{Ht(E(),l.s),C("Clock pushed to pay day"),Ne("nav","home")});x("grantXP",()=>{const e=De(E(),200);e.leveled?lt(e):(C("+200 XP"),$())});x("wipe",()=>{if(confirm("Start this household over? Every town in it goes.")){try{localStorage.removeItem("bzf_profile"),localStorage.removeItem("bzf_v1")}catch{}l.s=null,V={step:0},location.hash="",$()}});x("job",e=>{const a=Ot(E(),e);a?(y.coin(),C("+"+h(a))):C("Done that one today"),$()});x("jarIn",e=>{Ut(E(),e,f(2))?y.coin():C("Wallet is empty"),$()});x("jarOut",e=>{Kt(E(),e,f(2))?y.click():C("That jar is empty"),$()});x("rule",e=>{const[a,t]=e.split(":"),o=E().money.rules;o[a]=Math.max(0,Math.min(100,o[a]+ +t)),y.click(),$()});x("addGoal",()=>{const e=(l.fields.goalName||"").trim(),a=parseInt(String(l.fields.goalAmt||"").replace(/[^0-9]/g,""),10);if(!e){C("Name it first");return}if(!a||a<=0){C("How much does it cost?");return}Vt(E(),e,a),l.fields.goalName="",l.fields.goalAmt="",y.good(),C("Scaffolding up"),$()});x("fundGoal",e=>{if(!_t(E(),e,f(5))){C("The Save jar is empty");return}const a=E().money.goals.find(t=>t.id===e);a&&a.done?(y.level(),ge(40),C("Built it!")):y.coin(),$()});x("autoGoal",e=>{const a=E().money.goals.find(t=>t.id===e);a&&(a.auto=a.auto?0:f(5),C(a.auto?"Will move "+h(a.auto)+" every pay day":"Auto-save off"),y.click(),$())});x("raidGoal",e=>{ot(E(),e)&&(y.bad(),C("Scaffolding came down")),$()});x("bankIn",()=>{Xt(E(),f(10))?y.coin():C("Nothing in the Save jar"),$()});x("bankOut",()=>{Zt(E(),f(10)),y.click(),$()});x("loan",()=>{const e=E(),a=it(e,40,8);confirm(`Borrow ${h(a.amount)}?

You pay back ${h(a.perWeek)} every pay day for ${a.weeks} pay days.
You hand over ${h(a.total)} in total.
So it costs ${h(a.cost)}.`)&&(Qt(e,a),y.coin(),C("Borrowed — and you knew the cost first"),$())});x("repay",()=>{const e=ea(E(),E().money.wallet);e&&(y.coin(),C("Repaid "+h(e))),$()});x("buy",e=>{if(!ta(E(),e,f(5))){C("Fill the Grow jar first");return}y.coin(),$()});x("sell",e=>{aa(E(),e),y.click(),$()});x("openBiz",()=>{oa(E()),y.level(),ge(30),$()});x("bizBuy",e=>{sa(E(),e,5)?y.coin():C("Not enough in the till"),$()});x("bizPrice",e=>{const[a,t]=e.split(":");ia(E(),a,f(1)*+t),y.click(),$()});x("bizTrade",()=>{const e=E();if(!Y.some(o=>(e.biz.stock[o.id]||0)>0)){C("Buy something to sell first"),y.bad();return}const t=ra(e);l.overlay={kind:"biz",day:t},t.profit>=0?y.coin():y.bad(),$()});x("bizCashOut",()=>{const e=la(E());e&&(y.coin(),C("Drew "+h(e)+" from the till")),$()});x("cool",e=>{E().shop.cooling[e]=Date.now()+24*36e5,C("Come back tomorrow — see if you still want it"),y.click(),$()});x("buyItem",e=>{const a=E(),t=Mt.find(n=>n.id===e),o=f(t.units);let s=o-a.money.wallet;if(s>0){const n=Math.min(s,a.money.jars.spend);a.money.jars.spend-=n,a.money.wallet+=n,s-=n}if(s>0){C("Not enough — even after the Spend jar"),y.bad();return}a.money.wallet-=o,P(a,"out",o,t.name,"shop"),a.shop.owned.push(e),W(a),y.coin(),C(t.name+" is yours"),$()});x("move",e=>{const a=E(),t=+e,o=Me[t],s=et(a,t);if(!s.ok){C(s.why),y.bad();return}if(!Ct(a,t)){C("Could not move");return}y.level(),ge(45),l.overlay={kind:"moved",home:o},$()});x("allow",e=>{const a=E(),t=f(5);if(a.family.allowance==null)a.family.allowance=+e>0?t:null;else{const o=a.family.allowance+t*+e;a.family.allowance=o<t?null:o}y.click(),$()});x("coolOff",()=>{E().family.coolOff=!E().family.coolOff,y.click(),$()});x("chore",e=>{const a=E().family.chores[e];a.done=!a.done,y.click(),$()});x("choreAdd",()=>{const e=(l.fields.choreName||"").trim(),a=parseInt(String(l.fields.choreAmt||"").replace(/[^0-9]/g,""),10);if(!e||!a){C("A job and an amount");return}E().family.chores.push({name:e,amt:a,done:!1}),l.fields.choreName="",l.fields.choreAmt="",y.good(),$()});x("choreDel",e=>{E().family.chores.splice(+e,1),$()});x("switchKid",e=>{l.s.active=+e,Ae(E().currency),rt(E()),l.s.ui={nav:"home",sub:"wallet"},y.click(),C("Now playing as "+E().name),$()});x("addKid",()=>{l.adding=!0,V={step:0},l.fields={},$()});x("band",()=>{const e=E();e.band=e.band==="sprout"?"builder":"sprout",y.click(),$()});x("print",()=>{document.body.classList.add("printing");const e=E(),a=document.createElement("div");a.id="printsheet",a.innerHTML=`<h1>${u(e.name)} · Bizzington</h1>
    <p>Week to ${new Date().toLocaleDateString()} · level ${e.learn.level} · ${_e(e.learn.level)}</p>
    <h2>Money</h2>
    <p>Wallet ${h(e.money.wallet)} · jars ${h(We(e))} · bank ${h(e.money.bank.balance)} ·
       invested ${h(be(e))} · <b>net worth ${h(ye(e))}</b></p>
    <h2>Chapters</h2>
    <ul>${ie.map(t=>`<li>${u(t.title)} — ${t.cards.filter(o=>e.learn.done[o.id]).length}/${t.cards.length}</li>`).join("")}</ul>
    <h2>Recent movements</h2>
    <ul>${e.money.txns.slice(0,20).map(t=>`<li>${new Date(t.t).toLocaleDateString()} — ${u(t.label)} — ${t.kind==="in"?"+":"−"}${h(t.amt)}</li>`).join("")}</ul>
    <p style="margin-top:18px;font-size:11px">Simulated money only. Bizzing Finance never touches real money.</p>`,document.body.appendChild(a),setTimeout(()=>{try{window.print()}catch{C("Printing is not available here")}setTimeout(()=>{a.remove(),document.body.classList.remove("printing")},400)},60)});x("game",e=>{gn(e),$()});x("gquit",()=>{_(),$()});An.forEach(e=>{x(e,a=>{l.game&&l.game.act&&l.game.act(e,a)})});ba(document.body);document.body.addEventListener("input",e=>{const a=e.target.getAttribute&&e.target.getAttribute("data-field");a&&(l.fields[a]=e.target.value,e.target.getAttribute("data-live")&&fa(a,e.target.value))});document.body.addEventListener("change",e=>{const a=e.target.getAttribute&&e.target.getAttribute("data-field");a&&e.target.getAttribute("data-live")&&fa(a,e.target.value)});function fa(e,a){e==="query"?(l.query=a,$(),In("query")):e==="cur"?(ca(E(),a),C("Converted to "+L[a].name),$()):e==="payday"&&(Gt(E(),+a),C("Pay day moves to "+["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][+a]),$())}function In(e){const a=document.querySelector(`[data-field="${e}"]`);a&&(a.focus(),a.setSelectionRange(a.value.length,a.value.length))}document.addEventListener("keyup",e=>{l.game&&l.game.keyup&&!l.overlay&&l.game.keyup(e)});document.addEventListener("keydown",e=>{if(l.game&&l.game.key&&!l.overlay){["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter"," "].includes(e.key)&&document.activeElement&&document.activeElement.tagName!=="INPUT"&&e.preventDefault(),l.game.key(e);return}e.key==="Escape"&&l.overlay&&(l.overlay=null,$())});window.addEventListener("hashchange",()=>{Ve||!l.s||!l.s.kids.length||ga()&&(l.overlay=null,l.game&&_(),$())});try{l.mode=localStorage.getItem("bzf_mode")||null}catch{l.mode=null}l.mode&&document.documentElement.setAttribute("data-mode",l.mode);l.s=ua();l.s&&l.s.kids.length&&($t(l.s.settings.sound),rt(Q(l.s)),ga());$();"serviceWorker"in navigator&&/^https?:$/.test(location.protocol)&&!window.BZF_SINGLE&&window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})});window.BZF={R:l,sim:qa,key:e=>Xe(fe.find(a=>a.id===e)).answer};
