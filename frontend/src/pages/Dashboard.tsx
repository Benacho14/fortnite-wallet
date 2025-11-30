import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';

export function Dashboard() {
  const [balance, setBalance] = useState<string>('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferForm, setTransferForm] = useState({
    receiverEmail: '',
    amount: '',
    description: '',
  });
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.getBalance(),
        api.getTransactions(20),
      ]);
      setBalance(balanceRes.balance);
      setTransactions(transactionsRes);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');

    try {
      await api.transfer(
        transferForm.receiverEmail,
        parseFloat(transferForm.amount),
        transferForm.description
      );
      setTransferSuccess('Transfer successful!');
      setTransferForm({ receiverEmail: '', amount: '', description: '' });
      loadData();
    } catch (error: any) {
      setTransferError(error.message || 'Transfer failed');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Your Balance</h1>
        <p className="text-5xl font-extrabold">${parseFloat(balance).toFixed(2)}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Send Money</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            {transferError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                {transferError}
              </div>
            )}
            {transferSuccess && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
                {transferSuccess}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={transferForm.receiverEmail}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, receiverEmail: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={transferForm.description}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's this for?"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
            >
              Send Transfer
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No transactions yet</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{tx.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{tx.type}</p>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      tx.type.includes('RECEIVED') || tx.type === 'SALE'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {tx.type.includes('RECEIVED') || tx.type === 'SALE' ? '+' : '-'}$
                    {parseFloat(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
