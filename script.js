const COINS = [
  { sym: 'BTC', name: '비트코인',   price: 84500000, chg: 2.4,  color: '#f7931a', amount: 0.085, avgPrice: 81000000 },
  { sym: 'ETH', name: '이더리움',   price: 3120000,  chg: 3.8,  color: '#627eea', amount: 1.2,   avgPrice: 3000000 },
  { sym: 'SOL', name: '솔라나',     price: 192000,    chg: -1.2, color: '#9945ff', amount: 8.5,   avgPrice: 195000 },
  { sym: 'BNB', name: '바이낸스',   price: 412000,    chg: 0.8,  color: '#f3ba2f', amount: 2.4,   avgPrice: 405000 },
  { sym: 'XRP', name: '리플',       price: 624,        chg: -0.5, color: '#23292f', amount: 1240,  avgPrice: 630 },
  { sym: 'ADA', name: '카르다노',   price: 580,        chg: 1.4,  color: '#0033ad', amount: 800,   avgPrice: 560 },
];

let userCash = 10000000; // 초기 사용 가능한 원화 현금
let selectedCoin = COINS[0]; // 기본 선택된 코인

// 게임의 초깃값 기준자산 (수익률 추적용 고정값)
let initialTotalAsset = userCash;
COINS.forEach(c => {
  initialTotalAsset += c.avgPrice * c.amount;
});

function fmt(v) {
  if (Math.abs(v) >= 10000) return Math.round(v).toLocaleString('ko-KR');
  return v.toString();
}

// 인기 코인 UI 갱신
const coinList = document.getElementById('coinList');
function renderCoinList() {
  if (!coinList) return;
  coinList.innerHTML = '';
  COINS.forEach((c, i) => {
    const el = document.createElement('li');
    el.className = 'coin' + (c.sym === selectedCoin.sym ? ' active' : '');
    el.innerHTML = `
      <div class="coin-ic" style="background:${c.color}22;color:${c.color}">${c.sym[0]}</div>
      <div class="coin-info"><b>${c.name}</b><span>${c.sym}</span></div>
      <div class="coin-price">₩ ${fmt(c.price)}</div>
      <div class="coin-chg ${c.chg >= 0 ? 'up' : 'down'}">${c.chg >= 0 ? '▲' : '▼'} ${Math.abs(c.chg).toFixed(2)}%</div>
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

// 주문 창 데이터 세팅
function selectOrderCoin(c) {
  document.getElementById('orderCoinName').textContent = c.name;
  document.getElementById('orderCoinSym').textContent = c.sym;
  document.getElementById('inputUnit').textContent = c.sym;
  document.getElementById('orderPrice').textContent = '₩ ' + fmt(c.price);
  document.getElementById('orderMyAmount').textContent = c.amount.toFixed(4);
}

// 보유 자산 테이블 및 포트폴리오 가치 갱신
const holdings = document.getElementById('holdings');
function updatePortfolioAndHoldings() {
  if (!holdings) return;
  holdings.innerHTML = '';
  let totalCoinValue = 0;

  COINS.forEach((c) => {
    if (c.amount <= 0) return;
    
    const value = c.price * c.amount;
    const cost = c.avgPrice * c.amount;
    const pnl = value - cost;
    const pct = cost > 0 ? (pnl / cost) * 100 : 0;
    
    totalCoinValue += value;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.sym} <span style="color:var(--muted);font-weight:400">${c.name}</span></td>
      <td>${c.amount.toFixed(4)}</td>
      <td>₩ ${fmt(c.avgPrice)}</td>
      <td>₩ ${fmt(c.price)}</td>
      <td class="${pnl >= 0 ? 'up' : 'down'}">${pnl >= 0 ? '+' : ''}₩ ${fmt(pnl)}</td>
      <td class="${pct >= 0 ? 'up' : 'down'}">${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</td>
    `;
    holdings.appendChild(tr);
  });

  // 총 자산 = 현금 + 코인 평가금액
  const currentTotalAsset = userCash + totalCoinValue;
  document.getElementById('userCash').textContent = Math.floor(userCash).toLocaleString('ko-KR');
  document.getElementById('portfolio').textContent = '₩ ' + Math.floor(currentTotalAsset).toLocaleString('ko-KR');

  const totalPnl = currentTotalAsset - initialTotalAsset;
  const totalPct = (totalPnl / initialTotalAsset) * 100;

  const chgEl = document.getElementById('change');
  chgEl.textContent = `${totalPnl >= 0 ? '▲' : '▼'} ₩ ${Math.abs(Math.floor(totalPnl)).toLocaleString('ko-KR')} (${totalPnl >= 0 ? '+' : ''}${totalPct.toFixed(2)}%)`;
  chgEl.className = 'change ' + (totalPnl >= 0 ? 'up' : 'down');

  // 현재 활성화된 주문창 실시간 데이터 동기화
  document.getElementById('orderMyAmount').textContent = selectedCoin.amount.toFixed(4);
  document.getElementById('orderPrice').textContent = '₩ ' + fmt(selectedCoin.price);
}

// 🛒 매수 처리
document.getElementById('btnBuy').addEventListener('click', () => {
  const amtInput = document.getElementById('tradeAmount');
  const amountToBuy = parseFloat(amtInput.value);

  if (isNaN(amountToBuy) || amountToBuy <= 0) {
    alert('올바른 수량을 입력해주세요.');
    return;
  }

  const requiredCash = selectedCoin.price * amountToBuy;
  if (userCash < requiredCash) {
    alert('보유 현금이 부족합니다.');
    return;
  }

  userCash -= requiredCash;
  const currentCost = selectedCoin.avgPrice * selectedCoin.amount;
  const nextAmount = parseFloat((selectedCoin.amount + amountToBuy).toFixed(6));
  
  selectedCoin.avgPrice = (currentCost + requiredCash) / nextAmount;
  selectedCoin.amount = nextAmount;

  amtInput.value = '';
  updatePortfolioAndHoldings();
  renderCoinList();
});

// 📉 매도 처리
document.getElementById('btnSell').addEventListener('click', () => {
  const amtInput = document.getElementById('tradeAmount');
  const amountToSell = parseFloat(amtInput.value);

  if (isNaN(amountToSell) || amountToSell <= 0) {
    alert('올바른 수량을 입력해주세요.');
    return;
  }

  if (parseFloat(selectedCoin.amount.toFixed(6)) < amountToSell) {
    alert('보유 수량이 부족합니다.');
    return;
  }

  const revenue = selectedCoin.price * amountToSell;
  userCash += revenue;
  selectedCoin.amount = parseFloat((selectedCoin.amount - amountToSell).toFixed(6));

  if (selectedCoin.amount <= 0.00001) {
    selectedCoin.amount = 0;
    selectedCoin.avgPrice = 0;
  }

  amtInput.value = '';
  updatePortfolioAndHoldings();
  renderCoinList();
});

// 가격 차트 생성
let chart;
function makeData(base, chg, n = 24) {
  const out = [];
  let v = base * (1 - chg / 100);
  for (let i = 0; i < n; i++) {
    v *= 1 + (Math.random() - 0.5 + chg / 100 / n) * 0.02;
    out.push(v);
  }
  out.push(base);
  return out;
}

function updateChart(c) {
  const ctx = document.getElementById('priceChart');
  if (!ctx) return;
  const data = makeData(c.price, c.chg);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => `${i}h`),
      datasets: [{
        data,
        borderColor: c.chg >= 0 ? '#16c784' : '#ea3943',
        backgroundColor: c.chg >= 0 ? 'rgba(22,199,132,.08)' : 'rgba(234,57,67,.08)',
        tension: .35, fill: true, pointRadius: 0, borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#1a2138' }, ticks: { color: '#8088a3', callback: (v) => '₩' + (v / 1_000_000).toFixed(1) + 'M' } },
        x: { grid: { display: false }, ticks: { color: '#8088a3', autoSkip: true, maxTicksLimit: 6 } },
      },
    },
  });
}

// 시간 버튼 전환 인터랙션
document.querySelectorAll('.t-btn').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.t-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
  });
});

// 실시간 가격 시뮬레이션 (3초마다 가격 변동 후 연동 인프라 일괄 리프레시)
setInterval(() => {
  COINS.forEach((c) => { 
    const isUp = Math.random() > 0.49;
    const rate = (Math.random() * 0.005);
    c.price *= 1 + (isUp ? rate : -rate); 
    c.chg += isUp ? rate * 8 : -rate * 8;
  });
  renderCoinList();
  updatePortfolioAndHoldings();
}, 3000);

// 초기 구동 실행 보장 구조
document.addEventListener('DOMContentLoaded', () => {
  renderCoinList();
  selectOrderCoin(selectedCoin);
  updatePortfolioAndHoldings();
  updateChart(selectedCoin);
});
