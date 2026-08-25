import { useState } from 'react';
import { formatCurrency, formatDate, transactionMeta } from '@/lib/bank';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, ArrowDownUp } from 'lucide-react';

export default function AccountTransactionList({ transactions, onEdit, onDelete, onAdd }) {
  const [sortDesc, setSortDesc] = useState(true);
  const sorted = [...transactions].sort((a, b) => {
    const da = new Date(a.transaction_date || a.created_date).getTime();
    const db = new Date(b.transaction_date || b.created_date).getTime();
    return sortDesc ? db - da : da - db;
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          Hesap Hareketleri
          <span className="text-xs text-muted-foreground font-normal">({transactions.length})</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground" onClick={() => setSortDesc(s => !s)}>
            <ArrowDownUp className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" className="h-8" onClick={onAdd}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Yeni
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Hesap hareketi bulunmuyor.</p>
      ) : (
        <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
          {sorted.map(tx => {
            const m = transactionMeta(tx.type);
            return (
              <div key={tx.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{tx.recipient_name || m.label}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${m.sign === '+' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.transaction_date || tx.created_date)}</p>
                  {tx.description && <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{tx.description}</p>}
                  {tx.iban && <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono truncate">{tx.iban}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className={`text-sm font-semibold ${m.color}`}>{m.sign}{formatCurrency(tx.amount)}</p>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(tx)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(tx)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}