import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ChevronRight, X, ArrowLeftRight, Wallet, HandCoins, Split,
  Coins, TrendingUp, Bitcoin, PlusCircle, QrCode, Sparkles,
} from 'lucide-react';

const menu = [
  { key: 'Para Transferleri', icon: ArrowLeftRight, to: '/transfer/iban' },
  { key: 'Ödemeler', icon: Wallet, badge: 'YENİ' },
  { key: 'Ödeme İste', icon: HandCoins },
  { key: 'Harca Bölüştür', icon: Split, badge: 'YENİ' },
  { key: 'Döviz ve Kıymetli Madenler', icon: Coins },
  { key: 'Yatırımlar', icon: TrendingUp },
  { key: 'Bitcoin ve Kripto', icon: Bitcoin },
  { key: 'Başvurular', icon: PlusCircle },
  { key: 'TR Karekod İşlemleri', icon: QrCode, to: '/transfer/iban' },
  { key: 'Akıllı İşlemler', icon: Sparkles },
];

export default function Transfers() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLocaleLowerCase('tr-TR');
  const filtered = menu.filter((m) => !q || m.key.toLocaleLowerCase('tr-TR').includes(q));

  return (
    <div className="pt-8">
      <header className="px-4 pt-2 pb-3 flex items-center justify-between">
        <h1 className={`text-[23px] font-semibold text-foreground transition-opacity ${searchOpen ? 'opacity-0' : 'opacity-100'}`}>İşlemler</h1>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="w-8 h-8 grid place-items-center text-primary rounded-full active:bg-primary/10"
          aria-label="Ara"
        >
          {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </header>

      {searchOpen && (
        <div className="px-4 -mt-1 mb-2">
          <div className="flex items-center gap-2 px-3 h-10 border border-border rounded-lg bg-card">
            <Search className="w-4 h-4 text-primary shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="İşlem ara"
              className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      <main className="px-4">
        <section className="bg-card rounded-xl overflow-hidden">
          {filtered.map((m, i) => {
            const Icon = m.icon;
            const content = (
              <>
                <Icon className="w-6 h-6 text-primary shrink-0" strokeWidth={1.75} />
                <span className="flex-1 min-w-0 flex items-center text-[16.5px] font-normal text-foreground leading-tight tracking-tight whitespace-nowrap">
                  {m.key}
                  {m.badge && (
                    <span className="ml-3 inline-flex items-center justify-center h-[18px] px-1.5 rounded bg-[#ff5e67] text-white text-[10px] font-medium leading-none">{m.badge}</span>
                  )}
                </span>
                <ChevronRight className="w-2 h-3.5 text-foreground/80 shrink-0" strokeWidth={2} />
              </>
            );
            const cls = `w-full flex items-center gap-3 px-3.5 h-12 text-left active:bg-muted/60 transition-colors ${i !== filtered.length - 1 ? 'border-b border-background' : ''}`;
            return m.to ? (
              <Link key={m.key} to={m.to} className={cls}>{content}</Link>
            ) : (
              <button key={m.key} type="button" className={cls}>{content}</button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">Sonuç bulunamadı.</div>
          )}
        </section>
      </main>
    </div>
  );
}