// backend/routes/shop.js
const express = require('express');
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Crear negocio
router.post('/create-business', authMiddleware, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya tiene un negocio
    const existingBusiness = await Business.findOne({ ownerId: req.userId });
    if (existingBusiness) {
      return res.status(400).json({ error: 'Ya tienes un negocio creado' });
    }

    const newBusiness = new Business({
      ownerId: req.userId,
      name,
      description,
      category
    });

    await newBusiness.save();

    res.json({
      success: true,
      message: 'Negocio creado exitosamente',
      business: newBusiness
    });
  } catch (error) {
    console.error('Error al crear negocio:', error);
    res.status(500).json({ error: 'Error al crear negocio' });
  }
});

// Obtener mi negocio
router.get('/my-business', authMiddleware, async (req, res) => {
  try {
    const myBusiness = await Business.findOne({ ownerId: req.userId });

    if (!myBusiness) {
      return res.json({ hasBusiness: false });
    }

    res.json({
      hasBusiness: true,
      business: myBusiness
    });
  } catch (error) {
    console.error('Error al obtener negocio:', error);
    res.status(500).json({ error: 'Error al obtener negocio' });
  }
});

// Agregar producto
router.post('/add-product', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Nombre, descripción y precio son requeridos' });
    }

    const myBusiness = await Business.findOne({ ownerId: req.userId });

    if (!myBusiness) {
      return res.status(400).json({ error: 'Debes crear un negocio primero' });
    }

    const newProduct = new Product({
      businessId: myBusiness._id,
      ownerId: req.userId,
      name,
      description,
      price: parseInt(price),
      image: image || '🛍️'
    });

    await newProduct.save();

    res.json({
      success: true,
      message: 'Producto agregado exitosamente',
      product: newProduct
    });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Obtener mis productos
router.get('/my-products', authMiddleware, async (req, res) => {
  try {
    const myProducts = await Product.find({ ownerId: req.userId });
    res.json(myProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener todos los negocios
router.get('/all-business', authMiddleware, async (req, res) => {
  try {
    const businesses = await Business.find();
    
    const businessWithOwner = await Promise.all(
      businesses.map(async (b) => {
        const owner = await User.findById(b.ownerId);
        return {
          id: b._id,
          ownerId: b.ownerId,
          name: b.name,
          description: b.description,
          category: b.category,
          createdAt: b.createdAt,
          ownerName: owner ? owner.username : 'Usuario'
        };
      })
    );

    res.json(businessWithOwner);
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    res.status(500).json({ error: 'Error al obtener negocios' });
  }
});

// Obtener productos de un negocio
router.get('/business/:businessId/products', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.params;
    const products = await Product.find({ businessId, available: true });
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Comprar producto
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'ID del producto requerido' });
    }

    const qty = quantity || 1;
    const buyer = await User.findById(req.userId);
    const product = await Product.findById(productId);

    if (!buyer) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!product || !product.available) {
      return res.status(404).json({ error: 'Producto no disponible' });
    }

    const totalPrice = product.price * qty;

    if (buyer.balance < totalPrice) {
      return res.status(400).json({
        error: 'Saldo insuficiente',
        required: totalPrice,
        current: buyer.balance
      });
    }

    const seller = await User.findById(product.ownerId);

    if (!seller) {
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }

    // Realizar transacción
    buyer.balance -= totalPrice;
    seller.balance += totalPrice;

    await buyer.save();
    await seller.save();

    // Registrar transacciones
    const buyerTransaction = new Transaction({
      userId: buyer._id,
      type: 'purchase',
      amount: -totalPrice,
      productId: product._id,
      productName: product.name,
      quantity: qty,
      sellerId: seller._id,
      description: `Compra: ${qty}x ${product.name}`
    });

    const sellerTransaction = new Transaction({
      userId: seller._id,
      type: 'sale',
      amount: totalPrice,
      productId: product._id,
      productName: product.name,
      quantity: qty,
      buyerId: buyer._id,
      description: `Venta: ${qty}x ${product.name}`
    });

    await buyerTransaction.save();
    await sellerTransaction.save();

    res.json({
      success: true,
      newBalance: buyer.balance,
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
router.delete('/product/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId, ownerId: req.userId });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado o no tienes permisos' });
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Editar producto
router.put('/product/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, image } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Nombre, descripción y precio son requeridos' });
    }

    const product = await Product.findOne({ _id: productId, ownerId: req.userId });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado o no tienes permisos' });
    }

    product.name = name;
    product.description = description;
    product.price = parseInt(price);
    product.image = image || product.image;

    await product.save();

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      product: product
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Editar negocio
router.put('/my-business', authMiddleware, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const business = await Business.findOne({ ownerId: req.userId });

    if (!business) {
      return res.status(404).json({ error: 'No tienes un negocio' });
    }

    business.name = name;
    business.description = description;
    business.category = category;

    await business.save();

    res.json({
      success: true,
      message: 'Negocio actualizado exitosamente',
      business: business
    });
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    res.status(500).json({ error: 'Error al actualizar negocio' });
  }
});

// Eliminar negocio
router.delete('/my-business', authMiddleware, async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.userId });

    if (!business) {
      return res.status(404).json({ error: 'No tienes un negocio' });
    }

    // Eliminar todos los productos del negocio
    await Product.deleteMany({ businessId: business._id });

    // Eliminar negocio
    await Business.findByIdAndDelete(business._id);

    res.json({
      success: true,
      message: 'Negocio y productos eliminados exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar negocio:', error);
    res.status(500).json({ error: 'Error al eliminar negocio' });
  }
});

module.exports = router;