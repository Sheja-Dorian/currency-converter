// frontend/app.js
const API_BASE = 'https://api.frankfurter.app';
const fromEl = document.getElementById('from');
const toEl = document.getElementById('to');
const amountEl = document.getElementById('amount');
const convertBtn = document.getElementById('convert');
const swapBtn = document.getElementById('swap');
const resultEl = document.getElementById('result');
const ctx = document.getElementById('historyChart');
let chart = null;

async function fetchCurrencies(){
  try{
    const res = await fetch(`${API_BASE}/currencies`);
    const data = await res.json();
    return data;
  }catch(e){
    console.error('Failed to fetch currencies', e);
    return null;
  }
}

function populateCurrencySelects(list){
  const codes = Object.keys(list).sort();
  for(const code of codes){
    const opt1 = document.createElement('option'); opt1.value = code; opt1.textContent = `${code} — ${list[code]}`;
    const opt2 = opt1.cloneNode(true);
    fromEl.appendChild(opt1);
    toEl.appendChild(opt2);
  }
  // sensible defaults
  fromEl.value = 'USD';
  toEl.value = 'EUR';
}

async function convert(){
  const from = fromEl.value;
  const to = toEl.value;
  const amount = Number(amountEl.value) || 0;
  if(!from || !to) return;
  resultEl.textContent = 'Converting…';
  try{
    const q = `?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(`${API_BASE}/latest${q}`);
    if(!res.ok) throw new Error('Bad response');
    const data = await res.json();
    const rate = data.rates[to];
    const converted = rate;
    resultEl.textContent = `${amount} ${from} = ${converted.toFixed(4)} ${to}    (base: ${data.base}, date: ${data.date})`;
    // draw history
    drawHistory(from, to);
    // save last conversion to localStorage
    localStorage.setItem('lastConversion', JSON.stringify({from,to,amount,converted,date:data.date}));
  }catch(err){
    console.error(err);
    resultEl.textContent = 'Conversion failed — showing fallback or cached result.';
    const cached = localStorage.getItem('lastConversion');
    if(cached) resultEl.textContent = 'Cached: ' + cached;
  }
}

async function drawHistory(from, to){
  try{
    // get last 7 days including today
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate() - 6);
    const fmt = d => d.toISOString().slice(0,10);
    const url = `${API_BASE}/${fmt(start)}..${fmt(end)}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('history fetch failed');
    const data = await res.json();
    const labels = Object.keys(data.rates).sort();
    const values = labels.map(d => data.rates[d][to]);

    if(chart){ chart.destroy(); chart = null; }
    chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: `${from}/${to} (last 7 days)`, data: values, tension: 0.3 }] },
      options: { responsive: true, plugins: { legend: { display: true } } }
    });
  }catch(err){
    console.error('history chart failed', err);
  }
}

async function init(){
  const currencies = await fetchCurrencies();
  if(currencies){ populateCurrencySelects(currencies); }
  // load last conversion if available
  const last = localStorage.getItem('lastConversion');
  if(last){ try{ const j = JSON.parse(last); fromEl.value=j.from; toEl.value=j.to; amountEl.value=j.amount; resultEl.textContent = `${j.amount} ${j.from} = ${j.converted.toFixed ? j.converted.toFixed(4) : j.converted}`;}catch(e){} }
  convertBtn.addEventListener('click', convert);
  swapBtn.addEventListener('click', ()=>{const a=fromEl.value; fromEl.value=toEl.value; toEl.value=a;});
}

window.addEventListener('load', init);