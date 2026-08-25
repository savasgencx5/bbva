import { formatCurrency } from '@/lib/bank';
import { Building2, Hash, Wallet, Lock, Pencil } from 'lucide-react';

export default function AccountInfoCard({ account, onEdit }) {
  const available = account.balance - (account.blocked_balance || 0);
  const ibanGroups = (account.iban || '').match(/.{1,4}/g) || [];

  return (
    <div className="rounded-2xl bg-primary text-primary-foreground p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/80 font-medium">{account.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/15 px-2 py-1 rounded-full text-white/80">Vadesiz {account.currency || 'TRY'}</span>
          {onEdit && (
            <button onClick={onEdit} className="w-7 h-7 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors" aria-label="Hesabı düzenle">
              <Pencil className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-white/60 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-white/50">Şube Adı</p>
            <p className="text-sm text-white font-medium">{account.name || 'Merkez'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Hash className="w-4 h-4 text-white/60 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-white/50">IBAN</p>
            <p className="text-sm text-white font-mono tracking-wider break-all">{ibanGroups.join(' ') || '—'}</p>
          </div>
        </div>
      </div>

      <p className="text-3xl font-heading font-bold mt-5">{formatCurrency(account.balance)}</p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-white/60">
            <Wallet className="w-3.5 h-3.5" />
            <p className="text-[11px]">Kullanılabilir</p>
          </div>
          <p className="text-sm font-semibold mt-1">{formatCurrency(available)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-white/60">
            <Lock className="w-3.5 h-3.5" />
            <p className="text-[11px]">Bloke</p>
          </div>
          <p className="text-sm font-semibold mt-1">{formatCurrency(account.blocked_balance || 0)}</p>
        </div>
      </div>
    </div>
  );
}