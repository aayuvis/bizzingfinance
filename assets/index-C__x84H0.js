(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();function u(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}const Bt=Object.create(null);function $(e,a){Bt[e]=a}function oe(e,a,t){const n=Bt[e];n?n(a,t):console.warn("no action:",e)}function Ra(e){const a=t=>{const n=t.target.closest("[data-act]");if(!n||!e.contains(n))return;const o=n.getAttribute("data-act");if(o==="noop"){t.stopPropagation();return}t.preventDefault(),oe(o,n.getAttribute("data-arg"),t)};e.addEventListener("click",a),e.addEventListener("keydown",t=>{if(t.key!=="Enter"&&t.key!==" ")return;const n=t.target.closest("[data-act]");n&&n.tagName!=="BUTTON"&&n.tagName!=="INPUT"&&a(t)})}let ce=null,zt=!0;function Ct(e){zt=!!e}function Na(){if(!ce)try{ce=new(window.AudioContext||window.webkitAudioContext)}catch{ce=!1}return ce&&ce.state==="suspended"&&ce.resume(),ce}function ee(e,a,t,n,o){const s=Na();if(!s||!zt)return;const i=s.currentTime+(o||0),h=s.createOscillator(),r=s.createGain();h.type=t||"sine",h.frequency.setValueAtTime(e,i),r.gain.setValueAtTime(0,i),r.gain.linearRampToValueAtTime(n??.14,i+.012),r.gain.exponentialRampToValueAtTime(1e-4,i+a),h.connect(r),r.connect(s.destination),h.start(i),h.stop(i+a+.02)}const g={click(){ee(520,.07,"triangle",.06)},coin(){ee(880,.09,"triangle",.11),ee(1320,.13,"triangle",.09,.06)},good(){ee(660,.1,"sine",.12),ee(990,.16,"sine",.1,.08)},bad(){ee(220,.16,"sawtooth",.07),ee(170,.2,"sawtooth",.06,.08)},level(){[523,659,784,1047].forEach((e,a)=>ee(e,.24,"triangle",.11,a*.09))},bell(){[784,1175].forEach((e,a)=>ee(e,.8,"sine",.1,a*.14))}};let ft=null;function C(e){document.querySelectorAll(".toast").forEach(t=>t.remove());const a=document.createElement("div");a.className="toast",a.textContent=e,a.setAttribute("role","status"),document.body.appendChild(a),clearTimeout(ft),ft=setTimeout(()=>a.remove(),2400)}const Ia=["#F0B429","#0E6B78","#178A4C","#C4453C","#8A5BD6","#2E7FA8"];function re(e){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const a=document.createElement("div");a.className="conf",a.setAttribute("aria-hidden","true");let t="";for(let n=0;n<(e||40);n++){const o=(2.4+n%6*.35).toFixed(2);t+=`<i style="left:${n*37%100}%;background:${Ia[n%6]};animation-duration:${o}s;animation-delay:${(n*.13%1.2).toFixed(2)}s"></i>`}a.innerHTML=t,document.body.appendChild(a),setTimeout(()=>a.remove(),4200)}function he(e,a,t){return Math.max(a,Math.min(t,e))}function le(e){let a=e>>>0||1;return function(){return a^=a<<13,a>>>=0,a^=a>>17,a^=a<<5,a>>>=0,a/4294967296}}function Be(e,a,t,n){if(!e||e.length<2)return"";const o=Math.min(...e),s=Math.max(...e),i=s-o||1,h=e.map((w,k)=>{const R=k/(e.length-1)*(a-2)+1,y=t-3-(w-o)/i*(t-6);return R.toFixed(1)+","+y.toFixed(1)}),r=`M1,${t} L${h.join(" L")} L${a-1},${t} Z`;return`<svg class="spark" viewBox="0 0 ${a} ${t}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${r}" fill="${n}" opacity=".14"></path>
    <polyline points="${h.join(" ")}" fill="none" stroke="${n}" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"></polyline>
    <circle cx="${h[h.length-1].split(",")[0]}" cy="${h[h.length-1].split(",")[1]}" r="2.6" fill="${n}"></circle>
  </svg>`}const q={INR:{sign:"₹",locale:"en-IN",name:"Rupees",coins:[1,2,5,10,20],notes:[10,20,50,100,200,500]},USD:{sign:"$",locale:"en-US",name:"Dollars",coins:[1,5,10,25],notes:[1,5,10,20,50,100]},GBP:{sign:"£",locale:"en-GB",name:"Pounds",coins:[1,2,5,10,20,50],notes:[5,10,20,50]},EUR:{sign:"€",locale:"de-DE",name:"Euro",coins:[1,2,5,10,20,50],notes:[5,10,20,50,100]},AED:{sign:"د.إ",locale:"en-AE",name:"Dirham",coins:[25,50],notes:[5,10,20,50,100]}},Ve={INR:10,USD:.25,GBP:.2,EUR:.25,AED:1};let pe="INR";function Ce(e){q[e]&&(pe=e)}function Fa(){return pe}function jt(){return q[pe].sign}function bt(e,a,t){return a===t?e:e/Ve[a]*Ve[t]}function v(e){const a=e*Ve[pe];return a>=100?Math.round(a/10)*10:Math.round(a)}function c(e,a){const t=q[pe],n=Math.round(e),o=new Intl.NumberFormat(t.locale,{maximumFractionDigits:0}).format(Math.abs(n)),s=t.sign+o;return n<0?"−"+s:s}const Rt=864e5;function se(e){return Math.floor((e-new Date(e).getTimezoneOffset()*6e4)/Rt)}function Pa(e){return new Date(e).toLocaleDateString(q[pe].locale,{day:"numeric",month:"short"})}function We(e){return new Date(e).toLocaleDateString(q[pe].locale,{weekday:"long"})}const Ae=(e,a,t)=>`<svg viewBox="0 0 64 64" role="img" aria-label="${e}"><rect width="64" height="64" fill="${a}"/>${t}</svg>`,Me=(e,a,t,n)=>`
  <circle cx="${e}" cy="${t}" r="${n}" fill="#25201C"/>
  <circle cx="${a}" cy="${t}" r="${n}" fill="#25201C"/>
  <circle cx="${e+n*.4}" cy="${t-n*.45}" r="${n*.36}" fill="#fff"/>
  <circle cx="${a+n*.4}" cy="${t-n*.45}" r="${n*.36}" fill="#fff"/>`,H={pip:{name:"Pip",role:"your neighbour on Market Row",svg:Ae("Pip the squirrel","#FBEBD6",`
      <path d="M50 46c10-4 12-18 5-25-6-6-14-2-13 5 1 6 8 5 8 10 0 4-4 6-8 6z" fill="#C9752F"/>
      <path d="M49 44c7-4 8-14 3-19-4-4-9-1-8 3 1 5 6 5 6 9 0 3-2 5-5 6z" fill="#E29350"/>
      <ellipse cx="30" cy="44" rx="17" ry="16" fill="#D98338"/>
      <ellipse cx="30" cy="49" rx="11" ry="10" fill="#F6DEBE"/>
      <circle cx="30" cy="27" r="15" fill="#E29350"/>
      <path d="M19 17c-3-5 0-9 4-8s5 6 3 9zM41 17c3-5 0-9-4-8s-5 6-3 9z" fill="#E29350"/>
      <path d="M20 16c-1-3 0-4 2-4s3 3 2 5zM40 16c1-3 0-4-2-4s-3 3-2 5z" fill="#F2B183"/>
      <ellipse cx="30" cy="33" rx="9" ry="7" fill="#F6DEBE"/>
      ${Me(25,35,25,3.2)}
      <path d="M30 31c-1.6 0-2.6-1-2.6-2 0-.9 1-1.6 2.6-1.6s2.6.7 2.6 1.6c0 1-1 2-2.6 2z" fill="#2A2320"/>
      <path d="M26 35q4 3 8 0" stroke="#2A2320" stroke-width="1.4" fill="none" stroke-linecap="round"/>`)},mags:{name:"Mags",role:"Bizzington's best salesperson",svg:Ae("Mags the magpie","#E6EAF2",`
      <path d="M44 50c8-6 10-16 6-24l8 22z" fill="#2B3350"/>
      <ellipse cx="30" cy="42" rx="16" ry="17" fill="#2B3350"/>
      <ellipse cx="28" cy="46" rx="9" ry="11" fill="#F2F4F9"/>
      <circle cx="30" cy="24" r="13" fill="#2B3350"/>
      <path d="M22 30q8 6 16 0-2 8-8 8t-8-8z" fill="#3E4A75"/>
      ${Me(25,35,22,3)}
      <path d="M30 26l10 4-10 4z" fill="#E8B33F"/>
      <circle cx="47" cy="35" r="5" fill="#F0B429"/>
      <circle cx="45.4" cy="33.4" r="1.6" fill="#FFF0C4"/>`)},bo:{name:"Bo",role:"thinks it goes up",svg:Ae("Bo the bull calf","#E7F1E4",`
      <ellipse cx="32" cy="44" rx="18" ry="16" fill="#B58C64"/>
      <circle cx="32" cy="28" r="15" fill="#C99B70"/>
      <path d="M17 20c-6-3-9 2-6 6 2 3 6 3 8 0zM47 20c6-3 9 2 6 6-2 3-6 3-8 0z" fill="#EFE3CE"/>
      <ellipse cx="32" cy="36" rx="10" ry="8" fill="#F1DCC4"/>
      <circle cx="28.5" cy="36" r="1.7" fill="#7A5B3C"/><circle cx="35.5" cy="36" r="1.7" fill="#7A5B3C"/>
      ${Me(26,38,25,3)}
      <path d="M25 15q7-4 14 0" stroke="#8E6A48" stroke-width="2" fill="none" stroke-linecap="round"/>`)},bea:{name:"Bea",role:"thinks it goes down",svg:Ae("Bea the bear cub","#EFE7E0",`
      <circle cx="18" cy="18" r="7" fill="#6E5445"/><circle cx="46" cy="18" r="7" fill="#6E5445"/>
      <circle cx="18" cy="18" r="3.4" fill="#A98B77"/><circle cx="46" cy="18" r="3.4" fill="#A98B77"/>
      <ellipse cx="32" cy="44" rx="18" ry="16" fill="#7C6152"/>
      <circle cx="32" cy="30" r="16" fill="#8A6B5A"/>
      <ellipse cx="32" cy="38" rx="10" ry="8" fill="#D9C3B2"/>
      <path d="M32 35c-2 0-3.2-1.2-3.2-2.4 0-1.1 1.4-1.9 3.2-1.9s3.2.8 3.2 1.9c0 1.2-1.2 2.4-3.2 2.4z" fill="#3A2C24"/>
      <path d="M28 40q4 3 8 0" stroke="#3A2C24" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      ${Me(26,38,27,3)}`)},nana:{name:"Nana Bizz",role:"retired, from the shuttered shop",svg:Ae("Nana Bizz the tortoise","#E4EFE8",`
      <ellipse cx="42" cy="46" rx="20" ry="15" fill="#4E7A55"/>
      <ellipse cx="42" cy="46" rx="20" ry="15" fill="none" stroke="#3B5F42" stroke-width="2"/>
      <path d="M30 44h24M42 33v26M34 36l16 18M50 36L34 54" stroke="#3B5F42" stroke-width="1.6" opacity=".5"/>
      <circle cx="26" cy="28" r="14" fill="#7FA86F"/>
      <ellipse cx="26" cy="34" rx="8" ry="6" fill="#A5C795"/>
      ${Me(20,32,25,3.1)}
      <circle cx="20" cy="25" r="7" fill="none" stroke="#2F3A33" stroke-width="1.3"/>
      <circle cx="32" cy="25" r="7" fill="none" stroke="#2F3A33" stroke-width="1.3"/>
      <path d="M27 25h1" stroke="#2F3A33" stroke-width="1.3"/>
      <path d="M22 34q4 2.5 8 0" stroke="#2F3A33" stroke-width="1.4" fill="none" stroke-linecap="round"/>`)}};function Da(e,a){return`<span class="who" style="">${(H[e]||H.pip).svg}</span>`}function N(e,a){const t=H[e]||H.pip;return`<div class="say">${Da(e)}<div class="bub"><span class="nm">${t.name}</span>${a}</div></div>`}const ve=(()=>{const e=[];for(let a=1;a<=30;a++)e.push(Math.round(24*(a-1)+1.3*(a-1)*(a-1)));return e})(),ze=[{at:1,name:"Saver",em:"🪙",of:"what money is, and how it arrives"},{at:6,name:"Budgeter",em:"🫙",of:"a plan, and the sellers who test it"},{at:11,name:"Banker",em:"🏛️",of:"interest, safety, and what borrowing costs"},{at:16,name:"Investor",em:"📈",of:"risk, time, and never owning one thing"},{at:23,name:"Founder",em:"🏪",of:"revenue, cost, and the difference between them"}];function Wa(e){let a=1;for(let t=1;t<ve.length;t++)e>=ve[t]&&(a=t+1);return Math.min(a,ve.length)}function Qe(e){let a=ze[0];return ze.forEach(t=>{e>=t.at&&(a=t)}),a.name}function et(e){let a=ze[0];return ze.forEach(t=>{e>=t.at&&(a=t)}),a}const U=[{id:"c1",title:"What money even is",rank:"Saver",em:"🪙",lv:1,blurb:"Where money comes from, and why anyone accepts a piece of paper for a mango.",cards:[{id:"c1a",title:"Money is an agreement",who:"nana",teach:"A note is a piece of paper. It buys bread because <b>everyone agrees it does</b> — not because the paper is worth anything. Different places agree on different money, which is why the notes change when you cross a border.",eg:"The same slice of cake costs a different number in every country. The cake did not change.",drill:{q:"Why will the shopkeeper hand over a mango for a note?",opts:["The paper is worth a mango","Everyone has agreed the note can be swapped for things","The government sends her a mango later","The note is made of gold"],a:1,why:"Money works because of shared agreement. That is also why a note from another country is no use at your corner shop."}},{id:"c1b",title:"Needs and wants",who:"pip",teach:"A <b>need</b> is something you would be in trouble without. A <b>want</b> is something that makes life nicer. Both are allowed! The trick is knowing which one you are looking at <i>before</i> you pay.",eg:"Rain is coming. An umbrella is a need today and a want in May.",drill:{q:"Which of these changes from a want to a need depending on the day?",opts:["A birthday cake","An umbrella","A gold chain","A video game"],a:1,why:'Lots of things move between the two columns. That is why "needs vs wants" is a question, not a list.'}},{id:"c1c",title:"Where money comes from",who:"pip",teach:"Money arrives because somebody <b>traded something they had for something they wanted</b>. Usually that is time and skill: you do work, someone pays. Nobody is given money for nothing — and if a message says they will, read chapter five twice.",eg:"Pip carries crates for the grain seller. The grain seller has money and no time. Both end up better off.",drill:{q:"Mrs Rao pays you to deliver flyers. What did you actually sell her?",opts:["Paper","Your time and effort","Nothing — it was a gift","Her own flyers"],a:1,why:'Wages are a trade. Knowing that is what stops "free money" offers from ever sounding normal.'}},{id:"c1d",title:"Price is not value",who:"mags",teach:"The <b>price</b> is what the seller asks. The <b>value</b> is what it is worth <i>to you</i>. They are almost never the same number, and the gap between them is where every good and bad decision lives.",eg:"Mags will sell you a shiny button for a whole week of wages. The price is real. The value is up to you.",drill:{q:"Two shops sell the same water bottle at very different prices. What must be true?",opts:["The dearer one is always better made","Price does not only depend on the thing itself","The cheaper one is broken","One of them is breaking the law"],a:1,why:"Location, timing, and who is buying all move a price. The bottle is the same bottle."}}]},{id:"c2",title:"Earning it",rank:"Saver",em:"🧺",lv:3,blurb:"What you are really selling when somebody pays you, and how to be worth asking twice.",cards:[{id:"c2a",title:"You are selling time",who:"pip",teach:"Nearly every job is the same trade underneath: somebody has money and not enough <b>time</b>, and you have time and not enough money. The price is what your hour is worth to <i>them</i>, not what it feels like to you.",eg:"Two hours stacking crates pays the same whether it felt long or short. The clock is the product.",drill:{q:"Why does the grain seller pay for an hour of crate-stacking?",opts:["She enjoys company","Her own hour is worth more spent elsewhere","Crates cannot be moved by owners","It is the law"],a:1,why:"People buy time when their own is worth more doing something else. That idea comes back in every job you will ever have."}},{id:"c2b",title:"Being worth asking twice",who:"nana",teach:"The first job comes from luck. The second comes from how you did the first. Turning up, finishing, and saying what went wrong are worth more over a year than being the fastest.",eg:"Nana rehired the same boy for eleven years. He was never the quickest. He always said when a crate was cracked.",drill:{q:"What most affects whether you get asked back?",opts:["Being the fastest","Being reliable and honest about problems","Charging the least","Knowing the owner"],a:1,why:"Reputation is the thing that compounds fastest in a working life, and it is the only one you build for free."}},{id:"c2c",title:"Gifts are not wages",who:"pip",teach:"Money you were <b>given</b> and money you <b>earned</b> spend exactly the same — but they are not the same to plan with. A gift arrives once. A wage arrives again if you keep doing the thing.",eg:"A birthday 500 is lovely. It is not an income, and a plan built on it falls over next month.",drill:{q:"Why is it risky to plan a monthly budget around gift money?",opts:["Gifts are taxed","It arrives once and may not come again","Gifts are worth less","You must give it back"],a:1,why:"A budget is built on what repeats. One-off money is best pointed at one-off things — a goal, not a habit."}},{id:"c2d",title:"More than one tap",who:"mags",teach:"People who only have one way of getting money are one bad week away from having none. Selling something you no longer use, doing a second small job, or being paid for a thing you would do anyway — these are extra taps.",eg:"Mags sells buttons, mends umbrellas, and finds things. Two of those go badly most months. She is never broke.",drill:{q:"Why does having more than one source of income help?",opts:["It earns more in total","One of them stopping no longer means nothing arrives","It is easier work","It avoids tax"],a:1,why:"This is diversification, three chapters early and applied to earning instead of investing. It is the same idea both times."}}]},{id:"c3",title:"Making a plan",rank:"Budgeter",em:"🫙",lv:6,blurb:"Income, outgo, and the four jars that stop the month being a surprise.",cards:[{id:"c3a",title:"In, out, and what is left",who:"pip",teach:"A budget is only two columns: money <b>in</b> and money <b>out</b>. What is left over is the only part you get to choose about. If out is bigger than in, the difference has to come from somewhere — savings, or someone else.",eg:"In: 200 on pay day. Out: 60 phone, 40 bus. Left: 100. That 100 is the interesting number.",drill:{q:"Money in is 200. Money out is 240. What has to be true?",opts:["Nothing, it balances","The gap comes out of savings or a loan","The bank fixes it","You earned 240"],a:1,why:"A shortfall never vanishes. It moves — usually onto next month."}},{id:"c3b",title:"The four jars",who:"nana",teach:"Split what comes in, the moment it arrives: <b>Spend</b> for now, <b>Save</b> for something soon, <b>Grow</b> for far away, <b>Give</b> for someone else. Splitting first is the whole trick — anything left in one pile gets spent as one pile.",eg:"Nana has done 40 / 30 / 20 / 10 for sixty years and has never once made a spreadsheet.",drill:{q:"Why split the money the moment it arrives, instead of at the end of the week?",opts:["It earns more that way","Because what sits in one pile gets spent as one pile","The bank requires it","It makes the total bigger"],a:1,why:'This is "pay yourself first". It works because it removes the decision, not because it changes the maths.'}},{id:"c3c",title:"What it really cost",who:"mags",teach:'Every yes is also a no. Buying the shiny thing is not just "minus 600" — it is <b>also</b> the trip you now cannot take, or the goal that just moved three weeks further away. Grown-ups call that <i>opportunity cost</i>.',eg:"Mags never mentions the second half of the price. That is not lying — it is just selling.",drill:{q:"You spend your whole Save jar on a game. What did it cost?",opts:["The price of the game","The price, plus whatever the Save jar was for","Nothing, it was your money","Only the tax"],a:1,why:"Opportunity cost is the part of the price that is not on the label."}},{id:"c3d",title:"How many weeks?",who:"pip",teach:"A goal turns into a plan the moment you divide. <b>Price ÷ what you save each week = weeks.</b> If the answer is horrifying, you have three honest choices: save more each week, want something cheaper, or wait longer.",eg:'A 900 skateboard, saving 60 a week, is 15 weeks. Not "someday". Fifteen.',drill:{q:"It costs 800. You put away 50 a week. Roughly how long?",opts:["4 weeks","8 weeks","16 weeks","40 weeks"],a:2,why:"800 ÷ 50 = 16. Dividing turns a wish into a date, which is why the Build Yard shows weeks, not encouragement."}}]},{id:"c4",title:"Sellers and their tricks",rank:"Budgeter",em:"🪧",lv:8,blurb:'Urgency, "free", the small monthly one, and why the shop is arranged like that.',cards:[{id:"c4a",title:"Hurry is a tool",who:"mags",teach:'"Today only." "Last one." "Ends at midnight." These are not facts about the thing — they are <b>tools that stop you thinking</b>, and they work because a decision made fast feels like a decision made bravely.',eg:'Mags has said "the last one" about the same tray of buttons for six years.',drill:{q:"A shop says the offer ends in one hour. What is the safest first move?",opts:["Buy immediately","Notice the hurry is part of the sale, then decide","Argue about the price","Assume it is a scam"],a:1,why:"Urgency is not proof of a bargain, and it is not proof of a scam either. It is a technique — and naming it gives you your thinking back."}},{id:"c4b",title:"Free is never free",who:"nana",teach:"If you are not paying money, something else is being paid: your attention, your details, your time, or a much bigger payment later. Free samples, free games, free trials — all real, all paid for somehow.",eg:"The free trial that needs a card is not selling you a trial. It is selling you the forgetting.",drill:{q:"A game is free to play but sells extras. Who is it built to please?",opts:["Everybody equally","The players most likely to spend","The players who never spend","Nobody in particular"],a:1,why:"Knowing who a thing is designed for tells you what it will try to make you do."}},{id:"c4c",title:"The small monthly one",who:"pip",teach:"A subscription is a decision you make <b>once</b> and pay for <b>forever</b>. Small numbers are the point: 30 a month does not feel like 360 a year, but that is exactly what it is.",eg:"Four small monthly things nobody remembers signing up for is most of a week of wages, every year.",drill:{q:"Something costs 25 a month. What is the honest way to see it?",opts:["25","300 a year, until you cancel","Free after the first month","A one-off 25"],a:1,why:"Multiply every subscription by twelve before you agree to it. Then cancel the ones you would not buy at that price."}},{id:"c4d",title:"The shop is a machine",who:"mags",teach:"Sweets at the till, milk at the back, the dearest thing at eye height — none of that is an accident. A shop is <b>arranged to make buying easy</b>, which is fine, so long as you know that is what it is.",eg:"You walked past eleven things to reach the bread. That was the plan.",drill:{q:"Why is milk usually at the back of the shop?",opts:["It stays cooler there","So you walk past everything else","It is heavy","Nobody buys it"],a:1,why:"A shop is designed, and so is a website. Noticing the design is most of the defence."}}]},{id:"c5",title:"Keeping it safe",rank:"Banker",em:"🛡️",lv:11,blurb:"Banks, secrets, and the messages that will actually reach you this year.",cards:[{id:"c5a",title:"What a bank is for",who:"nana",teach:"A bank keeps money safer than a tin under a bed, lets you pay without carrying notes, and <b>pays you a little for leaving it there</b> — because while it sits, the bank lends it to somebody else.",eg:"Your money does not sit in a drawer with your name on it. It is out working, and the bank owes you it back.",drill:{q:"How does a bank afford to pay you interest?",opts:["The government pays it","It lends your money to others for more than it pays you","It sells shares","It charges the shops"],a:1,why:"A bank sits between savers and borrowers and keeps the gap. Knowing that makes both sides of interest obvious."}},{id:"c5b",title:"The three secrets",who:"pip",teach:"A PIN, a password, and a one-time code are <b>yours alone</b>. Nobody real ever needs them — not the bank, not the police, not a helpful stranger, not a friend. Anybody asking is telling you what they are.",eg:"The real bank already knows your account. That is how it is your bank.",drill:{q:"Someone says they are from your bank and asks for the code they just texted you. What is true?",opts:["Give it if the number matches","A real bank never needs that code from you","Give half of it","Ask them to text again"],a:1,why:"The one-time code exists to prove it is you. Handing it over is handing over the proof."}},{id:"c5c",title:"The shape of a scam",who:"nana",teach:"Scams differ in story and are identical in shape: <b>a reward or a fright, a hurry, and a secret</b>. You have won. Your account is at risk. Do not tell anyone. When you see the shape, the story stops mattering.",eg:"Prize, panic, or a friend in trouble — always in a rush, always just between us.",drill:{q:"Which combination should always stop you?",opts:["A good deal in a busy shop","Urgency plus secrecy plus money","A message with spelling mistakes","An offer from someone new"],a:1,why:"Bad spelling is a weak clue and honest strangers exist. Hurry plus secrecy plus money is the reliable one."}},{id:"c5d",title:"Telling someone is the answer",who:"pip",teach:`The reason scams work on grown-ups too is <b>embarrassment</b>. The instruction "don't tell anyone" is not protecting you, it is protecting them. Telling somebody is not the thing you do after failing — it is the move itself.`,eg:"A friend who really needs help can wait sixty seconds while you check with an adult. Someone who cannot, is not your friend.",drill:{q:"You already sent money and feel silly. What is the best next step?",opts:["Say nothing and hope","Tell a grown-up straight away","Send more to fix it","Block and forget it"],a:1,why:"Fast telling is what limits the damage — and being able to say it out loud is the skill worth more than the money."}}]},{id:"c6",title:"Borrowing",rank:"Banker",em:"🤝",lv:13,blurb:"What credit costs, why it exists, and why it is never a verdict on a person.",cards:[{id:"c6a",title:"Interest, both ways",who:"nana",teach:"Interest is <b>rent on money</b>. Leave money with a bank and they pay you rent for using it. Borrow money and you pay rent for using theirs. Same idea, and which side you are on makes all the difference.",eg:"Borrowing is not shameful — it is a tool with a price on it. Always find the price before you agree.",drill:{q:"What is the honest way to describe interest on a loan?",opts:["A punishment for being bad with money","The rent you pay for using somebody else’s money","A tax","A fee the shop keeps"],a:1,why:"Credit is a tool with a price, never a moral failing. Knowing the price is the skill."}},{id:"c6b",title:"The number that matters",who:"pip",teach:"Sellers quote the <b>monthly payment</b> because it is small. The number that tells you the truth is <b>everything you will hand over in total</b>, minus what you borrowed. That gap is what it cost.",eg:"Borrow 1,000, pay back 110 a month for a year: you handed over 1,320. It cost 320.",drill:{q:"You borrow 500 and repay 60 a month for ten months. What did borrowing cost?",opts:["60","100","500","Nothing"],a:1,why:"60 × 10 = 600, less the 500 you borrowed = 100. Always do that multiplication before you sign anything."}},{id:"c6c",title:"Good reasons and bad ones",who:"nana",teach:"Borrowing for a thing that <b>earns or lasts</b> — a tool, a course, a roof — can be sensible even with the rent on top. Borrowing for a thing that is gone by Friday means paying rent on a memory.",eg:"A loan for the umbrella stock made Nana money. A loan for the festival did not, and she would do it again anyway.",drill:{q:"Which is the more defensible reason to borrow?",opts:["A weekend away","A tool that lets you take on paid work","A better phone than your friend’s","Because the offer was there"],a:1,why:"Not a rule about fun — a question. Will this still be worth something when the repayments are still arriving?"}},{id:"c6d",title:"Trust is a memory",who:"pip",teach:"Lenders keep a record of whether people paid them back. A good record makes borrowing cheaper later; a bad one makes it dearer. It is a <b>memory of what happened</b>, not a score of what kind of person you are — and it can be rebuilt.",eg:"Bizzington calls it a trust score. It goes up every time you repay and never says anything about you.",drill:{q:"What does a lender’s record of you actually describe?",opts:["How much money you have","Whether past borrowing was repaid","How hard you work","Whether you deserve help"],a:1,why:"Plenty of good people have bad records after a bad year. It measures history, and history can be added to."}}]},{id:"c7",title:"Money that grows",rank:"Investor",em:"📈",lv:16,blurb:"Compounding, risk, and why nobody sensible owns just one thing.",cards:[{id:"c7a",title:"The snowball",who:"pip",teach:"Interest lands on your money — and then next time, it lands on <b>your money plus the interest</b>. That is compounding. It is boring for a year and then it is not boring at all.",eg:"100 growing 10% a year: 110, then 121, then 133. The steps get bigger while you do nothing.",drill:{q:"Why does the second year add more than the first?",opts:["The rate went up","There is more money for the rate to land on","The bank felt generous","Prices rose"],a:1,why:"Growth stacking on growth is the whole idea. Time does the heavy lifting, which is why starting early beats starting big."}},{id:"c7b",title:"Risk and return",who:"bo",teach:"Things that <i>might</i> grow a lot can also fall a lot — those are the same sentence, not two different ones. Safe things grow slowly. Anybody promising big returns with no risk is either confused or lying.",eg:"Bo says it will go up. Bea says it will go down. Neither of them knows, and both of them are certain.",drill:{q:'Somebody offers a "guaranteed" way to double your money in a month. What is the safe read?',opts:["Take it quickly before it goes","Guaranteed and doubling do not belong in the same sentence","Ask them to do it twice","Only put in half"],a:1,why:"High return with no risk is the oldest shape a scam takes."}},{id:"c7c",title:"Never just one",who:"bea",teach:"Owning a slice of <b>many</b> things means no single piece of bad news can wreck you. Owning one thing means your whole week depends on somebody else’s Tuesday. Spreading out is the only free thing in this entire subject.",eg:"A basket of the whole market is dull, and dull wins more often than exciting does.",drill:{q:"Why spread money across many things instead of the one you like best?",opts:["It grows faster","One piece of bad news can no longer sink everything","It costs less","The best one is hard to find"],a:1,why:"Diversification does not raise your top score. It raises your worst one — and the worst one is what ends games."}},{id:"c7d",title:"Time is the ingredient",who:"nana",teach:"Money you need <b>next month</b> must be somewhere safe, even if it grows by almost nothing. Money you will not touch for <b>ten years</b> can sit through bad weather, because it has time to come back.",eg:"The bus fare and the retirement fund are not the same money and must not live in the same place.",drill:{q:"You need the money in three weeks. Where does it belong?",opts:["Whatever grew most last year","Somewhere safe and boring","Split across four companies","The one your friend likes"],a:1,why:"How soon you need it decides where it goes — before any question about what might grow fastest."}}]},{id:"c8",title:"Running something",rank:"Founder",em:"🏪",lv:23,blurb:"Revenue, cost, profit — and the week you learn those are three different words.",cards:[{id:"c8a",title:"Three different words",who:"nana",teach:"<b>Revenue</b> is everything that came in. <b>Cost</b> is what you paid to make it happen. <b>Profit</b> is what is left. A busy shop with no profit is a very tiring hobby.",eg:"Sold 40 umbrellas at 20 = 800 in. They cost 8 each = 320 out. Profit 480.",drill:{q:"A stall takes 1,000 and spent 900 on stock. What is the profit?",opts:["1,000","100","900","1,900"],a:1,why:"Revenue is the number people brag about. Profit is the number that decides whether you are still open next year."}},{id:"c8b",title:"Setting a price",who:"mags",teach:'Price too low and you sell out and earn nothing. Price too high and you carry the stock home. The right price is not "cost plus a bit" — it is <b>the most people will happily pay</b>, which you only find by trying.',eg:"Mags raised buttons from 8 to 12 and sold two fewer. She made more money and went home earlier.",drill:{q:"You raise the price and sell a few less, but take more money overall. What should you do?",opts:["Go back to the old price","Keep the new price","Halve the price","Stop selling them"],a:1,why:"What matters is total profit, not how many you shifted. Selling more is not the goal; keeping more is."}},{id:"c8c",title:"Cash is not profit",who:"pip",teach:"You can be <b>profitable and broke at the same time</b>. Profit is on paper over a month; cash is what is in your hand on Tuesday when the stock must be paid for and the customers have not come yet.",eg:"Nana's best-ever month nearly closed the shop: the restock was due before the sales landed.",drill:{q:"Your shop is profitable but you cannot pay for stock this week. What is the problem?",opts:["You are not profitable really","Money comes in later than it goes out","The price is wrong","You sold too much"],a:1,why:"Timing kills more small businesses than pricing does. Profit is an opinion about a month; cash is a fact about today."}},{id:"c8d",title:"The stuff that arrives anyway",who:"nana",teach:"Rent and licences arrive whether you sold anything or not — those are <b>fixed</b>. Stock costs only arrive when you sell — those are <b>variable</b>. A quiet week hurts because the fixed ones do not care.",eg:"Two hundred rent a month is seven a day, before you have sold a single thing.",drill:{q:"Which cost still arrives in a week you sell nothing?",opts:["Stock","Rent","Wrapping paper","Nothing does"],a:1,why:"Knowing your fixed costs tells you the smallest week you can survive — the single most useful number a small business owner has."}}]}],ie=U.flatMap(e=>e.cards.map(a=>({...a,ch:e.id})));function tt(e){let a=2166136261;for(let n=0;n<e.id.length;n++)a^=e.id.charCodeAt(n),a=Math.imul(a,16777619);const t=e.drill.opts.map((n,o)=>o);for(let n=t.length-1;n>0;n--){a=Math.imul(a^a>>>15,2246822507),a>>>=0;const o=a%(n+1),s=t[n];t[n]=t[o],t[o]=s}return{order:t,opts:t.map(n=>e.drill.opts[n]),answer:t.indexOf(e.drill.a)}}const K=[{id:"market",tint:"#E0A85C",name:"Market Row",em:"🧺",rank:"Saver",blurb:"Stalls, crates and your first room. Where money arrives because you went and got it.",chapters:["c1","c2"],places:["place","wallet"],jobs:["crates","flyers","sweep"],sky:["#CFE9EE","#F6EFDC"],ground:"#DCCFA8",road:"#C9BE9C",opens:"Your stall, and a room above it."},{id:"harbour",tint:"#3E86A8",name:"The Old Harbour",em:"⚓",rank:"Budgeter",blurb:"Cargo, tides and weather. Nothing here rewards a plan made on the day.",chapters:["c3","c4"],places:["jars","goals"],jobs:["nets","cargo","mend"],sky:["#BFDDE8","#E9EEDF"],ground:"#B9C3A8",road:"#9FAE93",opens:"The Jar Shed and the Build Yard."},{id:"clock",tint:"#6E6AA8",name:"Clocktower Square",em:"🕰️",rank:"Banker",blurb:"Stone, ledgers and a clock that strikes interest in public.",chapters:["c5","c6"],places:["bank"],jobs:["books","errands"],sky:["#D6DCE9","#F1EEE4"],ground:"#C6BEB0",road:"#ADA595",opens:"The Bank — and, once you have read chapter six, borrowing."},{id:"exchange",tint:"#2F9E8F",name:"The Exchange Quarter",em:"📈",rank:"Investor",blurb:"Chalkboards, arguments, and two animals who are each certain and often wrong.",chapters:["c7"],places:["exchange"],jobs:["runner","board"],sky:["#C9E0E4","#EDE6DC"],ground:"#AFC0BE",road:"#96A8A6",opens:"The Exchange. Not before you have learned what a share is."},{id:"works",tint:"#B4682F",name:"The Works",em:"🏭",rank:"Founder",blurb:"Where things get made, priced, and sold for more than they cost. Or not.",chapters:["c8"],places:["shop"],jobs:["crates","books"],sky:["#E4D9CD","#F4EBDC"],ground:"#C3AE93",road:"#A8957D",opens:"Bizz & Co, and the shutters come off for good."}],Nt={place:null,wallet:null,jars:"c3",goals:"c3",bank:"c5",loans:"c6",portfolio:"c7",business:"c8"};function ue(e,a){const t=U.find(n=>n.id===a);return!!t&&t.cards.every(n=>e.learn.done[n.id])}function Oe(e,a){const t=Nt[a];return!t||ue(e,t)}function It(e){const a=Nt[e],t=a&&U.find(n=>n.id===a);return t?t.title:null}function at(e,a){return a<=0?!0:K.slice(0,a).every(t=>t.chapters.every(n=>ue(e,n)))}const qe=[{id:"q-card",em:"📗",kind:"lesson",n:1,pay:5,t:"Learn one card",sub:"Any chapter that is open to you."},{id:"q-card2",em:"📘",kind:"lesson",n:2,pay:9,t:"Learn two cards",sub:"Back to back. It is ten minutes."},{id:"q-letter",em:"✉️",kind:"letter",n:1,pay:4,t:"Empty the postbox",sub:"One letter. Thirty seconds."},{id:"q-job",em:"🧺",kind:"job",n:2,pay:6,t:"Take two jobs",sub:"Whatever is going on the Row."},{id:"q-play",em:"🎮",kind:"game",n:2,pay:7,t:"Play two games",sub:"Any two in the arcade."},{id:"q-earn",em:"🪙",kind:"earn",n:40,pay:6,t:"Earn 40 today",sub:"Jobs, games, letters — it all counts."},{id:"q-jar",em:"🫙",kind:"jar",n:20,pay:7,t:"Put 20 away",sub:"Into any jar that is not Spend.",needs:"c3"},{id:"q-goal",em:"🏗️",kind:"goal",n:1,pay:8,t:"Feed the Build Yard",sub:"Any goal, any amount.",needs:"c3"},{id:"q-scam",em:"🛡️",kind:"scam",n:1,pay:9,t:"Spot a scam",sub:"In the postbox or in Scam Spotter."},{id:"q-board",em:"🎲",kind:"board",n:1,pay:12,t:"Finish a game of Main Street",sub:"About ten minutes.",needs:"c1"},{id:"q-invest",em:"📈",kind:"invest",n:1,pay:10,t:"Add to your holdings",sub:"From the Grow jar, as always.",needs:"c7"},{id:"q-shop",em:"🏪",kind:"trade",n:1,pay:10,t:"Trade a day at Bizz & Co",sub:"Open the doors and count it honestly.",needs:"c8"}],vt=[{id:"l1",from:"pip",title:"Crates need carrying",body:"The grain seller has forty crates and no time. It is an hour of work. Want it?",choices:[{label:"Take the job",wallet:6,xp:8,note:"An hour of your time, traded."},{label:"Not today",xp:3,note:"Turning down work is a real choice, and sometimes the right one."}]},{id:"l2",from:"mags",title:"Shiny! Today only!",body:"A genuine brass button, previously owned by somebody important, probably. Half a week of your wages. The LAST one.",choices:[{label:"Buy the button",wallet:-10,xp:4,note:'You bought it. That is allowed — but "last one, today only" is a pressure tool, and now you have met one.'},{label:"Walk away",xp:10,badge:"cool-head",note:"Urgency is a sales technique. You noticed, which is most of the defence."}]},{id:"l3",from:"scam",title:"YOU HAVE WON 5,000!",scam:!0,body:"Congratulations!! You are our lucky winner!! To release your prize just send a small handling fee of 200 to the address below. Reply within 2 hours.",choices:[{label:"Pay the fee",wallet:-20,xp:6,note:"The prize never arrives. Nobody who is giving you money needs money from you first. That cost 20 — cheap, here."},{label:"Bin it and tell a grown-up",xp:14,badge:"scam-spotter",safe:!0,note:"Right on both counts: a prize you did not enter is not a prize, and telling someone is part of the answer."}]},{id:"l4",from:"nana",title:"A question, not a task",body:"Ask someone at home tonight: what is the first thing they ever saved up for, and how long did it take? Then come back and tell me.",choices:[{label:"I asked them",xp:16,badge:"asked-home",note:"Good. Every family does money differently, and yours is the one you live in."},{label:"Later",xp:2,note:"It will keep."}]},{id:"l5",from:"pip",title:"The pizza problem",body:"Chhoti wants to split a big pizza — that is 15 each. The bus home is 4 each way. You have 22.",choices:[{label:"Split it, walk home",wallet:-15,xp:12,note:"You made the trade knowingly. That is the whole skill."},{label:"Skip the pizza",xp:10,note:"Also right. There is no wrong answer here — only an unplanned one."},{label:"Split it and worry later",wallet:-15,xp:5,note:"You got home, but the walk was not a decision — it was a surprise. Surprises are what a budget removes."}]},{id:"l6",from:"scam",title:"is this you?? 😭",scam:!0,body:"hey its me i lost my phone im on my cousins account. im stuck and i need 300 rly quick, ill pay you back tomorrow promise. dont tell anyone its embarrassing",choices:[{label:"Send it — they sound desperate",wallet:-30,xp:6,note:'This is the most common scam that reaches children. "Do not tell anyone" is the tell. A real friend can wait sixty seconds while you check.'},{label:"Check with them another way first",xp:15,badge:"scam-spotter",safe:!0,note:"Exactly. Call the number you already have. Secrecy plus urgency plus money is always the same shape."}]},{id:"l7",from:"pip",title:"Bulk deal at the grain stall",body:"Six weeks of chalk for the price of four — but you have to buy all six now. You have the money, just.",choices:[{label:"Buy the six",wallet:-12,xp:12,note:"Cheaper per week. It also empties your pocket today, which is the part the deal does not mention."},{label:"Buy one week",wallet:-3,xp:8,note:"Dearer per week, but you kept your options. Both answers are defensible."}]},{id:"l8",from:"bea",title:"Everything is red today",body:"The board is down. Every single line. Bo says buy, I say run. What are you going to do?",choices:[{label:"Sell everything",xp:6,note:"You turned a paper fall into a real one. Everyone does this once — the point is to have done it here, with play money."},{label:"Do nothing",xp:15,badge:"steady-hand",note:"Sitting still is a decision, and on a red day it is usually the hard one."}]},{id:"l9",from:"scam",title:"FREE 10,000 COINS — 1 STEP",scam:!0,body:"GENERATOR WORKING 2026!! Just enter your account name and password on the site below and get UNLIMITED coins instantly. 100% safe no ban.",choices:[{label:"Try it",wallet:-25,xp:6,note:"There is no generator. What there is, is a page collecting passwords — and the account it takes is yours."},{label:"Close it",xp:14,badge:"scam-spotter",safe:!0,note:"Free things that need your password are not free and are not things."}]},{id:"l10",from:"nana",title:"The shop needs a decision",body:"Rain is forecast on market day. Umbrellas cost me 8 each and sell for 20 — but only if it rains. If it stays dry I am stuck with them.",choices:[{label:"Buy ten umbrellas",xp:12,note:"A bet on the weather with real cost attached. Businesses make it every week."},{label:"Buy three",xp:14,note:"Smaller bet, smaller loss, smaller win. You just discovered position sizing without anyone using the words."}]},{id:"l11",from:"mags",title:"I could take that off your hands",body:"That old thing you never use? I will give you 5 for it. Right now. Cash.",choices:[{label:"Sell it",wallet:5,xp:10,note:"Selling what you do not use is income. Most people never think of it as income."},{label:"Keep it",xp:5,note:"Fine — but notice you just valued it above 5."}]},{id:"l12",from:"pip",title:"Pay day is Friday",body:"Reminder: wages land Friday, and the phone plan goes out the same morning. Do you know what will be left?",choices:[{label:"Yes — I checked",xp:12,note:"Knowing the number before it happens is the entire difference between a budget and a hope."},{label:"No idea",xp:4,note:"Open the Jar Shed before Friday, then."}]},{id:"l13",from:"mags",title:"Only 30 a month!",body:"The Bizzington Button Club. New button every month, cancel any time*, just 30 a month. (*by letter, in person, on a Tuesday.)",choices:[{label:"Join — it is only 30",wallet:-30,xp:8,note:"30 a month is 360 a year. Small monthly numbers are the whole technique; multiply by twelve before you agree."},{label:"Work out the year first",xp:15,badge:"times-twelve",note:"360 a year, and cancelling needs a Tuesday. You read the small print, which almost nobody does."}]},{id:"l14",from:"pip",title:"Chhoti wants to borrow",body:"She is 40 short for the trip and says she will pay you back on Friday. She has paid you back before. You have it, but it is your Save jar.",choices:[{label:"Lend it",wallet:-40,xp:13,note:"Lending to friends is fine and it is a real risk. Ask yourself first: if it never comes back, is the friendship still fine?"},{label:"Explain why not",xp:13,note:"Saying no honestly is a skill, and it protects the friendship better than a grudge does."},{label:"Lend half",wallet:-20,xp:15,note:"Smaller stake, same kindness. Most good money answers are a size, not a yes or a no."}]},{id:"l15",from:"scam",title:"EARN 2,000/WEEK FROM HOME",scam:!0,body:"Simple work, no experience, start today! Small one-time registration fee of 150 to receive your starter kit. Limited places for your area.",choices:[{label:"Register",wallet:-15,xp:6,note:"A job that charges you to start is not a job. Real work pays you; it does not invoice you."},{label:"Delete it",xp:14,badge:"scam-spotter",safe:!0,note:"Money should flow towards the worker. Any offer reversing that arrow is the scam."}]},{id:"l16",from:"nana",title:"The roof, and the rainy-day tin",body:"My roof went last winter. It did not care that I had plans. I keep a tin with one month of costs in it and I have refilled it nine times in sixty years.",choices:[{label:"Start a rainy-day tin",xp:16,badge:"rainy-day",note:"An emergency fund is the least exciting and most protective thing in this whole app. Boring is the point."},{label:"Nothing will go wrong",xp:4,note:"It might not. The tin costs nothing while you are right, and everything while you are not."}]},{id:"l17",from:"bo",title:"A tip, just for you",body:"My cousin knows a man whose brother says Rocket Rickshaws are about to TRIPLE. Everyone is in. You should put the lot in. Can't lose!",choices:[{label:"Put it all in",xp:6,note:`"Everyone is in" and "can't lose" are the two most expensive sentences in money. Bo means well. Bo is also always certain.`},{label:"Put in a little, spread the rest",xp:15,badge:"diversified",note:"You can take a small swing without betting the week on somebody's cousin's brother."},{label:"Ignore it",xp:13,note:"A tip that reaches you has reached everybody. That is what makes it not a tip."}]},{id:"l18",from:"pip",title:"The price went up",body:"The chalk that was 10 last year is 12 now. Same chalk, same stall, same seller.",choices:[{label:"That is inflation",xp:14,badge:"noticed-inflation",note:"Prices drifting up over time is normal. It is also why money left in a tin quietly buys less each year."},{label:"He is cheating me",xp:6,note:"Sometimes! But usually his costs rose too. Prices carry information about the whole chain behind them."}]},{id:"l19",from:"mags",title:"It broke. Obviously.",body:"Your umbrella has turned inside out and died. A new one is 25. Also, I *did* offer you the cover for 3 a month.",choices:[{label:"Buy a new one",wallet:-25,xp:10,note:"Sometimes paying for the loss is cheaper than paying for cover. That is a calculation, not a mistake."},{label:"Ask what cover would have cost",xp:14,note:"3 a month is 36 a year to protect a 25 umbrella. Insurance is worth it for things you could not replace — not for things you could."}]},{id:"l20",from:"nana",title:"Where the Give jar went",body:"The school down the road lost its roof too. I put a little in every month for years without noticing, and this month it mattered.",choices:[{label:"Give from the Give jar",xp:15,badge:"gave",note:"Generosity works the same way saving does: small, regular, and invisible until the week it is not."},{label:"Keep it for now",xp:6,note:"A fair answer. The jar is yours and it will still be there."}]},{id:"l21",from:"scam",title:"Your account will be CLOSED",scam:!0,body:"URGENT: unusual activity detected. Your account is suspended. Confirm your PIN and the code we just sent to restore access within 30 minutes or funds will be frozen.",choices:[{label:"Confirm the details",wallet:-35,xp:6,note:"A real bank never asks for your PIN or a one-time code. The code exists to prove it is you — giving it away hands over the proof."},{label:"Ring the bank on the number you already have",xp:16,badge:"scam-spotter",safe:!0,note:"Perfect. Fright plus a countdown plus a secret is the shape. Always go back through a number you found yourself."}]},{id:"l22",from:"pip",title:"You got paid for the flyers",body:"Mrs Rao says you did it properly and she has two more streets next week if you want them.",choices:[{label:"Take next week too",wallet:8,xp:14,badge:"asked-back",note:"Being asked back is worth more than the fee. Reputation is the fastest-compounding thing you own."},{label:"Just take the pay",wallet:8,xp:8,note:"Fair enough. The money is the same; the second street was the interesting part."}]}],Ft=[{id:"crates",em:"📦",name:"Stack crates",units:6,who:"the grain seller"},{id:"flyers",em:"📄",name:"Deliver flyers",units:5,who:"Mrs Rao"},{id:"sweep",em:"🧹",name:"Sweep Market Row",units:3,who:"the market office"},{id:"nets",em:"🕸️",name:"Mend the nets",units:7,who:"the harbour master"},{id:"cargo",em:"⚓",name:"Unload the cargo",units:9,who:"a skipper in a hurry"},{id:"mend",em:"🧵",name:"Mend umbrellas",units:8,who:"Mags"},{id:"errands",em:"🏃",name:"Run the errands",units:8,who:"the clerk at the bank"},{id:"books",em:"📒",name:"Do Nana's books",units:12,who:"Nana Bizz"},{id:"runner",em:"📨",name:"Run the orders",units:11,who:"the floor manager"},{id:"board",em:"🖍️",name:"Chalk up the board",units:13,who:"Bo and Bea, arguing"}],je=[{id:"room",em:"🚪",name:"A room above the stall",rent:4,bills:[],food:10,deposit:0,blurb:"Dry, small, and yours. Nothing to manage yet."},{id:"window",em:"🪟",name:"A room with a window",rent:7,bills:[{name:"Phone",units:2}],food:10,deposit:14,blurb:"Your first real bill — and it arrives whether or not you worked."},{id:"flat",em:"🏢",name:"A small flat",rent:12,bills:[{name:"Phone",units:2},{name:"Power",units:3},{name:"Water",units:1}],food:10,deposit:24,blurb:"Enough bills that a plan beats remembering."},{id:"kitchen",em:"🍳",name:"A flat with a kitchen",rent:15,bills:[{name:"Phone",units:2},{name:"Power",units:4},{name:"Water",units:2}],food:4,deposit:36,perk:"kitchen",blurb:"Dearer rent, more bills — and it costs you less, because you can cook."},{id:"house",em:"🏡",name:"A little house, bought",rent:0,bills:[{name:"Phone",units:2},{name:"Power",units:5},{name:"Water",units:2},{name:"Internet",units:3},{name:"Upkeep",units:3}],food:4,deposit:120,perk:"kitchen",owned:!0,mortgage:{units:320,weeks:40},blurb:"Rent is forever. A mortgage ends. The first thing you own instead of rent."}],Pt=[{id:"lantern",em:"🏮",name:"Festival lantern",units:8,desc:"Hangs over your stall. Purely lovely."},{id:"cap",em:"🧢",name:"Market cap",units:12,desc:"Pip has one. Pip thinks it suits him."},{id:"awning",em:"⛱️",name:"Striped awning",units:16,desc:"Your stall, but smarter."},{id:"sign",em:"🪧",name:"Painted sign",units:24,desc:"Your name, in gold leaf, above your own stall."},{id:"cat",em:"🐈",name:"A shop cat",units:30,desc:"Does nothing. Sits. Worth it, arguably."},{id:"brass",em:"🔆",name:"Mags's brass button",units:60,desc:"Previously owned by somebody important, probably."},{id:"clock",em:"🕰️",name:"Brass stall clock",units:45,desc:"Tells the time. Loudly, and slightly wrong."},{id:"kite",em:"🪁",name:"A very good kite",units:20,desc:"No financial merit whatsoever."}],J=[{id:"basket",name:"Whole Market Basket",kind:"fund",em:"🧺",vol:.03,drift:.0075,desc:"A slice of every shop in town. Dull by design."},{id:"grain",name:"Sunrise Grains",kind:"steady",em:"🌾",vol:.016,drift:.004,desc:"People eat in good years and bad. Rarely exciting."},{id:"chai",name:"Chai Chain Co",kind:"growth",em:"🫖",vol:.052,drift:.009,desc:"Opening shops fast. Fast can go both ways."},{id:"rocket",name:"Rocket Rickshaws",kind:"wild",em:"🛺",vol:.105,drift:.0125,desc:"Might be the future. Might be a rickshaw."}];function Dt(e){const a={};return J.forEach((t,n)=>{const o=le(9301+n*7919);let s=100;const i=[s];for(let h=0;h<e;h++){const r=(o()+o()+o()-1.5)*2*t.vol,w=h===Math.floor(e*.55)?-t.vol*3.1:0;s=Math.max(6,s*(1+t.drift+r+w)),i.push(s)}a[t.id]=i}),a}const G=[{id:"chai",em:"🫖",name:"Chai",cost:2,sells:5,best:"cold",desc:"Sells all year. Sells twice as well when it is cold."},{id:"umbrella",em:"☂️",name:"Umbrellas",cost:8,sells:20,best:"rain",desc:"Enormous margin, and only if it rains."},{id:"ice",em:"🍧",name:"Ice golas",cost:3,sells:9,best:"hot",desc:"Melts. Literally a deadline."},{id:"rope",em:"🪢",name:"Rope & twine",cost:4,sells:8,best:"any",desc:"Nobody is excited. Somebody always needs it."}],be=[{id:"rain",em:"🌧️",name:"Rain all day",mult:{umbrella:2.6,chai:1.4,ice:.2,rope:1}},{id:"hot",em:"☀️",name:"Blazing hot",mult:{umbrella:.15,chai:.7,ice:2.8,rope:1}},{id:"cold",em:"🌬️",name:"Cold wind",mult:{umbrella:.6,chai:2.2,ice:.3,rope:1.1}},{id:"fair",em:"⛅",name:"Fair and mild",mult:{umbrella:.5,chai:1,ice:1.2,rope:1.1}}],Xe=[["Budget","A plan for money before you spend it.","Two columns — in and out — and whatever is left is the part you choose about."],["Income","Money coming in.","Wages, a gift, interest, or something you sold. A budget is built on the parts that repeat."],["Expense","Money going out.","Fixed ones arrive whether you like it or not; variable ones follow what you do."],["Opportunity cost","The thing you could have had instead.","The half of the price that is never on the label."],["Interest","Rent on money.","You are paid it for lending; you pay it for borrowing. Same idea, opposite sides."],["Compounding","Growth landing on earlier growth.","Boring for a year, then not boring at all. Time does the work."],["Principal","The amount you started with.","The sum you borrowed or invested, before any interest."],["Inflation","Prices drifting up over time.","Which is why money in a tin quietly buys less each year."],["Saving","Keeping money for something soon.","Safe, boring, and reachable when you need it."],["Investing","Putting money somewhere it might grow.","Might. Things that can rise a lot can fall a lot — same sentence."],["Risk","How wrong this could go.","Not a reason to avoid something. A reason to size it properly."],["Return","What you got back, over what you put in.","Usually a percentage, usually quoted by someone who wants something."],["Diversification","Not owning just one thing.","It does not raise your best outcome. It raises your worst, and the worst is what ends games."],["Share","A small piece of a company.","Own one and you own a sliver of everything that company does."],["Fund","A basket holding many things at once.","One purchase, lots of eggs, lots of baskets."],["Index fund","A fund holding a whole market.","Deliberately unexciting. Very hard to beat over a long time."],["Dividend","A share of profits paid to owners.","Some companies pay them, some reinvest instead. Neither is automatically better."],["Fee","What it costs to use a service.","Invisible in real life, which is exactly why this app puts it on screen."],["Volatility","How much something jumps about.","High volatility is not the same as high risk of loss, but they travel together."],["Bear market","A long stretch of falling prices.","Bea is right roughly as often as Bo is."],["Bull market","A long stretch of rising prices.","Everyone feels clever. That is the dangerous part."],["Credit","Borrowed money.","A tool with a price on it, never a verdict on a person."],["Debt","Money you owe.","Ordinary, common, and worth understanding rather than being ashamed of."],["Loan term","How long you have to repay.","A longer term means smaller payments and more total cost. Both, always."],["Trust score","A record of whether past borrowing was repaid.","A memory of what happened, not a score of what kind of person you are."],["Emergency fund","Money kept for the thing you did not plan.","Costs nothing while you are lucky and everything while you are not."],["Insurance","Paying a little so a disaster costs less.","Worth it for what you could not replace. Rarely worth it for what you could."],["Premium","What insurance costs you.","Multiply the monthly one by twelve before deciding."],["Tax","Money collected to pay for shared things.","Roads, schools, hospitals. It comes out before you ever see it."],["Revenue","Everything a business takes in.","The number people brag about."],["Cost","What a business paid to make it happen.","Fixed costs arrive anyway; variable ones follow the sales."],["Profit","Revenue minus cost.","The number that decides whether you are still open next year."],["Margin","Profit as a share of the price.","A big margin on nothing sold is still nothing."],["Cash flow","Money actually moving, and when.","You can be profitable and broke at the same time. Timing is its own subject."],["Inventory","The stock you are holding.","Money you have already spent, sitting in a box, hoping."],["Subscription","A payment that repeats until stopped.","A decision made once and paid for forever. Always times twelve."],["Wage","Money paid for work done.","You are usually selling time — and, over years, reputation."],["Value","What a thing is worth to you.","Different from price, and the gap is where every decision lives."],["Scam","A lie designed to take your money.","Reward or fright, plus a hurry, plus a secret. Always the same shape."],["Phishing","A fake message fishing for your details.","Real organisations already know who you are. That is what makes them real."],["One-time code","A number texted to prove it is you.","Nobody legitimate ever needs it from you. It is the proof, not a password."],["Net worth","Everything you have, added up.","Wallet plus jars plus bank plus investments. The number this whole town is drawing."],["Currency","The money a place has agreed on.","₹, $, £, €, د.إ — different agreements, same idea."],["Exchange rate","What one currency is worth in another.","It moves. That is why the same holiday costs differently in different years."]],te={"first-coin":{em:"🪙",name:"First earnings",desc:"Money you traded your time for."},"scam-spotter":{em:"🛡️",name:"Scam spotter",desc:"You saw the shape, not the story."},"cool-head":{em:"🧊",name:"Cool head",desc:'Said no to a "today only".'},"asked-home":{em:"🏡",name:"Asked at home",desc:"Every family does money differently."},"steady-hand":{em:"🪨",name:"Steady hand",desc:"Did nothing on a red day. Hardest move there is."},"jars-set":{em:"🫙",name:"Split it first",desc:"Paid yourself before you paid anyone else."},"goal-built":{em:"🏗️",name:"Built it",desc:"Finished a goal in the Build Yard."},"rainy-day":{em:"☔",name:"Rainy-day tin",desc:"Money set aside for the thing you did not plan."},"times-twelve":{em:"🗓️",name:"Times twelve",desc:"Worked out what a monthly thing costs in a year."},"noticed-inflation":{em:"📈",name:"Noticed the drift",desc:"Same chalk, bigger number."},gave:{em:"🤲",name:"Gave some",desc:"The Give jar did its job."},"asked-back":{em:"🔁",name:"Asked back",desc:"Worth hiring twice. Worth more than the fee."},"borrowed-well":{em:"🤝",name:"Repaid in full",desc:"Took a loan, knew the cost, cleared it."},diversified:{em:"🧺",name:"Never just one",desc:"Kept a Market Cup season spread out."},shopkeeper:{em:"🏪",name:"Open for business",desc:"Traded a day at Bizz & Co and counted it honestly."},"profit-day":{em:"💹",name:"In the black",desc:"A trading day that made more than it cost."},"chapter-c1":{em:"📗",name:"What money is",desc:"Chapter one, done."},"chapter-c2":{em:"📗",name:"Earning it",desc:"Chapter two, done."},"chapter-c3":{em:"📘",name:"Making a plan",desc:"Chapter three, done."},"chapter-c4":{em:"📘",name:"Sellers' tricks",desc:"Chapter four, done."},"chapter-c5":{em:"📙",name:"Keeping it safe",desc:"Chapter five, done."},"chapter-c6":{em:"📙",name:"Borrowing",desc:"Chapter six, done."},"chapter-c7":{em:"📕",name:"Money that grows",desc:"Chapter seven, done."},"chapter-c8":{em:"📕",name:"Running something",desc:"Chapter eight, done."},"moved-in":{em:"🔑",name:"Keys of your own",desc:"Moved somewhere better and could still afford Friday."},homeowner:{em:"🏡",name:"Bought it",desc:"Stopped renting. A mortgage ends; rent does not."},"indep-10":{em:"🌱",name:"One tenth",desc:"A tenth of your life is paid for by your money."},"indep-25":{em:"🌿",name:"A quarter",desc:"Your money covers a quarter of your week."},"indep-50":{em:"🌳",name:"Halfway",desc:"Half your life, paid for without working."},"indep-100":{em:"🏛️",name:"Independent",desc:"Your money pays for your life. You work because you choose to."},"held-the-storm":{em:"⛈️",name:"Held through it",desc:"Sat still while everything was red."},"exact-change":{em:"🪙",name:"Exact change",desc:"Counted it right, at speed."},climbed:{em:"🗼",name:"Over the line",desc:"Fifteen years of compounding, and still standing."},"main-street":{em:"🎲",name:"Main Street",desc:"Your shops paid for your life. Nobody went bankrupt."},"three-of-three":{em:"⭐",name:"All three",desc:"Cleared a whole day of quests."},traveller:{em:"🗺️",name:"On the road",desc:"Left Market Row for somewhere new."}},Le=[{key:"place",x:20,sub:"place",name:"Your place",lv:1,blurb:"where you live, and what it costs you every single week"},{key:"wallet",x:175,sub:"wallet",name:"Your stall",lv:1,blurb:"Market Row — where the money you earn actually sits"},{key:"jars",x:330,sub:"jars",name:"The Jar Shed",lv:6,blurb:"four jars, and a rule that splits your pay day by itself"},{key:"goals",x:485,sub:"goals",name:"The Build Yard",lv:8,blurb:"name a thing and watch it go up floor by floor"},{key:"bank",x:640,sub:"bank",name:"The Bank",lv:11,blurb:"the clock strikes interest, in public, every pay day"},{key:"exchange",x:795,sub:"portfolio",name:"The Exchange",lv:16,blurb:"Bo and Bea keep the board and neither of them knows"},{key:"shop",x:950,sub:"business",name:"Nana Bizz's shop",lv:23,blurb:"shuttered since she retired. Yours when you are ready"}],Se=348,b=250;function Oa(e,a){return`<g>
    <rect x="${e+a/2-44}" y="${b-54}" width="88" height="24" rx="12" fill="#1C2A2E" opacity=".82"/>
    <text x="${e+a/2}" y="${b-37}" text-anchor="middle" font-size="11.5" font-weight="700"
      fill="#EAE2CE">🔒 learn first</text>
  </g>`}function qa(e,a,t,n){return`<text x="${e+a/2}" y="${b+22}" text-anchor="middle" font-size="12.5" font-weight="800"
    fill="var(--ink)" opacity="${n?".85":".5"}">${u(t)}</text>`}function La(e,a){const t=["#B9A98C","#C6B58F","#D3BE96","#E0C79E","#E8CFA8"][a]||"#B9A98C",n=["#8A6A4E","#96745A","#A57E5E","#B0866A","#B8563F"][a]||"#8A6A4E",o=a>=2?2:1,s=o===2?118:78;let i="";return(o===2?[b-108,b-62]:[b-66]).forEach(r=>{const w=a>=2?3:a>=1?2:1;for(let k=0;k<w;k++)i+=`<rect x="${e+22+k*32}" y="${r}" width="22" height="24" rx="3" fill="#F6E9C8"/>
        <rect x="${e+22+k*32}" y="${r}" width="22" height="24" rx="3" fill="none" stroke="${n}" stroke-width="2"/>`}),`<g>
    <rect x="${e+8}" y="${b-s}" width="114" height="${s}" fill="${t}" rx="3"/>
    <path d="M${e} ${b-s} L${e+65} ${b-s-34} L${e+130} ${b-s} Z" fill="${n}"/>
    ${i}
    <rect x="${e+52}" y="${b-34}" width="26" height="34" rx="2" fill="${n}"/>
    <circle cx="${e+73}" cy="${b-17}" r="2" fill="#F0B429"/>
    ${a>=3?`<rect x="${e+96}" y="${b-s-26}" width="12" height="26" fill="${n}"/>
      <ellipse cx="${e+102}" cy="${b-s-32}" rx="9" ry="6" fill="rgba(255,255,255,.5)"/>`:""}
    ${a>=4?`<rect x="${e+6}" y="${b-14}" width="118" height="14" rx="4" fill="#7FA86F"/>
      <circle cx="${e+22}" cy="${b-16}" r="6" fill="#5F8A52"/><circle cx="${e+110}" cy="${b-16}" r="5" fill="#5F8A52"/>`:""}
  </g>`}function Ya(e,a){const t=a?"#B07A45":"#6E6A5E",n=a?"#C8524A":"#5E5A52";return`<g>
    <rect x="${e+8}" y="${b-62}" width="114" height="62" fill="${t}" rx="3"/>
    <rect x="${e+8}" y="${b-72}" width="114" height="12" fill="${a?"#8E5F35":"#57544B"}" rx="2"/>
    <path d="M${e} ${b-72} L${e+65} ${b-112} L${e+130} ${b-72} Z" fill="${n}"/>
    <path d="M${e+12} ${b-74} l14-24 14 24z" fill="${a?"#E8D9B8":"#6E6A5E"}"/>
    ${a?`<circle cx="${e+34}" cy="${b-46}" r="7" fill="#E0603C"/><circle cx="${e+52}" cy="${b-46}" r="7" fill="#F0B429"/><circle cx="${e+70}" cy="${b-46}" r="7" fill="#7CA84F"/>`:""}
    <rect x="${e+88}" y="${b-52}" width="26" height="52" fill="${a?"#7A5230":"#4E4B44"}" rx="2"/>
  </g>`}function Ga(e,a,t){const n=a?"#D8C79E":"#6E6A5E";let o="";if(a){const s=["#C4453C","#2E7FA8","#178A4C","#8A5BD6"];t.forEach((i,h)=>{const r=e+17+h*25,w=38*Math.max(.08,Math.min(1,i));o+=`<rect x="${r}" y="${b-80}" width="21" height="42" rx="5" fill="#F4F9FA" opacity=".92"/>
        <rect x="${r+2}" y="${b-38-w}" width="17" height="${w}" rx="4" fill="${s[h]}"/>
        <rect x="${r}" y="${b-80}" width="21" height="6" rx="3" fill="#CFDDDF"/>`})}return`<g>
    <rect x="${e+6}" y="${b-92}" width="118" height="92" fill="${n}" rx="3"/>
    <path d="M${e} ${b-92} L${e+65} ${b-124} L${e+130} ${b-92} Z" fill="${a?"#7E9C6A":"#5E5A52"}"/>
    <rect x="${e+14}" y="${b-80}" width="102" height="46" rx="4" fill="${a?"#3E3226":"#4E4B44"}" opacity=".25"/>
    ${o}
    <rect x="${e+52}" y="${b-34}" width="26" height="34" fill="${a?"#8E6238":"#4E4B44"}" rx="2"/>
  </g>`}function Ha(e,a,t){const o=Math.floor(t*4+.001);let s="";for(let i=0;i<4;i++){const h=b-26-(i+1)*26,r=i<o;s+=`<rect x="${e+22}" y="${h}" width="86" height="24" rx="2"
      fill="${r?a?"#C9A87A":"#6E6A5E":"none"}"
      stroke="${a?"rgba(255,255,255,.5)":"rgba(255,255,255,.25)"}" stroke-width="1.4" stroke-dasharray="${r?"0":"4 4"}"/>`,r&&a&&(s+=`<rect x="${e+32}" y="${h+6}" width="14" height="12" fill="#F0B429" opacity=".9"/>
      <rect x="${e+58}" y="${h+6}" width="14" height="12" fill="#F0B429" opacity=".55"/>`)}return`<g>
    <rect x="${e+10}" y="${b-26}" width="110" height="26" fill="${a?"#A98C63":"#6E6A5E"}" rx="2"/>
    ${s}
    <path d="M${e+14} ${b} L${e+14} ${b-118} M${e+116} ${b} L${e+116} ${b-118} M${e+14} ${b-58} L${e+116} ${b-58}"
      stroke="${a?"#8A6A3E":"#57544B"}" stroke-width="4" stroke-linecap="round"/>
    ${a&&o>=4?`<path d="M${e+46} ${b-132} l18-8 v10 z" fill="#C8524A"/><rect x="${e+44}" y="${b-134}" width="3" height="22" fill="#8A6A3E"/>`:""}
  </g>`}function Ua(e,a,t){const n=a?"#DCD3C0":"#6E6A5E",o=t%12*30;return`<g>
    <rect x="${e+8}" y="${b-86}" width="114" height="86" fill="${n}" rx="2"/>
    <rect x="${e}" y="${b-96}" width="130" height="12" fill="${a?"#C6BBA4":"#5E5A52"}" rx="2"/>
    ${[0,1,2,3].map(s=>`<rect x="${e+18+s*26}" y="${b-84}" width="12" height="84" fill="${a?"#EFE9DA":"#7A7669"}"/>`).join("")}
    <rect x="${e+44}" y="${b-156}" width="42" height="62" fill="${a?"#CFC5AE":"#5E5A52"}" rx="2"/>
    <path d="M${e+40} ${b-156} L${e+65} ${b-176} L${e+90} ${b-156} Z" fill="${a?"#3E6E77":"#4E4B44"}"/>
    <circle cx="${e+65}" cy="${b-132}" r="15" fill="${a?"#FBF7EC":"#8A8678"}" stroke="${a?"#8A5B00":"#57544B"}" stroke-width="2"/>
    ${a?`<path d="M${e+65} ${b-132} v-9" stroke="#3A2E1A" stroke-width="2" stroke-linecap="round"
        transform="rotate(${o} ${e+65} ${b-132})"/>
      <path d="M${e+65} ${b-132} l7 4" stroke="#3A2E1A" stroke-width="2" stroke-linecap="round"/>`:""}
    <rect x="${e+54}" y="${b-42}" width="22" height="42" rx="10" fill="${a?"#6E5233":"#4E4B44"}"/>
  </g>`}function Ka(e,a,t){const n=a?"#C8D8DA":"#6E6A5E";return`<g>
    <rect x="${e+6}" y="${b-104}" width="118" height="104" fill="${n}" rx="3"/>
    <rect x="${e+16}" y="${b-94}" width="98" height="52" rx="3" fill="${a?"#22383C":"#4E4B44"}"/>
    ${a?`<polyline points="${e+22},${b-56} ${e+40},${b-68} ${e+56},${b-60} ${e+74},${b-80} ${e+108},${b-86}"
      fill="none" stroke="${t?"#5BC98C":"#EC8B81"}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`:""}
    <path d="M${e} ${b-104} L${e+65} ${b-130} L${e+130} ${b-104} Z" fill="${a?"#3E6E77":"#5E5A52"}"/>
    <rect x="${e+52}" y="${b-36}" width="26" height="36" fill="${a?"#7A5230":"#4E4B44"}" rx="2"/>

  </g>`}function Ja(e,a){const t=a?"#E8CFA8":"#6E6A5E";return`<g>
    <rect x="${e+6}" y="${b-98}" width="118" height="98" fill="${t}" rx="3"/>
    <path d="M${e} ${b-98} L${e+65} ${b-128} L${e+130} ${b-98} Z" fill="${a?"#B8563F":"#5E5A52"}"/>
    ${a?`<rect x="${e+18}" y="${b-78}" width="94" height="44" rx="3" fill="#FBF3E2"/>
         <rect x="${e+18}" y="${b-86}" width="94" height="10" fill="#C8524A"/>
         <text x="${e+65}" y="${b-50}" text-anchor="middle" font-size="13" font-weight="800" fill="#8A5B00" font-family="Georgia,serif">BIZZ &amp; CO</text>
         <rect x="${e+52}" y="${b-32}" width="26" height="32" fill="#7A5230" rx="2"/>`:`<rect x="${e+18}" y="${b-78}" width="94" height="60" rx="3" fill="#4E4B44"/>
         ${[0,1,2,3,4].map(n=>`<rect x="${e+20}" y="${b-76+n*12}" width="90" height="9" fill="#6E6A5E"/>`).join("")}`}
  </g>`}function _a(e,a){return`<g><rect x="${e-1.5}" y="18" width="3" height="14" fill="#7A6A50"/>
    <circle cx="${e}" cy="38" r="7.5" fill="${a?"#F0B429":"rgba(140,140,130,.5)"}"/>
    ${a?`<circle cx="${e}" cy="38" r="13" fill="#F0B429" opacity=".2"/>`:""}</g>`}function Va(e){const a=e;e.learn.level;const t=["spend","save","grow","give"].map(p=>{const T=a.money.jars.spend+a.money.jars.save+a.money.jars.grow+a.money.jars.give;return T>0?a.money.jars[p]/Math.max(T,1)*2:0}),n=a.money.goals.find(p=>!p.done),o=n?Math.min(1,n.saved/n.target):0,s=a.market.lastMove>=0,i=a.streak.days.length,h=new Date().getHours(),r=K[e.world||0]||K[0],w=Le.filter(p=>r.places.includes(p.key)),k=155,R=130,y=Math.max(640,R*2+w.length*k),f=Math.max(R,(y-w.length*k)/2),m=p=>f+p*k,B=Array.from({length:7},(p,T)=>_a(70+T*((y-140)/6),T<Math.min(7,i))).join(""),M=(p,T)=>{p={...p,x:m(T)};const z=Oe(e,p.sub);let d="";return p.key==="place"?d=La(p.x,e.home&&e.home.tier||0):p.key==="wallet"?d=Ya(p.x,z):p.key==="jars"?d=Ga(p.x,z,t):p.key==="goals"?d=Ha(p.x,z,o):p.key==="bank"?d=Ua(p.x,z,h):p.key==="exchange"?d=Ka(p.x,z,s):d=Ja(p.x,z),`<g class="hot" data-act="town" data-arg="${p.key}" role="button" tabindex="0"
        aria-label="${u(p.name)}${z?"":" — opens when you finish "+(It(p.sub)||"the chapter")}">
      <rect class="bldg-glow" x="${p.x-4}" y="${b-190}" width="138" height="196" rx="10" fill="#F0B429" opacity="0"/>
      <g opacity="${z?1:.42}">${d}</g>
      ${z?"":Oa(p.x,130)}
      ${qa(p.x,130,p.name,z)}
    </g>`};return`<svg viewBox="0 0 ${y} ${Se}" preserveAspectRatio="xMidYMax meet" aria-label="Bizzington">
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
    <rect width="${y}" height="${Se}" fill="url(#sky)"/>
    <rect width="${y}" height="${b}" fill="${r.tint}" opacity=".22"/>
    <circle cx="852" cy="62" r="26" fill="#F0B429" opacity=".55"/>
    <g fill="rgba(255,255,255,.6)">
      <ellipse cx="150" cy="70" rx="34" ry="15"/><ellipse cx="178" cy="62" rx="24" ry="17"/>
      <ellipse cx="520" cy="52" rx="28" ry="13"/><ellipse cx="546" cy="46" rx="20" ry="14"/>
    </g>
    <g stroke="rgba(40,60,64,.35)" stroke-width="1.6" fill="none" stroke-linecap="round">
      <path d="M300 82 q7-6 14 0 q7-6 14 0"/><path d="M352 62 q6-5 12 0 q6-5 12 0"/>
    </g>
    <path d="M0 210 q90-46 190-10 t180-4 q100-40 200 2 t210-6 v140 H0z" fill="rgba(80,110,100,.18)"/>
    ${B}
    <rect x="0" y="${b}" width="${y}" height="${Se-b}" fill="var(--ground)"/>
    <rect x="0" y="${b}" width="${y}" height="${Se-b}" fill="${r.tint}" opacity=".3"/>
    <rect x="0" y="${b+28}" width="${y}" height="6" fill="var(--road)" opacity=".7"/>
    <text x="${y-14}" y="${Se-12}" text-anchor="end" font-size="12" font-weight="800"
      fill="var(--ink)" opacity=".45">${r.em} ${u(r.name)}</text>
    ${w.map(M).join("")}
    ${w.some(p=>p.key==="wallet")?`<g aria-hidden="true" transform="translate(${m(w.findIndex(p=>p.key==="wallet"))+145},204) scale(.72)"><g class="bob">
      <ellipse cx="16" cy="62" rx="16" ry="4" fill="rgba(0,0,0,.14)"/>
      <path d="M30 44c8-3 10-14 4-19-5-5-11-2-10 4 1 5 6 4 6 8 0 3-3 5-6 5z" fill="#C9752F"/>
      <ellipse cx="16" cy="44" rx="12" ry="14" fill="#D98338"/>
      <ellipse cx="16" cy="48" rx="7" ry="8" fill="#F6DEBE"/>
      <circle cx="16" cy="22" r="11" fill="#E29350"/>
      <path d="M8 14c-2-4 0-7 3-6s4 5 2 7zM24 14c2-4 0-7-3-6s-4 5-2 7z" fill="#E29350"/>
      <ellipse cx="16" cy="26" rx="7" ry="5" fill="#F6DEBE"/>
      <circle cx="12" cy="20" r="2.2" fill="#25201C"/><circle cx="20" cy="20" r="2.2" fill="#25201C"/>
      <path d="M16 25c-1.2 0-2-.8-2-1.5s.8-1.2 2-1.2 2 .5 2 1.2-.8 1.5-2 1.5z" fill="#2A2320"/>
    </g></g>`:""}
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
  </svg>`}const Fe="bzf_profile",wt="bzf_v1",Ue="bzf_device",Xa=2;function Pe(e,a){try{const t=localStorage.getItem(e);return t?JSON.parse(t):a}catch{return a}}function Ke(e,a){try{return localStorage.setItem(e,JSON.stringify(a)),!0}catch(t){return console.warn("storage unavailable",t),!1}}let Je=null;const Wt={loadProfile(){let e=Pe(Fe,null);if(!e){const a=Pe(wt,null);a&&(e=a)}return e?Za(e):null},saveProfile(e){clearTimeout(Je),Je=setTimeout(()=>Ke(Fe,e),150)},saveNow(e){clearTimeout(Je),Ke(Fe,e)},loadDevice(e,a){const t=Pe(Ue,{});return t[e]===void 0?a:t[e]},saveDevice(e,a){const t=Pe(Ue,{});t[e]=a,Ke(Ue,t)},wipe(){try{localStorage.removeItem(Fe),localStorage.removeItem(wt)}catch{}}};function Za(e){for(e.v||(e.v=1);e.v<Xa&&e.v===1;)e=Qa(e);return e}function Qa(e){const a={id:"k1",name:e.child&&e.child.name||"Friend",band:e.child&&e.child.band||"builder",currency:e.child&&e.child.currency||"INR",created:e.child&&e.child.created||Date.now(),money:e.money,learn:e.learn,market:e.market,streak:e.streak,postbox:e.postbox,shop:e.shop||{owned:[]},badges:e.badges||[],history:e.history||[]};return{v:2,parent:{created:Date.now(),gate:!1},kids:[a],active:0,settings:e.settings||{sound:!0},clock:{lastSeen:Date.now()}}}const Ye=60;function Ot(e,a,t){Ce(t);const n=Date.now();return{id:"k"+n.toString(36),name:e||"Friend",band:a||"builder",currency:t||"INR",created:n,money:{wallet:v(12),jars:{spend:0,save:0,grow:0,give:0},rules:{spend:40,save:30,grow:20,give:10},goals:[],txns:[{id:"t0",t:n,kind:"in",amt:v(12),label:"Starting float from Nana",cat:"gift"}],wage:v(20),bills:[],nextPay:it(n,5),bank:{balance:0,rate:.02,opened:!1,loan:null,trust:50,repaid:0}},learn:{xp:0,level:1,done:{},openCard:null,drill:null},market:{series:Dt(Ye),step:8,lastMove:1,holdings:{},best:null},biz:null,streak:{days:[se(n)],last:se(n)},postbox:{day:se(n),idx:0,answered:!1,log:[]},shop:{owned:[],cooling:{}},jobs:{},home:{tier:0,since:n,mortgage:null},world:0,quests:{day:se(n),list:[],prog:{},claimed:{},bonus:!1},badges:[],history:[{t:n,v:v(12)}],family:{allowance:null,payWeekday:5,chores:[],coolOff:!1}}}function Re(e){return je[e.home&&e.home.tier||0]}function xe(e){const a=Re(e),t=[];return a.rent>0&&t.push({name:"Rent",units:a.rent,amt:v(a.rent)}),a.bills.forEach(n=>t.push({name:n.name,units:n.units,amt:v(n.units)})),t.push({name:a.perk==="kitchen"?"Food (you cook)":"Food",units:a.food,amt:v(a.food)}),e.home.mortgage&&t.push({name:"Mortgage",units:0,amt:e.home.mortgage.perWeek}),e.money.bills=t,t}function ke(e){return xe(e).reduce((a,t)=>a+t.amt,0)}function qt(e){return Math.round(e.money.wage*(1+(e.learn.level-1)*.055))}function me(e){return e.family.allowance!=null?e.family.allowance:qt(e)}function nt(e){const a=e.money.bank.balance*e.money.bank.rate,t=Te(e)*.0075,n=e.biz&&e.biz.log.length?e.biz.log.slice(0,4).reduce((o,s)=>o+s.profit,0)/Math.min(4,e.biz.log.length)*3:0;return Math.max(0,Math.round(a+t+n))}function st(e){const a=ke(e);return a<=0?0:Math.min(2,nt(e)/a)}function Lt(e){const a=st(e)*100,t=[];return[[10,"indep-10"],[25,"indep-25"],[50,"indep-50"],[100,"indep-100"]].forEach(([n,o])=>{a>=n&&F(e,o)&&t.push(o)}),t}function ot(e,a){const t=je[a];if(!t||a!==e.home.tier+1)return{ok:!1,why:"Not the next one along"};const n=v(t.deposit);return e.money.wallet+e.money.jars.save<n?{ok:!1,why:"Deposit is "+n,deposit:n}:{ok:!0,deposit:n}}function Yt(e,a){const t=je[a],n=v(t.deposit);let o=n-e.money.wallet;if(o>0){const s=Math.min(o,e.money.jars.save);e.money.jars.save-=s,e.money.wallet+=s,o-=s}if(o>0)return!1;if(e.money.wallet-=n,n>0&&D(e,"out",n,"Deposit on "+t.name,"home"),t.mortgage){const s=v(t.mortgage.units);e.home.mortgage={owed:s,perWeek:Math.ceil(s/t.mortgage.weeks),weeks:t.mortgage.weeks,paid:0},F(e,"homeowner")}return e.home.tier=a,e.home.since=Date.now(),xe(e),F(e,"moved-in"),P(e),!0}function Gt(){return{v:2,parent:{created:Date.now(),gate:!1},kids:[],active:0,ui:{nav:"home",sub:"wallet"},settings:{sound:!0},clock:{lastSeen:Date.now()}}}function ae(e){return e.kids[e.active]}function it(e,a){const t=new Date(e);t.setHours(9,0,0,0);const n=(a-t.getDay()+7)%7||7;return t.setDate(t.getDate()+n),t.getTime()}function Ht(e){const a=Date.now(),t=e.clock&&e.clock.lastSeen||0;return a<t?t:(e.clock.lastSeen=a,a)}function Ut(e){return Date.now()<(e.clock&&e.clock.lastSeen||0)-6e4}function D(e,a,t,n,o){e.money.txns.unshift({id:"x"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:Date.now(),kind:a,amt:Math.round(t),label:n,cat:o||"other"}),e.money.txns.length>200&&(e.money.txns.length=200)}function ye(e,a,t,n){const o=Math.round(a);return o<=0?0:(e.money.wallet+=o,D(e,"in",o,t,n||"wage"),n!=="quest"&&_(e,"earn",o),F(e,"first-coin"),o)}function Kt(e,a,t,n){const o=Math.round(a);return e.band==="sprout"&&o>e.money.wallet?!1:(e.money.wallet-=o,D(e,"out",o,t,n||"spend"),!0)}function Ge(e){const a=e.money.jars;return a.spend+a.save+a.grow+a.give}function Te(e){return Math.round(J.reduce((a,t)=>a+(e.market.holdings[t.id]||0)*e.market.series[t.id][e.market.step],0))}function Jt(e){return e.biz?Math.round(e.biz.cash):0}function _t(e){return e.money.bank.loan?Math.round(e.money.bank.loan.owed):0}function Vt(e){const a=Re(e);return a.owned?Math.round(v(a.mortgage?a.mortgage.units:0)*1.15-(e.home.mortgage?e.home.mortgage.owed:0)):0}function $e(e){return Math.round(e.money.wallet+Ge(e)+e.money.bank.balance+Te(e)+Jt(e)+Vt(e)-_t(e))}function P(e){const a=e.history,t=$e(e);(!a.length||a[a.length-1].v!==t)&&a.push({t:Date.now(),v:t}),a.length>120&&a.splice(0,a.length-120)}function rt(e){const a=se(Date.now()),t=K[e.world||0];return Ft.filter(n=>t.jobs.includes(n.id)).map(n=>({...n,done:e.jobs[n.id]===a,amt:v(n.units)}))}function Xt(e,a){const t=se(Date.now()),n=Ft.find(s=>s.id===a);if(!n||e.jobs[a]===t)return 0;e.jobs[a]=t;const o=ye(e,v(n.units),n.name+" for "+n.who,"job");return _(e,"job",1),P(e),o}function en(e){return K[e.world||0]}function lt(e,a){if(a===(e.world||0))return{ok:!1,why:"You are already here"};if(at(e,a))return{ok:!0};const t=K[a-1],n=t.chapters.filter(o=>!ue(e,o));return{ok:!1,why:n.length?"Finish what you are learning in "+t.name:"Not yet",need:n}}function Zt(e,a){return lt(e,a).ok?(e.world=a,a>0&&F(e,"traveller"),!0):!1}function tn(e){return K.filter((a,t)=>at(e,t)).length}function dt(e){const a=se(Date.now());if(e.quests&&e.quests.day===a&&e.quests.list.length)return e.quests;const t=qe.filter(i=>!i.needs||ue(e,i.needs)),n=[];let o=a*2654435761>>>0;const s=t.slice();for(;n.length<Math.min(3,s.length);)o=Math.imul(o^o>>>15,2246822507)>>>0,n.push(s.splice(o%s.length,1)[0]);return e.quests={day:a,list:n.map(i=>i.id),prog:{},claimed:{},bonus:!1},e.quests}function ct(e){const a=dt(e);return a.list.map(t=>{const n=qe.find(s=>s.id===t),o=a.prog[t]||0;return{...n,at:Math.min(o,n.n),done:o>=n.n,claimed:!!a.claimed[t]}})}function _(e,a,t){!e.quests||!e.quests.list||e.quests.list.forEach(n=>{const o=qe.find(s=>s.id===n);!o||o.kind!==a||(e.quests.prog[n]=(e.quests.prog[n]||0)+(t||1))})}function Qt(e,a){const t=qe.find(o=>o.id===a);if(!t||!e.quests.list.includes(a)||e.quests.claimed[a]||(e.quests.prog[a]||0)<t.n)return 0;e.quests.claimed[a]=!0;const n=ye(e,v(t.pay),"Quest — "+t.t,"quest");return P(e),n}function ea(e){const a=ct(e);if(e.quests.bonus||!a.every(n=>n.claimed))return 0;e.quests.bonus=!0;const t=ye(e,v(12),"All three quests","quest");return F(e,"three-of-three"),P(e),t}function ht(e,a){return Ht(a)>=e.money.nextPay}function ta(e){return Math.max(0,Math.ceil((e.money.nextPay-Date.now())/Rt))}function aa(e,a){const t={wage:0,bills:[],interest:0,split:null,loan:0,chores:[]},n=me(e);if(e.money.wallet+=n,D(e,"in",n,"Pay day — wages","wage"),t.wage=n,(e.family.chores||[]).forEach(s=>{s.done&&(e.money.wallet+=s.amt,D(e,"in",s.amt,s.name,"chore"),t.chores.push(s),s.done=!1)}),e.money.bills.forEach(s=>{e.money.wallet-=s.amt,D(e,"out",s.amt,s.name,"bill"),t.bills.push(s)}),e.money.bank.opened&&e.money.bank.balance>0){const s=Math.round(e.money.bank.balance*e.money.bank.rate);s>0&&(e.money.bank.balance+=s,D(e,"in",s,"Bank interest","interest"),t.interest=s)}const o=e.money.bank.loan;if(o){const s=Math.min(o.perWeek,Math.max(0,e.money.wallet));s>0?(e.money.wallet-=s,o.owed=Math.max(0,o.owed-s),o.paid+=s,D(e,"out",s,"Loan repayment","loan"),t.loan=s,e.money.bank.trust=Math.min(100,e.money.bank.trust+3)):(e.money.bank.trust=Math.max(0,e.money.bank.trust-8),o.missed=(o.missed||0)+1),o.owed<=0&&(e.money.bank.loan=null,e.money.bank.repaid++,e.money.bank.trust=Math.min(100,e.money.bank.trust+8),F(e,"borrowed-well"),t.loanCleared=!0)}if(e.learn.level>=6&&e.money.wallet>0){const s=e.money.wallet,i=e.money.rules,h={spend:Math.round(s*i.spend/100),save:Math.round(s*i.save/100),grow:Math.round(s*i.grow/100),give:Math.round(s*i.give/100)};Object.keys(h).forEach(r=>{e.money.jars[r]+=h[r]}),e.money.wallet=s-(h.spend+h.save+h.grow+h.give),t.split=h,F(e,"jars-set")}if(e.money.goals.forEach(s=>{if(s.done||!s.auto)return;const i=Math.min(s.auto,e.money.jars.save);i>0&&(e.money.jars.save-=i,s.saved+=i,ca(e,s))}),e.home.mortgage){const s=e.home.mortgage,i=t.bills.find(h=>h.name==="Mortgage");i&&(s.owed=Math.max(0,s.owed-i.amt),s.paid+=i.amt),s.owed<=0&&(e.home.mortgage=null,t.mortgageCleared=!0,xe(e))}return t.independence=Lt(e),e.money.nextPay=it(Date.now(),e.family.payWeekday==null?5:e.family.payWeekday),e.market.step=Math.min(Ye,e.market.step+1),e.market.lastMove=na(e),F(e,"payday"),P(e),t}function na(e){const a=e.market.series.basket,t=e.market.step;return t>0?a[t]-a[t-1]:0}function sa(e,a){e.family.payWeekday=a,e.money.nextPay=it(Date.now(),a)}function oa(e,a){e.money.nextPay=Date.now()-1,a.clock.lastSeen=Date.now()}function ia(e,a,t){const n=Math.min(Math.round(t),e.money.wallet);return n<=0?0:(e.money.wallet-=n,e.money.jars[a]+=n,a!=="spend"&&_(e,"jar",n),D(e,"out",n,"Into the "+a+" jar","jar"),P(e),n)}function ra(e,a,t){const n=Math.min(Math.round(t),e.money.jars[a]);return n<=0?0:(e.money.jars[a]-=n,e.money.wallet+=n,D(e,"in",n,"Out of the "+a+" jar","jar"),P(e),n)}function la(e,a,t){e.money.goals.push({id:"g"+Date.now().toString(36),name:a,target:Math.round(t),saved:0,auto:0,done:!1,t:Date.now()})}function da(e,a,t){const n=e.money.goals.find(s=>s.id===a);if(!n)return 0;const o=Math.min(Math.round(t),e.money.jars.save);return o<=0?0:(e.money.jars.save-=o,n.saved+=o,ca(e,n),_(e,"goal",1),P(e),o)}function ut(e,a){const t=e.money.goals.find(o=>o.id===a);if(!t||t.saved<=0)return 0;const n=t.saved;return t.saved=0,t.done=!1,e.money.wallet+=n,D(e,"in",n,'Took back from "'+t.name+'"',"jar"),P(e),n}function an(e,a){ut(e,a),e.money.goals=e.money.goals.filter(t=>t.id!==a)}function ca(e,a){!a.done&&a.saved>=a.target&&(a.done=!0,F(e,"goal-built"))}function pt(e,a){const t=Math.max(1,Math.round(me(e)*e.money.rules.save/100));return Math.ceil(Math.max(0,a.target-a.saved)/t)}function ha(e,a){const t=Math.min(Math.round(a),e.money.jars.save);return t<=0?0:(e.money.jars.save-=t,e.money.bank.balance+=t,e.money.bank.opened=!0,D(e,"out",t,"Into the bank","bank"),P(e),t)}function ua(e,a){const t=Math.min(Math.round(a),e.money.bank.balance);return t<=0?0:(e.money.bank.balance-=t,e.money.jars.save+=t,D(e,"in",t,"Out of the bank","bank"),P(e),t)}function mt(e,a,t){const n=v(a),o=.01+(60-Math.min(60,e.money.bank.trust))*5e-4,s=Math.round(n*(1+o*t)),i=Math.ceil(s/t);return{amount:n,weeks:t,rate:o,total:s,perWeek:i,cost:s-n}}function pa(e,a){return e.money.bank.loan?!1:(e.money.bank.loan={amount:a.amount,owed:a.total,perWeek:a.perWeek,weeks:a.weeks,paid:0,missed:0,t:Date.now(),cost:a.cost},e.money.wallet+=a.amount,D(e,"in",a.amount,"Loan from the bank","loan"),P(e),!0)}function ma(e,a){const t=e.money.bank.loan;if(!t)return 0;const n=Math.min(Math.round(a),e.money.wallet,t.owed);return n<=0?0:(e.money.wallet-=n,t.owed-=n,t.paid+=n,D(e,"out",n,"Loan repayment","loan"),t.owed<=0&&(e.money.bank.loan=null,e.money.bank.repaid++,e.money.bank.trust=Math.min(100,e.money.bank.trust+10),F(e,"borrowed-well")),P(e),n)}function ya(e,a,t){const n=Math.min(Math.round(t),e.money.jars.grow);if(n<=0)return 0;const o=e.market.series[a][e.market.step];return e.money.jars.grow-=n,e.market.holdings[a]=(e.market.holdings[a]||0)+n/o,_(e,"invest",1),D(e,"out",n,"Bought "+J.find(s=>s.id===a).name,"invest"),P(e),n}function ga(e,a){const t=e.market.holdings[a]||0;if(t<=0)return 0;const n=Math.round(t*e.market.series[a][e.market.step]);return e.market.holdings[a]=0,e.money.jars.grow+=n,D(e,"in",n,"Sold "+J.find(o=>o.id===a).name,"invest"),P(e),n}function fa(e){const a=J.filter(t=>(e.market.holdings[t.id]||0)>1e-4);return a.length?a.some(t=>t.id==="basket")?Math.max(4,a.length):a.length:0}function ba(e){return e.biz||(e.biz={cash:v(40),day:1,rent:v(6),stock:{},prices:{},weather:"fair",open:!1,log:[],best:0},G.forEach(a=>{e.biz.prices[a.id]=v(a.sells),e.biz.stock[a.id]=0})),e.biz}function va(e,a,t){const n=e.biz,o=G.find(i=>i.id===a),s=v(o.cost)*t;return s>n.cash?!1:(n.cash-=s,n.stock[a]=(n.stock[a]||0)+t,!0)}function wa(e,a,t){const n=e.biz,o=G.find(i=>i.id===a),s=Math.max(1,Math.round(v(o.cost)*.5));n.prices[a]=Math.max(s,n.prices[a]+t)}function ka(e){const a=e.biz,t=be[Math.floor(kt(a.day*7919+13)*be.length)];a.weather=t.id;let n=0,o={},s={};G.forEach(r=>{const w=a.stock[r.id]||0;if(!w)return;const k=9*(t.mult[r.id]||1),R=v(r.sells),y=Math.pow(R/Math.max(1,a.prices[r.id]),1.6),f=Math.max(0,Math.round(k*y*(.75+kt(a.day*31+r.id.length)*.5))),m=Math.min(w,f);o[r.id]=m,n+=m*a.prices[r.id],a.stock[r.id]=w-m,r.id==="ice"&&a.stock[r.id]>0&&(s[r.id]=a.stock[r.id],a.stock[r.id]=0)});const i=a.rent;a.cash+=n-i;const h=n-i;return a.log.unshift({day:a.day,weather:t.id,revenue:n,rent:i,profit:h,sold:o,spoiled:s}),a.log.length>20&&(a.log.length=20),a.day++,a.best=Math.max(a.best,h),F(e,"shopkeeper"),_(e,"trade",1),h>0&&F(e,"profit-day"),P(e),{weather:t,revenue:n,rent:i,profit:h,sold:o,spoiled:s}}function kt(e){let a=e>>>0||1;return a^=a<<13,a>>>=0,a^=a>>17,a^=a<<5,a>>>=0,a/4294967296}function $a(e){const a=e.biz;if(!a)return 0;const t=v(20),n=Math.max(0,Math.round(a.cash-t));return n<=0?0:(a.cash-=n,e.money.wallet+=n,D(e,"in",n,"Drawn from Bizz & Co","business"),P(e),n)}function He(e,a){const t=e.learn.level;return e.learn.xp+=a,e.learn.level=Wa(e.learn.xp),{gained:a,leveled:e.learn.level>t,from:t,level:e.learn.level,rank:Qe(e.learn.level)}}function xa(e){const a=e.learn.level,t=ve[a-1],n=ve[a]==null?t+200:ve[a];return{lo:t,hi:n,pct:Math.min(1,(e.learn.xp-t)/Math.max(1,n-t)),need:Math.max(0,n-e.learn.xp)}}function F(e,a){return!a||e.badges.includes(a)?!1:(e.badges.push(a),!0)}function yt(e){const a=se(Date.now());return e.streak.last===a?!1:(e.streak.last===a-1?e.streak.days.push(a):e.streak.days=[a],e.streak.last=a,e.postbox.day!==a&&(e.postbox.day=a,e.postbox.idx+=1,e.postbox.answered=!1),dt(e),!0)}function Ta(e,a){const t=e.currency;if(t===a)return;const n=i=>Math.round(bt(i,t,a)),o=e.money;if(o.wallet=n(o.wallet),o.wage=n(o.wage),["spend","save","grow","give"].forEach(i=>{o.jars[i]=n(o.jars[i])}),o.bills.forEach(i=>{i.amt=n(i.amt)}),o.goals.forEach(i=>{i.target=n(i.target),i.saved=n(i.saved),i.auto=n(i.auto||0)}),o.txns.forEach(i=>{i.amt=n(i.amt)}),o.bank.balance=n(o.bank.balance),o.bank.loan){const i=o.bank.loan;i.amount=n(i.amount),i.owed=n(i.owed),i.perWeek=n(i.perWeek),i.paid=n(i.paid),i.cost=n(i.cost)}const s=bt(1,t,a);Object.keys(e.market.holdings).forEach(i=>{e.market.holdings[i]*=s}),e.family.allowance!=null&&(e.family.allowance=n(e.family.allowance)),(e.family.chores||[]).forEach(i=>{i.amt=n(i.amt)}),e.biz&&(e.biz.cash=n(e.biz.cash),e.biz.rent=n(e.biz.rent),Object.keys(e.biz.prices).forEach(i=>{e.biz.prices[i]=n(e.biz.prices[i])}),e.biz.log.forEach(i=>{i.revenue=n(i.revenue),i.rent=n(i.rent),i.profit=n(i.profit)})),e.history.forEach(i=>{i.v=n(i.v)}),e.currency=a,Ce(a)}function Aa(e){Wt.saveProfile(e)}function Ma(){const e=Wt.loadProfile();return e?(e.clock||(e.clock={lastSeen:Date.now()}),e.kids.forEach(a=>{(!a.market||!a.market.series)&&(a.market={series:Dt(Ye),step:8,lastMove:1,holdings:{},best:null}),a.market.holdings||(a.market.holdings={}),a.jobs||(a.jobs={}),a.shop.cooling||(a.shop.cooling={}),a.family||(a.family={allowance:null,payWeekday:5,chores:[],coolOff:!1}),a.money.bank.trust==null&&(a.money.bank.trust=50,a.money.bank.repaid=0,a.money.bank.loan=null),a.home||(a.home={tier:0,since:Date.now(),mortgage:null},xe(a)),a.world==null&&(a.world=0),a.quests||(a.quests={day:-1,list:[],prog:{},claimed:{},bonus:!1})}),e.ui||(e.ui={nav:"home",sub:"wallet"}),e.active>=e.kids.length&&(e.active=0),e.kids[e.active]&&Ce(e.kids[e.active].currency),e):null}const nn=Object.freeze(Object.defineProperty({__proto__:null,MARKET_STEPS:Ye,addGoal:la,addXP:He,badge:F,bankIn:ha,bankOut:ua,bizBuy:va,bizCashOut:$a,bizPrice:wa,bizTrade:ka,bizValue:Jt,buyAsset:ya,canMove:ot,canTravel:lt,changeCurrency:Ta,checkIndependence:Lt,claimQuest:Qt,clockSuspect:Ut,currentWorld:en,daysToPay:ta,debt:_t,doJob:Xt,dropGoal:an,earn:ye,fromJar:ra,fundGoal:da,holdingsValue:Te,homeEquity:Vt,homeOf:Re,independence:st,jarTotal:Ge,jobsToday:rt,kid:ae,load:Ma,loanOffer:mt,marketMove:na,moveHome:Yt,netWorth:$e,newChild:Ot,newState:Gt,now:Ht,openBiz:ba,passiveWeekly:nt,payDue:ht,protoSkipWeek:oa,questBonus:ea,questList:ct,questTick:_,raidGoal:ut,refreshBills:xe,repayLoan:ma,rollQuests:dt,runPayDay:aa,save:Aa,sellAsset:ga,setPayWeekday:sa,spend:Kt,spread:fa,stamp:P,takeLoan:pa,toJar:ia,touchDay:yt,travel:Zt,txn:D,wageFor:qt,weeklyCost:ke,weeklyIncome:me,weeksToGoal:pt,worldsOpen:tn,xpBar:xa},Symbol.toStringTag,{value:"Module"})),l={s:null,render(){},overlay:null,game:null,shelf:"",query:"",fields:{},mode:null},Y=()=>ae(l.s);function sn(e){const a=e.step||0,t=o=>`<div class="stack" style="max-width:520px;margin:5vh auto 0">${o}</div>`,n=l.s?l.s.kids.length===0:!0;return t(a===0?`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 12px;border-radius:50%;overflow:hidden;border:1px solid var(--line)">${H.pip.svg}</div>
        <h1 style="font-size:32px">${n?'Welcome to <em style="font-style:italic">Bizzington</em>':"A new stall on Market Row"}</h1>
        <p class="muted" style="margin-top:8px">${n?"A town where you get a stall, a wallet, and every mistake is made with money that isn't real.":"Another child, their own town, their own money. Nothing is shared between them."}</p>
      </div>
      ${N("nana",n?"I am shutting up my shop at the end of the road, and the smallest stall on Market Row is going spare. What shall I call you?":"Another one! There is always a stall going. What is this one called?")}
      <div class="card stack">
        <label class="eyebrow" for="nm">Name</label>
        <input id="nm" data-field="name" value="${u(e.name||"")}" placeholder="Type a name" autocomplete="off"
          style="padding:13px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-size:16px;font-weight:700;width:100%">
        <button class="btn wide" data-act="obNext">Next →</button>
        ${n?"":'<button class="small muted" style="text-align:center;width:100%" data-act="obCancel">Cancel</button>'}
      </div>`:a===1?`
      ${N("pip",`Good to meet you, <b>${u(e.name)}</b>. How old are you? It changes what the street shows — no debt and no market before they are taught.`)}
      <div class="card stack">
        <button class="opt" data-act="obBand" data-arg="sprout"><b>8 to 10</b><br><span class="small muted">Sprout — coins, earning, saving. Nothing can go negative.</span></button>
        <button class="opt" data-act="obBand" data-arg="builder"><b>11 and up</b><br><span class="small muted">Builder — budgets, the bank, the Exchange, a shop of your own.</span></button>
      </div>`:`
    ${N("pip","Last one. Which money do you count in? You can change it later and the town converts — it does not start over.")}
    <div class="card stack">
      ${Object.keys(q).map(o=>`<button class="opt" data-act="obCur" data-arg="${o}">
        <b style="font-size:18px">${q[o].sign}</b> &nbsp;${q[o].name}
        <span class="small muted"> · ${new Intl.NumberFormat(q[o].locale).format(12e5)}</span></button>`).join("")}
    </div>`)}function on(){const e=Y(),a=ht(e,l.s),t=ta(e),n=e.money.goals.find(m=>!m.done),o=e.band==="sprout",s=ln(e),i=o?`<div class="strip two">
        <div><div class="k">Wallet</div><div class="v">${c(e.money.wallet)}</div></div>
        <div><div class="k">Saved up</div><div class="v">${c(e.money.jars.save+e.money.jars.grow)}</div></div></div>`:`<div class="strip">
        <div><div class="k">Wallet</div><div class="v">${c(e.money.wallet)}</div></div>
        <div><div class="k">Jars</div><div class="v">${c(Ge(e))}</div></div>
        <div><div class="k">Invested</div><div class="v">${c(e.money.bank.balance+Te(e))}</div></div>
        <div><div class="k">Net worth</div><div class="v" style="color:var(--action)">${c($e(e))}</div></div></div>`,h=st(e),r=ke(e),w=nt(e),k=Re(e),R=K[e.world||0],y=ct(e),f=y.length&&y.every(m=>m.claimed);return`<div class="stack">
    ${i}
    <div class="card" style="padding:0;overflow:hidden">
      <div class="row" style="padding:13px 15px;gap:11px">
        <span style="font-size:26px">${R.em}</span>
        <div class="grow"><div class="eyebrow">You are in · ${u(R.rank)}</div>
          <h3 style="font-size:17px;margin:1px 0">${u(R.name)}</h3>
          <p class="small muted">${u(R.blurb)}</p></div>
        <button class="btn ghost sm" data-act="nav" data-arg="worlds">Travel</button>
      </div>
    </div>

    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Today's three</div>
        <p class="small muted">They pay wages into the same wallet as everything else.</p></div>
        <span class="pill ${f?"grow":""}">${y.filter(m=>m.claimed).length}/3</span></div>
      <div class="stack" style="gap:8px;margin-top:11px">
        ${y.map(m=>`<div class="row" style="gap:10px;background:${m.claimed?"var(--grow-tint)":"var(--surface2)"};
          border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="font-size:20px;${m.claimed?"opacity:.6":""}">${m.em}</span>
          <span class="grow" style="min-width:0">
            <b style="font-size:14px;${m.claimed?"opacity:.6":""}">${u(m.t)}</b>
            <div class="small muted">${m.claimed?"Claimed.":u(m.sub)}</div>
            ${m.claimed?"":`<div class="bar" style="height:5px;margin-top:5px"><i style="width:${Math.min(100,m.at/m.n*100)}%"></i></div>`}
          </span>
          ${m.claimed?'<span class="pill grow">✓</span>':m.done?`<button class="btn sm" data-act="claim" data-arg="${m.id}">Take ${c(v(m.pay))}</button>`:`<span class="pill">${m.at}/${m.n}</span>`}
        </div>`).join("")}
      </div>
      ${f&&!e.quests.bonus?`<button class="btn wide" style="margin-top:11px" data-act="questBonus">All three — take ${c(v(12))} more</button>`:""}
      ${e.quests.bonus?'<p class="small muted" style="margin-top:9px">All three done. Fresh ones tomorrow.</p>':""}
    </div>

    ${o?"":`<button class="card" data-act="sub" data-arg="place" style="display:block;width:100%;text-align:left">
      <div class="row"><span style="font-size:24px">${k.em}</span><div class="grow">
        <div class="eyebrow">Independence · what your money earns ÷ what your life costs</div>
        <p style="font-weight:800;font-size:15px">${c(w)} a week towards ${c(r)}</p></div>
        <div class="big" style="font-size:24px;color:${h>=1?"var(--grow)":"var(--action)"}">${Math.round(h*100)}%</div></div>
      <div class="bar" style="margin-top:9px;height:11px"><i style="width:${Math.min(100,h*100)}%;background:${h>=1?"var(--grow)":"var(--action)"}"></i></div>
      <p class="small muted" style="margin-top:7px">${h>=1?"Your money pays for your life. You work because you choose to.":h>=.5?"Half your week is paid for without working. Keep going.":h>=.1?"A tenth of your life pays for itself. That first tenth is the slow one.":"Nothing pays for itself yet. Every subscription you cancel moves this as much as a good year in the market."}</p>
    </button>`}
    <div class="town">
      <div class="town-scroll">${Va(e)}</div>
      <div class="town-cap"><span>🔥 ${e.streak.days.length}</span><span>Lv ${e.learn.level} · ${Qe(e.learn.level)}</span></div>
    </div>

    ${a?`<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint)">
          <div class="eyebrow" style="color:var(--treasure-deep)">The bell is ringing</div>
          <h3 style="margin:2px 0 4px">It's pay day in Bizzington</h3>
          <p class="small" style="color:var(--treasure-deep)">Wages in, bills out, jars filled. The whole street is busy.</p>
          <button class="btn wide" style="margin-top:12px" data-act="payday">🔔 Ring the bell</button>
        </div>`:`<div class="card row">
          <div class="grow"><div class="eyebrow">Pay day</div>
          <p style="font-weight:700">${t===0?"Later today":t+" day"+(t===1?"":"s")+" — "+We(e.money.nextPay)}</p>
          <p class="small muted">${c(me(e))} in, ${c(ke(e))} straight back out.</p></div>
          <button class="btn ghost sm" data-act="sub" data-arg="jars">Check the jars</button>
        </div>`}

    <div class="grid2">
      <button class="card" data-act="postbox" style="text-align:left;border-color:${e.postbox.answered?"var(--line)":"var(--spend)"}">
        <div class="row"><span style="font-size:26px">📬</span><div class="grow">
          <div class="eyebrow">The postbox</div>
          <p style="font-weight:800">${e.postbox.answered?"Emptied for today":"There's a letter"}</p>
          <p class="small muted">${e.postbox.answered?"Another one tomorrow.":"One a day. Thirty seconds."}</p></div></div>
      </button>
      <button class="card" data-act="${s.act}" data-arg="${s.arg||""}" style="text-align:left">
        <div class="row"><span style="font-size:26px">${s.em}</span><div class="grow">
          <div class="eyebrow">Today</div>
          <p style="font-weight:800">${u(s.title)}</p>
          <p class="small muted">${u(s.sub)}</p></div></div>
      </button>
    </div>

    ${n?`<button class="card" data-act="sub" data-arg="goals" style="display:block;width:100%;text-align:left">
      <div class="row"><div class="grow"><div class="eyebrow">In the Build Yard</div>
        <h3 style="margin:2px 0">${u(n.name)}</h3></div>
        <div style="text-align:right"><div class="big">${c(n.saved)}</div>
        <div class="small muted">of ${c(n.target)}</div></div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${Math.min(100,n.saved/n.target*100)}%;background:var(--save)"></i></div>
      <p class="small muted" style="margin-top:7px">${n.saved>=n.target?"Finished — the roof is on.":pt(e,n)+" more pay days at your current Save rate."}</p>
    </button>`:""}

    ${N("pip",rn(e))}
  </div>`}function rn(e){const a=e.learn.level;return a<6?"Your stall's open. There's work on Market Row most days — and learn a card or two, because the shed round the back has four jars in it and they change everything.":a<8?"Shed is yours. Split the money the moment it lands, before it has a chance to become one big pile.":a<11?"Build Yard next. Name something you want and it starts going up floor by floor. Fair warning: raid the fund and the scaffolding comes back down.":a<16?"Bank's open. The clock strikes every pay day and a little interest lands. Boring. Boring is exactly the point.":a<23?"Exchange is open — Bo and Bea are already arguing. Buy from the Grow jar, never the Spend jar.":"Nana's shutters came off. That's your shop now. Buy for less than you sell for, and count the difference honestly."}function ln(e){const a=ie.find(n=>!e.learn.done[n.id]),t=rt(e).filter(n=>!n.done);return a&&(e.learn.level<6||!t.length)?{em:U.find(n=>n.id===a.ch).em,title:a.title,sub:"Three minutes with "+H[a.who].name+".",act:"card",arg:a.id}:t.length?{em:t[0].em,title:t[0].name,sub:"For "+t[0].who+" — "+c(t[0].amt)+".",act:"sub",arg:"wallet"}:a?{em:"📗",title:a.title,sub:"Three minutes with "+H[a.who].name+".",act:"card",arg:a.id}:!e.money.goals.length&&e.learn.level>=8?{em:"🏗️",title:"Name a goal",sub:"It becomes a building you can watch go up.",act:"sub",arg:"goals"}:{em:"🎮",title:"Play a round",sub:"Wages, straight into the same wallet.",act:"nav",arg:"arcade"}}function dn(){const e=Y();return`<div class="stack">
    ${N("pip","Five places, and you walk them in order. You move on when you have finished learning where you are — not when you have earned enough. That is the whole rule.")}
    ${K.map((a,t)=>{const n=at(e,t),o=(e.world||0)===t,s=a.chapters.filter(h=>!ue(e,h)),i=a.chapters.length-s.length;return`<div class="card" style="${o?"border-color:var(--action);box-shadow:var(--sh-raised)":n?"":"opacity:.66"}">
        <div class="row" style="gap:12px">
          <span style="font-size:30px">${n?a.em:"🔒"}</span>
          <div class="grow">
            <div class="eyebrow">${u(a.rank)}${o?" · you are here":""}</div>
            <h3 style="font-size:18px;margin:1px 0 3px">${u(a.name)}</h3>
            <p class="small muted">${u(a.blurb)}</p>
          </div>
          ${o?'<span class="pill gold">here</span>':n?`<button class="btn sm" data-act="travel" data-arg="${t}">Go →</button>`:""}
        </div>
        <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
          <span class="pill">opens ${u(a.opens)}</span>
          <span class="grow"></span>
          <span class="small muted">${i}/${a.chapters.length} chapters</span>
        </div>
        <div class="bar" style="margin-top:6px"><i style="width:${i/a.chapters.length*100}%;background:${i===a.chapters.length?"var(--grow)":"var(--action)"}"></i></div>
        ${!n&&t>0?`<p class="small muted" style="margin-top:8px">Finish
          ${K[t-1].chapters.filter(h=>!ue(e,h)).map(h=>"“"+u(U.find(r=>r.id===h).title)+"”").join(" and ")||"the last stretch"}
          in ${u(K[t-1].name)} to walk on.</p>`:""}
        ${o&&s.length?`<p class="small muted" style="margin-top:8px">Still to learn here:
          ${s.map(h=>"<b>"+u(U.find(r=>r.id===h).title)+"</b>").join(", ")}.</p>`:""}
        ${o&&!s.length&&t<K.length-1?`<p class="small" style="margin-top:8px;color:var(--grow);font-weight:700">
          Everything here is learned. The road is open.</p>`:""}
      </div>`}).join("")}
  </div>`}function cn(){const e=Y();if(e.learn.openCard){const n=ie.find(o=>o.id===e.learn.openCard);if(n)return un(n)}if(l.shelf==="words")return pn();const a=xa(e),t=et(e.learn.level);return`<div class="stack">
    <div class="card">
      <div class="row"><div class="grow">
        <div class="eyebrow">${t.em} ${t.name} · level ${e.learn.level} of 30</div>
        <h2 style="margin:2px 0 0">${e.learn.xp} XP</h2>
        <p class="small muted">Learning ${u(t.of)}.</p></div>
        <div class="small muted" style="text-align:right">${a.need} XP to<br>level ${e.learn.level+1}</div></div>
      <div class="bar" style="margin-top:10px"><i style="width:${a.pct*100}%"></i></div>
      <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">
        ${ze.map(n=>`<span class="pill ${e.learn.level>=n.at?"gold":""}">${n.em} ${n.name}<span style="font-family:var(--mono);opacity:.7"> L${n.at}</span></span>`).join("")}
      </div>
    </div>
    <div class="grid2">
      <button class="card" data-act="shelf" data-arg="words" style="text-align:left">
        <div class="row"><span style="font-size:24px">📖</span><div class="grow">
        <p style="font-weight:800">Money Words</p><p class="small muted">${Xe.length} terms, in plain English.</p></div></div></button>
      <button class="card" data-act="nav" data-arg="arcade" style="text-align:left">
        <div class="row"><span style="font-size:24px">🎮</span><div class="grow">
        <p style="font-weight:800">Practise it</p><p class="small muted">Six games. Wages into the same wallet.</p></div></div></button>
    </div>
    ${N("pip","Every card ends with one question. Get it right and the town grows. Get it wrong and I tell you why — that counts too.")}
    <div class="chapts">
      ${U.map(n=>{const o=n.cards.filter(i=>e.learn.done[i.id]).length,s=e.learn.level<n.lv;return`<div class="card pad0" ${s?'style="opacity:.62"':""}>
          <div style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line-soft)">
            <span style="font-size:24px">${s?"🔒":n.em}</span>
            <div class="grow"><h3 style="font-size:18px">${u(n.title)}</h3>
            <p class="small muted">${s?"Opens at level "+n.lv+" · "+n.rank:u(n.blurb)}</p>
            ${$t(n.id)?`<p class="small" style="color:var(--action);font-weight:700;margin-top:2px">
              ${o===n.cards.length?"✓ opened ":"Finish this to open "}${u($t(n.id))}</p>`:""}</div>
            <span class="pill ${o===n.cards.length?"grow":""}">${o}/${n.cards.length}</span>
          </div>
          ${s?"":n.cards.map(i=>{const h=e.learn.done[i.id];return`<button data-act="card" data-arg="${i.id}" style="display:flex;gap:11px;align-items:center;width:100%;padding:11px 16px;border-top:1px solid var(--line-soft)">
              <span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;font-size:12px;font-weight:800;background:${h?"var(--grow)":"var(--tint)"};color:${h?"#fff":"var(--muted)"}">${h?"✓":""}</span>
              <span class="grow" style="font-weight:700;font-size:14.5px">${u(i.title)}</span>
              <span class="small muted">${H[i.who].name}</span></button>`}).join("")}
        </div>`}).join("")}
    </div>
  </div>`}const hn={c3:"the Jar Shed and the Build Yard",c5:"the Bank",c6:"borrowing",c7:"the Exchange",c8:"Bizz & Co"};function $t(e){return hn[e]}function un(e){const a=Y(),t=a.learn.drill,n=tt(e);return`<div class="stack">
    <button class="small muted" data-act="closeCard">← All chapters</button>
    <div class="card stack">
      <div class="eyebrow">${u(U.find(o=>o.id===e.ch).title)}</div>
      <h2>${u(e.title)}</h2>
      ${N(e.who,e.teach)}
      <div style="background:var(--tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px;border-left:3px solid var(--action)">
        <span class="eyebrow">For instance</span><br>${u(e.eg)}</div>
    </div>
    <div class="card stack">
      <div class="eyebrow">One question</div>
      <h3 style="font-size:18px">${u(e.drill.q)}</h3>
      <div class="stack" style="gap:8px">
        ${n.opts.map((o,s)=>{let i="";return t&&t.card===e.id&&(i=s===n.answer?" ok":s===t.pick?" no":""),`<button class="opt${i}" data-act="answer" data-arg="${s}" ${t&&t.card===e.id?"disabled":""}>
            <span class="k">${"ABCD"[s]}</span>${u(o)}</button>`}).join("")}
      </div>
      ${t&&t.card===e.id?`<div style="background:${t.right?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:12px 14px;font-size:14px">
          <b>${t.right?"That’s it.":"Not quite — and this is the useful bit:"}</b> ${u(e.drill.why)}</div>
        <button class="btn wide" data-act="cardDone" data-arg="${e.id}">Take it back to town →</button>`:""}
    </div>
  </div>`}function pn(){const e=(l.query||"").toLowerCase(),a=Xe.filter(t=>!e||t[0].toLowerCase().includes(e)||t[1].toLowerCase().includes(e));return`<div class="stack">
    <button class="small muted" data-act="shelf" data-arg="">← Learn</button>
    <div class="card">
      <div class="eyebrow">Money Words</div>
      <input data-field="query" data-live="1" value="${u(l.query||"")}" placeholder="Search ${Xe.length} terms"
        style="margin-top:8px;padding:11px 13px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650;width:100%">
    </div>
    ${a.length===0?'<div class="card"><p class="muted">Nothing by that name yet.</p></div>':""}
    <div class="card pad0">
      ${a.map((t,n)=>`<div style="padding:13px 16px;${n?"border-top:1px solid var(--line-soft)":""}">
        <b style="font-size:15px">${u(t[0])}</b>
        <p style="font-size:14px;margin-top:2px">${u(t[1])}</p>
        <p class="small muted" style="margin-top:3px">${u(t[2])}</p></div>`).join("")}
    </div>
  </div>`}function mn(){const e=Y(),a={place:"Home",wallet:"Wallet",jars:"Jars",goals:"Goals",bank:"Bank",portfolio:"Exchange",business:"Your shop"},t=Le.map(i=>({k:i.sub,n:a[i.sub]||i.name}));let n=l.s.ui.sub;t.find(i=>i.k===n&&Oe(e,i.k))||(n="wallet");const o=`<div style="display:flex;gap:7px;flex-wrap:wrap;padding:11px;background:var(--tint);border-radius:var(--r-md);border:1px solid var(--line-soft)">
    ${t.map(i=>{const h=Oe(e,i.k);return`<button data-act="${h?"sub":"lockedSub"}" data-arg="${i.k}"
        style="padding:7px 12px;border-radius:999px;font-size:13px;font-weight:800;border:1px ${h?"solid":"dashed"} var(--line);
        background:${n===i.k?"var(--action)":h?"var(--surface)":"transparent"};
        color:${n===i.k?"var(--action-ink)":h?"var(--ink)":"var(--muted)"}">
        ${h?"":"🔒 "}${i.n}</button>`}).join("")}</div>`,s=n==="place"?gn():n==="jars"?fn():n==="goals"?bn():n==="bank"?vn():n==="portfolio"?wn():n==="business"?kn():yn();return`<div class="stack">${o}${s}</div>`}function yn(){const e=Y(),a=rt(e);return`<div class="stack">
    <div class="card">
      <div class="eyebrow">In your pocket</div>
      <div class="big" style="font-size:38px;color:var(--treasure-deep)">${c(e.money.wallet)}</div>
      <p class="small muted">${e.band==="sprout"?"This can never go below zero — debt comes later, when it is taught.":"Everything below is dated, because a statement you cannot read is a statement you cannot argue with."}</p>
    </div>
    <div class="card">
      <div class="eyebrow">Work going on Market Row today</div>
      <p class="small muted" style="margin:3px 0 10px">Each job once a day. You are selling an hour, not a thing.</p>
      <div class="stack" style="gap:8px">
        ${a.map(t=>`<div class="row" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
          <span style="font-size:20px">${t.em}</span>
          <span class="grow"><b style="font-size:14px">${u(t.name)}</b><br><span class="small muted">for ${u(t.who)}</span></span>
          ${t.done?'<span class="pill grow">done today</span>':`<button class="btn sm" data-act="job" data-arg="${t.id}">${c(t.amt)}</button>`}
        </div>`).join("")}
      </div>
    </div>
    <div class="card pad0">
      <div style="padding:12px 16px;border-bottom:1px solid var(--line-soft);display:flex;align-items:center">
        <span class="eyebrow grow">Every movement</span>
        <button class="small muted" data-act="print">🖨 Statement</button></div>
      ${e.money.txns.slice(0,18).map(t=>`<div style="display:flex;gap:10px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line-soft)">
        <span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:13px;flex:0 0 auto;background:${t.kind==="in"?"var(--grow-tint)":"var(--spend-tint)"};color:${t.kind==="in"?"var(--grow)":"var(--spend)"}">${t.kind==="in"?"↓":"↑"}</span>
        <span class="grow" style="font-weight:650;font-size:14px">${u(t.label)}<br><span class="small muted">${Pa(t.t)}</span></span>
        <span class="tabnum" style="font-weight:800;color:${t.kind==="in"?"var(--grow)":"var(--ink)"}">${t.kind==="in"?"+":"−"}${c(t.amt)}</span>
      </div>`).join("")}
    </div>
  </div>`}function gn(){const e=Y(),a=Re(e),t=xe(e),n=ke(e),o=me(e),s=o-n,i=je[e.home.tier+1],h=i?ot(e,e.home.tier+1):null,r=e.home.mortgage;return`<div class="stack">
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
          <b style="color:var(--grow)">+${c(o)}</b></div>
        ${t.map(w=>`<div class="row"><span class="grow muted">${u(w.name)}</span><b>−${c(w.amt)}</b></div>`).join("")}
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">What's left to live on</span>
          <span class="big" style="font-size:22px;color:${s>0?"var(--ink)":"var(--spend)"}">${c(s)}</span></div>
      </div>
      <p class="small muted" style="margin-top:9px">${s>0?"That leftover is the only part you get to choose about. Everything above it already has a name.":"Costs are bigger than income. That gap has to come from somewhere — savings, or somebody else."}</p>
    </div>

    ${r?`<div class="card" style="border-color:var(--save)">
      <div class="eyebrow">Your mortgage</div>
      <div class="row" style="margin-top:3px"><div class="grow">
        <div class="big" style="font-size:24px">${c(r.owed)}</div>
        <p class="small muted">left to pay · ${c(r.perWeek)} every pay day</p></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.round(r.paid/(r.paid+r.owed)*100)}%;background:var(--save)"></i></div>
      <p class="small muted" style="margin-top:7px">This one ends. Rent never does — that is the whole difference between renting and owning.</p>
    </div>`:""}

    ${i?`<div class="card">
      <div class="eyebrow">Next along the street</div>
      <div class="row" style="margin-top:4px"><span style="font-size:28px">${i.em}</span>
        <div class="grow"><b style="font-size:16px">${u(i.name)}</b>
          <p class="small muted">${u(i.blurb)}</p></div></div>
      <div class="stack" style="gap:5px;margin-top:11px;font-size:14px">
        <div class="row"><span class="grow muted">Deposit, once</span><b>${c(v(i.deposit))}</b></div>
        <div class="row"><span class="grow muted">Every week after that</span>
          <b>${c(v(i.rent)+i.bills.reduce((w,k)=>w+v(k.units),0)+v(i.food))}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Which would leave you</span>
          <b style="color:${o-(v(i.rent)+i.bills.reduce((w,k)=>w+v(k.units),0)+v(i.food))>0?"var(--ink)":"var(--spend)"}">
            ${c(o-(v(i.rent)+i.bills.reduce((w,k)=>w+v(k.units),0)+v(i.food)))} a week</b></div>
      </div>
      <button class="btn wide" style="margin-top:12px" data-act="move" data-arg="${e.home.tier+1}" ${h.ok?"":"disabled"}>
        ${h.ok?"Take it →":"Need "+c(h.deposit||0)+" for the deposit"}</button>
      <p class="small muted" style="margin-top:8px">Nobody stops you moving somewhere you can barely afford. The number is right there, and the choice is yours.</p>
    </div>`:`<div class="card" style="text-align:center;padding:24px">
      <div style="font-size:34px">🏡</div>
      <h3 style="margin:8px 0 4px">You own where you live</h3>
      <p class="muted small">Top of the street. The only thing left to grow is what your money earns while you sleep.</p></div>`}

    ${N("nana",e.home.tier===0?"A room of your own and rent going out on Friday. Everything else in this town is built on that one fact.":"Notice what changed when you moved — not just the rent. Every room you add adds a bill behind it.")}
  </div>`}const O={spend:["Spend","var(--spend)","for now"],save:["Save","var(--save)","for soon"],grow:["Grow","var(--grow)","for far away"],give:["Give","var(--give)","for someone else"]};function fn(){const e=Y(),a=e.money.jars,t=e.money.rules,n=Math.max(1,...Object.values(a)),o=t.spend+t.save+t.grow+t.give;return`<div class="stack">
    ${N("nana","Split it the moment it lands. What sits in one pile gets spent as one pile — that is the entire trick, and it is sixty years old.")}
    <div class="card">
      <div class="jars">
        ${Object.keys(O).map(s=>`<div class="jar">
          <div class="jarglass"><div class="jarfill" style="height:${Math.max(4,a[s]/n*100)}%;background:${O[s][1]};opacity:.85"></div></div>
          <div class="jarlbl">${O[s][0]}<br><span class="jaramt">${c(a[s])}</span></div>
          <div class="row" style="gap:4px">
            <button class="btn ghost sm" style="padding:5px 9px" data-act="jarOut" data-arg="${s}" aria-label="Take out of ${O[s][0]}">−</button>
            <button class="btn sm" style="padding:5px 9px" data-act="jarIn" data-arg="${s}" aria-label="Put into ${O[s][0]}">+</button>
          </div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:12px">Buttons move ${c(v(2))} at a time, out of your wallet (${c(e.money.wallet)}).</p>
    </div>
    ${e.learn.level<11?`<div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on ${We(e.money.nextPay)}</div>
      <p class="small muted">Every twenty coins that arrive, split like this:</p>
      <div class="stack" style="gap:9px">
        ${Object.keys(O).map(s=>{const i=Math.round(t[s]/5);return`<div class="row" style="gap:9px">
            <span style="width:58px;font-weight:800;font-size:13.5px;color:${O[s][1]}">${O[s][0]}</span>
            <span class="grow" style="display:flex;gap:3px;flex-wrap:wrap">
              ${Array.from({length:20},(h,r)=>`<i style="width:13px;height:13px;border-radius:50%;display:block;background:${r<i?O[s][1]:"var(--line)"}"></i>`).join("")}
            </span>
            <div class="stepper"><button data-act="rule" data-arg="${s}:-5" aria-label="less ${O[s][0]}">−</button>
            <span class="n">${i}</span>
            <button data-act="rule" data-arg="${s}:5" aria-label="more ${O[s][0]}">+</button></div>
          </div>`}).join("")}
      </div>
      <p class="small ${o===100?"muted":""}" style="${o===100?"":"color:var(--spend);font-weight:700"}">
        ${o===100?"Twenty coins, all spoken for. Good.":"That is "+Math.round(o/5)+" coins out of twenty. Every coin has to go somewhere."}</p>
    </div>`:`<div class="card stack">
      <div class="eyebrow">Pay-day rule — this fires by itself on ${We(e.money.nextPay)}</div>
      ${Object.keys(O).map(s=>`<div class="row">
        <span style="width:58px;font-weight:800;font-size:13.5px;color:${O[s][1]}">${O[s][0]}</span>
        <div class="grow bar"><i style="width:${t[s]}%;background:${O[s][1]}"></i></div>
        <div class="stepper"><button data-act="rule" data-arg="${s}:-5" aria-label="less ${O[s][0]}">−</button>
        <span class="n">${t[s]}%</span>
        <button data-act="rule" data-arg="${s}:5" aria-label="more ${O[s][0]}">+</button></div>
      </div>`).join("")}
      <p class="small" style="${o===100?"color:var(--muted)":"color:var(--spend);font-weight:700"}">
        ${o===100?"Adds to 100%. Good.":"Adds to "+o+"%. It has to be 100 — the money has to go somewhere."}</p>
    </div>`}
  </div>`}function bn(){const e=Y();return`<div class="stack">
    ${N("pip","Name the thing and price it. Dividing turns a wish into a date — and the yard shows the date, not encouragement.")}
    <div class="card stack">
      <div class="eyebrow">Start something</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="goalName" placeholder="What do you want?" value="${u(l.fields.goalName||"")}"
          style="flex:2 1 150px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="goalAmt" inputmode="numeric" placeholder="${jt()}" value="${u(l.fields.goalAmt||"")}"
          style="flex:1 1 90px;min-width:0;padding:11px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn" data-act="addGoal">Add</button>
      </div>
    </div>
    ${e.money.goals.length===0?`<div class="card" style="text-align:center;padding:26px">
        <div style="font-size:34px">🏗️</div><p class="muted" style="margin-top:6px">The yard is empty. Nothing is being built.</p></div>`:""}
    ${e.money.goals.map(a=>{const t=Math.min(1,a.saved/a.target);return`<div class="card">
        <div class="row"><div class="grow"><h3 style="font-size:18px">${u(a.name)}${a.done?' <span class="pill grow">built</span>':""}</h3>
          <p class="small muted">${a.done?"Finished.":pt(e,a)+" pay days at your Save rate"}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:20px">${c(a.saved)}</div>
          <div class="small muted">of ${c(a.target)}</div></div></div>
        <div class="bar" style="margin-top:10px"><i style="width:${t*100}%;background:var(--save)"></i></div>
        <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
          <button class="btn sm" data-act="fundGoal" data-arg="${a.id}" ${e.money.jars.save<=0||a.done?"disabled":""}>Put in ${c(Math.min(v(5),Math.max(0,e.money.jars.save)))} from Save</button>
          <button class="btn ghost sm" data-act="autoGoal" data-arg="${a.id}">${a.auto?"Auto "+c(a.auto)+"/week":"Auto-save each week"}</button>
          <span class="grow"></span>
          <button class="btn ghost sm" data-act="raidGoal" data-arg="${a.id}" ${a.saved<=0?"disabled":""}>Take it back</button>
        </div>
        ${a.saved>0&&!a.done?'<p class="small muted" style="margin-top:8px">Taking it back is allowed. The scaffolding comes down on the town, though — that part is the lesson.</p>':""}
      </div>`}).join("")}
  </div>`}function vn(){const e=Y(),a=e.money.bank,t=a.loan,n=mt(e,40,8),o=[1,2,5,10].map(s=>({y:s,v:Math.round(Math.max(a.balance,v(50))*Math.pow(1+a.rate,s*52))}));return`<div class="stack">
    ${N("nana","Interest is rent on money. Leave it here and the bank pays you rent for using it. Borrow, and you pay. Same idea — the only question is which side you are standing on.")}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">In the vault</div>
        <div class="big" style="font-size:32px;color:var(--save)">${c(a.balance)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Every pay day</div>
        <div class="big" style="font-size:20px">${(a.rate*100).toFixed(0)}%</div></div></div>
      <p class="small muted" style="margin-top:8px">Next pay day this adds <b>${c(Math.round(a.balance*a.rate))}</b> — that is ${c(a.balance)} × ${(a.rate*100).toFixed(0)}%, shown rather than hidden.</p>
      <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
        <button class="btn sm" data-act="bankIn" ${e.money.jars.save<=0?"disabled":""}>Deposit ${c(Math.min(v(10),Math.max(0,e.money.jars.save)))} from Save</button>
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
        <div class="big" style="font-size:26px">${c(t.owed)}</div>
        <p class="small muted">still to repay of ${c(t.amount+t.cost)} · ${c(t.perWeek)} goes out each pay day</p></div></div>
      <div class="bar" style="margin-top:8px"><i style="width:${Math.round(t.paid/(t.amount+t.cost)*100)}%;background:var(--spend)"></i></div>
      <button class="btn wide" style="margin-top:11px" data-act="repay" ${e.money.wallet<=0?"disabled":""}>Pay off ${c(Math.min(e.money.wallet,t.owed))} now</button>
      <p class="small muted" style="margin-top:8px">Paying early costs you nothing extra here and clears it sooner. Missing a pay day costs trust, not dignity.</p>
    </div>`:`<div class="card">
      <div class="eyebrow">Borrowing</div>
      <h3 style="font-size:18px;margin:3px 0 6px">${c(n.amount)} over ${n.weeks} pay days</h3>
      <div class="stack" style="gap:5px;font-size:14px">
        <div class="row"><span class="grow muted">You receive</span><b>${c(n.amount)}</b></div>
        <div class="row"><span class="grow muted">You pay back, each pay day</span><b>${c(n.perWeek)}</b></div>
        <div class="row"><span class="grow muted">You hand over in total</span><b>${c(n.total)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">So borrowing costs</span>
          <span class="big" style="font-size:20px;color:var(--spend)">${c(n.cost)}</span></div>
      </div>
      <button class="btn wide" style="margin-top:12px" data-act="loan">Take the loan</button>
      <p class="small muted" style="margin-top:8px">The total is shown before you agree, which is the whole of chapter six. A higher trust score makes the same loan cheaper.</p>
    </div>`}

    <div class="card">
      <div class="eyebrow">The snowball, on this balance</div>
      <div class="grid3" style="margin-top:8px">
        ${o.map(s=>`<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">${s.y} year${s.y>1?"s":""}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${c(s.v)}</div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own made-up rate compounding weekly — not a real bank's, and not a forecast.</p>
    </div>
  </div>`}function wn(){const e=Y(),a=e.market.step,t=Te(e),n=fa(e);return`<div class="stack">
    ${N(e.market.lastMove>=0?"bo":"bea",e.market.lastMove>=0?"Up on the week! I said it would be. I say that every week.":"Down on the week. I said so. I also say that every week — one of us is always right and neither of us knows.")}
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Your holdings</div>
        <div class="big" style="font-size:30px;color:var(--grow)">${c(t)}</div></div>
        <div style="text-align:right"><div class="eyebrow">Grow jar</div>
        <div class="big" style="font-size:20px">${c(e.money.jars.grow)}</div></div></div>
      <p class="small muted" style="margin-top:6px">${n===0?"Nothing owned yet. Buy from the Grow jar — that is money you will not need soon.":n===1?"One thing. Your whole week now depends on somebody else’s Tuesday.":"Spread across "+n+". Bad news in one can no longer sink the lot."}</p>
    </div>
    ${J.map(o=>{const s=e.market.series[o.id],i=s[a],h=s[Math.max(0,a-1)],r=(i-h)/h,w=e.market.holdings[o.id]||0;return`<div class="card">
        <div class="row"><span style="font-size:22px">${o.em}</span>
          <div class="grow"><b style="font-size:15px">${u(o.name)}</b>
          <p class="small muted">${u(o.desc)}</p></div>
          <div style="text-align:right"><div style="font-weight:800;font-variant-numeric:tabular-nums">${c(i)}</div>
          <div class="small" style="color:${r>=0?"var(--grow)":"var(--spend)"};font-weight:700">${r>=0?"▲":"▼"} ${Math.abs(r*100).toFixed(1)}%</div></div></div>
        ${Be(s.slice(0,a+1),300,40,r>=0?"var(--grow)":"var(--spend)")}
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:4px">
          <span class="pill">${w>0?"you hold "+c(w*i):"not held"}</span>
          <span class="grow"></span>
          <button class="btn sm" data-act="buy" data-arg="${o.id}" ${e.money.jars.grow<v(5)?"disabled":""}>Buy ${c(v(5))}</button>
          <button class="btn ghost sm" data-act="sell" data-arg="${o.id}" ${w<=0?"disabled":""}>Sell all</button>
        </div></div>`}).join("")}
    <div class="card">
      <div class="eyebrow">⏳ The Time Machine</div>
      <p class="small muted" style="margin:4px 0 10px">The only place in Bizzington where the clock is compressed — because compounding cannot be felt at human speed, and a child who never feels it has not learned it.</p>
      <div class="grid3">
        ${[1,5,10,30].map(o=>`<div style="background:var(--tint);border-radius:var(--r-md);padding:10px 12px">
          <div class="small muted">in ${o} year${o>1?"s":""}</div>
          <div style="font-weight:800;font-variant-numeric:tabular-nums">${c(Math.round(t*Math.pow(1.07,o)))}</div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:9px">Bizzington's own simulated rate. Not advice, not a forecast, and not any real market.</p>
    </div>
  </div>`}function kn(){const e=Y();if(!e.biz)return`<div class="stack">
      ${N("nana","Shutters are off. I have left you forty in the till and the rent is due whether anybody comes or not. Buy for less than you sell for, and count the difference honestly.")}
      <div class="card" style="text-align:center;padding:26px">
        <div style="font-size:40px">🏪</div>
        <h3 style="margin:8px 0 4px">Bizz &amp; Co</h3>
        <p class="muted small">Stock it, price it, open the doors, and find out what the weather thinks of your plan.</p>
        <button class="btn wide" style="margin-top:14px" data-act="openBiz">Take the keys</button>
      </div></div>`;const a=e.biz,t=a.log[0];be.find(o=>o.id===a.weather);const n=G.reduce((o,s)=>o+(a.stock[s.id]||0)*v(s.cost),0);return`<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Day ${a.day} · Bizz &amp; Co</div>
        <div class="big" style="font-size:30px">${c(a.cash)}</div>
        <p class="small muted">in the till · ${c(n)} sitting in stock · rent ${c(a.rent)} a day</p></div></div>
      <div class="row" style="margin-top:11px;gap:8px;flex-wrap:wrap">
        <button class="btn" data-act="bizTrade">Open for the day →</button>
        <button class="btn ghost sm" data-act="bizCashOut" ${a.cash<=v(20)?"disabled":""}>Take the profit home</button>
      </div>
    </div>
    ${t?`<div class="card" style="border-color:${t.profit>=0?"var(--grow)":"var(--spend)"}">
      <div class="eyebrow">Yesterday · ${u(be.find(o=>o.id===t.weather).name)} ${be.find(o=>o.id===t.weather).em}</div>
      <div class="stack" style="gap:5px;margin-top:6px;font-size:14px">
        <div class="row"><span class="grow muted">Revenue — everything that came in</span><b>${c(t.revenue)}</b></div>
        <div class="row"><span class="grow muted">Rent — arrives whether you sold anything</span><b>−${c(t.rent)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Profit</span>
          <span class="big" style="font-size:20px;color:${t.profit>=0?"var(--grow)":"var(--spend)"}">${t.profit>=0?"+":"−"}${c(Math.abs(t.profit))}</span></div>
      </div>
      ${Object.keys(t.spoiled||{}).length?`<p class="small" style="color:var(--spend);margin-top:8px;font-weight:650">
        ${Object.keys(t.spoiled).map(o=>t.spoiled[o]+" "+G.find(s=>s.id===o).name.toLowerCase()+" melted").join(", ")} — stock you paid for and cannot sell.</p>`:""}
    </div>`:N("pip","Nothing has happened yet. Buy some stock, set your prices, then open the doors.")}
    <div class="card">
      <div class="eyebrow">Stock and prices</div>
      <p class="small muted" style="margin:3px 0 10px">Buy low, price it yourself. Put the price up and fewer people buy — the question is whether you end the day with more.</p>
      <div class="stack" style="gap:10px">
        ${G.map(o=>{const s=a.stock[o.id]||0,i=v(o.cost),h=a.prices[o.id],r=h-i;return`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:11px">
            <div class="row"><span style="font-size:20px">${o.em}</span>
              <span class="grow"><b style="font-size:14.5px">${u(o.name)}</b><br>
                <span class="small muted">${u(o.desc)}</span></span>
              <span class="pill">${s} in stock</span></div>
            <div class="row" style="margin-top:9px;gap:8px;flex-wrap:wrap">
              <button class="btn ghost sm" data-act="bizBuy" data-arg="${o.id}" ${i*5>a.cash?"disabled":""}>Buy 5 for ${c(i*5)}</button>
              <span class="small muted">${c(i)} each</span>
              <span class="grow"></span>
              <span class="small muted">sell at</span>
              <div class="stepper">
                <button data-act="bizPrice" data-arg="${o.id}:-1" aria-label="lower the price of ${u(o.name)}">−</button>
                <span class="n">${c(h)}</span>
                <button data-act="bizPrice" data-arg="${o.id}:1" aria-label="raise the price of ${u(o.name)}">+</button></div>
            </div>
            <p class="small ${r>0?"muted":""}" style="margin-top:6px;${r>0?"":"color:var(--spend);font-weight:700"}">
              ${r>0?"Margin "+c(r)+" each — before the rent.":"You are selling below what it cost you."}</p>
          </div>`}).join("")}
      </div>
    </div>
    ${a.log.length>1?`<div class="card">
      <div class="eyebrow">The last few days</div>
      <div class="stack" style="gap:5px;margin-top:8px">
        ${a.log.slice(0,8).map(o=>`<div class="row" style="font-size:13.5px">
          <span style="width:52px" class="muted">Day ${o.day}</span>
          <span style="width:26px">${be.find(s=>s.id===o.weather).em}</span>
          <span class="grow muted">${c(o.revenue)} in</span>
          <b style="color:${o.profit>=0?"var(--grow)":"var(--spend)"}">${o.profit>=0?"+":"−"}${c(Math.abs(o.profit))}</b></div>`).join("")}
      </div></div>`:""}
  </div>`}function $n(){const e=Y(),a=Date.now();return`<div class="stack">
    ${N("mags","Everything here is lovely and none of it is necessary. I have written what else the money could have been under each price, which my old boss said was commercial suicide.")}
    ${Pt.map(t=>{const n=v(t.units),o=e.shop.owned.includes(t.id),s=Math.max(1,(e.family.allowance!=null?e.family.allowance:e.money.wage)*e.money.rules.spend/100),i=Math.max(1,Math.round(n/s)),h=Math.round(n*Math.pow(1.07,10)),r=e.shop.cooling[t.id],w=r&&a<r,k=w?Math.ceil((r-a)/36e5):0,R=e.money.wallet+e.money.jars.spend>=n;return`<div class="card">
        <div class="row"><span style="font-size:28px">${t.em}</span>
          <div class="grow"><b style="font-size:15.5px">${u(t.name)}</b>
            <p class="small muted">${u(t.desc)}</p></div>
          <div style="text-align:right"><div class="big" style="font-size:19px">${c(n)}</div></div></div>
        <div style="background:var(--treasure-tint);color:var(--treasure-deep);border-radius:var(--r-md);padding:9px 12px;margin-top:10px;font-size:13px;font-weight:650">
          That's <b>${i} week${i>1?"s":""}</b> of your Spend jar — or <b>${c(h)}</b> in ten years if it went in the Grow jar instead.</div>
        <div class="row" style="margin-top:10px"><span class="grow"></span>
          ${o?'<span class="pill grow">yours</span>':w?`<span class="pill">think it over · ${k}h left</span>`:e.family.coolOff&&!r?`<button class="btn ghost sm" data-act="cool" data-arg="${t.id}">Think it over →</button>`:`<button class="btn sm" data-act="buyItem" data-arg="${t.id}" ${R?"":"disabled"}>Buy it anyway</button>`}
        </div></div>`}).join("")}
    <p class="small muted" style="text-align:center">Nothing here costs real money, and there is no path from this screen to a payment form. That is a rule, not an oversight.</p>
  </div>`}function xn(){const e=Y(),a=e.history.map(s=>s.v),t=e.postbox.log.filter(s=>s.scam&&s.safe).length,n=e.postbox.log.filter(s=>s.scam).length,o=et(e.learn.level);return`<div class="stack">
    <div class="card">
      <div class="eyebrow">Net worth, every decision so far</div>
      <div class="big" style="font-size:32px;color:var(--action)">${c($e(e))}</div>
      ${Be(a.length>1?a:[0,$e(e)],300,54,"var(--action)")}
      <p class="small muted">The one chart a card app can't draw: it only has your last statement, and this has every decision since you opened your stall.</p>
    </div>
    <div class="grid3">
      <div class="card"><div class="eyebrow">Streak</div><div class="big">🔥 ${e.streak.days.length}</div><p class="small muted">days in a row</p></div>
      <div class="card"><div class="eyebrow">Rank</div><div class="big" style="font-size:20px">${o.em} ${o.name}</div><p class="small muted">level ${e.learn.level} of 30</p></div>
      <div class="card"><div class="eyebrow">Letters</div><div class="big">${e.postbox.log.length}</div><p class="small muted">${n?t+" of "+n+" scams spotted":"no scams yet"}</p></div>
    </div>
    <div class="card">
      <div class="eyebrow">Chapters</div>
      <div class="stack" style="gap:7px;margin-top:9px">
        ${U.map(s=>{const i=s.cards.filter(h=>e.learn.done[h.id]).length;return`<div class="row" style="font-size:13.5px"><span style="width:22px">${s.em}</span>
            <span class="grow">${u(s.title)}</span>
            <div class="bar" style="width:88px"><i style="width:${i/s.cards.length*100}%;background:${i===s.cards.length?"var(--grow)":"var(--action)"}"></i></div>
            <span class="muted tabnum" style="width:34px;text-align:right">${i}/${s.cards.length}</span></div>`}).join("")}
      </div>
    </div>
    <button class="card" data-act="nav" data-arg="parents" style="display:block;width:100%;text-align:left">
      <div class="row"><span style="font-size:24px">👪</span><div class="grow">
        <p style="font-weight:800">The grown-up's page</p>
        <p class="small muted">What they learned, what they decided, Family Mode, and a printable week.</p></div>
        <span class="muted">→</span></div>
    </button>
  </div>`}function Tn(){const e=Y(),a=l.s,t=An(e);return`<div class="stack">
    <div class="card">
      <div class="eyebrow">For the grown-up</div>
      <h2 style="margin:2px 0 4px">${u(e.name)}'s week</h2>
      <p class="small muted">Observation, never a grade on the child. The simulator is a window into instincts no quiz gives you.</p>
    </div>

    <div class="card">
      <div class="eyebrow">What they learned</div>
      <div class="stack" style="gap:6px;margin-top:8px">
        ${t.learned.length?t.learned.map(n=>`<p class="small">📗 ${u(n)}</p>`).join(""):'<p class="small muted">Nothing new this week.</p>'}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">What they decided</div>
      <div class="stack" style="gap:8px;margin-top:8px">
        ${t.decisions.map(n=>`<div class="row" style="align-items:flex-start;gap:9px">
          <span style="font-size:15px">${n.em}</span><p class="small grow">${n.t}</p></div>`).join("")}
      </div>
    </div>

    <div class="card">
      <div class="eyebrow">Talk together</div>
      <div class="stack" style="gap:7px;margin-top:8px">
        ${t.prompts.map(n=>`<p class="small">💬 ${u(n)}</p>`).join("")}
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
          <span class="n">${e.family.allowance==null?"off":c(e.family.allowance)}</span>
          <button data-act="allow" data-arg="1" aria-label="more allowance">+</button></div>
      </div>
      <p class="small muted">${e.family.allowance==null?"Off — the town pays its own wage of "+c(e.money.wage)+". Some households have no allowance and the app must never assume one.":"On — replaces the town wage on pay day."}</p>
      <div class="sep"></div>
      <div class="row"><span class="small grow">Pay day falls on</span>
        <select data-field="payday" data-live="1" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface2);font-weight:700">
          ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((n,o)=>`<option value="${o}" ${e.family.payWeekday===o?"selected":""}>${n}</option>`).join("")}
        </select></div>
      <div class="row"><span class="small grow">"Think it over" before big buys</span>
        <button class="btn ${e.family.coolOff?"":"ghost"} sm" data-act="coolOff">${e.family.coolOff?"On":"Off"}</button></div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Jobs at home</div>
      <p class="small muted">Anything here that is ticked pays into the town on pay day. You tick it; the app never checks.</p>
      ${(e.family.chores||[]).map((n,o)=>`<div class="row" style="gap:9px">
        <button class="btn ${n.done?"":"ghost"} sm" data-act="chore" data-arg="${o}">${n.done?"✓":""}</button>
        <span class="grow" style="font-weight:650">${u(n.name)}</span>
        <span class="tabnum muted">${c(n.amt)}</span>
        <button class="small muted" data-act="choreDel" data-arg="${o}" aria-label="remove">✕</button></div>`).join("")}
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input data-field="choreName" placeholder="Job" value="${u(l.fields.choreName||"")}"
          style="flex:2 1 130px;min-width:0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <input data-field="choreAmt" inputmode="numeric" placeholder="${jt()}" value="${u(l.fields.choreAmt||"")}"
          style="flex:1 1 80px;min-width:0;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);font-weight:650">
        <button class="btn sm" data-act="choreAdd">Add</button>
      </div>
    </div>

    <div class="card stack">
      <div class="eyebrow">Children in this household</div>
      ${a.kids.map((n,o)=>`<div class="row" style="gap:9px">
        <span class="grow" style="font-weight:${o===a.active?800:650}">${u(n.name)}
          <span class="small muted"> · level ${n.learn.level} · ${n.band==="sprout"?"Sprout":"Builder"}</span></span>
        ${o===a.active?'<span class="pill grow">playing</span>':`<button class="btn ghost sm" data-act="switchKid" data-arg="${o}">Switch to</button>`}
      </div>`).join("")}
      <button class="btn ghost wide" data-act="addKid">+ Add another child</button>
      <p class="small muted">Each child has their own town, their own money and their own ladder. Nothing is shared, and no child can see another's.</p>
    </div>

    <div class="card stack">
      <div class="eyebrow">Settings</div>
      <div class="row"><span class="small grow">Currency</span>
        <select data-field="cur" data-live="1" style="padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface2);font-weight:700">
          ${Object.keys(q).map(n=>`<option value="${n}" ${e.currency===n?"selected":""}>${q[n].sign} ${q[n].name}</option>`).join("")}
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
  </div>`}function An(e){const a=Date.now()-6048e5,t=ie.filter(k=>e.learn.done[k.id]).slice(-5).map(k=>k.title),n=e.money.txns.filter(k=>k.t>=a),o=[],s=n.filter(k=>k.cat==="shop");s.length&&o.push({em:"🛍️",t:`Bought ${s.length} thing${s.length>1?"s":""} from Mags after being shown what else the money could have been.`});const i=n.filter(k=>/Took back from/.test(k.label));i.length&&o.push({em:"🏗️",t:`Raided a goal fund ${i.length} time${i.length>1?"s":""} — worth asking what it was for.`});const h=e.postbox.log.filter(k=>k.scam&&!k.safe).length;h&&o.push({em:"🛡️",t:`Fell for ${h} scam letter${h>1?"s":""} here, with play money. The cheapest place in the world to learn it.`});const r=n.filter(k=>k.cat==="job");r.length&&o.push({em:"🧺",t:`Took ${r.length} job${r.length>1?"s":""} on Market Row rather than waiting for pay day.`}),e.money.jars.grow>0&&o.push({em:"🌱",t:`Has ${c(e.money.jars.grow)} in the Grow jar — money deliberately set aside for far away.`}),e.money.rules.save+e.money.rules.grow>=50&&o.push({em:"📊",t:`Set the pay-day rule to keep ${e.money.rules.save+e.money.rules.grow}% back. Their choice, not a default.`}),e.money.bank.loan&&o.push({em:"🤝",t:"Is repaying a loan and can see the total cost of it on screen."}),o.length||o.push({em:"🌤️",t:"Nothing yet — a pay day or two will fill this in."});const w=[];return s.length&&w.push("Ask what they nearly bought and didn't."),e.money.goals.length&&w.push(`Ask how many weeks are left on "${e.money.goals[0].name}" — they will know.`),h&&w.push("Ask them what the scam letter was trying to make them feel."),w.push("Ask what the first thing you ever saved up for was. It is one of the app's own questions."),{learned:t,decisions:o,prompts:w}}function Mn(){const e=Y();return`<div class="stack">
    <div class="card">
      <div class="row"><div class="grow"><div class="eyebrow">Badges</div>
        <h2 style="margin:2px 0 0">${Object.keys(te).filter(t=>e.badges.includes(t)).length} of ${Object.keys(te).length}</h2></div></div>
      <div class="grid3" style="margin-top:12px">
        ${Object.keys(te).map(t=>{const n=te[t],o=e.badges.includes(t);return`<div style="background:${o?"var(--treasure-tint)":"var(--tint)"};border-radius:var(--r-md);padding:12px;text-align:center;opacity:${o?1:.45}">
            <div style="font-size:24px">${o?n.em:"🔒"}</div>
            <div style="font-weight:800;font-size:13px;margin-top:3px">${u(n.name)}</div>
            <div class="small muted" style="font-size:11.5px;line-height:1.35">${o?u(n.desc):"not yet"}</div></div>`}).join("")}
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
        ${Object.keys(q).map((t,n)=>{const o=e.currency===t||e.learn.level>=(n+1)*4;return`<div style="background:var(--tint);border-radius:var(--r-md);padding:12px;text-align:center;opacity:${o?1:.4}">
            <div style="font-size:22px;font-weight:800">${o?q[t].sign:"🔒"}</div>
            <div style="font-weight:700;font-size:12.5px">${o?u(q[t].name):"level "+(n+1)*4}</div></div>`}).join("")}
      </div>
    </div>
  </div>`}const Sn=()=>ae(l.s),V=[{t:"start",n:"Pay day",em:"🔔"},{t:"biz",n:"Chai cart",em:"🫖",cost:60,inc:6},{t:"chance",n:"Chance",em:"✉️"},{t:"biz",n:"Flower stall",em:"💐",cost:80,inc:8},{t:"bill",n:"Bus fares",em:"🚌",amt:10},{t:"biz",n:"Bread oven",em:"🍞",cost:100,inc:10},{t:"biz",n:"Fix-it shed",em:"🔧",cost:120,inc:12},{t:"chance",n:"Chance",em:"✉️"},{t:"biz",n:"Book barrow",em:"📚",cost:140,inc:14},{t:"rest",n:"Sit down",em:"🪑"},{t:"biz",n:"Tea rooms",em:"🍰",cost:160,inc:17},{t:"market",n:"The Basket",em:"🧺",cost:50,inc:4},{t:"biz",n:"Print shop",em:"🖨️",cost:180,inc:19},{t:"chance",n:"Chance",em:"✉️"},{t:"bill",n:"Phone bill",em:"📱",amt:14},{t:"biz",n:"Bike repair",em:"🚲",cost:200,inc:22},{t:"biz",n:"Corner shop",em:"🏪",cost:220,inc:24},{t:"chance",n:"Chance",em:"✉️"},{t:"biz",n:"The cinema",em:"🎬",cost:260,inc:30},{t:"bill",n:"Rent day",em:"🏠",amt:20}],xt=[{id:"crack",em:"📱",t:"Your screen is cracked",body:"Thirty to fix it — unless you took the cover when it was offered.",run:(e,a)=>a.insured?{note:"Your cover paid for it. That is what it was for.",cash:0}:{note:"No cover, so you pay the lot.",cash:-30}},{id:"insure",em:"🛡️",t:"Cover, fifteen",body:"Fifteen now, and anything that breaks for the rest of the game is covered.",choices:[{label:"Take the cover · 15",run:(e,a)=>(a.insured=!0,{note:"Covered. It may never pay off, and that is not the same as wasted.",cash:-15})},{label:"Chance it",run:()=>({note:"Nothing happens today. Sometimes that is the right call.",cash:0})}]},{id:"sub",em:"🔁",t:"A club you forgot joining",body:"Twelve now, and two every lap until you notice.",choices:[{label:"Cancel it · costs 12 today",run:(e,a)=>({note:"Twelve now instead of two a lap forever. Cancelling is almost always the cheap option.",cash:-12})},{label:"Leave it running",run:(e,a)=>(a.expenses+=2,{note:"Your expenses just went up by two a lap. Small numbers are the whole technique.",cash:0})}]},{id:"bonus",em:"🎉",t:"A job done properly",body:"Word got round. Somebody paid you forty for the trouble.",run:()=>({note:"Being worth asking twice pays better than being fastest.",cash:40})},{id:"rise",em:"📈",t:"Prices went up",body:"Same everything, bigger numbers. Your expenses rise by three a lap.",run:(e,a)=>(a.expenses+=3,{note:"That is inflation, and it does not undo itself.",cash:0})},{id:"lend",em:"🤝",t:"A friend is short",body:"Twenty-five would get them through the week.",choices:[{label:"Lend it",run:(e,a)=>(a.owed=(a.owed||0)+25,{note:"Lent. You get it back on your next pay day — probably.",cash:-25})},{label:"Explain why not",run:()=>({note:"Saying no honestly protects a friendship better than a grudge does.",cash:0})}]},{id:"found",em:"🪙",t:"Money in an old coat",body:"Fifteen, and no idea when it went in there.",run:()=>({note:"Free money is rare and this is not a strategy.",cash:15})},{id:"repair",em:"🔨",t:"The roof again",body:"Twenty-five, or fifty if you have nothing set aside.",run:(e,a)=>a.cash>=60?{note:"You had enough to fix it straight away, so it cost less.",cash:-25}:{note:"Fixing it late costs more. That is what an emergency fund is for.",cash:-50}}],Tt=18,En=140,_e=[{name:"Mags",who:"mags",buy:(e,a)=>e.cash>=a.cost,insure:!1,line:"If I can afford it I am having it."},{name:"Bo",who:"bo",buy:(e,a)=>a.cost>=En&&e.cash-a.cost>=60,insure:!0,line:"I am holding out for a big one."}],Bn=220,At=60,zn=24,Mt=8;function Cn(){const e=le(60607),a=(d,E,S)=>({name:d,who:E,human:S,pos:0,cash:Bn,own:[],expenses:zn,insured:!1,laps:0,owed:0}),t={players:[a("You","pip",!0),a("Mags","mags",!1),a("Bo","bo",!1)],turn:0,phase:"roll",die:0,log:[],card:null,sq:null,done:!1,winner:null,moves:0};let n=0;const o=()=>t.players[t.turn],s=d=>d.own.reduce((E,S)=>E+V[S].inc,0),i=d=>d.expenses>0?s(d)/d.expenses:0,h=d=>t.players.find(E=>E.own.includes(d)),r=d=>{t.log.unshift(d),t.log.length>5&&(t.log.length=5)},w=()=>{n&&(clearTimeout(n),n=0)},k=()=>{const d=t.players.filter(E=>i(E)>=1);return d.length?(t.done=!0,t.winner=d.sort((E,S)=>i(S)-i(E))[0],R(),!0):t.players[0].laps>=Mt?(t.done=!0,t.winner=t.players.slice().sort((E,S)=>i(S)-i(E))[0],R(),!0):!1},R=()=>{w();const d=t.players[0];t.mine=i(d);const E=Sn(),S=Math.max(4,Math.round(s(d)/2)+(t.winner===d?14:0));t.won=v(S),ye(E,t.won,"Main Street","wage"),P(E),t.winner===d&&F(E,"main-street"),g.level(),l.render()},y=d=>{for(;d.cash<0&&d.own.length;){const E=d.own.slice().sort((j,I)=>V[j].cost-V[I].cost)[0];d.own.splice(d.own.indexOf(E),1);const S=Math.round(V[E].cost/2);d.cash+=S,r(`${d.name} had to sell ${V[E].n} for ${S} — half what it cost.`),d.human&&g.bad()}d.cash<0&&(d.cash=0,d.skip=1,r(`${d.name} had a week they would rather forget, and misses a turn.`))},f=d=>{d.laps++,d.cash+=At+s(d),d.cash-=d.expenses,d.owed&&(d.cash+=Math.round(d.owed*1.2),r(`${d.name} was paid back, with a bit on top.`),d.owed=0),r(`${d.name} passed pay day: +${At+s(d)}, −${d.expenses}.`),d.name==="Mags"&&(d.cash-=Tt,r(`Mags bought something shiny on the way past — ${Tt}.`)),y(d)},m=d=>{const E=d.pos,S=V[E];if(t.sq=E,S.t==="bill")return d.cash-=S.amt,r(`${d.name} paid ${S.n} — ${S.amt}.`),y(d),B();if(S.t==="rest")return r(`${d.name} sat down for five minutes.`),B();if(S.t==="start")return r(`${d.name} landed on pay day.`),B();if(S.t==="chance"){const W=xt[Math.floor(e()*xt.length)];if(t.card=W,d.human&&W.choices){t.phase="card",l.render();return}const Q=(W.choices?W.choices[_e.find(fe=>fe.name===d.name)&&_e.find(fe=>fe.name===d.name).insure?0:1]:W).run(t,d);return d.cash+=Q.cash||0,r(`${d.name} — ${W.t}. ${Q.note}`),y(d),t.card=null,B()}const j=h(E);if(!j){if(d.human){t.phase="decide",l.render();return}const W=_e.find(ge=>ge.name===d.name);return W&&W.buy(d,S)&&d.cash>=S.cost?(d.cash-=S.cost,d.own.push(E),r(`${d.name} bought ${S.n} for ${S.cost}.`)):r(`${d.name} passed on ${S.n}.`),B()}if(j===d)return r(`${d.name} looked in on ${S.n}.`),B();if(S.t==="market")return r(`${d.name} browsed the Basket. Funds don't charge rent.`),B();const I=S.inc*2;return d.cash-=I,j.cash+=I,r(`${d.name} spent ${I} at ${j.human?"your":j.name+"'s"} ${S.n}.`),y(d),B()},B=()=>{if(!k()){if(t.phase="roll",t.turn=(t.turn+1)%t.players.length,t.card=null,o().skip){o().skip=0,r(`${o().name} sits this one out.`),l.render(),n=setTimeout(B,700);return}l.render(),o().human||(n=setTimeout(M,520))}},M=()=>{if(t.done)return;const d=o();t.die=1+Math.floor(e()*6),t.phase="moving",t.moves=t.die,g.click(),l.render();const E=()=>{d.pos=(d.pos+1)%V.length,d.pos===0&&f(d),t.moves--,l.render(),t.moves>0?n=setTimeout(E,125):n=setTimeout(()=>m(d),190)};n=setTimeout(E,190)},p=d=>{if(t.phase!=="decide")return;const E=o(),S=V[t.sq];d?E.cash<S.cost?r("Not enough — and nothing lends to you here."):(E.cash-=S.cost,E.own.push(t.sq),r(`You bought ${S.n}. It pays ${S.inc} every lap, forever.`),g.coin()):r(`You passed on ${S.n}.`),t.phase="roll",B()},T=d=>{if(t.phase!=="card")return;const E=o(),S=t.card,j=S.choices[+d].run(t,E);E.cash+=j.cash||0,r(`${S.t} — ${j.note}`),y(E),t.card=null,t.phase="roll",(j.cash||0)<0?g.bad():g.good(),B()},z=d=>d<=5?{r:6,c:1+d}:d<=10?{r:6-(d-5),c:6}:d<=15?{r:1,c:6-(d-10)}:{r:1+(d-15),c:1};return{id:"mn",mount(){},stop:w,key(d){if(t.done){d.key==="Enter"&&(l.game=null,l.render());return}if(t.phase==="roll"&&o().human&&(d.key==="Enter"||d.key===" "))d.preventDefault(),M();else if(t.phase==="decide")(d.key==="y"||d.key==="Y")&&p(!0),(d.key==="n"||d.key==="N")&&p(!1);else if(t.phase==="card"&&t.card&&t.card.choices){const E=parseInt(d.key,10);E>=1&&E<=t.card.choices.length&&T(E-1)}},act(d,E){d==="mnRoll"?M():d==="mnBuy"?p(!0):d==="mnPass"?p(!1):d==="mnCard"?T(E):d==="mnEnd"&&(l.game=null,l.render())},view(){if(t.done){const j=t.players[0];return`<div class="stack">
          <div class="hud"><span class="box">Main Street</span><span class="grow"></span>
            <button class="btn ghost sm" data-act="gquit">Leave</button></div>
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${t.winner===j?"🏆":"🎗️"}</div>
            <h2>${t.winner===j?"Your street pays for your life":t.winner.name+" got there first"}</h2>
            <p class="muted">${Math.round(t.mine*100)}% of your expenses covered by what you own.</p>
            <div class="lead">
              ${t.players.slice().sort((I,W)=>i(W)-i(I)).map((I,W)=>`
                <div class="leadrow ${I.human?"me":""}">
                  <span>${W+1}</span>
                  <span>${u(I.name)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                    owns ${I.own.length} · earns ${I.own.reduce((ge,Q)=>ge+V[Q].inc,0)} a lap · spends ${I.expenses}</span></span>
                  <span class="p" style="font-size:17px">${Math.round(i(I)*100)}%</span></div>`).join("")}
            </div>
            ${N("nana","Nobody went bankrupt and nobody had to. You win this one when the things you own pay for the life you lead — that is the only definition of rich worth chasing.")}
            <p class="small muted">Earned ${c(t.won)}.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`}const d=o(),E=V.map((j,I)=>{const{r:W,c:ge}=z(I),Q=h(I),fe=t.players.filter(Ie=>Ie.pos===I),ja=t.sq===I&&t.phase!=="roll";return`<div style="grid-row:${W};grid-column:${ge};position:relative;border:1px solid var(--line);
          border-radius:7px;padding:4px 3px;font-size:9.5px;line-height:1.15;text-align:center;overflow:hidden;
          background:${ja?"var(--action-tint)":Q?Q.human?"var(--grow-tint)":"var(--tint)":"var(--surface)"};
          ${Q?`box-shadow:inset 0 -3px 0 ${Q.human?"var(--grow)":Q.who==="mags"?"var(--give)":"var(--treasure)"}`:""}">
          <div style="font-size:14px">${j.em}</div>
          <div style="font-weight:700">${u(j.n)}</div>
          ${j.cost?`<div class="mono" style="opacity:.65">${j.cost}</div>`:""}
          ${fe.length?`<div style="position:absolute;top:2px;right:2px;display:flex;gap:1px">
            ${fe.map(Ie=>`<span style="width:8px;height:8px;border-radius:50%;display:block;background:${Ie.human?"var(--action)":Ie.who==="mags"?"var(--give)":"var(--treasure)"}"></span>`).join("")}</div>`:""}
        </div>`}).join(""),S=`<div style="grid-row:2/6;grid-column:2/6;display:flex;flex-direction:column;gap:8px;
        padding:10px;background:var(--tint);border-radius:10px;overflow:auto">
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${t.players.map(j=>`<span class="pill ${j===d?"gold":""}" style="font-size:10px">
            ${u(j.name)} ${j.cash}</span>`).join("")}
        </div>
        <div>
          <div class="row"><span class="eyebrow grow">Your street pays</span>
            <span class="small" style="font-weight:800">${s(t.players[0])} / ${t.players[0].expenses}</span></div>
          <div class="bar" style="margin-top:4px"><i style="width:${Math.min(100,i(t.players[0])*100)}%;background:var(--grow)"></i></div>
        </div>
        ${t.phase==="decide"?(()=>{const j=V[t.sq];return`<div style="background:var(--surface);border-radius:9px;padding:10px;text-align:center">
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
            ${t.card.choices.map((j,I)=>`<button class="opt" style="padding:7px 9px;font-size:12px" data-act="mnCard" data-arg="${I}">${I+1} · ${u(j.label)}</button>`).join("")}
          </div></div>`:""}
        ${t.phase==="roll"?`<button class="btn wide" data-act="mnRoll" ${d.human?"":"disabled"}>
          ${d.human?"Roll · ⏎":d.name+" is thinking…"}</button>`:""}
        ${t.phase==="moving"?`<div style="text-align:center;font-family:var(--display);font-weight:800;font-size:28px">🎲 ${t.die}</div>`:""}
        <div class="stack" style="gap:3px;margin-top:auto">
          ${t.log.slice(0,3).map(j=>`<p class="small muted" style="font-size:11px;line-height:1.35">${u(j)}</p>`).join("")}
        </div>
      </div>`;return`<div class="stack">
        <div class="hud"><span class="box">Lap ${t.players[0].laps+1} / ${Mt}</span>
          <span class="box">You ${d===t.players[0]?"· your turn":""} ${t.players[0].cash}</span>
          <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>
        <div class="stage" style="padding:10px">
          <div style="display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(6,1fr);
            gap:4px;aspect-ratio:1;max-width:520px;width:100%;margin:0 auto">
            ${E}${S}
          </div>
          <p class="hint">Enter to roll, Y/N to buy. You win when what you own pays for what you spend — nobody has to go bankrupt.</p>
        </div></div>`}}}const ne=()=>ae(l.s),De=[{id:"cr",em:"🪙",name:"Change Rush",keys:"← →",kind:"action",needs:null,blurb:"Coins are falling and you need exactly the right amount. Catch one too many and you have overpaid."},{id:"nw",em:"⚖️",name:"Needs vs Wants",keys:"← →",kind:"action",needs:null,blurb:"Sort it before the bell. Some are both, and those are the good ones."},{id:"ss",em:"🛡️",name:"Scam Spotter",keys:"← →",kind:"action",needs:null,blurb:"Real message or trap? They are designed to look identical."},{id:"bb",em:"💸",name:"Budget Blitz",keys:"1 2",kind:"action",needs:"c3",blurb:"A month of money, and the bills arrive one at a time."},{id:"cc",em:"🗼",name:"Compound Climb",keys:"hold space",kind:"action",needs:"c6",blurb:"Hold to grow the tower. Hold longer for more — and past a point it can go backwards, and you can be wiped out."},{id:"sr",em:"🫖",name:"Stall Rush",keys:"1–4 · R",kind:"action",needs:"c3",blurb:"Sixty seconds of customers. Serve them, restock, and find out whether busy and profitable are the same thing."},{id:"st",em:"⛈️",name:"Market Storm",keys:"space",kind:"action",needs:"c7",blurb:"Everything is red and everyone is shouting sell. The winning move is to do nothing, and it is much harder than it sounds."},{id:"mc",em:"🏆",name:"The Market Cup",keys:"↑↓←→ ⏎",kind:"action",needs:"c7",blurb:"Six weeks against Chaser, Panicker and Boring Bella. Bella is annoying."},{id:"mn",em:"🎲",name:"Main Street",keys:"⏎ · Y/N",kind:"board",needs:"c1",blurb:"The board game. Buy the shops, collect the rent, and win when your street pays for your life — nobody goes bankrupt."},{id:"tt",em:"🗓️",name:"Times Twelve",keys:"1–4",kind:"drill",needs:"c4",blurb:"Small monthly numbers, turned into the number that is actually true."},{id:"sn",em:"❄️",name:"The Snowball",keys:"1–4",kind:"drill",needs:"c6",blurb:"Guess where compounding lands. Nobody guesses high enough."}];function jn(){if(l.game)return l.game.view();const e=ne(),a=t=>{const n=!t.needs||ue(e,t.needs),o=t.needs&&U.find(s=>s.id===t.needs);return`<button class="card" data-act="${n?"game":"lockedGame"}" data-arg="${t.id}" style="text-align:left;width:100%;${n?"":"opacity:.62"}">
      <div class="row"><span style="font-size:30px">${n?t.em:"🔒"}</span>
        <div class="grow"><b style="font-size:16px">${u(t.name)}</b>
          <p class="small muted">${n?u(t.blurb):"Finish “"+u(o.title)+"” to open this"}</p></div>
        <span class="pill">${n?t.keys:"learn first"}</span></div></button>`};return`<div class="stack">
    ${N("pip","Wages from in here land in the same wallet as everything else. There is no second, magic money — that is on purpose.")}
    <div class="eyebrow">The board game · about ten minutes, and nobody goes bankrupt</div>
    ${De.filter(t=>t.kind==="board").map(a).join("")}
    <div class="eyebrow" style="margin-top:6px">A few minutes each</div>
    ${De.filter(t=>t.kind==="action").map(a).join("")}
    <div class="eyebrow" style="margin-top:6px">Quick drills — a minute each, no reflexes required</div>
    ${De.filter(t=>t.kind==="drill").map(a).join("")}
    ${e.market.best?`<div class="card"><div class="eyebrow">Best Market Cup finish</div>
      <p style="font-weight:800">${u(e.market.best)}</p></div>`:""}
  </div>`}function Rn(e){const a={cr:Hn,nw:In,ss:Pn,bb:Dn,cc:Yn,sr:Gn,st:Un,tt:Wn,sn:On,mc:qn,mn:Cn}[e];a&&(l.game&&l.game.stop&&l.game.stop(),l.game=a(),g.click())}function Z(){l.game&&l.game.stop&&l.game.stop(),l.game=null}function L(e){return`<div class="hud">${e.map(a=>`<span class="box">${a}</span>`).join("")}
    <span class="grow"></span><button class="btn ghost sm" data-act="gquit">Leave</button></div>`}function de(e,a){const t=v(e);return t>0&&(ye(ne(),t,a,"wage"),P(ne()),g.coin()),t}function Ne(e,a,t,n,o,s){return`<div class="stage" style="justify-content:center;text-align:center">
    <div style="font-size:44px">${e}</div>
    <h2>${u(a)}</h2>
    <p class="muted">${t}</p>
    ${o?N(s||"pip",o):""}
    <p class="small muted">Earned ${c(n)}, straight into your wallet.</p>
    <button class="btn wide" data-act="gquit">Back to the arcade</button></div>`}function we(e,a){const t=le(a);for(let n=e.length-1;n>0;n--){const o=Math.floor(t()*(n+1)),s=e[n];e[n]=e[o],e[o]=s}return e}function Sa(e){const a=we(e.items.slice(),e.seed),t={i:0,right:0,note:null,done:!1},n=o=>{if(t.done)return;const s=a[t.i],i=s.a===o||s.a==="both";i?(t.right++,g.good()):g.bad(),t.note={ok:i,text:s.note||(i?"Yes.":e.wrongNote(s))},t.i++,t.i>=a.length&&(t.done=!0,t.won=de(Math.round(t.right*e.pay),e.name)),l.render()};return{id:e.id,key(o){if(t.done){o.key==="Enter"&&(Z(),l.render());return}o.key==="ArrowLeft"?n(e.left.side):o.key==="ArrowRight"&&n(e.right.side)},act(o){o===e.left.act?n(e.left.side):o===e.right.act&&n(e.right.side)},view(){if(t.done)return`<div class="stack">${L(["Done"])}
        ${Ne(t.right>=a.length-1?"🏅":"👍",t.right+" of "+a.length,"",t.won,e.outro(t.right,a.length),e.who)}</div>`;const o=a[t.i];return`<div class="stack">
        ${L([`${t.i+1} / ${a.length}`,`✓ ${t.right}`])}
        <div class="stage">
          ${e.card(o)}
          ${t.note?`<div style="background:${t.note.ok?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${u(t.note.text)}</div>`:""}
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" style="background:${e.left.color}" data-act="${e.left.act}">← ${e.left.label}</button>
            <button class="btn" style="background:${e.right.color}" data-act="${e.right.act}">${e.right.label} →</button>
          </div>
          <p class="hint">${u(e.hint)}</p>
        </div></div>`}}}const Nn=[{em:"🍚",t:"Rice for the week",a:"need"},{em:"🎮",t:"A new game",a:"want"},{em:"🧥",t:"A winter coat",a:"need"},{em:"☂️",t:"An umbrella, and it is raining",a:"both",note:"Today it is a need. In May it is a want. That is the whole card."},{em:"🚌",t:"The bus fare to school",a:"need"},{em:"🍫",t:"Chocolate at the till",a:"want"},{em:"📱",t:"A phone, and your family shares one",a:"both",note:"Depends entirely on the household. There is no universal answer, and pretending there is would be the mistake."},{em:"👟",t:"Shoes that still fit",a:"want",note:"They still fit. That makes them a want today."},{em:"💊",t:"Medicine you were prescribed",a:"need"},{em:"🎧",t:"Headphones",a:"want"},{em:"💧",t:"Clean water",a:"need"},{em:"🎂",t:"A cake for your sister",a:"both",note:"Nobody starves without it. It might still be the best thing you buy all month."}];function In(){return Sa({id:"nw",name:"Needs vs Wants",items:Nn,seed:7717,pay:.7,who:"pip",hint:"Arrow keys, or tap. Some are both — either answer counts.",left:{side:"need",act:"nwNeed",label:"Need",color:"var(--save)"},right:{side:"want",act:"nwWant",label:"Want",color:"var(--give)"},card:e=>`<div class="gcard"><span class="em">${e.em}</span><span class="nm">${u(e.t)}</span></div>`,wrongNote:e=>e.a==="need"?"That one you would be in trouble without.":"Lovely, but you would survive the week.",outro:()=>"The ones that were <b>both</b> are the point. A list of needs that never changes is a list somebody else wrote for you."})}const Fn=[{t:"Your parcel could not be delivered. Pay the £1.99 redelivery fee here to reschedule.",a:"scam",note:"A tiny fee is the hook — it is not about the £1.99, it is about your card details."},{t:"Hi, it's Nani. Are you free on Sunday? Ask your mother and let me know.",a:"safe",note:"No money, no hurry, no secret. Just Sunday."},{t:"CONGRATULATIONS! You are today's selected winner. Claim within 2 hours!",a:"scam",note:"A prize you never entered, and a countdown. Reward plus hurry."},{t:"Your library book is due back on Friday. No action needed if you have returned it.",a:"safe",note:'"No action needed" is almost never how a scam opens.'},{t:"BANK ALERT: suspicious login. Reply with your PIN to secure your account NOW.",a:"scam",note:"No real bank ever asks for your PIN. Fright plus hurry plus a secret."},{t:"hey it's me, new number! lost my phone. can you send 200 quick, don't tell mum",a:"scam",note:`New number, urgent money, and "don't tell". The secrecy is the tell.`},{t:"Your school trip form is due Monday. Paper copies are at the office.",a:"safe",note:"Boring, specific, and asks for nothing but a form."},{t:"FREE V-BUCKS GENERATOR — just log in with your username and password!",a:"scam",note:"There is no generator. There is a page collecting passwords."},{t:"Your order of one pencil case has shipped. Track it in the app you ordered from.",a:"safe",note:"It points you back to the app you already use rather than a new link."},{t:"INVESTMENT OPPORTUNITY: guaranteed to double in 30 days. Only 5 places left!",a:"scam",note:"Guaranteed and doubling do not belong in the same sentence — and there are always exactly five places left."}];function Pn(){return Sa({id:"ss",name:"Scam Spotter",items:Fn,seed:3391,pay:1.1,who:"nana",hint:"Arrow keys, or tap. Half of these are perfectly ordinary.",left:{side:"safe",act:"ssSafe",label:"Looks fine",color:"var(--grow)"},right:{side:"scam",act:"ssScam",label:"It's a trap",color:"var(--spend)"},card:e=>`<div class="gcard" style="text-align:left"><span class="em" style="display:block;text-align:center">📱</span>
      <p style="font-size:15px;line-height:1.5;font-weight:650">${u(e.t)}</p></div>`,wrongNote:e=>e.a==="scam"?"That one was a trap.":"That one was real. Suspecting everything is its own kind of expensive.",outro:(e,a)=>e===a?"All of them. The shape is always the same: a reward or a fright, a hurry, and a secret.":"Look for the <b>shape</b>, not the story: a reward or a fright, plus a hurry, plus a secret."})}function Dn(){const e=ne(),a=me(e)*4,n=we([{n:"Rent on the stall",u:14,must:!0},{n:"Food for the month",u:22,must:!0},{n:"Bus pass",u:8,must:!0},{n:"A film with friends",u:6,must:!1},{n:"Phone plan",u:6,must:!0},{n:"Mags's brass button",u:12,must:!1},{n:"Sister’s birthday cake",u:5,must:!1},{n:"New shoes — the old ones leak",u:10,must:!0}].slice(),4423),o={i:0,left:a,missed:[],paid:[],done:!1},s=i=>{if(o.done)return;const h=n[o.i],r=v(h.u);i?r>o.left?(g.bad(),C("Not enough left — and that is the lesson"),o.missed.push(h)):(o.left-=r,o.paid.push(h),g.click()):(h.must?g.bad():g.good(),o.missed.push(h)),o.i++,o.i>=n.length&&(o.done=!0,o.mustMissed=o.missed.filter(w=>w.must).length,o.won=de(Math.max(0,10-o.mustMissed*4)+(o.left>0?4:0),"Budget Blitz")),l.render()};return{id:"bb",key(i){i.key==="1"?s(!0):i.key==="2"?s(!1):i.key==="Enter"&&o.done&&(Z(),l.render())},act(i){i==="bbPay"?s(!0):i==="bbSkip"&&s(!1)},view(){if(o.done)return`<div class="stack">${L(["Month over"])}
        ${Ne(o.mustMissed===0?"🎯":"😬",c(o.left)+" left over",o.mustMissed===0?"Everything you actually needed got paid.":o.mustMissed+" thing"+(o.mustMissed>1?"s":"")+" you needed went unpaid. Those do not disappear — they move to next month.",o.won,"Leftover money is not a prize. It is the part of the month you get to choose about.","nana")}</div>`;const i=n[o.i],h=v(i.u);return`<div class="stack">
        ${L([`Left ${c(o.left)}`,`${o.i+1} / ${n.length}`])}
        <div class="stage">
          <div class="gcard"><span class="em">🧾</span><span class="nm">${u(i.n)}</span>
            <div class="big" style="margin-top:6px">${c(h)}</div></div>
          <div class="bar"><i style="width:${he(o.left/a*100,0,100)}%;background:${o.left>a*.25?"var(--grow)":"var(--spend)"}"></i></div>
          <div class="grow"></div>
          <div class="choices">
            <button class="btn" data-act="bbPay">1 · Pay it</button>
            <button class="btn ghost" data-act="bbSkip">2 · Skip it</button></div>
          <p class="hint">Keys 1 and 2, or tap. Nothing tells you which ones you truly need.</p>
        </div></div>`}}}function Ea(e){const a=e.build(),t={i:0,right:0,pick:null,done:!1},n=s=>{t.done||t.pick!=null||(t.pick=s,s===a[t.i].a?(t.right++,g.good()):g.bad(),l.render())},o=()=>{t.pick!=null&&(t.pick=null,t.i++,t.i>=a.length&&(t.done=!0,t.won=de(Math.round(t.right*e.pay),e.name)),l.render())};return{id:e.id,key(s){if(t.done){s.key==="Enter"&&(Z(),l.render());return}if(s.key==="Enter"){o();return}const i=parseInt(s.key,10);i>=1&&i<=a[t.i].opts.length&&n(i-1)},act(s,i){s===e.pickAct?n(+i):s===e.nextAct&&o()},view(){if(t.done)return`<div class="stack">${L(["Done"])}
        ${Ne(t.right>=a.length-1?"🏅":"👍",t.right+" of "+a.length,"",t.won,e.outro,e.who)}</div>`;const s=a[t.i];return`<div class="stack">
        ${L([`${t.i+1} / ${a.length}`,`✓ ${t.right}`])}
        <div class="stage">
          <div class="gcard"><span class="em">${e.em}</span>
            <p style="font-size:15.5px;line-height:1.45;font-weight:700">${s.q}</p></div>
          <div class="stack" style="gap:8px">
            ${s.opts.map((i,h)=>{let r="";return t.pick!=null&&(r=h===s.a?" ok":h===t.pick?" no":""),`<button class="opt${r}" data-act="${e.pickAct}" data-arg="${h}" ${t.pick!=null?"disabled":""}>
                <span class="k">${h+1}</span>${i}</button>`}).join("")}
          </div>
          ${t.pick!=null?`<div style="background:${t.pick===s.a?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">${s.why}</div>
            <button class="btn wide" data-act="${e.nextAct}">Next →</button>`:""}
          <p class="hint">Number keys, or tap. Enter for the next one.</p>
        </div></div>`}}}function Wn(){return Ea({id:"tt",name:"Times Twelve",em:"🗓️",pay:1.2,who:"pip",pickAct:"ttPick",nextAct:"ttNext",outro:"Multiply every monthly thing by twelve <b>before</b> you agree to it. Then cancel the ones you would not buy at that price.",build(){const e=le(5150),a=[];we([15,25,30,40,60,12,20].slice(),991).slice(0,4).forEach(i=>{const h=i*12,r=we([h,i*10,i*6,h+i],Math.round(e()*1e6)+i);a.push({q:`A club costs <b>${c(v(i))} a month</b>. What is that in a year?`,opts:r.map(w=>c(v(w))),a:r.indexOf(h),why:`${c(v(i))} × 12 = <b>${c(v(h))}</b>. Small monthly numbers are the entire technique.`})}),[8,15,25].forEach(i=>{const h=i*52,r=we([h,i*12,i*30,i*100],i*77);a.push({q:`You spend <b>${c(v(i))} a week</b> on snacks. In a year?`,opts:r.map(w=>c(v(w))),a:r.indexOf(h),why:`${c(v(i))} × 52 = <b>${c(v(h))}</b>. A week is a small unit and a year is not.`})});const o=45,s=480;return a.push({q:`One shop wants <b>${c(v(o))} a month</b>. Another wants <b>${c(v(s))} once a year</b>. Which costs less?`,opts:[c(v(o))+" a month",c(v(s))+" a year","They are the same","Not enough information"],a:1,why:`${c(v(o))} × 12 = ${c(v(o*12))}, which is more than ${c(v(s))}. The yearly one wins — and it is quoted that way precisely because it looks bigger.`}),a}})}function On(){return Ea({id:"sn",name:"The Snowball",em:"❄️",pay:1.6,who:"nana",pickAct:"snPick",nextAct:"snNext",outro:"Almost nobody guesses high enough, because we all quietly add instead of multiplying. Time is the ingredient, not the amount.",build(){return[{p:100,r:.1,y:10},{p:100,r:.07,y:20},{p:500,r:.05,y:10},{p:1e3,r:.1,y:20},{p:200,r:.08,y:30},{p:100,r:.1,y:30}].map((a,t)=>{const n=Math.round(a.p*Math.pow(1+a.r,a.y)),o=Math.round(a.p*(1+a.r*a.y)),s=we([n,o,Math.round(a.p*(1+a.r*a.y*.5)),Math.round(n*2.1)],700+t*13);return{q:`<b>${c(v(a.p))}</b> growing <b>${(a.r*100).toFixed(0)}% a year</b> for <b>${a.y} years</b>. Where does it land?`,opts:s.map(i=>c(v(i))),a:s.indexOf(n),why:`<b>${c(v(n))}</b>. Adding ${(a.r*100).toFixed(0)}% ${a.y} times would only reach ${c(v(o))} — the extra is growth landing on earlier growth.`}})}})}function qn(){const n=le(120),o=[];for(let y=0;y<6;y++){const f={};J.forEach(m=>{const B=(n()+n()+n()-1.5)*2*m.vol*1;f[m.id]=m.drift*3.6+B+(y===3?-m.vol*1.5:0)}),o.push(f)}const s={round:0,sel:0,done:!1,churn:0,divSum:0,alloc:{basket:0,grain:0,chai:0,rocket:0},me:1e3,log:[1e3],bots:{Chaser:1e3,Panicker:1e3,"Boring Bella":1e3},botHold:{Chaser:"basket",Panicker:"chai","Boring Bella":"basket"},botStat:{Chaser:{div:0,churn:100},Panicker:{div:0,churn:100},"Boring Bella":{div:0,churn:100}}},i=()=>100-(s.alloc.basket+s.alloc.grain+s.alloc.chai+s.alloc.rocket),h=(y,f)=>{if(s.done)return;const m=he(s.alloc[y]+f,0,s.alloc[y]+i());if(m===s.alloc[y]){g.bad();return}s.churn+=Math.abs(m-s.alloc[y]),s.alloc[y]=m,g.click(),l.render()},r=()=>{let y=0;return s.alloc.basket>=15&&(y+=4),["grain","chai","rocket"].forEach(f=>{s.alloc[f]>=15&&(y+=1)}),Math.min(4,y)},w=(y,f,m)=>{const B=Math.round((y/1e3-1)*100),M=Math.round(f*7),p=Math.max(0,30-Math.round(m/8));return{ret:B,div:M,steady:p,total:B+M+p}},k=()=>{if(s.done)return;s.divSum+=r();const y=o[s.round];let f=0;J.forEach(T=>{f+=s.alloc[T.id]/100*y[T.id]}),s.me=Math.round(s.me*(1+f)),s.log.push(s.me);const m=T=>T==="cash"?0:T==="basket"?4:1;Object.keys(s.bots).forEach(T=>{s.botStat[T].div+=m(s.botHold[T])});const B=J.slice().sort((T,z)=>y[z.id]-y[T.id])[0].id;s.bots.Chaser=Math.round(s.bots.Chaser*(1+y[s.botHold.Chaser])),B!==s.botHold.Chaser&&(s.botStat.Chaser.churn+=100),s.botHold.Chaser=B;const M=s.botHold.Panicker;s.bots.Panicker=Math.round(s.bots.Panicker*(1+(M==="cash"?0:y[M])));const p=M!=="cash"&&y[M]<0?"cash":"chai";p!==M&&(s.botStat.Panicker.churn+=100),s.botHold.Panicker=p,s.bots["Boring Bella"]=Math.round(s.bots["Boring Bella"]*(1+y.basket)),s.round++,s.round>=6?R():g.click(),l.render()},R=()=>{s.done=!0;const y=ne();s.score=w(s.me,s.divSum/6,s.churn),s.table=[{who:"You",v:s.me,sc:s.score}].concat(Object.keys(s.bots).map(m=>({who:m,v:s.bots[m],sc:w(s.bots[m],s.botStat[m].div/6,s.botStat[m].churn)}))).sort((m,B)=>B.sc.total-m.sc.total),s.place=s.table.findIndex(m=>m.who==="You")+1,s.byReturn=s.table.slice().sort((m,B)=>B.v-m.v)[0].who,s.won=de(Math.max(4,Math.round(s.score.total/6)),"The Market Cup"),s.score.div>=24&&F(y,"diversified");const f=`${s.place}${["st","nd","rd","th"][Math.min(s.place-1,3)]} of 4 · cup score ${s.score.total}`;y.market.best||(y.market.best=f),g.level()};return{id:"mc",key(y){if(s.done){y.key==="Enter"&&(Z(),l.render());return}const f=J.map(m=>m.id);y.key==="ArrowDown"?(s.sel=(s.sel+1)%f.length,l.render()):y.key==="ArrowUp"?(s.sel=(s.sel+f.length-1)%f.length,l.render()):y.key==="ArrowRight"?h(f[s.sel],10):y.key==="ArrowLeft"?h(f[s.sel],-10):y.key==="Enter"&&k()},act(y,f){if(y==="mcAdj"){const[m,B]=f.split(":");h(m,+B)}else y==="mcNext"?k():y==="mcSel"&&(s.sel=J.findIndex(m=>m.id===f),l.render())},view(){if(s.done){const y=s.score;return`<div class="stack">${L(["Cup over"])}
          <div class="stage">
            <div style="text-align:center"><div style="font-size:42px">${s.place===1?"🏆":"🎗️"}</div>
            <h2>${s.place===1?"You won the Cup":s.place+" of 4"}</h2>
            <p class="muted">Cup score ${y.total} · ended on ${s.me} from 1000.</p></div>
            <div class="lead">
              ${s.table.map((f,m)=>`<div class="leadrow ${f.who==="You"?"me":""}">
                <span>${m+1}</span>
                <span>${u(f.who)}<br><span style="font-weight:600;font-size:11.5px;opacity:.75">
                  ${f.sc.ret>=0?"+":""}${f.sc.ret} return · ${f.sc.div} spread · ${f.sc.steady} nerve</span></span>
                <span class="p" style="font-size:17px">${f.sc.total}</span></div>`).join("")}
            </div>
            <p class="small muted">Ranked on cup score. On money alone <b>${u(s.byReturn)}</b> finished top —
              which is exactly why money alone is not the scoreboard.</p>
            <div class="card" style="box-shadow:none">
              <div class="eyebrow">Your cup score — and this is the part that matters</div>
              <div class="grid3" style="margin-top:8px">
                <div><div class="small muted">Return</div><div style="font-weight:800">${y.ret>=0?"+":""}${y.ret}</div></div>
                <div><div class="small muted">Spread out</div><div style="font-weight:800">${y.div}</div></div>
                <div><div class="small muted">Kept your nerve</div><div style="font-weight:800">${y.steady}</div></div>
              </div>
              <div class="sep" style="margin:10px 0"></div>
              <div class="row"><span class="grow" style="font-weight:800">Total</span><span class="big" style="font-size:22px">${y.total}</span></div>
            </div>
            ${N(s.table[0].who==="Boring Bella"?"bea":"bo",s.table[0].who==="Boring Bella"?"Bella bought the whole basket in week one and then went home. She does that every season, and she is very hard to beat.":"You beat Bella this time. Run another six weeks and see whether that keeps happening — that question <b>is</b> the game.")}
            <p class="small muted">Earned ${c(s.won)}. Fictional companies, real market behaviour, nothing here is advice.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`}return`<div class="stack">
        ${L([`Week ${s.round+1} / 6`,`${s.me}`,`cash ${i()}%`])}
        <div class="stage">
          <p class="small muted">Split 100% across what you fancy. What you leave in cash is safe and grows by nothing.</p>
          <div class="alloc">
            ${J.map((y,f)=>`<div class="alrow ${f===s.sel?"sel":""}" data-act="mcSel" data-arg="${y.id}" role="button" tabindex="0">
              <div><b style="font-size:14px">${y.em} ${u(y.name)}</b>
                <div class="small muted">${y.kind==="fund"?"a slice of every shop":y.kind==="steady"?"slow and dull":y.kind==="growth"?"growing, bumpy":"anybody’s guess"}</div></div>
              <div class="stepper">
                <button data-act="mcAdj" data-arg="${y.id}:-10" aria-label="less ${u(y.name)}">−</button>
                <span class="n">${s.alloc[y.id]}%</span>
                <button data-act="mcAdj" data-arg="${y.id}:10" aria-label="more ${u(y.name)}">+</button></div></div>`).join("")}
          </div>
          ${Be(s.log,300,40,"var(--action)")}
          <button class="btn wide" data-act="mcNext">Play the week →</button>
          <p class="hint">Arrows to move and change, Enter to play the week. Or just tap.</p>
        </div></div>`}}}const Ln=["nwNeed","nwWant","ssSafe","ssScam","bbPay","bbSkip","ttPick","ttNext","snPick","snNext","mcAdj","mcNext","mcSel","crLane","crGo","stSell","stPlan","stGo","ccHold","ccRelease","srServe","srStock","mnRoll","mnBuy","mnPass","mnCard","mnEnd"];function Yn(){const s={year:0,money:100,charge:0,holding:!1,done:!1,hist:[100],last:null,ruined:!1,peak:100};let i=0,h=0,r=null,w=null;const k=le(8821),R=()=>{i&&cancelAnimationFrame(i),i=0},y=()=>{s.done||(s.done=!0,R(),s.won=de(Math.max(3,Math.round(s.money/22)),"Compound Climb"),s.money>=420&&F(ne(),"climbed"),g.level(),l.render())},f=()=>{if(s.done||!s.holding)return;s.holding=!1;const p=s.charge/100,T=p*.22,z=p*p*.34,d=T+(k()+k()-1)*z,E=s.money;if(s.money=Math.max(0,s.money*(1+d)),s.hist.push(Math.round(s.money)),s.peak=Math.max(s.peak,s.money),s.last={pct:d,before:E,after:s.money},s.year++,s.charge=0,s.money<20){s.ruined=!0,y();return}if(d<0?g.bad():g.coin(),s.year>=15){y();return}l.render()},m=()=>{!s.done&&!s.holding&&(s.holding=!0,s.charge=0)},B=p=>{if(s.done)return;const T=Math.min(60,p-(h||p));h=p,s.holding&&(s.charge=Math.min(100,s.charge+T*.075)),M();const z=document.getElementById("ccCharge");z&&(z.style.width=s.charge.toFixed(1)+"%"),i=requestAnimationFrame(B)},M=()=>{if(!r)return;const p=getComputedStyle(document.documentElement),T=(S,j)=>(p.getPropertyValue(S)||j).trim()||j;r.clearRect(0,0,360,320),r.fillStyle=T("--tint","#EDF2F2"),r.fillRect(0,0,360,320);const z=Math.max(420*1.15,s.peak*1.1),d=S=>306-S/z*280;r.setLineDash([5,5]),r.strokeStyle=T("--grow","#178A4C"),r.lineWidth=1.5,r.beginPath(),r.moveTo(0,d(420)),r.lineTo(360,d(420)),r.stroke(),r.setLineDash([]),r.fillStyle=T("--grow","#178A4C"),r.font="600 11px system-ui",r.textAlign="left",r.fillText("target",6,d(420)-6);const E=Math.max(6,320/15);s.hist.forEach((S,j)=>{const I=20+j*E,W=j===0||S>=s.hist[j-1];r.fillStyle=W?T("--action","#0E6B78"):T("--spend","#C4453C"),r.globalAlpha=j===s.hist.length-1?1:.75,r.fillRect(I,d(S),E-3,306-d(S))}),r.globalAlpha=1,r.fillStyle=T("--ink","#16262A"),r.font="800 15px system-ui",r.textAlign="right",r.fillText(String(Math.round(s.money)),352,Math.max(16,d(s.money)-8))};return{id:"cc",mount(){if(w=document.getElementById("ccCanvas"),!w)return;const p=Math.min(window.devicePixelRatio||1,2);w.width=360*p,w.height=320*p,r=w.getContext("2d"),r&&r.setTransform(p,0,0,p,0,0),!s.done&&!i&&(h=0,i=requestAnimationFrame(B));const T=document.getElementById("ccBtn");T&&(T.onpointerdown=z=>{z.preventDefault(),m()},T.onpointerup=z=>{z.preventDefault(),f()},T.onpointerleave=()=>{s.holding&&f()})},stop:R,key(p){if(s.done){p.key==="Enter"&&(Z(),l.render());return}(p.key===" "||p.key==="Spacebar")&&p.type==="keydown"&&m()},keyup(p){(p.key===" "||p.key==="Spacebar")&&f()},act(p){p==="ccHold"?m():p==="ccRelease"&&f()},view(){if(s.done){const T=s.money>=420;return`<div class="stack">${L(["Fifteen years"])}
          ${Ne(s.ruined?"💀":T?"🗼":"📈",s.ruined?"Wiped out in year "+s.year:Math.round(s.money)+" from 100",s.ruined?'Nothing left to compound. That is the half of "high return" nobody puts on the poster.':T?"Over the line.":"Short of the line, and still "+(s.money/100).toFixed(1)+"× what you started with.",s.won,s.ruined?"Growth needs something left to grow. A swing big enough to double you is big enough to end you.":"The middle charge usually wins. Not the safe one, not the wild one — the one you can survive fifteen times in a row.","nana")}</div>`}const p=s.last;return`<div class="stack">
        ${L([`Year ${s.year+1} / 15`,`${Math.round(s.money)}`,"target 420"])}
        <div class="stage" style="min-height:0;padding:12px">
          <canvas id="ccCanvas" style="width:100%;max-width:420px;margin:0 auto;height:auto;aspect-ratio:360/320;border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          ${p?`<div style="background:${p.pct>=0?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:10px 12px;font-size:13.5px;text-align:center">
            Year ${s.year}: <b>${p.pct>=0?"+":""}${(p.pct*100).toFixed(1)}%</b> · ${Math.round(p.before)} → ${Math.round(p.after)}</div>`:""}
          <div>
            <div class="row"><span class="eyebrow grow">This year's growth</span>
              <span class="small muted">longer = more, and wilder</span></div>
            <div class="bar" style="height:16px;margin-top:5px">
              <i id="ccCharge" style="width:${s.charge}%;background:linear-gradient(90deg,var(--grow),var(--treasure) 55%,var(--spend))"></i></div>
          </div>
          <button class="btn wide" id="ccBtn" style="padding:18px" data-act="noop">HOLD TO GROW</button>
          <p class="hint">Hold space or the button, let go to lock the year in. Steady beats spectacular — usually.</p>
        </div></div>`}}}function Gn(){const t={t:0,revenue:0,spent:0,served:0,lost:0,stock:{chai:3,ice:3,umbrella:2,rope:2},q:[],done:!1,spawn:900,restock:0,msg:""};let n=0,o=0,s=0;const i=le(3312),h=G.map(f=>f.id),r=()=>{n&&cancelAnimationFrame(n),n=0},w=()=>{t.done||(t.done=!0,r(),t.profit=t.revenue-t.spent,t.won=de(Math.max(2,Math.round(t.profit/14)),"Stall Rush"),t.profit>0&&F(ne(),"profit-day"),g.level(),l.render())},k=f=>{if(t.done)return;const m=t.q.findIndex(M=>M.want===f);if(m<0){g.bad(),t.msg="Nobody is waiting for that",l.render();return}if(!t.stock[f]){g.bad(),t.msg="Out of "+f+" — restock costs time",l.render();return}const B=G.find(M=>M.id===f);t.stock[f]--,t.q.splice(m,1),t.revenue+=v(B.sells),t.served++,t.msg="",g.coin(),l.render()},R=()=>{if(t.done||t.restock>0)return;let f=0;if(G.forEach(m=>{const B=3-(t.stock[m.id]||0);B>0&&(t.stock[m.id]+=B,f+=v(m.cost)*B)}),!f){t.msg="Everything is already stocked",l.render();return}t.spent+=f,t.restock=2600,t.msg="Restocked for "+c(f)+" — and the queue did not wait",g.click(),l.render()},y=f=>{if(t.done)return;const m=Math.min(60,f-(o||f));o=f,t.t+=m,t.restock=Math.max(0,t.restock-m),t.spawn-=m;let B=!1;t.spawn<=0&&t.q.length<4&&(t.spawn=900+i()*700,t.q.push({id:++s,want:h[Math.floor(i()*h.length)],patience:1}),B=!0);for(let p=t.q.length-1;p>=0;p--)t.q[p].patience-=m/9e3,t.q[p].patience<=0&&(t.q.splice(p,1),t.lost++,B=!0,g.bad());if(t.t>=6e4){w();return}const M=document.getElementById("srTime");M&&(M.textContent=Math.ceil((6e4-t.t)/1e3)),t.q.forEach(p=>{const T=document.getElementById("srP"+p.id);T&&(T.style.width=Math.max(0,p.patience*100)+"%")}),B&&l.render(),n=requestAnimationFrame(y)};return{id:"sr",mount(){!t.done&&!n&&(o=0,n=requestAnimationFrame(y))},stop:r,key(f){if(t.done){f.key==="Enter"&&(Z(),l.render());return}const m=parseInt(f.key,10);m>=1&&m<=h.length?k(h[m-1]):(f.key==="r"||f.key==="R")&&R()},act(f,m){f==="srServe"?k(m):f==="srStock"&&R()},view(){return t.done?`<div class="stack">${L(["Closed"])}
          <div class="stage" style="justify-content:center;text-align:center">
            <div style="font-size:44px">${t.profit>0?"💹":"📉"}</div>
            <h2>${t.profit>=0?"+":"−"}${c(Math.abs(t.profit))} profit</h2>
            <div class="card" style="box-shadow:none">
              <div class="grid3">
                <div><div class="small muted">Took</div><div style="font-weight:800;color:var(--grow)">${c(t.revenue)}</div></div>
                <div><div class="small muted">Spent on stock</div><div style="font-weight:800">${c(t.spent)}</div></div>
                <div><div class="small muted">Served</div><div style="font-weight:800">${t.served}</div></div>
              </div>
            </div>
            <p class="small muted">${t.lost} customer${t.lost===1?"":"s"} gave up waiting.</p>
            ${N("nana",t.revenue>0&&t.profit<=0?"You were rushed off your feet and you are down on the day. Busy and profitable are two different words, and only one of them pays the rent.":"Revenue is the number people brag about. That one at the top is the one that decides whether you are open next year.")}
            <p class="small muted">Earned ${c(t.won)}.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`:`<div class="stack">
        ${L([`<span id="srTime">${Math.ceil((6e4-t.t)/1e3)}</span>s`,`took ${c(t.revenue)}`,`stock ${c(t.spent)}`,`lost ${t.lost}`])}
        <div class="stage">
          <div class="eyebrow">The queue</div>
          <div class="stack" style="gap:7px;min-height:132px">
            ${t.q.length?t.q.map(f=>{const m=G.find(B=>B.id===f.want);return`<div class="row" style="gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 11px">
                <span style="font-size:22px">${m.em}</span>
                <span class="grow"><b style="font-size:14px">${u(m.name)}</b>
                  <div class="bar" style="height:5px;margin-top:5px"><i id="srP${f.id}" style="width:${f.patience*100}%;background:var(--treasure);transition:none"></i></div></span>
                <span class="pill">${c(v(m.sells))}</span></div>`}).join(""):'<p class="small muted">Nobody yet. They come in waves.</p>'}
          </div>
          ${t.msg?`<p class="small" style="color:var(--spend);font-weight:650;text-align:center">${u(t.msg)}</p>`:""}
          <div class="choices" style="grid-template-columns:repeat(4,1fr)">
            ${G.map((f,m)=>`<button class="btn ${t.stock[f.id]?"":"ghost"}" data-act="srServe" data-arg="${f.id}"
              style="flex-direction:column;gap:1px;padding:8px 3px;font-size:11px;line-height:1.15">
              <span style="font-size:18px">${f.em}</span>
              <span style="font-weight:800">${u(f.name)}</span>
              <span style="opacity:.75;font-family:var(--mono);font-size:10.5px">${m+1} · ${t.stock[f.id]||0} left</span></button>`).join("")}
          </div>
          <button class="btn ghost wide" data-act="srStock" ${t.restock>0?"disabled":""}>
            ${t.restock>0?"Restocking…":"R · Restock everything"}</button>
          <p class="hint">Number keys to serve, R to restock. Restocking costs money and takes time you do not have.</p>
        </div></div>`}}}function Hn(){const a=q[Fa()].coins.slice(0,5),t=4,n=360,o=300,s={target:0,got:0,lives:3,round:1,score:0,lane:1,drops:[],t:0,spawn:0,done:!1,flash:0,msg:""};let i=0,h=0,r=null,w=null;const k=()=>{const M=2+Math.floor(Math.random()*3);let p=0;for(let T=0;T<M;T++)p+=a[Math.floor(Math.random()*a.length)];s.target=p,s.got=0,s.drops=[],s.spawn=0};k();const R=()=>{s.done||(s.done=!0,B(),s.won=de(Math.round(s.score*.5),"Change Rush"),s.round>4&&F(ne(),"exact-change"),l.render())},y=M=>{s.got+=M,s.got===s.target?(s.score+=4+s.round,s.round++,s.flash=1,s.msg="Exact!",g.coin(),k()):s.got>s.target?(s.lives--,s.flash=-1,s.msg="Overpaid by "+c(s.got-s.target),g.bad(),k(),s.lives<=0&&R()):g.click()},f=M=>{if(s.done)return;const p=Math.min(50,M-(h||M));if(h=M,s.t+=p,s.spawn-=p,s.spawn<=0){s.spawn=620-Math.min(320,s.round*40);const z=s.target-s.got,d=a.filter(S=>S<=z),E=d.length&&Math.random()<.55?d[Math.floor(Math.random()*d.length)]:a[Math.floor(Math.random()*a.length)];s.drops.push({lane:Math.floor(Math.random()*t),y:-20,v:E})}const T=.075+s.round*.012;s.drops.forEach(z=>{z.y+=T*p});for(let z=s.drops.length-1;z>=0;z--){const d=s.drops[z];d.y>o-44&&d.y<o-18&&d.lane===s.lane?(y(d.v),s.drops.splice(z,1)):d.y>o+24&&s.drops.splice(z,1)}s.flash&&(s.flash*=.93),m(),i=requestAnimationFrame(f)},m=()=>{if(!r)return;const M=getComputedStyle(document.documentElement),p=(z,d)=>(M.getPropertyValue(z)||d).trim()||d;r.clearRect(0,0,n,o),r.fillStyle=p("--tint","#EDF2F2"),r.fillRect(0,0,n,o),r.strokeStyle=p("--line","#DCE5E4"),r.lineWidth=1;for(let z=1;z<t;z++)r.beginPath(),r.moveTo(z*(n/t),0),r.lineTo(z*(n/t),o),r.stroke();s.drops.forEach(z=>{const d=z.lane*(n/t)+n/t/2;r.beginPath(),r.arc(d,z.y,15,0,Math.PI*2),r.fillStyle=p("--treasure","#F0B429"),r.fill(),r.fillStyle="#5A3D00",r.font="700 13px system-ui",r.textAlign="center",r.textBaseline="middle",r.fillText(String(z.v),d,z.y+1)});const T=s.lane*(n/t)+n/t/2;r.fillStyle=s.flash>.1?p("--grow","#178A4C"):s.flash<-.1?p("--spend","#C4453C"):p("--action","#0E6B78"),r.beginPath(),r.moveTo(T-34,o-34),r.lineTo(T+34,o-34),r.lineTo(T+26,o-6),r.lineTo(T-26,o-6),r.closePath(),r.fill()},B=()=>{i&&cancelAnimationFrame(i),i=0};return{id:"cr",mount(){if(w=document.getElementById("crCanvas"),!w)return;const M=Math.min(window.devicePixelRatio||1,2);w.width=n*M,w.height=o*M,r=w.getContext("2d"),r&&r.setTransform(M,0,0,M,0,0),s.done||(h=0,B(),i=requestAnimationFrame(f)),w.onpointerdown=p=>{const T=w.getBoundingClientRect();s.lane=he(Math.floor((p.clientX-T.left)/T.width*t),0,t-1)}},stop:B,key(M){if(s.done){M.key==="Enter"&&(Z(),l.render());return}M.key==="ArrowLeft"?s.lane=Math.max(0,s.lane-1):M.key==="ArrowRight"&&(s.lane=Math.min(t-1,s.lane+1))},act(M,p){M==="crLane"&&(s.lane=he(+p,0,t-1))},view(){return s.done?`<div class="stack">${L(["Done"])}
        ${Ne(s.round>4?"🏅":"🪙",s.round-1+" exact","Score "+s.score+".",s.won,"Overpaying is the one that costs you. A shop will take too much money all day long and never mention it.","mags")}</div>`:`<div class="stack">
        ${L([`Need ${c(s.target)}`,`Got ${c(s.got)}`,"❤️".repeat(Math.max(0,s.lives))])}
        <div class="stage" style="min-height:0;padding:12px">
          <div class="bar"><i style="width:${Math.min(100,s.got/s.target*100)}%;background:${s.got>s.target?"var(--spend)":"var(--action)"}"></i></div>
          <canvas id="crCanvas" style="width:100%;max-width:400px;margin:0 auto;height:auto;aspect-ratio:${n}/${o};border-radius:var(--r-md);display:block;touch-action:none"></canvas>
          <div class="choices" style="grid-template-columns:repeat(4,1fr);max-width:400px;margin:0 auto;width:100%">
            ${[0,1,2,3].map(M=>`<button class="btn ${s.lane===M?"":"ghost"}" data-act="crLane" data-arg="${M}" aria-label="lane ${M+1}">${M+1}</button>`).join("")}
          </div>
          <p class="hint">${s.msg?u(s.msg)+" · ":""}Arrow keys, or tap a lane. Stop at exactly the amount.</p>
        </div></div>`}}}const St=[["bea","It is down again. I told you. GET OUT."],["bea","Everyone is selling. Everyone."],["mags","Sell me yours cheap and I will look after it for you."],["bea","This one is not coming back. This one is different."],["bo","I am buying more, but I would say that."],["bea","Down eleven percent. ELEVEN."],["mags","My cousin sold at the top. You could have been my cousin."],["bea","It has never been this bad. Well — it has, but still."]];function Un(){const t={t:0,panic:0,val:1e3,low:1e3,line:[1e3,1e3,1e3],done:!1,sold:!1,shout:null,shoutT:0,calmT:0};let n=0,o=0;const s=le(4477),i=()=>{n&&cancelAnimationFrame(n),n=0},h=k=>{t.done||(t.done=!0,t.sold=k,i(),t.after=Math.round(1e3*1.12),t.soldAt=Math.round(t.val),t.won=de(k?3:14,"Market Storm"),k||F(ne(),"held-the-storm"),k?g.bad():g.level(),l.render())},r=k=>{if(t.done)return;const R=Math.min(60,k-(o||k));o=k,t.t+=R;const y=t.t/42e3,f=(s()-.5)*22;if(t.val=Math.max(520,1e3*(1-.34*Math.sin(Math.min(1,y)*Math.PI*.92))+f),t.low=Math.min(t.low,t.val),t.line.length<120&&t.t-(t.lastPt||0)>350&&(t.lastPt=t.t,t.line.push(Math.round(t.val))),t.panic=he(t.panic+R*.0022,0,100),t.shoutT-=R,t.calmT=Math.max(0,t.calmT-R),t.shoutT<=0&&(t.shoutT=3400,t.shout=St[Math.floor(s()*St.length)],t.panic=he(t.panic+11,0,100),l.render()),t.panic>=100){h(!0);return}if(t.t>=42e3){h(!1);return}const m=document.getElementById("stPanic");m&&(m.style.width=t.panic.toFixed(1)+"%");const B=document.getElementById("stVal");B&&(B.textContent=Math.round(t.val));const M=document.getElementById("stTime");M&&(M.textContent=Math.ceil((42e3-t.t)/1e3));const p=document.getElementById("stChart");p&&(p.innerHTML=Be(t.line,300,62,"var(--spend)")),n=requestAnimationFrame(r)},w=()=>{t.done||t.calmT>0||(t.panic=he(t.panic-26,0,100),t.calmT=2600,g.good(),l.render())};return{id:"st",mount(){!t.done&&!n&&(o=0,n=requestAnimationFrame(r))},stop:i,key(k){if(t.done){k.key==="Enter"&&(Z(),l.render());return}(k.key===" "||k.key==="Spacebar")&&(k.preventDefault(),w())},act(k){k==="stSell"?h(!0):k==="stPlan"&&w()},view(){if(t.done)return`<div class="stack">${L(["Storm over"])}
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
            ${N(t.sold?"bea":"nana",t.sold?"I talked you into it, and I am always this certain, and I am wrong about half the time. Have another go.":"A fall is not a loss until you sell. Sitting still is the hardest thing in this whole subject and you just did it.")}
            <p class="small muted">Earned ${c(t.won)}. Fictional market, real behaviour, nothing here is advice.</p>
            <button class="btn wide" data-act="gquit">Back to the arcade</button>
          </div></div>`;const k=t.shout;return`<div class="stack">
        ${L([`<span id="stTime">${Math.ceil((42e3-t.t)/1e3)}</span>s left`,`<span id="stVal">${Math.round(t.val)}</span> / 1000`])}
        <div class="stage">
          <div>
            <div class="row"><span class="eyebrow grow">Panic</span>
              <span class="small muted">${t.calmT>0?"reading your plan…":"space, or the small button"}</span></div>
            <div class="bar" style="height:14px;margin-top:5px">
              <i id="stPanic" style="width:${t.panic}%;background:linear-gradient(90deg,var(--treasure),var(--spend));transition:width .2s linear"></i></div>
          </div>
          <div id="stChart">${Be(t.line,300,62,"var(--spend)")}</div>
          ${k?N(k[0],u(k[1])):N("bo","It is going to be fine. Probably. I say that every week too.")}
          <div class="card" style="box-shadow:none;border-style:dashed">
            <div class="eyebrow">Your plan, in your words</div>
            <p style="font-weight:650;font-size:14.5px">"I'm in for five years. I won't sell before then unless the company stops making anything."</p>
          </div>
          <div class="grow"></div>
          <button class="btn wide" style="background:var(--spend)" data-act="stSell">SELL EVERYTHING</button>
          <button class="btn ghost wide" data-act="stPlan" ${t.calmT>0?"disabled":""}>Re-read my plan · space</button>
          <p class="hint">Doing nothing is the move. It will not feel like one.</p>
        </div></div>`}}}const Et=document.getElementById("app");let X={step:0},Ze=!1;const Ee=[{k:"home",n:"Home",g:"🏘️"},{k:"learn",n:"Learn",g:"📗"},{k:"money",n:"Money",g:"🪙"},{k:"arcade",n:"Arcade",g:"🎮"},{k:"store",n:"Store",g:"🛒"},{k:"progress",n:"Progress",g:"📈"},{k:"collection",n:"Collection",g:"🏅"}],Kn=[{k:"worlds",n:"Worlds",g:"🗺️"},{k:"parents",n:"Grown-up's page",g:"👪"}],Ba=["home","learn","money","arcade"];function Jn(){if(!l.s||!l.s.kids.length)return;const e=l.s.ui,a="#/"+e.nav+(e.nav==="money"?"/"+e.sub:"");location.hash!==a&&(Ze=!0,location.hash=a,Ze=!1)}function za(){const e=(location.hash||"").replace(/^#\/?/,"").split("/");return!e[0]||Ee.map(t=>t.k).concat(["parents","worlds"]).indexOf(e[0])<0?!1:(l.s.ui.nav=e[0],e[0]==="money"&&e[1]&&(l.s.ui.sub=e[1]),!0)}function x(){const e=l.s;if(!e||!e.kids.length||l.adding){Et.innerHTML=`<div class="content">${sn(X)}</div>`;return}const a=ae(e),t=a.band==="sprout",n=t?Ee.filter(i=>Ba.includes(i.k)):Ee,o=e.ui.nav==="learn"?cn():e.ui.nav==="money"?mn():e.ui.nav==="arcade"?jn():e.ui.nav==="store"?$n():e.ui.nav==="progress"?xn():e.ui.nav==="parents"?Tn():e.ui.nav==="worlds"?dn():e.ui.nav==="collection"?Mn():on(),s=t?n:Ee.slice(0,4).concat([{k:"more",n:"More",g:"⋯"}]);Et.innerHTML=`
    <header class="topbar">
      <div class="topbar-in">
        <button class="brand" data-act="nav" data-arg="home"><em>Bizzing</em> Finance</button>
        <button class="chip money" data-act="nav" data-arg="money"
          title="Your money — this opens the town's ledger, not the shop">${c(a.money.wallet)}</button>
        <span class="chip streak" title="Days in a row">🔥 ${a.streak.days.length}</span>
        <button class="iconbtn" data-act="mode" aria-label="Light or dark">${l.mode==="dark"?"☾":"☀"}</button>
        <button class="iconbtn" data-act="nav" data-arg="parents" aria-label="Grown-up's page">👪</button>
      </div>
      <nav class="nav" aria-label="Sections">
        ${n.map(i=>`<button class="navbtn" data-act="nav" data-arg="${i.k}"
          aria-current="${e.ui.nav===i.k?"page":"false"}">${i.n}</button>`).join("")}
      </nav>
    </header>
    <main class="content">${Ut(e)?_n():""}${o}</main>
    <nav class="tabbar" aria-label="Primary">
      ${s.map(i=>`<button data-act="${i.k==="more"?"more":"nav"}" data-arg="${i.k}"
        aria-current="${e.ui.nav===i.k?"page":"false"}"><span class="gl">${i.g}</span><span>${i.n}</span></button>`).join("")}
    </nav>
    ${l.overlay?Vn():""}`,l.game&&l.game.mount&&l.game.mount(),Jn(),Aa(e)}l.render=x;function _n(){return`<div class="card" style="border-color:var(--treasure);background:var(--treasure-tint);margin-bottom:14px">
    <div class="eyebrow" style="color:var(--treasure-deep)">The town clock</div>
    <p class="small" style="color:var(--treasure-deep)">This device's clock has gone backwards, so Bizzington is holding
      the date it last saw. Pay day cannot be replayed by winding a clock back — in the shipping build the time comes
      from the server and this cannot happen at all.</p></div>`}function Vn(){const e=l.overlay,a=ae(l.s),t=(n,o)=>`<div class="ov" data-act="closeOv"><div class="ovbox" data-act="noop" role="dialog" aria-modal="true">${n}</div></div>`;if(e.kind==="letter"){const n=e.letter,o=n.from==="scam"?null:H[n.from];return t(`
      <div class="row" style="gap:11px;margin-bottom:12px">
        <span style="width:46px;height:46px;flex:0 0 auto;border-radius:50%;overflow:hidden;border:1px solid var(--line);display:block;background:var(--surface2)">
          ${o?o.svg:'<div style="display:grid;place-items:center;height:100%;font-size:22px">✉️</div>'}</span>
        <div class="grow"><div class="eyebrow">${o?u(o.name):"Sender unknown"}</div>
        <h3 style="font-size:19px">${u(n.title)}</h3></div></div>
      <p style="font-size:15px;line-height:1.6;background:var(--tint);border-radius:var(--r-md);padding:13px 15px">${u(n.body)}</p>
      ${e.result?`<div style="margin-top:12px;background:${e.result.good?"var(--grow-tint)":"var(--spend-tint)"};border-radius:var(--r-md);padding:13px 15px;font-size:14px">${u(e.result.note)}</div>
           <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">
             ${e.result.money?`<span class="pill gold">${e.result.money>0?"+":"−"}${c(Math.abs(e.result.money))}</span>`:""}
             <span class="pill grow">+${e.result.xp} XP</span>
             ${e.result.badge?`<span class="pill gold">${te[e.result.badge].em} ${u(te[e.result.badge].name)}</span>`:""}</div>
           <button class="btn wide" style="margin-top:14px" data-act="closeOv">Back to the street</button>`:`<div class="stack" style="gap:8px;margin-top:14px">
            ${n.choices.map((s,i)=>`<button class="opt" data-act="letterPick" data-arg="${i}">${u(s.label)}</button>`).join("")}
           </div>`}`)}if(e.kind==="payday"){const n=e.res;return t(`
      <div style="text-align:center"><div style="font-size:44px">🔔</div>
        <div class="eyebrow">The bell rang</div>
        <h2 style="margin:4px 0 10px">Pay day in Bizzington</h2></div>
      <div class="stack" style="gap:7px">
        <div class="row"><span class="grow">Wages</span><b style="color:var(--grow)">+${c(n.wage)}</b></div>
        ${n.chores.map(o=>`<div class="row"><span class="grow muted">${u(o.name)}</span><b style="color:var(--grow)">+${c(o.amt)}</b></div>`).join("")}
        ${n.bills.map(o=>`<div class="row"><span class="grow muted">${u(o.name)}</span><b>−${c(o.amt)}</b></div>`).join("")}
        ${n.interest?`<div class="row"><span class="grow">Bank interest</span><b style="color:var(--grow)">+${c(n.interest)}</b></div>`:""}
        ${n.loan?`<div class="row"><span class="grow muted">Loan repayment</span><b>−${c(n.loan)}</b></div>`:""}
        ${n.split?`<div class="sep"></div><div class="eyebrow">Your rule split it before you could think about it</div>
          ${Object.keys(n.split).map(o=>`<div class="row"><span class="grow muted">${o[0].toUpperCase()+o.slice(1)} jar</span><b>${c(n.split[o])}</b></div>`).join("")}`:""}
      </div>
      <div class="sep" style="margin:12px 0"></div>
      <div class="row"><span class="grow" style="font-weight:800">In your pocket now</span><span class="big" style="font-size:22px">${c(a.money.wallet)}</span></div>
      ${n.loanCleared?'<div style="margin-top:10px;background:var(--grow-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px"><b>Loan cleared.</b> Your trust score went up, and the next one will be cheaper.</div>':""}
      ${n.mortgageCleared?'<div style="margin-top:10px;background:var(--grow-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px"><b>Mortgage cleared.</b> You own where you live outright. Rent would still be going out today.</div>':""}
      ${(n.independence||[]).map(o=>`<div style="margin-top:10px;background:var(--treasure-tint);border-radius:var(--r-md);padding:11px 13px;font-size:14px">
        <b>${te[o].em} ${u(te[o].name)}</b> — ${u(te[o].desc)}</div>`).join("")}
      ${N("pip",n.split?"Split before you could think about it. That is the point of a rule.":"Open the Jar Shed and set a rule — then this happens by itself.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Out into the market →</button>`)}if(e.kind==="level"){const n=Le.find(s=>s.lv>e.from&&s.lv<=e.level),o=et(e.level);return t(`
      <div style="text-align:center">
        <div style="width:96px;height:96px;margin:0 auto 8px;border-radius:50%;overflow:hidden">${H.pip.svg}</div>
        <div class="eyebrow">Level ${e.level} · ${o.em} ${o.name}</div>
        <h2 style="margin:4px 0 8px;font-size:28px">${n?u(n.name)+" is open":"Level "+e.level}</h2>
        <p class="muted">${n?u(n.blurb):"Learning "+u(o.of)+"."}</p>
        ${n?`<button class="btn wide" style="margin-top:16px" data-act="goPlace" data-arg="${n.key}">Go and look →</button>`:""}
        <button class="${n?"small muted":"btn wide"}" style="margin-top:10px;width:100%;text-align:center" data-act="closeOv">${n?"Later":"Keep going"}</button>
      </div>`)}if(e.kind==="biz"){const n=e.day,o=n.weather;return t(`
      <div style="text-align:center"><div style="font-size:42px">${o.em}</div>
        <div class="eyebrow">${u(o.name)}</div>
        <h2 style="margin:4px 0 10px">Day's trading</h2></div>
      <div class="stack" style="gap:6px">
        ${G.filter(s=>n.sold[s.id]).map(s=>`<div class="row"><span class="grow muted">${s.em} ${n.sold[s.id]} × ${u(s.name)}</span><b style="color:var(--grow)">+${c(n.sold[s.id]*ae(l.s).biz.prices[s.id])}</b></div>`).join("")||'<p class="small muted">Nothing sold. It happens — the rent still arrived.</p>'}
        <div class="sep"></div>
        <div class="row"><span class="grow">Revenue</span><b>${c(n.revenue)}</b></div>
        <div class="row"><span class="grow muted">Rent</span><b>−${c(n.rent)}</b></div>
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Profit</span>
          <span class="big" style="font-size:22px;color:${n.profit>=0?"var(--grow)":"var(--spend)"}">${n.profit>=0?"+":"−"}${c(Math.abs(n.profit))}</span></div>
      </div>
      ${Object.keys(n.spoiled||{}).length?`<div style="margin-top:11px;background:var(--spend-tint);border-radius:var(--r-md);padding:11px 13px;font-size:13.5px">
        ${Object.keys(n.spoiled).map(s=>n.spoiled[s]+" "+G.find(i=>i.id===s).name.toLowerCase()).join(", ")} melted overnight — stock you had already paid for.</div>`:""}
      ${N("nana",n.profit>=0?"Revenue is the number people brag about. That one at the bottom is the one that decides whether you are open next year.":"A loss is information, not a verdict. Look at what the weather wanted and what you had on the counter.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Close up →</button>`)}if(e.kind==="moved"){const n=e.home,o=me(a)-ke(a);return t(`
      <div style="text-align:center"><div style="font-size:46px">${n.em}</div>
        <div class="eyebrow">Keys</div>
        <h2 style="margin:4px 0 8px;font-size:26px">${u(n.name)}</h2>
        <p class="muted">${u(n.blurb)}</p></div>
      <div class="stack" style="gap:6px;margin-top:14px">
        ${a.money.bills.map(s=>`<div class="row"><span class="grow muted">${u(s.name)}</span><b>−${c(s.amt)}</b></div>`).join("")}
        <div class="sep"></div>
        <div class="row"><span class="grow" style="font-weight:800">Left each week</span>
          <span class="big" style="font-size:21px;color:${o>0?"var(--grow)":"var(--spend)"}">${c(o)}</span></div>
      </div>
      ${N("nana",o>0?"Every room you add adds a bill behind it. That is not a warning — it is just the arithmetic, and now you have seen it.":"That is more going out than coming in. It is survivable for a while and it is not survivable forever. Worth knowing now.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Settle in →</button>`)}if(e.kind==="world"){const n=e.world;return t(`
      <div style="text-align:center"><div style="font-size:46px">${n.em}</div>
        <div class="eyebrow">${u(n.rank)}</div>
        <h2 style="margin:4px 0 8px;font-size:27px">${u(n.name)}</h2>
        <p class="muted">${u(n.blurb)}</p></div>
      <div style="margin-top:14px;background:var(--action-tint);border-radius:var(--r-md);padding:12px 14px;font-size:14px">
        <b>Opens here:</b> ${u(n.opens)}</div>
      ${N("pip","New street, new work going, new things to learn. You got here by finishing the last lot — that is the only way anybody gets anywhere in this town.")}
      <button class="btn wide" style="margin-top:12px" data-act="closeOv">Look around →</button>`)}if(e.kind==="between"){const n=e.card;return t(`
      <div class="eyebrow">While you're here</div>
      <h3 style="font-size:19px;margin:4px 0 8px">${u(n.title)}</h3>
      ${N(n.who,"One card. Three minutes. Then back to it.")}
      <div class="row" style="gap:8px;margin-top:14px">
        <button class="btn grow" data-act="betweenGo" data-arg="${n.id}">Read it</button>
        <button class="btn ghost" data-act="closeOv">Not now</button>
      </div>`)}if(e.kind==="more"){const n=Ee.filter(o=>!Ba.includes(o.k)).concat(Kn);return t(`<div class="eyebrow" style="margin-bottom:10px">Everything else</div>
      <div class="stack" style="gap:8px">
        ${n.map(o=>`<button class="opt" data-act="nav" data-arg="${o.k}">${o.g} &nbsp;${o.n}</button>`).join("")}
      </div>`)}return""}const A=()=>ae(l.s);$("noop",()=>{});$("closeOv",()=>{l.overlay=null,x()});$("more",()=>{l.overlay={kind:"more"},x()});$("nav",e=>{l.overlay=null,l.shelf="",l.game&&Z(),l.s.ui.nav=e,l.s.kids.length&&(A().learn.openCard=null),g.click(),x(),window.scrollTo(0,0)});$("sub",e=>{l.overlay=null,l.s.ui.nav="money",l.s.ui.sub=e,g.click(),x(),window.scrollTo(0,0)});$("shelf",e=>{l.shelf=e||"",l.query="",x(),window.scrollTo(0,0)});$("locked",e=>{C(`Opens at level ${e} — keep learning`),g.bad()});$("lockedSub",e=>{C("Finish “"+(It(e)||"the chapter")+"” first"),g.bad(),oe("nav","learn")});$("lockedGame",e=>{const a=De.find(n=>n.id===e),t=a&&U.find(n=>n.id===a.needs);C("Finish “"+(t?t.title:"the chapter")+"” to open "+(a?a.name:"this")),g.bad(),oe("nav","learn")});$("travel",e=>{const a=A(),t=lt(a,+e);if(!t.ok){C(t.why),g.bad();return}Zt(a,+e);const n=K[+e];g.level(),re(35),l.overlay={kind:"world",world:n},l.s.ui.nav="home",x()});$("claim",e=>{const a=Qt(A(),e);a?(g.coin(),C("+"+c(a))):C("Not finished yet"),x()});$("questBonus",()=>{const e=ea(A());e&&(g.level(),re(40),C("All three — "+c(e))),x()});$("mode",()=>{l.mode=l.mode==="dark"?"light":"dark",document.documentElement.setAttribute("data-mode",l.mode);try{localStorage.setItem("bzf_mode",l.mode)}catch{}x()});$("sound",()=>{l.s.settings.sound=!l.s.settings.sound,Ct(l.s.settings.sound),g.click(),x()});$("obNext",()=>{const e=(l.fields.name||"").trim();if(!e){C("Type a name first");return}X.name=e,X.step=1,g.click(),x()});$("obBand",e=>{X.band=e,X.step=2,g.click(),x()});$("obCancel",()=>{X={step:0},l.adding=!1,x()});$("obCur",e=>{l.s||(l.s=Gt());const a=Ot(X.name,X.band,e);l.s.kids.push(a),l.s.active=l.s.kids.length-1,l.s.ui={nav:"home",sub:"wallet"},Ce(e),l.fields={},X={step:0},l.adding=!1,g.level(),re(40),x()});$("town",e=>{const a=Le.find(t=>t.key===e);if(a){if(!Oe(A(),a.sub)){oe("lockedSub",a.sub);return}oe("sub",a.sub)}});$("goPlace",e=>{l.overlay=null,oe("town",e)});$("betweenGo",e=>{l.overlay=null,oe("card",e)});$("card",e=>{l.s.ui.nav="learn",l.shelf="",A().learn.openCard=e,A().learn.drill=null,g.click(),x(),window.scrollTo(0,0)});$("closeCard",()=>{A().learn.openCard=null,A().learn.drill=null,x()});$("answer",e=>{const a=A(),t=ie.find(s=>s.id===a.learn.openCard);if(!t||a.learn.drill&&a.learn.drill.card===t.id)return;const n=+e,o=n===tt(t).answer;a.learn.drill={card:t.id,pick:n,right:o},o?g.good():g.bad(),x()});$("cardDone",e=>{const a=A(),t=ie.find(h=>h.id===e);if(!t)return;const n=!!(a.learn.drill&&a.learn.drill.right),o=!a.learn.done[e];a.learn.done[e]=!0,o&&_(a,"lesson",1);const s=He(a,o?n?22:12:2),i=U.find(h=>h.id===t.ch);i.cards.every(h=>a.learn.done[h.id])&&F(a,"chapter-"+i.id),a.learn.openCard=null,a.learn.drill=null,s.leveled?gt(s):(C("+"+s.gained+" XP"),x())});function gt(e){g.level(),re(50),l.overlay={kind:"level",level:e.level,from:e.from},x()}$("postbox",()=>{const e=A();if(e.postbox.answered){C("Emptied — another one tomorrow");return}l.overlay={kind:"letter",letter:vt[e.postbox.idx%vt.length],result:null},g.click(),x()});$("letterPick",e=>{const a=A(),t=l.overlay.letter,n=t.choices[+e];let o=0;if(n.wallet){const i=v(Math.abs(n.wallet));n.wallet>0?(ye(a,i,t.title,"letter"),o=i):(Kt(a,i,t.title,"letter"),o=-i)}const s=He(a,n.xp||0);n.badge&&F(a,n.badge),a.postbox.answered=!0,a.postbox.log.push({id:t.id,scam:!!t.scam,safe:!!n.safe,t:Date.now()}),_(a,"letter",1),t.scam&&n.safe&&_(a,"scam",1),P(a),l.overlay.result={note:n.note,money:o,xp:n.xp||0,badge:n.badge,good:!(t.scam&&!n.safe)},o>0?g.coin():t.scam&&!n.safe?g.bad():g.good(),x(),s.leveled&&setTimeout(()=>gt(s),900)});$("payday",()=>{const e=A();if(!ht(e,l.s)){C("Not yet — the bell rings on "+We(e.money.nextPay));return}l.overlay={kind:"payday",res:aa(e,l.s)},g.bell(),re(30),x()});$("skipWeek",()=>{oa(A(),l.s),C("Clock pushed to pay day"),oe("nav","home")});$("grantXP",()=>{const e=He(A(),200);e.leveled?gt(e):(C("+200 XP"),x())});$("wipe",()=>{if(confirm("Start this household over? Every town in it goes.")){try{localStorage.removeItem("bzf_profile"),localStorage.removeItem("bzf_v1")}catch{}l.s=null,X={step:0},location.hash="",x()}});$("job",e=>{const a=Xt(A(),e);a?(g.coin(),C("+"+c(a))):C("Done that one today"),x()});$("jarIn",e=>{ia(A(),e,v(2))?g.coin():C("Wallet is empty"),x()});$("jarOut",e=>{ra(A(),e,v(2))?g.click():C("That jar is empty"),x()});$("rule",e=>{const[a,t]=e.split(":"),n=A().money.rules;n[a]=Math.max(0,Math.min(100,n[a]+ +t)),g.click(),x()});$("addGoal",()=>{const e=(l.fields.goalName||"").trim(),a=parseInt(String(l.fields.goalAmt||"").replace(/[^0-9]/g,""),10);if(!e){C("Name it first");return}if(!a||a<=0){C("How much does it cost?");return}la(A(),e,a),l.fields.goalName="",l.fields.goalAmt="",g.good(),C("Scaffolding up"),x()});$("fundGoal",e=>{if(!da(A(),e,v(5))){C("The Save jar is empty");return}const a=A().money.goals.find(t=>t.id===e);a&&a.done?(g.level(),re(40),C("Built it!")):g.coin(),x()});$("autoGoal",e=>{const a=A().money.goals.find(t=>t.id===e);a&&(a.auto=a.auto?0:v(5),C(a.auto?"Will move "+c(a.auto)+" every pay day":"Auto-save off"),g.click(),x())});$("raidGoal",e=>{ut(A(),e)&&(g.bad(),C("Scaffolding came down")),x()});$("bankIn",()=>{ha(A(),v(10))?g.coin():C("Nothing in the Save jar"),x()});$("bankOut",()=>{ua(A(),v(10)),g.click(),x()});$("loan",()=>{const e=A(),a=mt(e,40,8);confirm(`Borrow ${c(a.amount)}?

You pay back ${c(a.perWeek)} every pay day for ${a.weeks} pay days.
You hand over ${c(a.total)} in total.
So it costs ${c(a.cost)}.`)&&(pa(e,a),g.coin(),C("Borrowed — and you knew the cost first"),x())});$("repay",()=>{const e=ma(A(),A().money.wallet);e&&(g.coin(),C("Repaid "+c(e))),x()});$("buy",e=>{if(!ya(A(),e,v(5))){C("Fill the Grow jar first");return}g.coin(),x()});$("sell",e=>{ga(A(),e),g.click(),x()});$("openBiz",()=>{ba(A()),g.level(),re(30),x()});$("bizBuy",e=>{va(A(),e,5)?g.coin():C("Not enough in the till"),x()});$("bizPrice",e=>{const[a,t]=e.split(":");wa(A(),a,v(1)*+t),g.click(),x()});$("bizTrade",()=>{const e=A();if(!G.some(n=>(e.biz.stock[n.id]||0)>0)){C("Buy something to sell first"),g.bad();return}const t=ka(e);l.overlay={kind:"biz",day:t},t.profit>=0?g.coin():g.bad(),x()});$("bizCashOut",()=>{const e=$a(A());e&&(g.coin(),C("Drew "+c(e)+" from the till")),x()});$("cool",e=>{A().shop.cooling[e]=Date.now()+24*36e5,C("Come back tomorrow — see if you still want it"),g.click(),x()});$("buyItem",e=>{const a=A(),t=Pt.find(s=>s.id===e),n=v(t.units);let o=n-a.money.wallet;if(o>0){const s=Math.min(o,a.money.jars.spend);a.money.jars.spend-=s,a.money.wallet+=s,o-=s}if(o>0){C("Not enough — even after the Spend jar"),g.bad();return}a.money.wallet-=n,D(a,"out",n,t.name,"shop"),a.shop.owned.push(e),P(a),g.coin(),C(t.name+" is yours"),x()});$("move",e=>{const a=A(),t=+e,n=je[t],o=ot(a,t);if(!o.ok){C(o.why),g.bad();return}if(!Yt(a,t)){C("Could not move");return}g.level(),re(45),l.overlay={kind:"moved",home:n},x()});$("allow",e=>{const a=A(),t=v(5);if(a.family.allowance==null)a.family.allowance=+e>0?t:null;else{const n=a.family.allowance+t*+e;a.family.allowance=n<t?null:n}g.click(),x()});$("coolOff",()=>{A().family.coolOff=!A().family.coolOff,g.click(),x()});$("chore",e=>{const a=A().family.chores[e];a.done=!a.done,g.click(),x()});$("choreAdd",()=>{const e=(l.fields.choreName||"").trim(),a=parseInt(String(l.fields.choreAmt||"").replace(/[^0-9]/g,""),10);if(!e||!a){C("A job and an amount");return}A().family.chores.push({name:e,amt:a,done:!1}),l.fields.choreName="",l.fields.choreAmt="",g.good(),x()});$("choreDel",e=>{A().family.chores.splice(+e,1),x()});$("switchKid",e=>{l.s.active=+e,Ce(A().currency),yt(A()),l.s.ui={nav:"home",sub:"wallet"},g.click(),C("Now playing as "+A().name),x()});$("addKid",()=>{l.adding=!0,X={step:0},l.fields={},x()});$("band",()=>{const e=A();e.band=e.band==="sprout"?"builder":"sprout",g.click(),x()});$("print",()=>{document.body.classList.add("printing");const e=A(),a=document.createElement("div");a.id="printsheet",a.innerHTML=`<h1>${u(e.name)} · Bizzington</h1>
    <p>Week to ${new Date().toLocaleDateString()} · level ${e.learn.level} · ${Qe(e.learn.level)}</p>
    <h2>Money</h2>
    <p>Wallet ${c(e.money.wallet)} · jars ${c(Ge(e))} · bank ${c(e.money.bank.balance)} ·
       invested ${c(Te(e))} · <b>net worth ${c($e(e))}</b></p>
    <h2>Chapters</h2>
    <ul>${U.map(t=>`<li>${u(t.title)} — ${t.cards.filter(n=>e.learn.done[n.id]).length}/${t.cards.length}</li>`).join("")}</ul>
    <h2>Recent movements</h2>
    <ul>${e.money.txns.slice(0,20).map(t=>`<li>${new Date(t.t).toLocaleDateString()} — ${u(t.label)} — ${t.kind==="in"?"+":"−"}${c(t.amt)}</li>`).join("")}</ul>
    <p style="margin-top:18px;font-size:11px">Simulated money only. Bizzing Finance never touches real money.</p>`,document.body.appendChild(a),setTimeout(()=>{try{window.print()}catch{C("Printing is not available here")}setTimeout(()=>{a.remove(),document.body.classList.remove("printing")},400)},60)});$("game",e=>{const a=A();_(a,"game",1),e==="mn"&&_(a,"board",1),Rn(e),x()});$("gquit",()=>{Z();const e=A(),a=ie.find(t=>!e.learn.done[t.id]&&A().learn.level>=U.find(n=>n.id===t.ch).lv);a&&Math.random()<.7&&(l.overlay={kind:"between",card:a}),x()});Ln.forEach(e=>{$(e,a=>{l.game&&l.game.act&&l.game.act(e,a)})});Ra(document.body);document.body.addEventListener("input",e=>{const a=e.target.getAttribute&&e.target.getAttribute("data-field");a&&(l.fields[a]=e.target.value,e.target.getAttribute("data-live")&&Ca(a,e.target.value))});document.body.addEventListener("change",e=>{const a=e.target.getAttribute&&e.target.getAttribute("data-field");a&&e.target.getAttribute("data-live")&&Ca(a,e.target.value)});function Ca(e,a){e==="query"?(l.query=a,x(),Xn("query")):e==="cur"?(Ta(A(),a),C("Converted to "+q[a].name),x()):e==="payday"&&(sa(A(),+a),C("Pay day moves to "+["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][+a]),x())}function Xn(e){const a=document.querySelector(`[data-field="${e}"]`);a&&(a.focus(),a.setSelectionRange(a.value.length,a.value.length))}document.addEventListener("keyup",e=>{l.game&&l.game.keyup&&!l.overlay&&l.game.keyup(e)});document.addEventListener("keydown",e=>{if(l.game&&l.game.key&&!l.overlay){["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter"," "].includes(e.key)&&document.activeElement&&document.activeElement.tagName!=="INPUT"&&e.preventDefault(),l.game.key(e);return}e.key==="Escape"&&l.overlay&&(l.overlay=null,x())});window.addEventListener("hashchange",()=>{Ze||!l.s||!l.s.kids.length||za()&&(l.overlay=null,l.game&&Z(),x())});try{l.mode=localStorage.getItem("bzf_mode")||null}catch{l.mode=null}l.mode&&document.documentElement.setAttribute("data-mode",l.mode);l.s=Ma();l.s&&l.s.kids.length&&(Ct(l.s.settings.sound),yt(ae(l.s)),za());x();"serviceWorker"in navigator&&/^https?:$/.test(location.protocol)&&!window.BZF_SINGLE&&window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})});window.BZF={R:l,sim:nn,allCards:ie,key:e=>tt(ie.find(a=>a.id===e)).answer};
