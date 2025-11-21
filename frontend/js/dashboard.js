// frontend/js/dashboard.js
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : 'https://fortnite-wallet.onrender.com/api';

// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

// Cargar datos del usuario
async function loadUserData() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('No autorizado');
    }

    const data = await response.json();
    const user = data.user;

    // Mostrar datos
    document.getElementById('username').textContent = user.username;
    document.getElementById('balance').textContent = `${user.balance.toLocaleString()} V-Bucks`;

    // Mostrar botón de recargar SOLO si es admin
    if (user.isAdmin) {
      document.getElementById('rechargeBtn').style.display = 'flex';
    }

  } catch (error) {
    console.error('Error al cargar usuario:', error);
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }
}

// Cargar transacciones recientes
async function loadRecentTransactions() {
  try {
    const response = await fetch(`${API_URL}/wallet/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    // Cargar transacciones recientes
async function loadRecentTransactions() {
  try {
    const response = await fetch(`${API_URL}/wallet/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    // Verificar si hay transacciones
    if (!data || !Array.isArray(data)) {
      container.innerHTML = '<p>No tienes transacciones aún.</p>';
      return;
    }
    
    const transactions = data.slice(0, 5); // Solo las últimas 5

    const container = document.getElementById('recentTransactions');
    
    if (transactions.length === 0) {
      container.innerHTML = '<p>No tienes transacciones aún.</p>';
      return;
    }

    container.innerHTML = transactions.map(t => `
      <div class="transaction-item ${t.type === 'recharge' || t.type === 'admin_modification' ? 'positive' : 'negative'}">
        <div class="transaction-info">
          <span class="transaction-type">${getTransactionIcon(t.type)} ${t.description}</span>
          <span class="transaction-date">${new Date(t.date).toLocaleDateString()}</span>
        </div>
        <span class="transaction-amount ${t.type === 'recharge' || t.type === 'admin_modification' ? 'positive' : 'negative'}">
          ${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()} V-Bucks
        </span>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar transacciones:', error);
    const container = document.getElementById('recentTransactions');
    container.innerHTML = '<p>No se pudieron cargar las transacciones.</p>';
  }
}

    const container = document.getElementById('recentTransactions');
    
    if (transactions.length === 0) {
      container.innerHTML = '<p>No tienes transacciones aún.</p>';
      return;
    }

    container.innerHTML = transactions.map(t => `
      <div class="transaction-item ${t.type === 'recharge' || t.type === 'admin_modification' ? 'positive' : 'negative'}">
        <div class="transaction-info">
          <span class="transaction-type">${getTransactionIcon(t.type)} ${t.description}</span>
          <span class="transaction-date">${new Date(t.date).toLocaleDateString()}</span>
        </div>
        <span class="transaction-amount ${t.type === 'recharge' || t.type === 'admin_modification' ? 'positive' : 'negative'}">
          ${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()} V-Bucks
        </span>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar transacciones:', error);
  }
}

function getTransactionIcon(type) {
  const icons = {
    'recharge': '💳',
    'purchase': '🛒',
    'admin_modification': '⚙️',
    'transfer_to_club': '⚽',
    'transfer_from_club': '💰'
  };
  return icons[type] || '📝';
}

// Recargar saldo (solo admins)
document.getElementById('rechargeBtn')?.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_URL}/wallet/recharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ ${data.message}`);
      loadUserData();
      loadRecentTransactions();
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (error) {
    console.error('Error al recargar:', error);
    alert('Error al recargar saldo');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

// Cargar datos al iniciar
loadUserData();
loadRecentTransactions();