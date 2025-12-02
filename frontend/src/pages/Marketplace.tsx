import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Product, Store } from '../types';

export function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'stores' | 'create'>('products');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [storeForm, setStoreForm] = useState({ name: '', description: '' });
  const [productForm, setProductForm] = useState({
    storeId: '',
    name: '',
    description: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, storesRes] = await Promise.all([api.getProducts(), api.getStores()]);
      setProducts(productsRes);
      setStores(storesRes);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (productId: string, productName: string) => {
    const quantity = prompt(`How many of "${productName}" would you like to buy?`, '1');
    if (!quantity) return;

    try {
      await api.buyProduct(productId, parseInt(quantity, 10));
      setSuccess('Purchase successful!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Purchase failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStore(storeForm.name, storeForm.description);
      setSuccess('Store created!');
      setStoreForm({ name: '', description: '' });
      loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct(
        productForm.storeId,
        productForm.name,
        parseFloat(productForm.price),
        parseInt(productForm.stock, 10),
        productForm.description
      );
      setSuccess('Product created!');
      setProductForm({ storeId: '', name: '', description: '', price: '', stock: '' });
      loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 pb-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Marketplace</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
          {success}
        </div>
      )}

      <div className="flex space-x-2 sm:space-x-4 border-b border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'products'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'stores' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Stores
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'create' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Create
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-bold">{product.name}</h3>
              {product.description && <p className="text-gray-400 text-xs sm:text-sm">{product.description}</p>}
              <p className="text-xl sm:text-2xl font-bold text-green-400">${parseFloat(product.price).toFixed(2)}</p>
              <p className="text-xs sm:text-sm text-gray-400">Stock: {product.stock}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Store: {product.store.name} by {product.store.owner.name}
              </p>
              <button
                onClick={() => handleBuy(product.id, product.name)}
                disabled={product.stock === 0}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-medium text-sm sm:text-base"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-8 text-sm">No products available</p>
          )}
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3">
              <h3 className="text-lg sm:text-xl font-bold">{store.name}</h3>
              {store.description && <p className="text-gray-400 text-sm">{store.description}</p>}
              <p className="text-xs sm:text-sm text-gray-500">Owner: {store.owner.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Products: {store._count?.products || 0}
              </p>
            </div>
          ))}
          {stores.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-8 text-sm">No stores yet</p>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Create Store</h2>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={storeForm.description}
                  onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md font-medium text-sm sm:text-base"
              >
                Create Store
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Add Product</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Store</label>
                <select
                  required
                  value={productForm.storeId}
                  onChange={(e) => setProductForm({ ...productForm, storeId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md font-medium text-sm sm:text-base"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
