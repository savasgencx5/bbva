import { db } from '@/lib/db';

export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(Number(amount) || 0);

export const formatNumber = (amount = 0) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0);

export const formatDate = (d) =>
  new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

// --- In-memory + localStorage cache for instant navigation ---
const mem = { account: null, profile: null, transactions: null };

const readLS = (key) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
};
const writeLS = (key, v) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
};

export const getCachedAccount = () => mem.account || readLS('cache_account');
export const getCachedProfile = () => mem.profile || readLS('cache_profile');
export const getCachedTransactions = () => mem.transactions || readLS('cache_transactions');

export const getAccount = async () => {
  const list = await db.Account.list();
  const acc = list[0];
  if (acc) { mem.account = acc; writeLS('cache_account', acc); }
  return acc;
};

export const getProfile = async () => {
  const list = await db.Profile.list();
  const p = list[0];
  if (p) { mem.profile = p; writeLS('cache_profile', p); }
  return p;
};

export const listTransactions = async () => {
  const list = await db.Transaction.list('-created_date', 50);
  mem.transactions = list;
  writeLS('cache_transactions', list);
  return list;
};

export const createTransaction = async (data) => {
  const tx = await db.Transaction.create(data);
  if (mem.transactions) { mem.transactions = [tx, ...mem.transactions]; writeLS('cache_transactions', mem.transactions); }
  return tx;
};

export const transactionMeta = (type) => {
  switch (type) {
    case 'transfer_in': return { label: 'Gelen Transfer', sign: '+', color: 'text-emerald-600' };
    case 'blocked': return { label: 'Blokeli İşlem', sign: '-', color: 'text-orange-600' };
    case 'unblocked': return { label: 'Blok Kaldırma', sign: '+', color: 'text-emerald-600' };
    default: return { label: 'Para Transferi', sign: '-', color: 'text-rose-600' };
  }
};

// Apply a transaction's effect on an account's balance/blocked_balance.
// reverse=true undoes the effect (used when editing/deleting).
export const applyTxToAccount = (account, tx, reverse = false) => {
  const dir = reverse ? -1 : 1;
  let balance = account.balance;
  let blocked = account.blocked_balance || 0;
  const amt = Number(tx.amount) || 0;
  switch (tx.type) {
    case 'transfer_in': balance += amt * dir; break;
    case 'transfer_out': balance -= amt * dir; break;
    // Bloke işlemleri bakiyeyi değiştirmez; sadece bloke tutarını etkiler.
    // Kullanılabilir bakiye = bakiye - bloke bakiyesi
    case 'blocked': blocked += amt * dir; break;
    case 'unblocked': blocked -= amt * dir; break;
  }
  return { ...account, balance, blocked_balance: Math.max(0, blocked) };
};

export const updateAccount = async (id, data) => {
  const acc = await db.Account.update(id, data);
  mem.account = acc; writeLS('cache_account', acc);
  return acc;
};

export const updateTransaction = async (id, data) => {
  const tx = await db.Transaction.update(id, data);
  if (mem.transactions) {
    mem.transactions = mem.transactions.map(t => t.id === id ? tx : t);
    writeLS('cache_transactions', mem.transactions);
  }
  return tx;
};

export const deleteTransaction = async (id) => {
  await db.Transaction.delete(id);
  if (mem.transactions) {
    mem.transactions = mem.transactions.filter(t => t.id !== id);
    writeLS('cache_transactions', mem.transactions);
  }
};

export const setPendingTransfer = (data) =>
  sessionStorage.setItem('pending_transfer', JSON.stringify(data));
export const getPendingTransfer = () =>
  JSON.parse(sessionStorage.getItem('pending_transfer') || 'null');
export const clearPendingTransfer = () =>
  sessionStorage.removeItem('pending_transfer');

export const setReceipt = (data) =>
  sessionStorage.setItem('transfer_receipt', JSON.stringify(data));
export const getReceipt = () =>
  JSON.parse(sessionStorage.getItem('transfer_receipt') || 'null');