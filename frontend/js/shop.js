// frontend/js/shop.js
const API_URL = 'http://localhost:3000/api';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const user = JSON.parse(localStorage.getItem('user'));

// Elementos del DOM
const balanceEl = document.getElementById('balance');
const logoutBtn = document.getElementById('logoutBtn');
const myBusinessBtn = document.getElementById('myBusinessBtn');
const businessList = document.getElementById('businessList');
const categoryFilter = document.getElementById('categoryFilter');
const createBusinessForm = document.getElementById('createBusinessForm');
const addProductForm = document.getElementById('addProductForm');
const noBusinessSection = document.getElementById('noBusinessSection');
const hasBusinessSection = document.getElementById('hasBusinessSection');
const myProductsList = document.getElementById('myProductsList');
const productsModal = document.getElementById('productsModal');
const closeModal = document.getElementById('closeModal');
const modalProductsList = document.getElementById('modalProductsList');

let myBusiness = null;
let allBusiness = [];

const editBusinessModal = document.getElementById('editBusinessModal');
const editBusinessForm = document.getElementById('editBusinessForm');
const cancelEditBusiness = document.getElementById('cancelEditBusiness');
const editBusinessBtn = document.getElementById('editBusinessBtn');
const deleteBusinessBtn = document.getElementById('deleteBusinessBtn');

const editProductModal = document.getElementById('editProductModal');
const editProductForm = document.getElementById('editProductForm');
const cancelEditProduct = document.getElementById('cancelEditProduct');

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Cambiar tab activo
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Mostrar contenido
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Cargar datos según el tab
    if (tabName === 'mybusiness') {
      loadMyBusiness();
    } else {
      loadAllBusiness();
    }
  });
});

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

// Cargar todos los negocios
async function loadAllBusiness() {
  try {
    const response = await fetch(`${API_URL}/shop/all-business`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const business = await response.json();
    allBusiness = business;
    
    if (response.ok) {
      displayBusiness(business);
    }
  } catch (error) {
    businessList.innerHTML = '<p class="no-data">Error al cargar negocios</p>';
  }
}

// Mostrar negocios
function displayBusiness(business) {
  if (business.length === 0) {
    businessList.innerHTML = '<p class="no-data">No hay negocios disponibles aún</p>';
    return;
  }
  
  businessList.innerHTML = business.map(b => {
    const categoryEmoji = getCategoryEmoji(b.category);
    return `
      <div class="business-card" data-id="${b.id}">
        <div class="business-icon">${categoryEmoji}</div>
        <div class="business-info">
          <h3>${b.name}</h3>
          <p>${b.description}</p>
          <span class="business-owner">👤 ${b.ownerName}</span>
        </div>
        <button class="btn-view-products" data-id="${b.id}">Ver Productos</button>
      </div>
    `;
  }).join('');
  
  // Event listeners
  document.querySelectorAll('.btn-view-products').forEach(btn => {
    btn.addEventListener('click', () => {
      const businessId = btn.dataset.id;
      openBusinessProducts(businessId);
    });
  });
}

// Filtro por categoría
categoryFilter.addEventListener('change', (e) => {
  const category = e.target.value;
  
  if (category === 'all') {
    displayBusiness(allBusiness);
  } else {
    const filtered = allBusiness.filter(b => b.category === category);
    displayBusiness(filtered);
  }
});

// Abrir productos de un negocio
async function openBusinessProducts(businessId) {
  const business = allBusiness.find(b => b.id === businessId);
  
  if (!business) return;
  
  document.getElementById('modalBusinessName').textContent = business.name;
  productsModal.classList.remove('hidden');
  
  try {
    const response = await fetch(`${API_URL}/shop/business/${businessId}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const products = await response.json();
    
    if (response.ok) {
      if (products.length === 0) {
        modalProductsList.innerHTML = '<p class="no-data">Este negocio no tiene productos aún</p>';
        return;
      }
      
      modalProductsList.innerHTML = products.map(p => `
        <div class="product-card">
          <div class="product-image">${p.image}</div>
          <div class="product-info">
            <h4>${p.name}</h4>
            <p>${p.description}</p>
            <div class="product-price">
              <span class="price">💎 ${p.price}</span>
              <button class="btn-buy" data-id="${p.id}" data-price="${p.price}">Comprar</button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Event listeners para comprar
      document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', () => {
          buyProduct(btn.dataset.id, btn.dataset.price);
        });
      });
    }
  } catch (error) {
    modalProductsList.innerHTML = '<p class="no-data">Error al cargar productos</p>';
  }
}

// Cerrar modal
closeModal.addEventListener('click', () => {
  productsModal.classList.add('hidden');
});

// Comprar producto
async function buyProduct(productId, price) {
  if (!confirm(`¿Comprar este producto por ${price} V-Bucks?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/shop/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      balanceEl.textContent = data.newBalance;
      productsModal.classList.add('hidden');
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al realizar compra', 'error');
  }
}

// Cargar mi negocio
async function loadMyBusiness() {
  try {
    const response = await fetch(`${API_URL}/shop/my-business`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      if (data.hasBusiness) {
        myBusiness = data.business;
        showMyBusiness();
        loadMyProducts();
      } else {
        showCreateBusiness();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Mostrar formulario de crear negocio
function showCreateBusiness() {
  noBusinessSection.classList.remove('hidden');
  hasBusinessSection.classList.add('hidden');
}

// Mostrar mi negocio
function showMyBusiness() {
  noBusinessSection.classList.add('hidden');
  hasBusinessSection.classList.remove('hidden');
  
  document.getElementById('myBusinessName').textContent = myBusiness.name;
  document.getElementById('myBusinessDescription').textContent = myBusiness.description;
  document.getElementById('myBusinessCategory').textContent = getCategoryName(myBusiness.category);
}

// Crear negocio
createBusinessForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('businessName').value;
  const description = document.getElementById('businessDescription').value;
  const category = document.getElementById('businessCategory').value;
  
  try {
    const response = await fetch(`${API_URL}/shop/create-business`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, category })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      loadMyBusiness();
      createBusinessForm.reset();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al crear negocio', 'error');
  }
});

// Agregar producto
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const image = document.getElementById('productImage').value || '🛍️';
  
  try {
    const response = await fetch(`${API_URL}/shop/add-product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, price, image })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      addProductForm.reset();
      loadMyProducts();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al agregar producto', 'error');
  }
});

// Cargar mis productos
async function loadMyProducts() {
  try {
    const response = await fetch(`${API_URL}/shop/my-products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const products = await response.json();
    
    if (response.ok) {
      if (products.length === 0) {
        myProductsList.innerHTML = '<p class="no-data">No tienes productos aún</p>';
        return;
      }
      
      myProductsList.innerHTML = products.map(p => `
        <div class="product-card-own">
          <div class="product-image">${p.image}</div>
          <div class="product-info">
            <h4>${p.name}</h4>
            <p>${p.description}</p>
            <div class="product-price">
              <span class="price">💎 ${p.price}</span>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-edit-product" data-product='${JSON.stringify(p)}'>✏️</button>
                <button class="btn-delete-product" data-id="${p.id}">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      
      // Event listeners para editar
      document.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
          const product = JSON.parse(btn.dataset.product);
          openEditProduct(product);
        });
      });
      
      // Event listeners para eliminar
      document.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', () => {
          deleteProduct(btn.dataset.id);
        });
      });
    }
  } catch (error) {
    myProductsList.innerHTML = '<p class="no-data">Error al cargar productos</p>';
  }
}

// Eliminar producto
async function deleteProduct(productId) {
  if (!confirm('¿Eliminar este producto?')) return;
  
  try {
    const response = await fetch(`${API_URL}/shop/product/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showNotification(data.message, 'success');
      loadMyProducts();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Error al eliminar producto', 'error');
  }
}

// Botón "Mi Negocio"
myBusinessBtn.addEventListener('click', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tab="mybusiness"]').classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('mybusinessTab').classList.add('active');
  
  loadMyBusiness();
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Funciones helper
function getCategoryEmoji(category) {
  const emojis = {
    comida: '🍕',
    ropa: '👕',
    tecnologia: '💻',
    juegos: '🎮',
    servicios: '⚙️',
    otros: '📦'
  };
  return emojis[category] || '🏪';
}

function getCategoryName(category) {
  const names = {
    comida: '🍕 Comida',
    ropa: '👕 Ropa',
    tecnologia: '💻 Tecnología',
    juegos: '🎮 Juegos',
    servicios: '⚙️ Servicios',
    otros: '📦 Otros'
  };
  return names[category] || category;
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// Abrir modal de editar negocio
if (editBusinessBtn) {
    editBusinessBtn.addEventListener('click', () => {
      if (!myBusiness) return;
      
      document.getElementById('editBusinessName').value = myBusiness.name;
      document.getElementById('editBusinessDescription').value = myBusiness.description;
      document.getElementById('editBusinessCategory').value = myBusiness.category;
      
      editBusinessModal.classList.remove('hidden');
    });
  }
  
  // Cerrar modal de editar negocio
  cancelEditBusiness.addEventListener('click', () => {
    editBusinessModal.classList.add('hidden');
  });
  
  // Guardar cambios del negocio
  editBusinessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('editBusinessName').value;
    const description = document.getElementById('editBusinessDescription').value;
    const category = document.getElementById('editBusinessCategory').value;
    
    try {
      const response = await fetch(`${API_URL}/shop/my-business`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, category })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showNotification(data.message, 'success');
        editBusinessModal.classList.add('hidden');
        loadMyBusiness();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (error) {
      showNotification('Error al actualizar negocio', 'error');
    }
  });
  
  // Eliminar negocio
  if (deleteBusinessBtn) {
    deleteBusinessBtn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar tu negocio? También se eliminarán todos tus productos.')) {
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/shop/my-business`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          showNotification(data.message, 'success');
          myBusiness = null;
          loadMyBusiness();
        } else {
          showNotification(data.error, 'error');
        }
      } catch (error) {
        showNotification('Error al eliminar negocio', 'error');
      }
    });
  }
  
  // Abrir modal de editar producto
  function openEditProduct(product) {
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductImage').value = product.image;
    
    editProductModal.classList.remove('hidden');
  }
  
  // Cerrar modal de editar producto
  cancelEditProduct.addEventListener('click', () => {
    editProductModal.classList.add('hidden');
  });
  
  // Guardar cambios del producto
  editProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value;
    const price = document.getElementById('editProductPrice').value;
    const description = document.getElementById('editProductDescription').value;
    const image = document.getElementById('editProductImage').value;
    
    try {
      const response = await fetch(`${API_URL}/shop/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, price, image })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showNotification(data.message, 'success');
        editProductModal.classList.add('hidden');
        loadMyProducts();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (error) {
      showNotification('Error al actualizar producto', 'error');
    }
  });

// Cargar datos iniciales
loadBalance();
loadAllBusiness();