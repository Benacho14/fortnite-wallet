// frontend/js/football.js - PARTE 1
const API_URL = 'http://localhost:3000/api';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));

// Elementos del DOM
const logoutBtn = document.getElementById('logoutBtn');
const userBalance = document.getElementById('userBalance');
const createTeamForm = document.getElementById('createTeamForm');
const noTeamSection = document.getElementById('noTeamSection');
const hasTeamSection = document.getElementById('hasTeamSection');
const transferToClubBtn = document.getElementById('transferToClubBtn');
const transferModal = document.getElementById('transferModal');
const confirmTransfer = document.getElementById('confirmTransfer');
const cancelTransfer = document.getElementById('cancelTransfer');
const playerModal = document.getElementById('playerModal');
const closePlayerModal = document.getElementById('closePlayerModal');
const buyPlayerBtn = document.getElementById('buyPlayerBtn');
const sellPlayerBtn = document.getElementById('sellPlayerBtn');

let myTeam = null;
let myPlayers = [];
let selectedPlayer = null;

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Cargar datos según tab
    if (tabName === 'myteam') {
      loadMyTeam();
    } else if (tabName === 'ligaA') {
      loadLeagueTable('A');
    } else if (tabName === 'ligaB') {
      loadLeagueTable('B');
    } else if (tabName === 'market') {
      loadMarket();
    }
  });
});

// Cargar balance del usuario
async function loadUserBalance() {
  try {
    const response = await fetch(`${API_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      userBalance.textContent = data.balance;
    }
  } catch (error) {
    console.error('Error al cargar balance:', error);
  }
}

// Cargar mi equipo
async function loadMyTeam() {
  try {
    const response = await fetch(`${API_URL}/football/my-team`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      if (data.hasTeam) {
        myTeam = data.team;
        myPlayers = data.players;
        showMyTeam();
        loadTeamData();
      } else {
        showCreateTeam();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mostrar formulario crear equipo
function showCreateTeam() {
  noTeamSection.classList.remove('hidden');
  hasTeamSection.classList.add('hidden');
}

// Mostrar mi equipo
function showMyTeam() {
  noTeamSection.classList.add('hidden');
  hasTeamSection.classList.remove('hidden');
  
  // Info del equipo
  document.getElementById('myTeamShield').textContent = myTeam.shield;
  document.getElementById('myTeamName').textContent = myTeam.name;
  document.getElementById('myTeamLeague').textContent = myTeam.league;
  document.getElementById('myTeamBudget').textContent = myTeam.budget.toLocaleString();
  
  // Calcular valor de plantilla
  const totalValue = myPlayers.reduce((sum, p) => sum + p.marketValue, 0);
  document.getElementById('myTeamValue').textContent = totalValue.toLocaleString();
  
  // Stats
  document.getElementById('teamPlayed').textContent = myTeam.matchesPlayed;
  document.getElementById('teamWins').textContent = myTeam.wins;
  document.getElementById('teamDraws').textContent = myTeam.draws;
  document.getElementById('teamLosses').textContent = myTeam.losses;
  document.getElementById('teamGF').textContent = myTeam.goalsFor;
  document.getElementById('teamGA').textContent = myTeam.goalsAgainst;
  document.getElementById('teamPoints').textContent = myTeam.points;
  
  // Mejoras
  document.getElementById('youthLevel').textContent = myTeam.youthAcademy;
  document.getElementById('stadiumLevel').textContent = myTeam.stadium;
  document.getElementById('trainingLevel').textContent = myTeam.trainingFacilities;
  
  document.getElementById('youthCost').textContent = (10000 * (myTeam.youthAcademy + 1)).toLocaleString();
  document.getElementById('stadiumCost').textContent = (20000 * (myTeam.stadium + 1)).toLocaleString();
  document.getElementById('trainingCost').textContent = (15000 * (myTeam.trainingFacilities + 1)).toLocaleString();
  
  // Plantilla
  displaySquad();
}

// Mostrar plantilla
function displaySquad() {
  const squadList = document.getElementById('squadList');
  
  if (myPlayers.length === 0) {
    squadList.innerHTML = '<p class="no-data">No tienes jugadores</p>';
    return;
  }
  
  // Agrupar por posición
  const positions = {
    'POR': myPlayers.filter(p => p.position === 'POR'),
    'DEF': myPlayers.filter(p => p.position === 'DEF'),
    'MED': myPlayers.filter(p => p.position === 'MED'),
    'DEL': myPlayers.filter(p => p.position === 'DEL')
  };
  
  squadList.innerHTML = '';
  
  for (const [pos, players] of Object.entries(positions)) {
    if (players.length > 0) {
      const posSection = document.createElement('div');
      posSection.className = 'position-section';
      posSection.innerHTML = `<h4>${getPositionName(pos)} (${players.length})</h4>`;
      
      const playersDiv = document.createElement('div');
      playersDiv.className = 'position-players';
      
      players.forEach(player => {
        const playerCard = createPlayerCard(player, true);
        playersDiv.appendChild(playerCard);
      });
      
      posSection.appendChild(playersDiv);
      squadList.appendChild(posSection);
    }
  }
}

// Crear card de jugador
function createPlayerCard(player, isMyPlayer = false) {
  const card = document.createElement('div');
  card.className = 'player-card';
  card.onclick = () => openPlayerModal(player, isMyPlayer);
  
  card.innerHTML = `
    <div class="player-overall-badge">${player.overall}</div>
    <div class="player-position-badge">${player.position}</div>
    <div class="player-card-content">
      <h4>${player.name}</h4>
      <p>${player.nationality} | ${player.age} años</p>
      <p class="player-value">${player.marketValue.toLocaleString()} V-Bucks</p>
      ${player.onMarket ? '<span class="on-market-badge">En venta</span>' : ''}
    </div>
  `;
  
  return card;
}

// Abrir modal de jugador
function openPlayerModal(player, isMyPlayer) {
  selectedPlayer = player;
  
  document.getElementById('playerModalName').textContent = player.name;
  document.getElementById('playerModalNameDetail').textContent = player.name;
  document.getElementById('playerModalOverall').textContent = player.overall;
  document.getElementById('playerModalAge').textContent = player.age;
  document.getElementById('playerModalPos').textContent = player.position;
  document.getElementById('playerModalNat').textContent = player.nationality;
  
  // Stats
  updateStatBar('statPace', player.pace);
  updateStatBar('statShoot', player.shooting);
  updateStatBar('statPass', player.passing);
  updateStatBar('statDef', player.defending);
  updateStatBar('statPhys', player.physical);
  
  // Precio
  const priceToShow = player.onMarket ? player.transferPrice : player.marketValue;
  document.getElementById('playerModalPrice').textContent = priceToShow.toLocaleString();
  
  // Botones
  if (isMyPlayer) {
    buyPlayerBtn.classList.add('hidden');
    sellPlayerBtn.classList.remove('hidden');
    sellPlayerBtn.dataset.playerId = player._id;
  } else {
    buyPlayerBtn.classList.remove('hidden');
    sellPlayerBtn.classList.add('hidden');
    buyPlayerBtn.dataset.playerId = player._id;
  }
  
  playerModal.classList.remove('hidden');
}

// Actualizar barra de stats
function updateStatBar(id, value) {
  const bar = document.getElementById(id);
  const valueSpan = document.getElementById(id + 'Value');
  
  bar.style.width = value + '%';
  valueSpan.textContent = value;
  
  // Color según valor
  if (value >= 80) {
    bar.style.background = '#4ade80';
  } else if (value >= 60) {
    bar.style.background = '#fbbf24';
  } else {
    bar.style.background = '#f87171';
  }
}

// Cerrar modal jugador
closePlayerModal.addEventListener('click', () => {
  playerModal.classList.add('hidden');
});

// Obtener nombre de posición
function getPositionName(pos) {
  const names = {
    'POR': 'Porteros',
    'DEF': 'Defensas',
    'MED': 'Mediocampistas',
    'DEL': 'Delanteros'
  };
  return names[pos] || pos;
}

// Cargar datos adicionales del equipo
async function loadTeamData() {
  if (!myTeam) return;
  
  // Próximos partidos
  try {
    const response = await fetch(`${API_URL}/football/next-matches/${myTeam._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const matches = await response.json();
    displayMatches(matches, 'nextMatches', false);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Últimos resultados
  try {
    const response = await fetch(`${API_URL}/football/recent-results/${myTeam._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const results = await response.json();
    displayMatches(results, 'recentResults', true);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mostrar partidos
function displayMatches(matches, containerId, showScore) {
  const container = document.getElementById(containerId);
  
  if (matches.length === 0) {
    container.innerHTML = '<p class="no-data">No hay partidos</p>';
    return;
  }
  
  container.innerHTML = matches.map(m => {
    const isHome = m.homeTeam._id === myTeam._id;
    
    return `
      <div class="match-card">
        <div class="match-teams">
          <div class="match-team ${isHome ? 'my-team' : ''}">
            <span class="team-shield">${m.homeTeam.shield}</span>
            <span class="team-name">${m.homeTeam.name}</span>
          </div>
          <div class="match-score">
            ${showScore ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
          </div>
          <div class="match-team ${!isHome ? 'my-team' : ''}">
            <span class="team-name">${m.awayTeam.name}</span>
            <span class="team-shield">${m.awayTeam.shield}</span>
          </div>
        </div>
        <div class="match-info">
          ${showScore ? `Jornada ${m.matchday}` : `Próxima jornada: ${m.matchday}`}
        </div>
      </div>
    `;
  }).join('');
}

// Crear equipo
createTeamForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('teamName').value;
  const shield = document.getElementById('teamShield').value || '⚽';
  
  try {
    const response = await fetch(`${API_URL}/football/create-team`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, shield })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      createTeamForm.reset();
      loadUserBalance();
      loadMyTeam();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al crear equipo', 'error');
  }
});

// Abrir modal transferir
transferToClubBtn.addEventListener('click', () => {
  document.getElementById('modalUserBalance').textContent = userBalance.textContent;
  document.getElementById('modalClubBudget').textContent = myTeam.budget.toLocaleString();
  transferModal.classList.remove('hidden');
});

// Cerrar modal transferir
cancelTransfer.addEventListener('click', () => {
  transferModal.classList.add('hidden');
});

// Confirmar transferencia
confirmTransfer.addEventListener('click', async () => {
  const amount = parseInt(document.getElementById('transferAmount').value);
  
  if (!amount || amount <= 0) {
    showNotification('Monto inválido', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/football/transfer-to-club`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      transferModal.classList.add('hidden');
      document.getElementById('transferAmount').value = '';
      
      // Actualizar balances
      userBalance.textContent = data.newUserBalance;
      document.getElementById('myTeamBudget').textContent = data.newClubBudget.toLocaleString();
      myTeam.budget = data.newClubBudget;
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error en la transferencia', 'error');
  }
});

// Continúa en la siguiente parte...
// frontend/js/football.js - PARTE 2

// Mejorar instalaciones
document.querySelectorAll('.btn-upgrade').forEach(btn => {
  btn.addEventListener('click', async () => {
    const facility = btn.dataset.facility;
    
    if (!confirm('¿Mejorar esta instalación?')) return;
    
    try {
      const response = await fetch(`${API_URL}/football/upgrade-facility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ facility })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showNotification(data.message, 'success');
        loadMyTeam();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (error) {
      showNotification('Error al mejorar', 'error');
    }
  });
});

// Cargar tabla de liga
async function loadLeagueTable(league) {
  try {
    const response = await fetch(`${API_URL}/football/league-table/${league}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const teams = await response.json();
    
    if (response.ok) {
      displayLeagueTable(teams, league);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mostrar tabla
function displayLeagueTable(teams, league) {
  const tableId = league === 'A' ? 'ligaATable' : 'ligaBTable';
  const tbody = document.querySelector(`#${tableId} tbody`);
  
  if (teams.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="no-data">No hay equipos</td></tr>';
    return;
  }
  
  tbody.innerHTML = teams.map(t => {
    let rowClass = '';
    
    if (league === 'A') {
      if (t.position <= 10) rowClass = 'copa-zone';
      if (t.position >= 18) rowClass = 'relegation-zone';
    } else {
      if (t.position <= 3) rowClass = 'promotion-zone';
    }
    
    const isMyTeam = myTeam && t.id === myTeam._id;
    
    return `
      <tr class="${rowClass} ${isMyTeam ? 'my-team-row' : ''}">
        <td>${t.position}</td>
        <td>
          <div class="team-cell">
            <span>${t.shield}</span>
            <span>${t.name}</span>
            ${isMyTeam ? '<span class="my-team-badge">TÚ</span>' : ''}
            ${t.isNPC ? '' : `<span class="user-badge">${t.owner}</span>`}
          </div>
        </td>
        <td>${t.played}</td>
        <td>${t.wins}</td>
        <td>${t.draws}</td>
        <td>${t.losses}</td>
        <td>${t.goalsFor}</td>
        <td>${t.goalsAgainst}</td>
        <td>${t.goalDifference}</td>
        <td><strong>${t.points}</strong></td>
      </tr>
    `;
  }).join('');
}

// Cargar mercado
async function loadMarket() {
  try {
    const response = await fetch(`${API_URL}/football/transfer-market`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const players = await response.json();
    
    if (response.ok) {
      displayMarket(players);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mostrar mercado
function displayMarket(players) {
  const container = document.getElementById('marketList');
  
  if (players.length === 0) {
    container.innerHTML = '<p class="no-data">No hay jugadores en el mercado</p>';
    return;
  }
  
  container.innerHTML = '';
  
  players.forEach(player => {
    const card = createPlayerCard(player, false);
    container.appendChild(card);
  });
}

// Filtros del mercado
document.getElementById('positionFilter').addEventListener('change', filterMarket);
document.getElementById('priceFilter').addEventListener('change', filterMarket);

function filterMarket() {
  // Recargar mercado con filtros (implementación básica)
  loadMarket();
}

// Comprar jugador
buyPlayerBtn.addEventListener('click', async () => {
  if (!selectedPlayer) return;
  
  if (!confirm(`¿Fichar a ${selectedPlayer.name} por ${selectedPlayer.transferPrice} V-Bucks?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/football/buy-player`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playerId: selectedPlayer._id })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      playerModal.classList.add('hidden');
      loadMyTeam();
      loadMarket();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al fichar jugador', 'error');
  }
});

// Vender jugador
sellPlayerBtn.addEventListener('click', async () => {
  if (!selectedPlayer) return;
  
  const price = prompt(`¿Por cuánto quieres vender a ${selectedPlayer.name}?\n(Valor de mercado: ${selectedPlayer.marketValue})`);
  
  if (!price || parseInt(price) <= 0) {
    showNotification('Precio inválido', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/football/sell-player`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        playerId: selectedPlayer._id,
        price: parseInt(price)
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      playerModal.classList.add('hidden');
      loadMyTeam();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al poner en venta', 'error');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Notificaciones
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// Cargar datos iniciales
loadUserBalance();
loadMyTeam();