import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, FileText, Send } from 'lucide-react';
import { getReceipt, getAccount } from '@/lib/bank';
import { generateDekontPdf } from '@/lib/dekont';
import DekontReceipt from '@/components/DekontReceipt';

export default function TransferSuccess() {
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [account, setAccount] = useState(null);
  const [generating, setGenerating] = useState(false);
  const dekontRef = useRef(null);

  useEffect(() => {
    const d = getReceipt();
    if (!d) { navigate('/home'); return; }
    setR(d);
    getAccount().then(setAccount);
  }, []);

  if (!r) return null;

  const ref = (r.id || '').replace(/-/g, '').slice(-10) || '0000000000';

  const showDekont = async () => {
    if (!dekontRef.current || generating) return;
    setGenerating(true);
    try {
      await generateDekontPdf(dekontRef.current, `dekont-${(r.id || '').slice(0, 8)}.pdf`);
    } finally { setGenerating(false); }
  };

  return (
    <div className="px-4 pt-16 pb-28 flex-grow flex flex-col">
      <h1 className="text-white text-[23px] font-semibold leading-tight text-center sm:text-left">IBAN/Hesap No'ya Transfer</h1>

      <div className="mt-14 flex justify-center">
        <div className="w-[84px] h-[84px] bg-card rounded-full flex items-center justify-center">
          <div className="w-[58px] h-[58px] bg-[#0c9745] rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-background" strokeWidth={2} />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-foreground/80 text-[16px] leading-[1.5] px-2 font-medium">
        FAST işleminiz {ref} referans numarası ile tamamlanmıştır.
      </p>

      <div className="mt-7 flex justify-center items-center gap-4">
        <button onClick={showDekont} disabled={generating} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity whitespace-nowrap disabled:opacity-50">
          <FileText className="w-[18px] h-[18px]" strokeWidth={1.8} />
          <span className="text-[14px] font-semibold">{generating ? 'Hazırlanıyor…' : 'Dekont Görüntüle'}</span>
        </button>
        <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity whitespace-nowrap">
          <Send className="w-5 h-5" strokeWidth={1.8} />
          <span className="text-[14px] font-semibold">Dekont Gönder</span>
        </button>
      </div>

      <div className="mt-8 bg-card rounded-2xl p-5">
        <h2 className="text-white text-[18px] font-semibold">{r.recipient_name}</h2>
        <div className="mt-1 text-muted-foreground text-[15.5px] break-all">{(r.iban || '').replace(/\s/g, '')}</div>
      </div>

      <button className="mt-6 w-full bg-primary hover:bg-primary/90 transition-colors rounded-xl py-4 text-primary-foreground text-[16px] font-bold">
        Kayıtlı Kişilere Ekle
      </button>

      <button onClick={() => navigate('/transfers')} className="mt-4 w-full bg-card hover:bg-muted transition-colors rounded-xl py-4 text-primary text-[16px] font-bold">
        Para Transferleri
      </button>

      <div className="flex-grow flex flex-col justify-end items-center mt-12 mb-2">
        <img src="https://cdn.screenshottocode.com/AeLiyrvkkmJ6DlBf8ynqB.png" alt="FAST Merkez Bankası" className="h-[42px] object-contain mix-blend-screen opacity-95" />
      </div>

      <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        {account && <DekontReceipt ref={dekontRef} data={r} account={account} />}
      </div>
    </div>
  );
}