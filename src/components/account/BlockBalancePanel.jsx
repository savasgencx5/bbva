import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

export default function BlockBalancePanel({ account, onBlock, onUnblock, busy }) {
  const [blockAmount, setBlockAmount] = useState('');
  const [unblockAmount, setUnblockAmount] = useState('');
  const [msg, setMsg] = useState('');

  const available = account.balance - (account.blocked_balance || 0);

  const doBlock = () => {
    const amt = parseFloat(blockAmount);
    if (!amt || amt <= 0) return setMsg('Geçerli tutar girin.');
    if (amt > available) return setMsg('Yetersiz kullanılabilir bakiye.');
    setMsg('');
    onBlock(amt);
    setBlockAmount('');
  };

  const doUnblock = () => {
    const amt = parseFloat(unblockAmount);
    if (!amt || amt <= 0) return setMsg('Geçerli tutar girin.');
    if (amt > (account.blocked_balance || 0)) return setMsg('Bloke edilen tutardan fazla.');
    setMsg('');
    onUnblock(amt);
    setUnblockAmount('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-orange-500" />
        <h2 className="font-heading font-semibold">Bakiye Bloke Et</h2>
      </div>
      <div className="flex gap-2">
        <Input type="number" inputMode="decimal" value={blockAmount} onChange={e => setBlockAmount(e.target.value)} placeholder="Tutar (TL)" />
        <Button onClick={doBlock} disabled={busy}>Bloke Et</Button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Unlock className="w-4 h-4 text-emerald-500" />
        <h2 className="font-heading font-semibold">Bloke Kaldır</h2>
      </div>
      <div className="flex gap-2">
        <Input type="number" inputMode="decimal" value={unblockAmount} onChange={e => setUnblockAmount(e.target.value)} placeholder="Tutar (TL)" />
        <Button onClick={doUnblock} disabled={busy} variant="outline">Kaldır</Button>
      </div>

      {msg && (
        <p className="text-sm text-rose-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> {msg}
        </p>
      )}
    </div>
  );
}