import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserWithBalance, Transaction, Order, Store, Product } from '../types';

export function Admin() {
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'orders' | 'stores' | 'products'>('users');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, transactionsRes, ordersRes, storesRes, productsRes] = await Promise.all([
        api.adminGetUsers(),
        api.adminGetTransactions(50),
        api.adminGetOrders(50),
        api.getStores(),
        api.getProducts(),
      ]);
      setUsers(usersRes);
      setTransactions(transactionsRes);
      setOrders(ordersRes);
      setStores(storesRes);
      setProducts(productsRes);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReverseTransaction = async (txId: string) => {
    const reason = prompt('Enter reason for reversal:');
    if (!reason || reason.length < 5) {
      setError('Reason must be at least 5 characters');
      return;
    }

    try {
      await api.adminReverseTransaction(txId, reason);
      setSuccess('Transaction reversed successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Reversal failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (!confirm(`Are you sure you want to delete store "${storeName}"? This will also delete all its products.`)) {
      return;
    }

    try {
      await api.deleteStore(storeId);
      setSuccess('Store deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete product "${productName}"?`)) {
      return;
    }

    try {
      await api.deleteProduct(productId);
      setSuccess('Product deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading admin panel...</div>;
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 pb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">Admin Panel</h1>

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
          onClick={() => setActiveTab('users')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'users' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400'
          }`}
        >
          Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'orders' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'stores' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
        >
          Stores ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'products' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
        >
          Products ({products.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${user.account ? parseFloat(user.account.balance).toFixed(2) : '0.00'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{tx.description}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>Type: {tx.type}</p>
                    {tx.sender && <p>From: {tx.sender.name} ({tx.sender.email})</p>}
                    {tx.receiver && <p>To: {tx.receiver.name} ({tx.receiver.email})</p>}
                    <p className="font-mono">ID: {tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">
                    ${parseFloat(tx.amount).toFixed(2)}
                  </p>
                  {(tx.type === 'TRANSFER_SENT' || tx.type === 'TRANSFER_RECEIVED') &&
                    tx.sender &&
                    tx.receiver && (
                      <button
                        onClick={() => handleReverseTransaction(tx.id)}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        Reverse
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {order.quantity}x {order.product.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>Buyer: {order.buyer.name} ({order.buyer.email})</p>
                    <p>Store: {order.product.store.name}</p>
                    <p>Seller: {order.product.store.owner.name}</p>
                    <p className="font-mono">Order ID: {order.id}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-bold text-green-400">
                    ${parseFloat(order.totalPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-bold">{store.name}</h3>
              {store.description && <p className="text-sm text-gray-400">{store.description}</p>}
              <p className="text-xs text-gray-500">Owner: {store.owner.name}</p>
              <p className="text-xs text-gray-500">Products: {store._count?.products || 0}</p>
              <button
                onClick={() => handleDeleteStore(store.id, store.name)}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md font-medium text-sm"
              >
                Delete Store
              </button>
            </div>
          ))}
          {stores.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-8 text-sm">No stores available</p>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-bold">{product.name}</h3>
              {product.description && <p className="text-sm text-gray-400">{product.description}</p>}
              <p className="text-xl font-bold text-green-400">${parseFloat(product.price).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
              <p className="text-xs text-gray-500">Store: {product.store.name}</p>
              <p className="text-xs text-gray-500">Owner: {product.store.owner.name}</p>
              <button
                onClick={() => handleDeleteProduct(product.id, product.name)}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md font-medium text-sm"
              >
                Delete Product
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-8 text-sm">No products available</p>
          )}
        </div>
      )}
    </div>
  );
}
