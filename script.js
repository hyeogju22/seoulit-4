const COINS = [
  { sym: 'BTC', name: '비트코인',   price: 84500000, chg: 2.4,  color: '#f7931a', amount: 0.085, avgPrice: 81000000 },
  { sym: 'ETH', name: '이더리움',   price: 3120000,  chg: 3.8,  color: '#627eea', amount: 1.2,   avgPrice: 3000000 },
  { sym: 'SOL', name: '솔라나',     price: 192000,    chg: -1.2, color: '#9945ff', amount: 8.5,   avgPrice: 195000 },
  { sym: 'BNB', name: '바이낸스',   price: 412000,    chg: 0.8,  color: '#f3ba2f', amount: 2.4,   avgPrice: 405000 },
  { sym: 'XRP', name: '리플',       price: 624,        chg: -0.5, color: '#23292f', amount: 1240,  avgPrice: 630 },
  { sym: 'ADA', name: '카르다노',   price: 580,        chg: 1.4,  color: '#0033ad', amount: 800,   avgPrice: 560 },
];

let userCash = 10000000; 
let selectedCoin = COINS[0]; 

let initialTotalAsset = userCash;
COINS.forEach(c => {
  initialTotalAsset += c.avgPrice * c.amount;
});

const chartDataStorage = {};
COINS.forEach(c => {
  chartDataStorage[c.sym] = makeInitialData(c.price, c.chg);
});

function fmt(v) {
  if (Math.abs(v) >= 10000) return Math.round(v).toLocaleString('ko-KR');
  return v.toFixed(2);
}

function makeInitialData(base, chg, n = 20) {
  const out = [];
  let v = base * (1 - chg / 100);
  for (let i = 0; i < n; i++) {
    v *= 1 + (Math.random() - 0.5) * 0.01;
    out.push(v);
  }
  out.push(base);
  return out;
}

function initCoinList() {
  const coinList = document.getElementById('coinList');
  if (!coinList) return;
  coinList.innerHTML = '';
  
  COINS.forEach((c) => {
    const el = document.createElement('li');
    el.id = `list-${c.sym}`;
    el.className = 'coin' + (c.sym === selectedCoin.sym ? ' active' : '');
    el.innerHTML = `
      <div class="coin-ic" style="background:${c.color}22;color:${c.color}">${c.sym[0]}</div>
      <div class="coin-info"><b>${c.name}</b><span>${c.sym}</span></div>
      <div class="coin-price" id="lp-${c.sym}">₩ 0</div>
      <div class="coin-chg" id="lc-${c.sym}">0%</div>
    `;
    el.addEventListener('click', () => {
      selectedCoin = c;
      document.querySelectorAll('.coin').forEach((x) => x.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('chartCoin').textContent = `${c.sym} / KRW`;
      selectOrderCoin(c);
      updateChart(c);
    });
    coinList.appendChild(el);
  });
}

function updateCoinListValues() {
  COINS.forEach(c => {
    const priceEl = document.getElementById(`lp-${c.sym}`);
    const chgEl = document.getElementById(`lc-${c.sym}`);
    if (priceEl) priceEl.textContent = `₩ ${fmt(c.price)}`;
    if (chgEl) {
      chgEl.textContent = `${c.chg >= 0 ? '▲' : '▼'} ${Math.abs(c.chg).toFixed(2)}%`;
      chgEl.className = `coin-chg ${c.chg >= 0 ? 'up' : 'down'}`;
    }
  });
}

function selectOrderCoin(c) {
  document.getElementById('orderCoinName').textContent = c.name;
  document.getElementById('orderCoinSym').textContent = c.sym;
  document.getElementById('inputUnit').textContent = c.sym;
  document.getElementById('orderPrice').textContent = '₩ ' + fmt(c.price);
  document.getElementById('orderMyAmount').textContent = c.amount.toFixed(4);
}

function updatePortfolioAndHoldings() {
  let totalCoinValue = 0;

  COINS.forEach((c) => {
    const value = c.price * c.amount;
    const cost = c.avgPrice * c.amount;
    const pnl = c.amount > 0 ? (value - cost) : 0;
    const pct = cost > 0 ? (pnl / cost) * 100 : 0;
    
    totalCoinValue += value;

    const tr = document.getElementById(`row-${c.sym}`);
    if (tr) {
      tr.innerHTML = `
        <td>${c.sym} <span style="color:var(--muted);font-weight:400">${c.name}</span></td>
        <td>${c.amount.toFixed(4)}</td>
        <td>₩ ${fmt(c.avgPrice)}</td>
        <td>₩ ${fmt(c.price)}</td>
        <td class="${pnl >= 0 ? 'up' : 'down'}">${pnl > 0 ? '+' : ''}${c.amount > 0 ? '₩ ' + fmt(pnl) : '₩ 0'}</td>
        <td class="${pct >= 0 ? 'up' : 'down'}">${pct > 0 ? '+' : ''}${pct.toFixed(2)}%</td>
      `;
    }
  });

  const currentTotalAsset = userCash + totalCoinValue;
  document.getElementById('userCash').textContent = Math.floor(userCash).toLocaleString('ko-KR');
  document.getElementById('portfolio').textContent = '₩ ' + Math.floor(currentTotalAsset).toLocaleString('ko-KR');

  const totalPnl = currentTotalAsset - initialTotalAsset;
  const totalPct = (totalPnl / initialTotalAsset) * 100;

  const chgEl = document.getElementById('change');
  chgEl.textContent = `${totalPnl >= 0 ? '▲' : '▼'} ₩ ${Math.abs(Math.floor(totalPnl)).toLocaleString('ko-KR')} (${totalPnl >= 0 ? '+' : ''}${totalPct.toFixed(2)}%)`;
  chgEl.className = 'change ' + (totalPnl >= 0 ? 'up' : 'down');

  document.getElementById('orderMyAmount').textContent = selectedCoin.amount.toFixed(4);
  document.getElementById('orderPrice').textContent = '₩ ' + fmt(selectedCoin.price);
}

document.getElementById('btnBuy').addEventListener('click', () => {
  const amtInput = document.getElementById('tradeAmount');
  const amountToBuy = parseFloat(amtInput.value);
  if (isNaN(amountToBuy) || amountToBuy <= 0) return alert('올바른 수량을 입력해주세요.');

  const requiredCash = selectedCoin.price * amountToBuy;
  if (userCash < requiredCash) return alert('보유 현금이 부족합니다.');

  userCash -= requiredCash;
  const currentCost = selectedCoin.avgPrice * selectedCoin.amount;
  const nextAmount = parseFloat((selectedCoin.amount + amountToBuy).toFixed(6));
  
  selectedCoin.avgPrice = (currentCost + requiredCash) / nextAmount;
  selectedCoin.amount = nextAmount;

  amtInput.value = '';
  updatePortfolioAndHoldings();
  updateCoinListValues();
});

document.getElementById('btnSell').addEventListener('click', () => {
  const amtInput = document.getElementById('tradeAmount');
  const amountToSell = parseFloat(amtInput.value);
  if (isNaN(amountToSell) || amountToSell <= 0) return alert('올바른 수량을 입력해주세요.');

  if (parseFloat(selectedCoin.amount.toFixed(6)) < amountToSell) return alert('보유 수량이 부족합니다.');

  const revenue = selectedCoin.price * amountToSell;
  userCash += revenue;
  selectedCoin.amount = parseFloat((selectedCoin.amount - amountToSell).toFixed(6));

  if (selectedCoin.amount <= 0.00001) {
    selectedCoin.amount = 0;
    selectedCoin.avgPrice = 0;
  }

  amtInput.value = '';
  updatePortfolioAndHoldings();
  updateCoinListValues();
});

let chart;
function updateChart(c) {
  const ctx = document.getElementById('priceChart');
  if (!ctx) return;
  
  const currentHistory = chartDataStorage[c.sym];
  const minLimit = c.price * 0.85;
  const maxLimit = c.price * 1.15;

  if (chart) {
    chart.data.labels = currentHistory.map((_, i) => `${i}m`);
    chart.data.datasets[0].data = currentHistory;
    chart.data.datasets[0].borderColor = c.chg >= 0 ? '#16c784' : '#ea3943';
    chart.data.datasets[0].backgroundColor = c.chg >= 0 ? 'rgba(22,199,132,.08)' : 'rgba(234,57,67,.08)';
    chart.options.scales.y.min = minLimit;
    chart.options.scales.y.max = maxLimit;
    chart.update('none'); 
  } else {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: currentHistory.map((_, i) => `${i}m`),
        datasets: [{
          data: currentHistory,
          borderColor: c.chg >= 0 ? '#16c784' : '#ea3943',
          backgroundColor: c.chg >= 0 ? 'rgba(22,199,132,.08)' : 'rgba(234,57,67,.08)',
          tension: .3, fill: true, pointRadius: 0, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#1a2138' }, ticks: { color: '#8088a3' }, min: minLimit, max: maxLimit },
          x: { grid: { display: false }, ticks: { color: '#8088a3', autoSkip: true, maxTicksLimit: 8 } },
        },
      },
    });
  }
}

setInterval(() => {
  COINS.forEach((c) => { 
    const dice = Math.random();
    let rate = 0;
    if (dice < 0.025) { 
      rate = -(0.05 + Math.random() * 0.10); 
    } else if (dice > 0.975) {
      rate = (0.05 + Math.random() * 0.10);  
    } else {
      const isUp = Math.random() > 0.50;
      rate = (Math.random() * 0.008) * (isUp ? 1 : -1); 
    }
    c.price *= (1 + rate); 
    c.chg += rate * 100;

    chartDataStorage[c.sym].push(c.price);
    chartDataStorage[c.sym].shift();
  });

  updateCoinListValues();
  updatePortfolioAndHoldings();
  updateChart(selectedCoin);
}, 3000);

document.addEventListener('DOMContentLoaded', () => {
  initCoinList();
  updateCoinListValues();
  selectOrderCoin(selectedCoin);
  updatePortfolioAndHoldings();
  updateChart(selectedCoin);
});
