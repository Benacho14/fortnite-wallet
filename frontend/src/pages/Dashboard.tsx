import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
}

export function Dashboard() {
  const [balance, setBalance] = useState<string>('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [transferForm, setTransferForm] = useState({
    receiverEmail: '',
    receiverName: '',
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
      const [balanceRes, transactionsRes, usersRes] = await Promise.all([
        api.getBalance(),
        api.getTransactions(20),
        api.getUsers(),
      ]);
      setBalance(balanceRes.balance);
      setTransactions(transactionsRes);
      setUsers(usersRes);
    } catch (error: any) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectUser = (user: User) => {
    setTransferForm({
      ...transferForm,
      receiverEmail: user.email,
      receiverName: user.name,
    });
    setShowUserList(false);
    setSearchTerm('');
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
      setTransferForm({ receiverEmail: '', receiverName: '', amount: '', description: '' });
      loadData();
      setTimeout(() => setTransferSuccess(''), 3000);
    } catch (error: any) {
      setTransferError(error.message || 'Transfer failed');
      setTimeout(() => setTransferError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-8 pb-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Your Balance</h1>
        <p className="text-3xl sm:text-5xl font-extrabold">${parseFloat(balance).toFixed(2)}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Send Money</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            {transferError && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
                {transferError}
              </div>
            )}
            {transferSuccess && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
                {transferSuccess}
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Recipient
              </label>
              {transferForm.receiverName ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                    <div className="font-medium text-sm sm:text-base">{transferForm.receiverName}</div>
                    <div className="text-xs text-gray-400">{transferForm.receiverEmail}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransferForm({ ...transferForm, receiverEmail: '', receiverName: '' })}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowUserList(true);
                    }}
                    onFocus={() => setShowUserList(true)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Search by name or email..."
                  />
                  {showUserList && searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => selectUser(user)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium text-sm sm:text-base">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400 text-sm">No users found</div>
                      )}
                    </div>
                  )}
                </>
              )}
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="What's this for?"
              />
            </div>
            <button
              type="submit"
              disabled={!transferForm.receiverEmail}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-medium text-sm sm:text-base"
            >
              Send Transfer
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-4 text-sm">No transactions yet</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-gray-700 rounded-lg p-3 sm:p-4 flex justify-between items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{tx.description}</p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{tx.type}</p>
                  </div>
                  <div
                    className={`text-base sm:text-lg font-bold flex-shrink-0 ${
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
