import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronUp, ArrowRight, Zap, Banknote, Smartphone, Calculator, Gift, Users } from 'lucide-react';
import { getProfile } from '@/lib/bank';

export default function PinLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [name, setName] = useState(() => localStorage.getItem('minibank_user_name') || '');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/home';

  useEffect(() => {
    getProfile().then((p) => {
      const n = p?.customer_name || '';
      if (n) {
        setName(n);
        localStorage.setItem('minibank_user_name', n);
      }
    }).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  useEffect(() => {
    if (pin.length === 6) handlePin(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handlePin = async () => {
    if (busy) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    navigate(returnTo);
  };

  return (
    <div className="relative min-h-screen max-w-md mx-auto overflow-hidden text-white flex flex-col">
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7)), url('https://cdn.screenshottocode.com/Da9ViX_jcP53_Qpn757ua.png')" }} />

      <div className="relative z-10 flex-1 flex flex-col items-center pt-8">
        <div className="w-full flex justify-between items-center px-8 mb-12">
          <div className="w-10" />
          <img src="https://cdn.screenshottocode.com/hK1R4qcLP8PZB61hL2le3.png" alt="Garanti BBVA" className="h-6" />
          <div className="relative">
            <div className="bg-gray-800/40 p-2 rounded-full">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 bg-[#f05151] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-background">7</span>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="absolute left-4 top-[40%] text-white opacity-80">
          
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 mb-4 bg-gray-800">
            <img src="https://media.base44.com/images/public/6a694296a06f82dc8d145685/a05a68d11_WhatsApp_Image_2026-08-16_at_140513.jpeg" alt={name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold tracking-wide">{name}</h1>
        </div>

        <div className="w-[90%] max-w-sm mb-12">
          <div onClick={() => inputRef.current?.focus()} className="bg-gray-900/50 backdrop-blur-md rounded-xl py-4 px-6 flex items-center justify-between border border-white/5 relative cursor-pointer">
            <input ref={inputRef} type="tel" maxLength={6} inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            <div className="flex space-x-7 z-10">
              {[0, 1, 2, 3, 4, 5].map((i) =>
              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < pin.length ? '#00e3e3' : '#4b5563' }} />
              )}
            </div>
            <div className="text-primary z-10">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
          <button onClick={() => navigate('/forgot-password')} className="w-full text-white text-center mt-10 text-lg font-normal opacity-90">Parolamı Unuttum</button>
        </div>

        <div className="w-full mt-auto mb-4">
          <div className="flex overflow-x-auto px-4 space-x-3 hide-scrollbar pb-2">
            <div className="flex-shrink-0 w-[280px] bg-white/5 backdrop-blur-md p-4 rounded-2xl flex items-center space-x-4 border border-white/5">
              <div className="w-14 h-14 rounded-full border-2 border-white/10 flex-shrink-0 bg-gray-800 flex items-center justify-center"><Gift className="w-6 h-6 text-primary" /></div>
              <p className="text-white text-[13px] leading-tight font-medium">Yakınlarını getirene <span className="font-bold">25.000 TL</span>'ye varan bonus!</p>
            </div>
            <div className="flex-shrink-0 w-[280px] bg-white/5 backdrop-blur-md p-4 rounded-2xl flex items-center space-x-4 border border-white/5">
              <div className="w-14 h-14 rounded-full border-2 border-white/10 flex-shrink-0 bg-gray-800 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
              <p className="text-white text-[13px] leading-tight font-medium">Ailem'le çocuk harcamaları kontrol altında!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-[#0b111a] rounded-t-[2rem] pt-2 pb-10 px-4 flex flex-col items-center">
        <div className="mb-4 text-white/50"><ChevronUp className="w-3 h-3" /></div>
        <div className="grid grid-cols-4 gap-2 w-full">
          {[
          { icon: Zap, label: 'Fast İşlemleri' },
          { icon: Banknote, label: 'Para Çek / Yatır' },
          { icon: Smartphone, label: 'Mobilden Öde' },
          { icon: Calculator, label: 'Hesaplama Yap' }].
          map(({ icon: Icon, label }) =>
          <div key={label} className="flex flex-col items-center">
              <div className="bg-gray-800 w-full aspect-square rounded-xl flex items-center justify-center mb-1">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-[10px] text-center leading-tight">{label}</span>
            </div>
          )}
        </div>
      </div>
    </div>);

}