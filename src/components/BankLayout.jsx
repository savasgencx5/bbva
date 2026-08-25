import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wallet, PlusCircle, List, HeartPulse } from 'lucide-react';

const navItems = [
  { to: '/home', label: 'Ana Sayfa', icon: Home },
  { to: '/accounts', label: 'Hesap ve Kart', icon: Wallet },
  { to: null, label: 'Başvurular', icon: PlusCircle },
  { to: '/transfers', label: 'İşlemler', icon: List },
  { to: null, label: 'Durumum', icon: HeartPulse },
];

export default function BankLayout() {
  const { pathname } = useLocation();
  const [toast, setToast] = useState(null);
  let toastTimer;
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToast(null), 1600);
  };
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative text-foreground">
      <main className="pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background flex justify-between items-center px-2 py-2 border-t border-border z-50 pb-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = to && (pathname === to || (to === '/transfers' && pathname.startsWith('/transfer')));
          const content = (
            <>
              {active && <div className="absolute top-[-8px] w-1/2 h-0.5 bg-bank-green rounded-b" />}
              <Icon className={`text-xl mb-1 mt-1 ${active ? 'text-bank-green' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-bank-green' : 'text-muted-foreground'}`}>{label}</span>
            </>
          );
          const cls = 'flex flex-col items-center justify-center w-1/5 relative';
          return to ? (
            <Link key={label} to={to} className={cls}>{content}</Link>
          ) : (
            <button key={label} type="button" onClick={() => showToast(`${label} yakında`)} className={cls}>{content}</button>
          );
        })}
      </nav>

      {toast && (
        <div className="fixed left-1/2 bottom-24 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-[#30343e] text-foreground text-xs whitespace-nowrap shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}