import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTransactions, getAccount, formatNumber, transactionMeta, getCachedAccount, getCachedTransactions } from '@/lib/bank';
import { ArrowLeft, Download, SlidersHorizontal, ChevronDown, Bookmark, FileText, Repeat } from 'lucide-react';
import { generateDekontPdf } from '@/lib/dekont';
import DekontReceipt from '@/components/DekontReceipt';

const MONTHS_TR = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];

export default function Transactions() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getCachedTransactions() || []);
  const [account, setAccount] = useState(() => getCachedAccount());
  const [view, setView] = useState('past');
  const [typeFilter, setTypeFilter] = useState('Hepsi');
  const [dateFilter, setDateFilter] = useState('Son 7 gün');
  const [openMenu, setOpenMenu] = useState(null);
  const [dekontTx, setDekontTx] = useState(null);
  const [generating, setGenerating] = useState(false);
  const dekontRef = useRef(null);

  useEffect(() => {
    Promise.all([listTransactions(), getAccount()]).then(([t, a]) => {
      setItems(t);
      if (a) setAccount(a);
    });
  }, []);

  useEffect(() => {
    if (!dekontTx || !account) return;
    let cancelled = false;
    (async () => {
      setGenerating(true);
      try {
        await new Promise((r) => setTimeout(r, 60));
        if (!dekontRef.current || cancelled) return;
        await generateDekontPdf(dekontRef.current, `dekont-${(dekontTx.id || '').slice(0, 8)}.pdf`);
        if (cancelled) return;
      } finally {
        if (!cancelled) { setGenerating(false); setDekontTx(null); }
      }
    })();
    return () => { cancelled = true; };
  }, [dekontTx, account]);

  const rows = useMemo(() => {
    let running = account ? account.balance : 0;
    const withBalance = items.map((tx) => {
      const m = transactionMeta(tx.type);
      const incoming = m.sign === '+';
      const signed = incoming ? tx.amount : -tx.amount;
      const post = running;
      running -= signed;
      return { tx, meta: m, incoming, post };
    });
    return withBalance;
  }, [items, account]);

  const filtered = useMemo(() => {
    let list = rows;
    if (typeFilter === 'Para Transferleri') list = list.filter((r) => r.tx.type === 'transfer_out' || r.tx.type === 'transfer_in');
    else if (typeFilter === 'Diğer') list = list.filter((r) => r.tx.type === 'blocked' || r.tx.type === 'unblocked');
    if (dateFilter !== 'Hepsi') {
      const days = dateFilter === 'Son 7 gün' ? 7 : dateFilter === 'Son 30 gün' ? 30 : 365;
      const cutoff = Date.now() - days * 86400000;
      list = list.filter((r) => new Date(r.tx.created_date).getTime() >= cutoff);
    }
    return list;
  }, [rows, typeFilter, dateFilter]);

  const available = account ? account.balance - (account.blocked_balance || 0) : 0;
  const accTail = account ? account.iban.replace(/\s/g, '').slice(-10).replace(/(\d{4})(\d{3})(\d{3})/, '$1 - $2$3') : '';

  const dateBlock = (d) => {
    const dt = new Date(d);
    return {
      day: String(dt.getDate()).padStart(2, '0'),
      mon: MONTHS_TR[dt.getMonth()],
      year: dt.getFullYear(),
      time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
    };
  };

  return (
    <div className="pt-2">
      {/* Topbar */}
      <header className="h-12 px-4 flex items-center justify-between relative">
        <button onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/home'))} className="w-7 h-10 grid place-items-start text-primary" aria-label="Geri">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.9} />
        </button>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-foreground whitespace-nowrap">Hesap Hareketleri</h1>
        <div className="flex items-center gap-3.5 text-primary">
          <button className="w-7 h-10 grid place-items-center" aria-label="Hareketleri indir"><Download className="w-5 h-5" strokeWidth={1.8} /></button>
          <button className="w-7 h-10 grid place-items-center" aria-label="Ayarlar"><SlidersHorizontal className="w-5 h-5" strokeWidth={1.8} /></button>
        </div>
      </header>

      {/* Segment control */}
      <section className="mx-4 mt-1 p-0.5 rounded-[10px] bg-secondary grid grid-cols-2 gap-0.5 h-9">
        {['past', 'future'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-[7px] text-[15px] font-semibold leading-[31px] transition-colors ${view === v ? 'bg-[#e4eaf7] text-[#181a20]' : 'text-foreground'}`}
          >
            {v === 'past' ? 'Geçmiş' : 'Gelecek'}
          </button>
        ))}
      </section>

      {/* Balance summary */}
      <section className="mx-4 mt-3 flex justify-between items-start">
        <div className="flex flex-col">
          <div className="text-[15.5px] font-medium text-foreground leading-[22px]">{accTail || '—'}</div>
          <div className="mt-0.5 text-[14.5px] text-muted-foreground leading-[19px]">Kullanılabilir Bakiye</div>
        </div>
        <div className="flex flex-col items-end text-right">
          <div className="text-[15.5px] font-semibold text-foreground leading-[22px]">{formatNumber(account?.balance || 0)} TL</div>
          <div className="mt-0.5 text-[14.5px] font-semibold text-muted-foreground leading-[19px]">{formatNumber(available)} TL</div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-4 mt-4 grid grid-cols-2 gap-3 relative z-10">
        <FilterDropdown
          open={openMenu === 'type'}
          onToggle={() => setOpenMenu(openMenu === 'type' ? null : 'type')}
          value={typeFilter}
          options={['Hepsi', 'Para Transferleri', 'Diğer']}
          onSelect={setTypeFilter}
        />
        <FilterDropdown
          open={openMenu === 'date'}
          onToggle={() => setOpenMenu(openMenu === 'date' ? null : 'date')}
          value={dateFilter}
          options={['Son 7 gün', 'Son 30 gün', 'Bu yıl']}
          onSelect={setDateFilter}
        />
      </section>

      {/* Transactions */}
      {view === 'past' ? (
        filtered.length === 0 ? (
          <div className="mx-4 mt-6 rounded-lg bg-card py-10 text-center text-muted-foreground text-sm">Hesap hareketi bulunamadı.</div>
        ) : (
          <section className="mx-4 mt-6 rounded-lg bg-card overflow-hidden">
            {filtered.map(({ tx, meta, incoming, post }, i) => {
              const d = dateBlock(tx.created_date);
              return (
                <article key={tx.id} className={`grid grid-cols-[58px_minmax(0,1fr)] px-3 ${i ? 'border-t border-background' : ''}`}>
                  <div className="pt-3 -ml-1.5 text-center text-muted-foreground tabular-nums">
                    <div className="text-[23px] leading-[27px] font-normal tracking-tight">{d.day}</div>
                    <div className="mt-1 text-[8px] leading-[9.6px] font-semibold">{d.mon}<br />{d.year}<br />{d.time}</div>
                  </div>
                  <div className="min-w-0 pt-3 pb-2.5 flex flex-col">
                    <div className="flex items-start justify-between gap-2 text-[15px] font-semibold text-foreground whitespace-nowrap">
                      <span className="truncate">{tx.recipient_name || meta.label}</span>
                      <span className={`ml-auto tabular-nums ${incoming ? 'text-bank-green font-semibold' : 'font-medium'}`}>
                        {meta.sign}{formatNumber(tx.amount)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-start justify-between text-[14.5px] text-muted-foreground whitespace-nowrap">
                      <span>İşlem Sonu Bakiye</span>
                      <span className="text-foreground/80 tabular-nums">{formatNumber(post)}</span>
                    </div>
                    {tx.description && (
                      <div className="mt-1.5 text-[14px] text-foreground/70 truncate">{tx.description}</div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {tx.type === 'transfer_out' ? (
                        <button className="text-primary text-[14px] font-semibold">Tekrarla</button>
                      ) : <span />}
                      <div className="flex items-center gap-4 text-primary">
                        <button className="w-6 h-6 grid place-items-center" aria-label="Hareketi kaydet"><Bookmark className="w-5 h-5" strokeWidth={1.6} /></button>
                        <button onClick={() => setDekontTx(tx)} disabled={generating} className="w-6 h-6 grid place-items-center disabled:opacity-50" aria-label="Dekont"><FileText className="w-5 h-5" strokeWidth={1.55} /></button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )
      ) : (
        <section className="mx-4 mt-6 rounded-lg bg-card py-10 text-center text-muted-foreground text-sm">Planlanmış gelecek hareket bulunmuyor.</section>
      )}

      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
          <div className="text-sm text-muted-foreground">Dekont hazırlanıyor…</div>
        </div>
      )}

      <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        {dekontTx && account && <DekontReceipt ref={dekontRef} data={dekontTx} account={account} />}
      </div>
    </div>
  );
}

function FilterDropdown({ open, onToggle, value, options, onSelect }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full h-11 rounded-lg bg-card px-3 flex items-center justify-between text-[15px] text-foreground"
      >
        <span>{value}</span>
        <ChevronDown className="w-4 h-2.5 text-foreground" strokeWidth={1.6} />
      </button>
      {open && (
        <div className="absolute top-12 left-0 right-0 p-1 rounded-lg border border-border bg-[#20232b] shadow-xl z-20">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => { onSelect(o); onToggle(); }}
              className={`w-full h-8 px-2 rounded-md text-left text-[13px] ${o === value ? 'bg-secondary text-foreground' : 'text-foreground/90'}`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}