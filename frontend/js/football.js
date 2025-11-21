// frontend/js/football.js
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://fortnite-wallet.onrender.com/api';

let currentTeam = null;
let currentUser = null;

// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

console.log('🔧 Football Manager iniciado');
console.log('📡 API URL:', API_URL);
console.log('🔑 Token:', token ? 'Presente' : 'No encontrado');

// Cargar datos iniciales
async function init() {
  await loadUserData();
  await loadTeamData();
}

async function loadUserData() {
  try {
    console.log('📥 Cargando datos de usuario...');
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Usuario cargado:', data.user.username);
    currentUser = data.user;
    
    const balanceDisplay = document.getElementById('userBalanceDisplay');
    if (balanceDisplay) {
      balanceDisplay.textContent = currentUser.balance;
    }
  } catch (error) {
    console.error('❌ Error al cargar usuario:', error);
    alert('Error al cargar datos de usuario. Verifica la consola.');
  }
}

async function loadTeamData() {
  try {
    console.log('📥 Cargando datos de equipo...');
    const response = await fetch(`${API_URL}/football/my-team`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Respuesta del servidor:', data);
    
    const noTeamView = document.getElementById('noTeamView');
    const hasTeamView = document.getElementById('hasTeamView');
    
    if (data.hasTeam) {
      console.log('✅ Equipo encontrado:', data.team.name);
      currentTeam = data.team;
      if (noTeamView) noTeamView.style.display = 'none';
      if (hasTeamView) hasTeamView.style.display = 'block';
      displayTeamInfo(data.team, data.players);
    } else {
      console.log('ℹ️ Usuario sin equipo');
      if (noTeamView) noTeamView.style.display = 'block';
      if (hasTeamView) hasTeamView.style.display = 'none';
    }
  } catch (error) {
    console.error('❌ Error al cargar equipo:', error);
    alert('Error al cargar equipo. Verifica:\n1. Que el servidor esté corriendo\n2. Que la ruta /api/football/my-team exista\n3. La consola para más detalles');
  }
}

function displayTeamInfo(team, players) {
  document.getElementById('teamName').textContent = team.name;
  document.getElementById('teamLeague').textContent = team.league;
  document.getElementById('teamAverage').textContent = team.averageOverall;
  document.getElementById('teamShield').textContent = team.shield;
  document.getElementById('clubBudget').textContent = `${team.budget.toLocaleString()} V-Bucks`;
  
  // Stats
  document.getElementById('statsPlayed').textContent = team.stats.played;
  document.getElementById('statsWins').textContent = team.stats.wins;
  document.getElementById('statsDraws').textContent = team.stats.draws;
  document.getElementById('statsLosses').textContent = team.stats.losses;
  document.getElementById('statsGF').textContent = team.stats.goalsFor;
  document.getElementById('statsGA').textContent = team.stats.goalsAgainst;
  document.getElementById('statsPoints').textContent = team.stats.points;
  
  // Facilities
  document.getElementById('stadiumLevel').textContent = team.facilities.stadium;
  document.getElementById('trainingLevel').textContent = team.facilities.trainingCenter;
  document.getElementById('youthLevel').textContent = team.facilities.youth;
  
  displaySquad(players);
}

function displaySquad(players) {
  const squadList = document.getElementById('squadList');
  squadList.innerHTML = '';
  
  players.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.innerHTML = `
      <div class="player-header">
        <span class="player-overall">${player.overall}</span>
        <span class="player-position">${player.position}</span>
      </div>
      <h4>${player.name}</h4>
      <p>Edad: ${player.age} | Valor: ${player.marketValue.toLocaleString()}</p>
      <div class="player-stats-mini">
        <span>PAC ${player.pace}</span>
        <span>SHO ${player.shooting}</span>
        <span>PAS ${player.passing}</span>
      </div>
      <button class="btn-small" onclick="sellPlayer('${player._id}', ${player.marketValue})">Vender</button>
    `;
    squadList.appendChild(playerCard);
  });
}

async function loadLeague(league) {
  try {
    const response = await fetch(`${API_URL}/football/league/${league}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    displayLeagueTable(data.teams);
  } catch (error) {
    console.error('Error al cargar liga:', error);
  }
}

function displayLeagueTable(teams) {
  const tbody = document.getElementById('leagueTableBody');
  tbody.innerHTML = '';
  
  teams.forEach((team, index) => {
    const row = document.createElement('tr');
    const isMyTeam = currentTeam && team._id === currentTeam._id;
    if (isMyTeam) row.classList.add('my-team');
    
    const gd = team.stats.goalsFor - team.stats.goalsAgainst;
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${team.name} ${isMyTeam ? '⭐' : ''}</td>
      <td>${team.stats.played}</td>
      <td>${team.stats.wins}</td>
      <td>${team.stats.draws}</td>
      <td>${team.stats.losses}</td>
      <td>${team.stats.goalsFor}</td>
      <td>${team.stats.goalsAgainst}</td>
      <td>${gd >= 0 ? '+' : ''}${gd}</td>
      <td><strong>${team.stats.points}</strong></td>
    `;
    tbody.appendChild(row);
  });
}

async function loadMarket() {
  try {
    const response = await fetch(`${API_URL}/football/market`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    displayMarket(data.players);
  } catch (error) {
    console.error('Error al cargar mercado:', error);
  }
}

function displayMarket(players) {
  const marketList = document.getElementById('marketList');
  marketList.innerHTML = '';
  
  if (players.length === 0) {
    marketList.innerHTML = '<p>No hay jugadores en venta actualmente.</p>';
    return;
  }
  
  players.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.innerHTML = `
      <div class="player-header">
        <span class="player-overall">${player.overall}</span>
        <span class="player-position">${player.position}</span>
      </div>
      <h4>${player.name}</h4>
      <p>Equipo: ${player.teamId.name}</p>
      <p>Edad: ${player.age} años</p>
      <p class="price">💰 ${player.askingPrice.toLocaleString()} V-Bucks</p>
      <button class="btn-primary" onclick="openOfferModal('${player._id}', '${player.name}', ${player.askingPrice})">Hacer Oferta</button>
    `;
    marketList.appendChild(playerCard);
  });
}

async function loadOffers() {
  try {
    const response = await fetch(`${API_URL}/football/my-offers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    displayReceivedOffers(data.received);
    displaySentOffers(data.sent);
  } catch (error) {
    console.error('Error al cargar ofertas:', error);
  }
}

function displayReceivedOffers(offers) {
  const container = document.getElementById('receivedOffers');
  container.innerHTML = '';
  
  if (offers.length === 0) {
    container.innerHTML = '<p>No tienes ofertas recibidas.</p>';
    return;
  }
  
  offers.forEach(offer => {
    const offerCard = document.createElement('div');
    offerCard.className = 'offer-card';
    offerCard.innerHTML = `
      <h4>${offer.playerId.name} (${offer.playerId.overall})</h4>
      <p>De: ${offer.toTeam.name}</p>
      <p>Oferta: ${offer.offerAmount.toLocaleString()} V-Bucks</p>
      <div class="offer-actions">
        <button class="btn-success" onclick="respondOffer('${offer._id}', true)">Aceptar</button>
        <button class="btn-danger" onclick="respondOffer('${offer._id}', false)">Rechazar</button>
      </div>
    `;
    container.appendChild(offerCard);
  });
}

function displaySentOffers(offers) {
  const container = document.getElementById('sentOffers');
  container.innerHTML = '';
  
  if (offers.length === 0) {
    container.innerHTML = '<p>No has enviado ofertas.</p>';
    return;
  }
  
  offers.forEach(offer => {
    const offerCard = document.createElement('div');
    offerCard.className = 'offer-card';
    offerCard.innerHTML = `
      <h4>${offer.playerId.name} (${offer.playerId.overall})</h4>
      <p>A: ${offer.fromTeam.name}</p>
      <p>Oferta: ${offer.offerAmount.toLocaleString()} V-Bucks</p>
      <p>Estado: <span class="status-${offer.status}">${offer.status}</span></p>
    `;
    container.appendChild(offerCard);
  });
}

// Event Listeners
document.getElementById('createTeamBtn').addEventListener('click', () => {
  document.getElementById('createTeamModal').style.display = 'block';
});

document.getElementById('createTeamForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('teamNameInput').value;
  const primaryColor = document.getElementById('primaryColor').value;
  const secondaryColor = document.getElementById('secondaryColor').value;
  const shield = document.getElementById('shieldInput').value;
  
  try {
    const response = await fetch(`${API_URL}/football/create-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, primaryColor, secondaryColor, shield })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      document.getElementById('createTeamModal').style.display = 'none';
      location.reload();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error al crear equipo:', error);
  }
});

document.getElementById('simulateBtn').addEventListener('click', async () => {
  if (!confirm('¿Simular la siguiente jornada?')) return;
  
  try {
    const response = await fetch(`${API_URL}/football/simulate-matchday`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ league: currentTeam.league })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      location.reload();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error al simular jornada:', error);
  }
});

document.getElementById('transferVBucksBtn').addEventListener('click', () => {
  document.getElementById('transferModal').style.display = 'block';
});

document.getElementById('submitTransferBtn').addEventListener('click', async () => {
  const amount = parseInt(document.getElementById('transferAmount').value);
  
  if (!amount || amount <= 0) {
    alert('Ingresa una cantidad válida');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/football/transfer-to-club`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      document.getElementById('transferModal').style.display = 'none';
      location.reload();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error al transferir:', error);
  }
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    if (tab === 'league') loadLeague(currentTeam.league);
    if (tab === 'market') loadMarket();
    if (tab === 'transfers') loadOffers();
  });
});

// League selector
document.querySelectorAll('.league-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const league = btn.dataset.league;
    document.querySelectorAll('.league-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadLeague(league);
  });
});

// Upgrade facilities
document.querySelectorAll('.btn-upgrade').forEach(btn => {
  btn.addEventListener('click', async () => {
    const facility = btn.dataset.facility;
    
    if (!confirm(`¿Mejorar ${facility}?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/football/upgrade-facility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ facilityType: facility })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        location.reload();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error al mejorar instalación:', error);
    }
  });
});

async function sellPlayer(playerId, marketValue) {
  const askingPrice = prompt(`Precio de venta (valor de mercado: ${marketValue}):`, marketValue);
  
  if (!askingPrice) return;
  
  try {
    const response = await fetch(`${API_URL}/football/sell-player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ playerId, askingPrice: parseInt(askingPrice) })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      location.reload();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

let currentOfferId = null;

function openOfferModal(playerId, playerName, askingPrice) {
  currentOfferId = playerId;
  document.getElementById('offerPlayerName').textContent = `Jugador: ${playerName}`;
  document.getElementById('offerAskingPrice').textContent = `Precio pedido: ${askingPrice.toLocaleString()} V-Bucks`;
  document.getElementById('offerAmount').value = askingPrice;
  document.getElementById('offerModal').style.display = 'block';
}

document.getElementById('submitOfferBtn').addEventListener('click', async () => {
  const offerAmount = parseInt(document.getElementById('offerAmount').value);
  
  if (!offerAmount || offerAmount <= 0) {
    alert('Ingresa una cantidad válida');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/football/make-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ playerId: currentOfferId, offerAmount })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      document.getElementById('offerModal').style.display = 'none';
      loadMarket();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error al hacer oferta:', error);
  }
});

async function respondOffer(transferId, accept) {
  try {
    const response = await fetch(`${API_URL}/football/respond-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ transferId, accept })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      loadOffers();
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Cerrar modales
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    closeBtn.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

// Inicializar
init();