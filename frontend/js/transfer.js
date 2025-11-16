// frontend/js/transfer.js
const API_URL = 'http://localhost:3000/api';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));

// Elementos del DOM
const balanceEl = document.getElementById('balance');
const usersList = document.getElementById('usersList');
const transferForm = document.getElementById('transferForm');
const selectedUserDisplay = document.getElementById('selectedUserDisplay');
const selectedUserEmail = document.getElementById('selectedUserEmail');
const transferAmount = document.getElementById('transferAmount');
const logoutBtn = document.getElementById('logoutBtn');

let selectedUser = null;

// Cargar balance
async function loadBalance() {
  try {
    const response = await fetch(`${API_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      balanceEl.textContent = data.balance;
    }
  } catch (error) {
    console.error('Error al cargar balance:', error);
  }
}

// Cargar lista de usuarios
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/wallet/users-list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const users = await response.json();
    
    if (response.ok) {
      if (users.length === 0) {
        usersList.innerHTML = '<p class="no-data">No hay otros usuarios disponibles</p>';
        return;
      }
      
      usersList.innerHTML = users.map(u => `
        <div class="user-card-transfer" data-email="${u.email}" data-username="${u.username}">
          <div class="user-avatar">👤</div>
          <div class="user-info-transfer">
            <h4>${u.username}</h4>
            <p>${u.email}</p>
          </div>
          <div class="user-select-btn">
            <button class="btn-select">Seleccionar</button>
          </div>
        </div>
      `).join('');
      
      // Agregar event listeners
      document.querySelectorAll('.user-card-transfer').forEach(card => {
        card.querySelector('.btn-select').addEventListener('click', () => {
          selectUser(card.dataset.email, card.dataset.username);
        });
      });
    }
  } catch (error) {
    usersList.innerHTML = '<p class="no-data">Error al cargar usuarios</p>';
  }
}

// Seleccionar usuario
function selectUser(email, username) {
  selectedUser = { email, username };
  selectedUserEmail.value = email;
  selectedUserDisplay.value = `${username} (${email})`;
  
  // Resaltar selección
  document.querySelectorAll('.user-card-transfer').forEach(card => {
    card.classList.remove('selected');
    if (card.dataset.email === email) {
      card.classList.add('selected');
    }
  });
  
  showNotification(`Usuario seleccionado: ${username}`, 'success');
}

// Realizar transferencia
transferForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!selectedUser) {
    showNotification('Por favor selecciona un usuario', 'error');
    return;
  }
  
  const amount = parseInt(transferAmount.value);
  
  if (!amount || amount <= 0) {
    showNotification('Ingresa una cantidad válida', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/wallet/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientEmail: selectedUser.email,
        amount: amount
      })
    });
    
    const data = await response.json();
    
    // Verificar que la respuesta sea exitosa Y tenga data.success
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      balanceEl.textContent = data.newBalance;
      
      // Limpiar formulario
      transferForm.reset();
      selectedUserDisplay.value = '';
      selectedUserEmail.value = '';
      selectedUser = null;
      
      // Quitar selección visual
      document.querySelectorAll('.user-card-transfer').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Recargar balance para asegurar sincronización
      setTimeout(() => {
        loadBalance();
      }, 500);
    } else {
      // Si el servidor responde pero hay un error
      showNotification(data.error || 'Error al realizar transferencia', 'error');
    }
  } catch (error) {
    // Error de red o del servidor
    console.error('Error completo:', error);
    showNotification('Error de conexión con el servidor', 'error');
  }
});

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
loadUsers();