import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserWithBalance, Transaction, Order } from '../types';

export function Admin() {
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'orders'>('users');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, transactionsRes, ordersRes] = await Promise.all([
        api.adminGetUsers(),
        api.adminGetTransactions(50),
        api.adminGetOrders(50),
      ]);
      setUsers(usersRes);
      setTransactions(transactionsRes);
      setOrders(ordersRes);
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

  if (loading) {
    return <div className="text-center py-12">Loading admin panel...</div>;
  }

  return (
    <div className="px-4 space-y-6">
      <h1 className="text-3xl font-bold text-yellow-400">Admin Panel</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'users' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'transactions'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400'
          }`}
        >
          Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'orders' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'
          }`}
        >
          Orders ({orders.length})
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
                    tx.senderId &&
                    tx.receiverId && (
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
            <div key={order.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">
                    {order.quantity}x {order.product.name}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>Buyer: {order.buyer.name} ({order.buyer.email})</p>
                    <p>Store: {order.product.store.name}</p>
                    <p>Seller: {order.product.store.owner.name}</p>
                    <p className="font-mono">Order ID: {order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">
                    ${parseFloat(order.totalPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
