import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAccount } from '@/lib/bank';
import {
  Search, ChevronRight, Landmark, CreditCard, Banknote, CircleDollarSign,
  Umbrella, PiggyBank, ScrollText, Store, Target, Lock, X,
} from 'lucide-react';

const menu = [
  { key: 'Hesaplar', icon: Landmark, to: null },
  { key: 'Kartlar', icon: CreditCard },
  { key: 'Krediler', icon: Banknote },
  { key: 'Avans / Taksitli Avans Hesap', icon: CircleDollarSign, badge: 'YENİLENDİ', twoLine: true },
  { key: 'Sigorta Poliçelerim', icon: Umbrella },
  { key: 'Bireysel Emeklilik Sözleşmesi', icon: PiggyBank },
  { key: 'Çek / Senet', icon: ScrollText },
  { key: 'Üye İşyeri (POS) İşlemleri', icon: Store },
  { key: 'Birikim Hedefi', icon: Target },
  { key: 'Kiralık Kasa', icon: Lock },
];

export default function Accounts() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => { getAccount().then(setAccount); }, []);

  const q = query.trim().toLocaleLowerCase('tr-TR');
  const filtered = menu.filter((m) => !q || m.key.toLocaleLowerCase('tr-TR').includes(q));

  const onRow = (m) => {
    if (m.key === 'Hesaplar' && account) navigate(`/account/${account.id}`);
  };

  return (
    <div className="pt-6">
      <header className="px-4 pt-8 pb-3 flex items-center justify-between">
        <h1 className={`text-[23px] font-semibold text-foreground transition-opacity ${searchOpen ? 'opacity-0' : 'opacity-100'}`}>Hesap ve Kart</h1>
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
              placeholder="Hesap ve kartlarda ara"
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
                <span className="flex-1 min-w-0 text-[16.5px] font-normal text-foreground leading-[21.5px] tracking-tight">
                  {m.twoLine ? (
                    <span className="flex flex-col py-1">
                      <span className="flex items-center whitespace-nowrap">
                        Avans / Taksitli{' '}
                        <span className="ml-3 inline-flex items-center justify-center h-[18px] px-1 rounded bg-[#f15c65] text-white text-[10px] font-medium leading-none">YENİLENDİ</span>
                      </span>
                      <span>Avans Hesap</span>
                    </span>
                  ) : (
                    <span className="whitespace-nowrap">{m.key}</span>
                  )}
                </span>
                <ChevronRight className="w-2 h-3.5 text-foreground/80 shrink-0" strokeWidth={2} />
              </>
            );
            const cls = `w-full flex items-center gap-3 px-3.5 text-left active:bg-muted/60 transition-colors ${m.twoLine ? 'py-2' : 'h-12'} ${i !== filtered.length - 1 ? 'border-b border-background' : ''}`;
            return m.to ? (
              <Link key={m.key} to={m.to} className={cls}>{content}</Link>
            ) : (
              <button key={m.key} type="button" onClick={() => onRow(m)} className={cls}>{content}</button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">Sonuç bulunamadı.</div>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate('/home')}
          className="relative w-full mt-3 h-16 bg-card rounded-xl text-left active:bg-muted/60 transition-colors block"
        >
          <img src="https://cdn.screenshottocode.com/r169L9CCupcY9rGolykR3.png" alt="Genç" className="absolute top-3 left-3 w-8 h-8 rounded-full object-contain" />
          <span className="absolute top-2.5 left-14 right-9">
            <span className="block text-[16.5px] font-normal text-foreground leading-[22px] tracking-tight whitespace-nowrap">Garanti BBVA Genç</span>
            <span className="block text-[14px] text-foreground/80 leading-[19px] tracking-tight whitespace-nowrap">Genç olmanın ayrıcalıklarına sahipsin.</span>
          </span>
          <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-3.5 text-foreground/80" strokeWidth={2} />
        </button>
      </main>
    </div>
  );
}