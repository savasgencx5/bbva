import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { getPendingTransfer, clearPendingTransfer, getAccount, createTransaction, setReceipt, formatNumber } from '@/lib/bank';
import { base44 } from '@/api/base44Client';

function Row({ label, value, last }) {
  return (
    <div className={`px-4 py-[14px] ${last ? '' : 'border-b border-border'}`}>
      <div className="text-muted-foreground text-[13px] uppercase tracking-wide">{label}</div>
      <div className="text-foreground text-[16px] mt-0.5">{value}</div>
    </div>
  );
}

export default function TransferPreview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [account, setAccount] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = getPendingTransfer();
    if (!d) { navigate('/transfer/iban'); return; }
    setData(d);
    getAccount().then(setAccount);
  }, []);

  if (!data) return null;

  const today = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  const paymentType = (data.recipient_name || '').length > 2 ? 'Bireysel Ödeme' : 'Diğer';
  const fee = 8.37;

  const confirm = async () => {
    setBusy(true);
    try {
      const acc = await getAccount();
      const newBalance = acc.balance - data.amount;
      await base44.entities.Account.update(acc.id, { balance: newBalance });
      const tx = await createTransaction({ amount: data.amount, type: 'transfer_out', recipient_name: data.recipient_name, iban: data.iban, description: data.description });
      setReceipt(tx);
      clearPendingTransfer();
      navigate('/transfer/success');
    } finally { setBusy(false); }
  };

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-4 pt-5">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-primary"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-white text-[17px] font-medium tracking-wide">IBAN/Hesap No'ya Transfer</h1>
        <button className="p-1 -mr-1 text-primary"><Info className="w-[22px] h-[22px]" /></button>
      </header>

      <main className="px-4 pb-8 flex flex-col mt-2">
        <p className="text-muted-foreground text-[15px] mb-4">Lütfen işleminizi onaylayın.</p>

        <div className="bg-card rounded-xl flex flex-col">
          <Row label="GÖNDERİM YÖNTEMİ" value="IBAN'a Transfer" />
          <Row label="GÖNDEREN" value={account ? <>{account.name}<br />{account.iban}</> : '—'} />
          <Row label="ALICI IBAN" value={data.iban} />
          <Row label="ALICI ADI SOYADI" value={data.recipient_name} />
          <Row label="TUTAR" value={`${formatNumber(data.amount)} TL`} />
          <Row label="İŞLEM ÜCRETİ" value={`${formatNumber(fee)} TL`} />
          <Row label="İŞLEMİN GERÇEKLEŞECEĞİ TARİH" value={today} />
          <Row label="ÖDEME TİPİ" value={paymentType} last />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button onClick={confirm} disabled={busy} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[17px] font-medium py-3.5 rounded-lg transition-colors disabled:opacity-60">
            {busy ? 'İşleniyor…' : 'Onayla'}
          </button>
          <button onClick={() => navigate('/transfer/iban')} className="w-full bg-card hover:bg-muted text-primary text-[17px] font-medium py-3.5 rounded-lg transition-colors">
            Düzenle
          </button>
        </div>
      </main>
    </div>
  );
}