// frontend/js/history.js
const API_URL = 'https://fortnite-wallet.onrender.com';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));

// Elementos del DOM
const balanceEl = document.getElementById('balance');
const transactionsList = document.getElementById('transactionsList');
const logoutBtn = document.getElementById('logoutBtn');
const typeFilter = document.getElementById('typeFilter');
const sortFilter = document.getElementById('sortFilter');
const totalIncome = document.getElementById('totalIncome');
const totalExpense = document.getElementById('totalExpense');
const totalTransactions = document.getElementById('totalTransactions');

// Paginación
const pagination = document.getElementById('pagination');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
const itemsPerPage = 10;

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

// Cargar historial completo
async function loadTransactions() {
  try {
    const response = await fetch(`${API_URL}/wallet/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const transactions = await response.json();
    
    if (response.ok) {
      allTransactions = transactions;
      filteredTransactions = transactions;
      calculateSummary();
      applyFilters();
    }
  } catch (error) {
    transactionsList.innerHTML = '<p class="no-data">Error al cargar historial</p>';
  }
}

// Calcular resumen
function calculateSummary() {
  let income = 0;
  let expense = 0;

  allTransactions.forEach(t => {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      expense += Math.abs(t.amount);
    }
  });

  totalIncome.textContent = `+${income.toLocaleString()} 💎`;
  totalExpense.textContent = `-${expense.toLocaleString()} 💎`;
  totalTransactions.textContent = allTransactions.length;
}

// Aplicar filtros
function applyFilters() {
  let filtered = [...allTransactions];

  // Filtro por tipo
  const type = typeFilter.value;
  if (type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }

  // Ordenamiento
  const sort = sortFilter.value;
  switch (sort) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'highest':
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      break;
    case 'lowest':
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
      break;
  }

  filteredTransactions = filtered;
  currentPage = 1;
  displayTransactions();
}

// Mostrar transacciones con paginación
function displayTransactions() {
  if (filteredTransactions.length === 0) {
    transactionsList.innerHTML = '<p class="no-data">No hay transacciones que mostrar</p>';
    pagination.classList.add('hidden');
    return;
  }

  // Calcular paginación
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(start, end);

  // Mostrar transacciones
  transactionsList.innerHTML = paginatedTransactions.map(t => {
    const typeInfo = getTransactionTypeInfo(t.type);
    const isPositive = t.amount > 0;
    
    return `
      <div class="transaction-detail-card ${t.type}">
        <div class="transaction-icon ${isPositive ? 'positive' : 'negative'}">
          ${typeInfo.icon}
        </div>
        <div class="transaction-content">
          <div class="transaction-header">
            <h4>${t.description}</h4>
            <span class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
              ${isPositive ? '+' : ''}${t.amount} 💎
            </span>
          </div>
          <div class="transaction-meta">
            <span class="transaction-type">${typeInfo.label}</span>
            <span class="transaction-date">${formatDate(t.date)}</span>
          </div>
          ${getTransactionDetails(t)}
        </div>
      </div>
    `;
  }).join('');

  // Mostrar/ocultar paginación
  if (totalPages > 1) {
    pagination.classList.remove('hidden');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
  } else {
    pagination.classList.add('hidden');
  }
}

// Obtener información del tipo de transacción
function getTransactionTypeInfo(type) {
  const types = {
    recharge: { icon: '💰', label: 'Recarga' },
    purchase: { icon: '🛒', label: 'Compra' },
    sale: { icon: '💵', label: 'Venta' },
    transfer_sent: { icon: '📤', label: 'Transferencia Enviada' },
    transfer_received: { icon: '📥', label: 'Transferencia Recibida' },
    admin_modification: { icon: '⚙️', label: 'Modificación Admin' }
  };
  return types[type] || { icon: '📄', label: 'Transacción' };
}

// Obtener detalles adicionales de la transacción
function getTransactionDetails(transaction) {
  let details = '';

  if (transaction.productName) {
    details += `<div class="transaction-detail">📦 Producto: ${transaction.productName}</div>`;
  }

  if (transaction.quantity && transaction.quantity > 1) {
    details += `<div class="transaction-detail">🔢 Cantidad: ${transaction.quantity}</div>`;
  }

  if (transaction.recipientEmail) {
    details += `<div class="transaction-detail">📧 Destinatario: ${transaction.recipientEmail}</div>`;
  }

  if (transaction.senderEmail) {
    details += `<div class="transaction-detail">📧 Remitente: ${transaction.senderEmail}</div>`;
  }

  return details ? `<div class="transaction-details">${details}</div>` : '';
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `Hoy a las ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (days === 1) {
    return `Ayer a las ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (days < 7) {
    return `Hace ${days} días`;
  } else {
    return date.toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Event listeners para filtros
typeFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);

// Event listeners para paginación
prevPage.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayTransactions();
  }
});

nextPage.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayTransactions();
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Cargar datos iniciales
loadBalance();
loadTransactions();