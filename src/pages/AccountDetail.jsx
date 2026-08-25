import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccount, listTransactions, createTransaction, updateTransaction, deleteTransaction, updateAccount, applyTxToAccount, getCachedAccount } from '@/lib/bank';
import { ArrowLeft, Settings2 } from 'lucide-react';
import AccountInfoCard from '@/components/account/AccountInfoCard';
import BlockBalancePanel from '@/components/account/BlockBalancePanel';
import AccountTransactionList from '@/components/account/AccountTransactionList';
import ManualTransactionForm from '@/components/account/ManualTransactionForm';
import AccountEditForm from '@/components/account/AccountEditForm';

export default function AccountDetail() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(() => getCachedAccount());
  const [transactions, setTransactions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editAccountOpen, setEditAccountOpen] = useState(false);

  const load = async () => {
    const [acc, txs] = await Promise.all([getAccount(), listTransactions()]);
    setAccount(acc);
    setTransactions(txs);
  };
  useEffect(() => { load(); }, []);

  const block = async (amt) => {
    if (!account) return;
    setBusy(true);
    try {
      await updateAccount(account.id, { blocked_balance: (account.blocked_balance || 0) + amt });
      await createTransaction({ amount: amt, type: 'blocked', description: 'Bakiye bloke edildi', transaction_date: new Date().toISOString() });
      await load();
    } finally { setBusy(false); }
  };

  const unblock = async (amt) => {
    if (!account) return;
    setBusy(true);
    try {
      await updateAccount(account.id, { blocked_balance: Math.max(0, (account.blocked_balance || 0) - amt) });
      await createTransaction({ amount: amt, type: 'unblocked', description: 'Bloke kaldırıldı', transaction_date: new Date().toISOString() });
      await load();
    } finally { setBusy(false); }
  };

  const handleAdd = () => { setEditing(null); setFormOpen(true); };
  const handleEdit = (tx) => { setEditing(tx); setFormOpen(true); };

  const handleSubmit = async (data) => {
    if (!account) return;
    setBusy(true);
    try {
      if (editing) {
        const reversed = applyTxToAccount(account, editing, true);
        const applied = applyTxToAccount(reversed, data, false);
        await updateAccount(applied.id, { balance: applied.balance, blocked_balance: applied.blocked_balance });
        await updateTransaction(editing.id, data);
      } else {
        const applied = applyTxToAccount(account, data, false);
        await updateAccount(applied.id, { balance: applied.balance, blocked_balance: applied.blocked_balance });
        await createTransaction(data);
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } finally { setBusy(false); }
  };

  const handleDelete = async (tx) => {
    if (!account) return;
    if (!confirm('Bu hesap hareketini silmek istediğinize emin misiniz? Bakiye geriye alınacaktır.')) return;
    setBusy(true);
    try {
      const reversed = applyTxToAccount(account, tx, true);
      await updateAccount(reversed.id, { balance: reversed.balance, blocked_balance: reversed.blocked_balance });
      await deleteTransaction(tx.id);
      await load();
    } finally { setBusy(false); }
  };

  const handleEditAccount = async (data) => {
    if (!account) return;
    setBusy(true);
    try {
      await updateAccount(account.id, data);
      setEditAccountOpen(false);
      await load();
    } finally { setBusy(false); }
  };

  if (!account) return null;

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-3 flex items-center gap-3 sticky top-0 bg-background z-10">
        <button onClick={() => navigate(-1)} className="text-primary"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-[17px] font-heading font-semibold flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" /> Hesap Yönetimi
        </h1>
      </header>

      <div className="px-4 space-y-4">
        <AccountInfoCard account={account} onEdit={() => setEditAccountOpen(true)} />
        <BlockBalancePanel account={account} onBlock={block} onUnblock={unblock} busy={busy} />
        <AccountTransactionList transactions={transactions} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <ManualTransactionForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={handleSubmit} editing={editing} />
      <AccountEditForm open={editAccountOpen} account={account} onClose={() => setEditAccountOpen(false)} onSubmit={handleEditAccount} />
    </div>
  );
}