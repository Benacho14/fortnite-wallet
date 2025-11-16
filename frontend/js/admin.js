// frontend/js/admin.js
const API_URL = 'https://fortnite-wallet.onrender.com';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));

// Verificar si es admin
if (!user.isAdmin) {
  alert('⚠️ Acceso denegado. Solo administradores.');
  window.location.href = 'dashboard.html';
}

const usersList = document.getElementById('usersList');
const allTransactions = document.getElementById('allTransactions');
const logoutBtn = document.getElementById('logoutBtn');
const modifyModal = document.getElementById('modifyModal');
const modalUsername = document.getElementById('modalUsername');
const modalCurrentBalance = document.getElementById('modalCurrentBalance');
const modalNewBalance = document.getElementById('modalNewBalance');
const confirmModify = document.getElementById('confirmModify');
const cancelModify = document.getElementById('cancelModify');

let selectedUserId = null;

// Cargar usuarios
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const users = await response.json();
    
    if (response.ok) {
      usersList.innerHTML = users.map(u => `
        <div class="admin-user-card">
          <div class="user-info">
            <h4>${u.isAdmin ? '👑 ' : ''}${u.username}</h4>
            <p>${u.email}</p>
            <p class="user-balance">💎 ${u.balance} V-Bucks</p>
            <p class="user-date">Registrado: ${new Date(u.createdAt).toLocaleDateString('es')}</p>
          </div>
          <div class="user-actions">
            <button class="btn-modify" data-id="${u.id}" data-username="${u.username}" data-balance="${u.balance}">
              ✏️ Modificar Saldo
            </button>
            ${!u.isAdmin ? `<button class="btn-delete" data-id="${u.id}" data-username="${u.username}">🗑️ Eliminar</button>` : ''}
          </div>
        </div>
      `).join('');
      
      // Event listeners
      document.querySelectorAll('.btn-modify').forEach(btn => {
        btn.addEventListener('click', handleModifyClick);
      });
      
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
      });
    } else {
      usersList.innerHTML = '<p class="no-data">Error al cargar usuarios</p>';
    }
  } catch (error) {
    usersList.innerHTML = '<p class="no-data">Error de conexión</p>';
  }
}

// Manejar click en modificar
function handleModifyClick(e) {
  const btn = e.target;
  selectedUserId = btn.dataset.id;
  modalUsername.textContent = btn.dataset.username;
  modalCurrentBalance.textContent = btn.dataset.balance;
  modalNewBalance.value = btn.dataset.balance;
  modifyModal.classList.remove('hidden');
}

// Confirmar modificación
confirmModify.addEventListener('click', async () => {
  const newBalance = parseInt(modalNewBalance.value);
  
  if (isNaN(newBalance) || newBalance < 0) {
    showNotification('Ingresa un saldo válido', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/admin/modify-balance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: selectedUserId, newBalance })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification(data.message, 'success');
      modifyModal.classList.add('hidden');
      loadUsers();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error de conexión', 'error');
  }
});

cancelModify.addEventListener('click', () => {
  modifyModal.classList.add('hidden');
});

// Manejar eliminación
async function handleDeleteClick(e) {
  const btn = e.target;
  const userId = btn.dataset.id;
  const username = btn.dataset.username;
  
  if (!confirm(`¿Eliminar al usuario "${username}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/admin/delete-user/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification(data.message, 'success');
      loadUsers();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error de conexión', 'error');
  }
}

// Cargar todas las transacciones
async function loadAllTransactions() {
  try {
    const response = await fetch(`${API_URL}/admin/all-transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const transactions = await response.json();
    
    if (response.ok) {
      if (transactions.length === 0) {
        allTransactions.innerHTML = '<p class="no-data">No hay transacciones</p>';
        return;
      }
      
      allTransactions.innerHTML = transactions.slice(0, 20).map(t => `
        <div class="transaction-item ${t.type}">
          <div class="transaction-info">
            <h4>${t.username} - ${t.description}</h4>
            <p class="transaction-date">${new Date(t.date).toLocaleString('es')}</p>
          </div>
          <div class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">
            ${t.amount > 0 ? '+' : ''}${t.amount} 💎
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    allTransactions.innerHTML = '<p class="no-data">Error al cargar transacciones</p>';
  }
}

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

loadUsers();
loadAllTransactions();