import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function AccountEditForm({ open, account, onClose, onSubmit }) {
  const [name, setName] = useState(account?.name || '');
  const [iban, setIban] = useState(account?.iban || '');
  const [currency, setCurrency] = useState(account?.currency || 'TRY');
  const [err, setErr] = useState('');

  const seedKey = account?.id || 'none';
  const [seeded, setSeeded] = useState(seedKey);
  if (seeded !== seedKey) {
    setSeeded(seedKey);
    setName(account?.name || '');
    setIban(account?.iban || '');
    setCurrency(account?.currency || 'TRY');
    setErr('');
  }

  const submit = () => {
    if (!name.trim()) return setErr('Şube/Hesap adı boş olamaz.');
    setErr('');
    onSubmit({ name: name.trim(), iban: iban.trim().toUpperCase(), currency });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Hesap Bilgilerini Düzenle</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Şube / Hesap Adı</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="SARIYER" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">IBAN</Label>
            <Input value={iban} onChange={e => setIban(e.target.value.toUpperCase())} placeholder="TR..." className="font-mono tracking-wider" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Para Birimi</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TRY">TRY (₺)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {err && <p className="text-sm text-rose-500">{err}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={submit}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}