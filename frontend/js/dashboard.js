// frontend/js/dashboard.js
const API_URL = 'https://fortnite-wallet.onrender.com/api';

// Verificar autenticación
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));

// Elementos del DOM
const usernameEl = document.getElementById('username');
const balanceEl = document.getElementById('balance');
const rechargeBtn = document.getElementById('rechargeBtn');
const transferBtn = document.getElementById('transferBtn');
const logoutBtn = document.getElementById('logoutBtn');
const recentTransactions = document.getElementById('recentTransactions');

// Mostrar nombre de usuario
usernameEl.textContent = user.username;

// Cargar balance
async function loadBalance() {
  try {
    const response = await fetch(`${API_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      balanceEl.textContent = data.balance;
      
      // Actualizar en localStorage
      user.balance = data.balance;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error al cargar balance:', error);
  }
}

// Recargar saldo (solo admin)
if (rechargeBtn) {
  if (!user.isAdmin) {
    rechargeBtn.style.display = 'none';
  } else {
    rechargeBtn.addEventListener('click', async () => {
      try {
        rechargeBtn.disabled = true;
        rechargeBtn.textContent = 'Recargando...';
        
        const response = await fetch(`${API_URL}/wallet/recharge`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount: 1000 })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          balanceEl.textContent = data.newBalance;
          showNotification(data.message, 'success');
          loadRecentTransactions();
        } else {
          showNotification(data.error, 'error');
        }
      } catch (error) {
        showNotification('Error de conexión', 'error');
      } finally {
        rechargeBtn.disabled = false;
        rechargeBtn.textContent = 'Recargar +1000 V-Bucks';
      }
    });
  }
}



async function transferMoney(recipientEmail, amount) {
  try {
    const response = await fetch(`${API_URL}/wallet/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipientEmail, amount })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      balanceEl.textContent = data.newBalance;
      showNotification(data.message, 'success');
      loadRecentTransactions();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error de conexión', 'error');
  }
}

// Cargar transacciones recientes
async function loadRecentTransactions() {
  try {
    const response = await fetch(`${API_URL}/wallet/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const transactions = await response.json();
    
    if (transactions.length === 0) {
      recentTransactions.innerHTML = '<p class="no-data">No hay transacciones aún</p>';
      return;
    }
    
    // Mostrar solo las últimas 5
    const recent = transactions.slice(0, 5);
    recentTransactions.innerHTML = recent.map(t => `
      <div class="transaction-item ${t.type}">
        <div class="transaction-info">
          <h4>${t.description}</h4>
          <p class="transaction-date">${new Date(t.date).toLocaleString('es')}</p>
        </div>
        <div class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">
          ${t.amount > 0 ? '+' : ''}${t.amount} 💎
        </div>
      </div>
    `).join('');
  } catch (error) {
    recentTransactions.innerHTML = '<p class="no-data">Error al cargar transacciones</p>';
  }
}

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Mostrar notificación
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
loadBalance();
loadRecentTransactions();