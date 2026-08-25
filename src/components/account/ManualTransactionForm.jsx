import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const TYPES = [
  { value: 'transfer_in', label: 'Gelen Transfer' },
  { value: 'transfer_out', label: 'Giden Transfer' },
  { value: 'blocked', label: 'Bloke' },
  { value: 'unblocked', label: 'Bloke Kaldırma' },
];

const toInputDate = (d) => {
  const dt = d ? new Date(d) : new Date();
  const off = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
};

export default function ManualTransactionForm({ open, onClose, onSubmit, editing }) {
  const [type, setType] = useState(editing?.type || 'transfer_out');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [recipientName, setRecipientName] = useState(editing?.recipient_name || '');
  const [iban, setIban] = useState(editing?.iban || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [date, setDate] = useState(toInputDate(editing?.transaction_date || editing?.created_date));
  const [err, setErr] = useState('');

  // re-seed when editing target changes
  const seedKey = editing?.id || 'new';
  const [seeded, setSeeded] = useState(seedKey);
  if (seeded !== seedKey) {
    setSeeded(seedKey);
    setType(editing?.type || 'transfer_out');
    setAmount(editing ? String(editing.amount) : '');
    setRecipientName(editing?.recipient_name || '');
    setIban(editing?.iban || '');
    setDescription(editing?.description || '');
    setDate(toInputDate(editing?.transaction_date || editing?.created_date));
    setErr('');
  }

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setErr('Geçerli bir tutar girin.');
    setErr('');
    onSubmit({
      type,
      amount: amt,
      recipient_name: recipientName.trim(),
      iban: iban.trim(),
      description: description.trim(),
      transaction_date: new Date(date).toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>{editing ? 'Hareketi Düzenle' : 'Manuel Hesap Hareketi'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">İşlem Tipi</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tutar (TL)</Label>
            <Input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Alıcı Adı Soyadı</Label>
            <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Zorunlu değil" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">IBAN</Label>
            <Input value={iban} onChange={e => setIban(e.target.value)} placeholder="TR..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Açıklama</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Zorunlu değil" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">İşlem Tarihi</Label>
            <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {err && <p className="text-sm text-rose-500">{err}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={submit}>{editing ? 'Kaydet' : 'Oluştur'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}