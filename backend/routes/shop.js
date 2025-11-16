// backend/routes/shop.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');
const businessFile = path.join(__dirname, '../data/business.json');
const productsFile = path.join(__dirname, '../data/products.json');
const transactionsFile = path.join(__dirname, '../data/transactions.json');

const getUsers = () => JSON.parse(fs.readFileSync(usersFile));
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
const getBusiness = () => {
  try {
    return JSON.parse(fs.readFileSync(businessFile));
  } catch {
    return [];
  }
};
const saveBusiness = (business) => fs.writeFileSync(businessFile, JSON.stringify(business, null, 2));
const getProducts = () => {
  try {
    return JSON.parse(fs.readFileSync(productsFile));
  } catch {
    return [];
  }
};
const saveProducts = (products) => fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
const getTransactions = () => JSON.parse(fs.readFileSync(transactionsFile));
const saveTransactions = (transactions) => fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));

// Crear negocio
router.post('/create-business', authMiddleware, (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const business = getBusiness();
    
    // Verificar si el usuario ya tiene un negocio
    if (business.find(b => b.ownerId === req.userId)) {
      return res.status(400).json({ error: 'Ya tienes un negocio creado' });
    }

    const newBusiness = {
      id: Date.now().toString(),
      ownerId: req.userId,
      name,
      description,
      category,
      createdAt: new Date().toISOString()
    };

    business.push(newBusiness);
    saveBusiness(business);

    res.json({
      success: true,
      message: 'Negocio creado exitosamente',
      business: newBusiness
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear negocio' });
  }
});

// Obtener mi negocio
router.get('/my-business', authMiddleware, (req, res) => {
  try {
    const business = getBusiness();
    const myBusiness = business.find(b => b.ownerId === req.userId);

    if (!myBusiness) {
      return res.json({ hasBusiness: false });
    }

    res.json({
      hasBusiness: true,
      business: myBusiness
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener negocio' });
  }
});

// Agregar producto
router.post('/add-product', authMiddleware, (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Nombre, descripción y precio son requeridos' });
    }

    const business = getBusiness();
    const myBusiness = business.find(b => b.ownerId === req.userId);

    if (!myBusiness) {
      return res.status(400).json({ error: 'Debes crear un negocio primero' });
    }

    const products = getProducts();

    const newProduct = {
      id: Date.now().toString(),
      businessId: myBusiness.id,
      ownerId: req.userId,
      name,
      description,
      price: parseInt(price),
      image: image || '🛍️',
      available: true,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    saveProducts(products);

    res.json({
      success: true,
      message: 'Producto agregado exitosamente',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Obtener mis productos
router.get('/my-products', authMiddleware, (req, res) => {
  try {
    const products = getProducts();
    const myProducts = products.filter(p => p.ownerId === req.userId);

    res.json(myProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener todos los negocios
router.get('/all-business', authMiddleware, (req, res) => {
  try {
    const business = getBusiness();
    const users = getUsers();

    const businessWithOwner = business.map(b => {
      const owner = users.find(u => u.id === b.ownerId);
      return {
        ...b,
        ownerName: owner ? owner.username : 'Usuario'
      };
    });

    res.json(businessWithOwner);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener negocios' });
  }
});

// Obtener productos de un negocio
router.get('/business/:businessId/products', authMiddleware, (req, res) => {
  try {
    const { businessId } = req.params;
    const products = getProducts();
    const businessProducts = products.filter(p => p.businessId === businessId && p.available);

    res.json(businessProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Comprar producto
router.post('/purchase', authMiddleware, (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'ID del producto requerido' });
    }

    const qty = quantity || 1;
    const users = getUsers();
    const products = getProducts();
    const business = getBusiness();

    const buyerIndex = users.findIndex(u => u.id === req.userId);
    const product = products.find(p => p.id === productId);

    if (buyerIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!product || !product.available) {
      return res.status(404).json({ error: 'Producto no disponible' });
    }

    const totalPrice = product.price * qty;

    if (users[buyerIndex].balance < totalPrice) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        required: totalPrice,
        current: users[buyerIndex].balance
      });
    }

    // Encontrar al vendedor
    const sellerIndex = users.findIndex(u => u.id === product.ownerId);

    if (sellerIndex === -1) {
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }

    // Realizar transacción
    users[buyerIndex].balance -= totalPrice;
    users[sellerIndex].balance += totalPrice;
    saveUsers(users);

    // Registrar transacciones
    const transactions = getTransactions();

    // Transacción del comprador
    transactions.push({
      id: Date.now().toString(),
      userId: req.userId,
      type: 'purchase',
      amount: -totalPrice,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      sellerId: product.ownerId,
      description: `Compra: ${qty}x ${product.name}`,
      date: new Date().toISOString()
    });

    // Transacción del vendedor
    transactions.push({
      id: (Date.now() + 1).toString(),
      userId: product.ownerId,
      type: 'sale',
      amount: totalPrice,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      buyerId: req.userId,
      description: `Venta: ${qty}x ${product.name}`,
      date: new Date().toISOString()
    });

    saveTransactions(transactions);

    res.json({
      success: true,
      newBalance: users[buyerIndex].balance,
      message: `¡Compraste ${qty}x ${product.name}!`,
      product: product,
      totalPaid: totalPrice
    });
  } catch (error) {
    console.error('Error en compra:', error);
    res.status(500).json({ error: 'Error al procesar compra' });
  }
});

// Eliminar producto
router.delete('/product/:productId', authMiddleware, (req, res) => {
  try {
    const { productId } = req.params;
    const products = getProducts();

    const productIndex = products.findIndex(p => p.id === productId && p.ownerId === req.userId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado o no tienes permisos' });
    }

    products.splice(productIndex, 1);
    saveProducts(products);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Editar producto
router.put('/product/:productId', authMiddleware, (req, res) => {
    try {
      const { productId } = req.params;
      const { name, description, price, image } = req.body;
  
      if (!name || !description || !price) {
        return res.status(400).json({ error: 'Nombre, descripción y precio son requeridos' });
      }
  
      const products = getProducts();
      const productIndex = products.findIndex(p => p.id === productId && p.ownerId === req.userId);
  
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado o no tienes permisos' });
      }
  
      // Actualizar producto
      products[productIndex].name = name;
      products[productIndex].description = description;
      products[productIndex].price = parseInt(price);
      products[productIndex].image = image || products[productIndex].image;
  
      saveProducts(products);
  
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        product: products[productIndex]
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  });
  
  // Editar negocio
  router.put('/my-business', authMiddleware, (req, res) => {
    try {
      const { name, description, category } = req.body;
  
      if (!name || !description || !category) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }
  
      const business = getBusiness();
      const businessIndex = business.findIndex(b => b.ownerId === req.userId);
  
      if (businessIndex === -1) {
        return res.status(404).json({ error: 'No tienes un negocio' });
      }
  
      // Actualizar negocio
      business[businessIndex].name = name;
      business[businessIndex].description = description;
      business[businessIndex].category = category;
  
      saveBusiness(business);
  
      res.json({
        success: true,
        message: 'Negocio actualizado exitosamente',
        business: business[businessIndex]
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar negocio' });
    }
  });
  
  // Eliminar negocio
  router.delete('/my-business', authMiddleware, (req, res) => {
    try {
      const business = getBusiness();
      const businessIndex = business.findIndex(b => b.ownerId === req.userId);
  
      if (businessIndex === -1) {
        return res.status(404).json({ error: 'No tienes un negocio' });
      }
  
      const businessId = business[businessIndex].id;
  
      // Eliminar todos los productos del negocio
      const products = getProducts();
      const updatedProducts = products.filter(p => p.businessId !== businessId);
      saveProducts(updatedProducts);
  
      // Eliminar negocio
      business.splice(businessIndex, 1);
      saveBusiness(business);
  
      res.json({
        success: true,
        message: 'Negocio y productos eliminados exitosamente'
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar negocio' });
    }
  });

module.exports = router;