import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, getAccount, getProfile, listTransactions, transactionMeta, getCachedAccount, getCachedProfile, getCachedTransactions } from '@/lib/bank';
import { Search, Bell, X, ArrowLeftRight, Receipt, QrCode, ArrowRight, Upload, Bot } from 'lucide-react';

export default function Home() {
  const [account, setAccount] = useState(() => getCachedAccount());
  const [transactions, setTransactions] = useState(() => getCachedTransactions() || []);
  const [user, setUser] = useState(() => getCachedProfile());
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    (async () => {
      const [acc, txs, prof] = await Promise.all([
        getAccount(),
        listTransactions(),
        getProfile().catch(() => null),
      ]);
      if (acc) setAccount(acc);
      setTransactions(txs);
      if (prof) setUser(prof);
    })();
  }, []);

  if (!account) return null;

  const available = account.balance - (account.blocked_balance || 0);
  const [whole, dec] = formatNumber(available).split(',');
  const lastTx = transactions[0];
  const lastMeta = lastTx ? transactionMeta(lastTx.type) : null;
  const shortDate = lastTx
    ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(lastTx.created_date))
    : '';
  const actions = [
    { label: 'Garanti BBVA Genç', badge: 'GENÇ', to: '/accounts' },
    { label: 'Para Transferi', icon: ArrowLeftRight, to: '/transfers' },
    { label: 'Fatura', icon: Receipt, to: '/transfers' },
    { label: 'TR Karekod İşlemleri', icon: QrCode, to: '/transfers' },
  ];

  return (
    <div className="pt-[4.1rem]">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background flex justify-between items-center px-4 pt-2 pb-2 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-card border border-border">
            <img src="https://media.base44.com/images/public/6a694296a06f82dc8d145685/a05a68d11_WhatsApp_Image_2026-08-16_at_140513.jpeg" alt={user?.customer_name || 'Profil'} className="w-full h-full object-cover" />
          </div>
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground">
            <Search className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground">
            <Bot className="w-5 h-5" />
          </div>
          <div className="relative w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">7</span>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Green Banner */}
        {showBanner && (
          <div className="bg-bank-green rounded-xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <button onClick={() => setShowBanner(false)} className="absolute top-3 right-3 text-white z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="w-2/3 z-10">
              <p className="text-white font-semibold text-[15px] leading-snug mb-4">
                Yeni fatura talimatınıza özel 1.000 TL, toplamda 4.000 TL bonus kazanma fırsatı!
              </p>
            </div>
            <div className="z-10">
              <button className="bg-white text-primary font-semibold py-2 px-6 rounded-lg text-sm">İncele</button>
            </div>
            <img src="https://cdn.screenshottocode.com/4Plk0Nj-ZSHJigN7v5wvE.png" alt="" className="absolute bottom-[-5px] right-2 w-24 h-auto object-contain rotate-6" />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1 -mx-1 px-1">
          {actions.map((a) => (
            <Link key={a.label} to={a.to} className="flex flex-col items-center bg-card rounded-xl p-3 w-[90px] justify-between snap-start shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2 text-black">
                {a.badge ? <span className="font-bold text-xs" style={{ fontFamily: 'cursive' }}>{a.badge}</span> : a.icon ? <a.icon className="w-5 h-5" /> : null}
              </div>
              <span className="text-xs text-center font-medium leading-tight text-gray-200">{a.label}</span>
            </Link>
          ))}
          <div className="flex flex-col items-center bg-card rounded-xl p-3 w-[90px] justify-between opacity-50 snap-start shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center mb-2" />
            <span className="text-xs text-gray-200">D</span>
          </div>
        </div>

        {/* Account Card */}
        <div className="bg-card rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-muted-foreground text-[13px] font-medium flex items-center mr-2">
              <span>{account.name} • {account.iban.replace(/\s/g, '').slice(-11).replace(/(\d{4})(\d{7})/, '$1-$2')}</span>
              <Upload className="w-3 h-3 ml-2 text-primary flex-shrink-0" />
            </h3>
            <Link to="/accounts" className="text-primary text-[13px] font-semibold flex-shrink-0">Tümü</Link>
          </div>
          <p className="text-white font-semibold mb-1 text-base">Kullanılabilir Bakiye</p>
          <div className="flex items-baseline mb-3">
            <span className="text-3xl font-bold">{whole}</span>
            <span className="text-xl font-bold">,{dec} TL</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">Bakiye: {formatNumber(account.balance)} TL</p>
          {lastTx && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted-foreground text-sm">{shortDate} • {lastTx.recipient_name || lastMeta.label}</p>
              <p className="text-muted-foreground text-sm">{lastMeta.sign}{formatNumber(lastTx.amount)} TL</p>
            </div>
          )}
          <Link to="/transactions" className="text-primary text-sm font-semibold flex items-center">
            Hesap Hareketleri <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Promo Card */}
        <div className="bg-card rounded-xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="w-[65%] z-10">
            <p className="text-muted-foreground text-[15px] leading-snug mb-6">
              Bonus'un en prestijlisi Bonus Platinum ile <span className="text-white font-bold">25.000 TL'ye varan faizsiz</span> ve <span className="text-white font-bold">masrafsız Taksitli Nakit Avans'tan</span> faydalanın!
            </p>
          </div>
          <div className="z-10 mt-auto">
            <span className="text-primary text-sm font-semibold flex items-center">Hemen Başvur <ArrowRight className="w-4 h-4 ml-2" /></span>
          </div>
          <img src="https://cdn.screenshottocode.com/qvCOQGkPMvoyAqbzmZAo6.png" alt="" className="absolute bottom-[-5px] right-[-10px] w-36 h-auto object-cover -rotate-6" />
        </div>
      </main>
    </div>
  );
}