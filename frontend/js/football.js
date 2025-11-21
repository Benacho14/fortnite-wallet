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
      console.log('✅ Equipo encontrado:', data.team.teamName);
      currentTeam = data.team;
      if (noTeamView) noTeamView.style.display = 'none';
      if (hasTeamView) hasTeamView.style.display = 'block';
      displayTeamInfo(data.team);
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

function displayTeamInfo(team) {
  document.getElementById('teamName').textContent = team.teamName;
  document.getElementById('teamShield').textContent = '⚽';
  document.getElementById('clubBudget').textContent = `${team.budget.toLocaleString()} V-Bucks`;
  
  // Stats
  document.getElementById('statsPlayed').textContent = team.wins + team.draws + team.losses;
  document.getElementById('statsWins').textContent = team.wins;
  document.getElementById('statsDraws').textContent = team.draws;
  document.getElementById('statsLosses').textContent = team.losses;
  document.getElementById('statsPoints').textContent = team.points;
  
  displayPlayers(team.players);
}

function displayPlayers(players) {
  const squadList = document.getElementById('squadList');
  squadList.innerHTML = '';
  
  if (!players || players.length === 0) {
    squadList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No tienes jugadores aún</p>';
    return;
  }
  
  players.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.innerHTML = `
      <div class="player-header">
        <span class="player-overall">${player.rating || 50}</span>
        <span class="player-position">${player.position}</span>
      </div>
      <h4>${player.name}</h4>
      <p>Valor: ${(player.price || 0).toLocaleString()} V-Bucks</p>
    `;
    squadList.appendChild(playerCard);
  });
}

// Event Listeners
document.getElementById('createTeamBtn').addEventListener('click', () => {
  document.getElementById('createTeamModal').style.display = 'flex';
});

// ESTO ES LO IMPORTANTE - ARREGLADO
document.getElementById('createTeamForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Obtener el valor correctamente
  const teamName = document.getElementById('teamNameInput').value.trim();
  
  console.log('📝 Nombre del equipo:', teamName);
  
  if (!teamName) {
    alert('Por favor ingresa un nombre para el equipo');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/football/create-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ teamName: teamName }) // Enviar como teamName
    });
    
    const data = await response.json();
    console.log('📊 Respuesta crear equipo:', data);
    
    if (response.ok) {
      alert(data.message || '¡Equipo creado exitosamente!');
      document.getElementById('createTeamModal').style.display = 'none';
      location.reload();
    } else {
      alert(data.error || 'Error al crear equipo');
    }
  } catch (error) {
    console.error('Error al crear equipo:', error);
    alert('Error de conexión al crear equipo');
  }
});

document.getElementById('transferVBucksBtn')?.addEventListener('click', () => {
  document.getElementById('transferModal').style.display = 'flex';
});

document.getElementById('submitTransferBtn')?.addEventListener('click', async () => {
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
    alert('Error de conexión');
  }
});

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