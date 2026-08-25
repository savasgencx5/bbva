import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Info, ChevronRight } from 'lucide-react';
import { setPendingTransfer, formatNumber, getAccount, getCachedAccount } from '@/lib/bank';
import IBANScanner from '@/components/IBANScanner';
import AccountsSheet from '@/components/AccountsSheet';

export default function IbanTransfer() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(() => getCachedAccount());
  const [method, setMethod] = useState('iban');
  const [iban, setIban] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [tcKimlik, setTcKimlik] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saveContact, setSaveContact] = useState(false);
  const [senderSelected, setSenderSelected] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [balanceError, setBalanceError] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getAccount().then(a => setAccount(a)); }, []);

  const balance = account ? account.balance - (account.blocked_balance || 0) : null;
  const pureIban = iban.replace(/\s/g, '');
  const revealName = pureIban.length > 15;
  const paymentType = recipientName.length > 2 ? 'Bireysel Ödeme' : 'Diğer';
  const today = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

  const onIbanFocus = () => { if (!iban.startsWith('TR')) setIban('TR '); };
  const onIbanChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (!value.startsWith('TR')) value = 'TR' + value.replace(/[^0-9]/g, '');
    const numbers = value.substring(2).replace(/[^0-9]/g, '');
    const pure = 'TR' + numbers;
    setIban((pure.match(/.{1,4}/g) || []).join(' '));
  };

  const onAmountChange = (e) => {
    let value = e.target.value.replace(/\./g, '').replace(/[^0-9,]/g, '');
    let parts = value.split(',');
    if (parts.length > 2) { value = parts[0] + ',' + parts.slice(1).join(''); parts = value.split(','); }
    if (parts[1] && parts[1].length > 2) parts[1] = parts[1].substring(0, 2);
    let tam = parts[0];
    if (tam) tam = new Intl.NumberFormat('tr-TR').format(parseInt(tam, 10));
    const ond = value.includes(',') ? ',' + (parts[1] || '') : '';
    const formatted = tam + ond;
    setAmount(formatted);
    const raw = formatted.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(raw) || 0;
    setBalanceError(balance != null && num > balance);
  };

  const submit = (e) => {
    e.preventDefault();
    if (pureIban.length < 26) return setError('IBAN numarası eksik! TR dahil 26 hane olmalıdır.');
    if (!recipientName.trim()) return setError('Lütfen alıcı adı ve soyadı alanını boş bırakmayınız.');
    const raw = amount.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(raw) || 0;
    if (num <= 0) return setError('Lütfen geçerli bir transfer tutarı giriniz.');
    if (balance != null && num > balance) return setError('Bakiyeniz yetersiz olduğu için işleme devam edilemez.');
    setError('');
    setPendingTransfer({ recipient_name: recipientName, iban, amount: num, description });
    navigate('/transfer/preview');
  };

  if (!account) return null;

  return (
    <div className="relative">
      <header className="flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-primary mr-4"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-[17px] font-medium text-white">IBAN/Hesap No'ya Transfer</h1>
        </div>
        <Info className="w-5 h-5 text-primary" />
      </header>

      <form onSubmit={submit} className="px-4 pb-4 space-y-3">
        <div className="bg-card rounded-xl p-4 flex justify-between items-center cursor-pointer">
          <span className="text-gray-300 text-[15px]">Kayıtlı Kişi Seç (Zorunlu Değil)</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>

        <div className="bg-card rounded-xl p-4 space-y-4">
          <div className="text-muted-foreground text-xs">Gönderim Yöntemi</div>
          <RadioGroup value={method} onValueChange={setMethod} className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <RadioGroupItem value="iban" id="m-iban" />
              <span className="text-white text-[15px]">IBAN'a</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <RadioGroupItem value="hesap" id="m-hesap" />
              <span className="text-white text-[15px]">Hesap No'ya</span>
            </label>
          </RadioGroup>
        </div>

        <div className="bg-[#21232d] rounded-xl p-4 flex items-start space-x-3">
          <Info className="text-white mt-0.5 text-lg shrink-0" />
          <p className="text-[#e2e2e2] text-[14px] leading-relaxed">
            <span className="font-bold text-white">100.000</span> TL'ye kadar olan başka bankaya para transferi işlemlerinizi FAST ile 7 gün 24 saat, anında yapabilirsiniz.
          </p>
        </div>

        <button type="button" onClick={() => setShowAccounts(true)} className="bg-card rounded-xl p-4 flex justify-between items-center w-full text-left">
          <div className="flex flex-col w-full justify-center">
            {!senderSelected ? (
              <span className="text-muted-foreground text-[15px]">Gönderen</span>
            ) : (
              <div className="flex flex-col mt-1">
                <span className="text-white text-[15px]">{account.name} • {account.iban.replace(/\s/g, '').slice(-10)}</span>
                <span className="text-[#a0a0a0] text-xs mt-0.5">Kullanılabilir Bakiye: {formatNumber(balance)} TL</span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>

        <div className="bg-card rounded-xl p-4 focus-within:ring-1 focus-within:ring-primary transition-all">
          <div className="flex justify-between items-center mb-1">
            <label className="text-muted-foreground text-xs">IBAN</label>
            <button type="button" onClick={() => setShowScanner(true)} className="text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h3" /><path d="M20 7V4h-3" /><path d="M4 17v3h3" /><path d="M20 17v3h-3" />
                <text x="12" y="15" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="currentColor" stroke="none">IBAN</text>
              </svg>
            </button>
          </div>
          <input type="text" value={iban} onChange={onIbanChange} onFocus={onIbanFocus} maxLength="32" className="bg-transparent text-white text-[15px] w-full outline-none font-medium tracking-wide" placeholder="" />
        </div>

        {revealName && (
          <div className="bg-card rounded-xl p-4">
            <label className="text-muted-foreground text-xs mb-1 block">IBAN Sahibi</label>
            <div className="text-white text-[15px] font-medium tracking-wider">XX***** XX*****</div>
          </div>
        )}

        {revealName && (
          <div className="bg-card rounded-xl p-4 focus-within:ring-1 focus-within:ring-primary transition-all">
            <label className="text-muted-foreground text-xs mb-1 block">Alıcı Adı Soyadı</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="bg-transparent text-white text-[15px] w-full outline-none" placeholder="" />
          </div>
        )}

        <div className="bg-card rounded-xl p-4 focus-within:ring-1 focus-within:ring-primary transition-all">
          <label className="text-muted-foreground text-xs mb-1 block">Alıcı Vergi / T.C. Kimlik No (Zorunlu Değil)</label>
          <input type="text" value={tcKimlik} onChange={(e) => setTcKimlik(e.target.value)} className="bg-transparent text-white text-[15px] w-full outline-none" placeholder="" />
        </div>

        <div className={`bg-card rounded-xl p-4 relative focus-within:ring-1 transition-all ${balanceError ? 'ring-1 ring-red-500 focus-within:ring-red-500' : 'focus-within:ring-primary'}`}>
          <label className="text-muted-foreground text-xs mb-1 block">Tutar</label>
          <div className="flex items-center">
            <input type="text" inputMode="decimal" value={amount} onChange={onAmountChange} autoComplete="off" className="bg-transparent text-white text-[15px] w-full outline-none font-medium text-left" />
            <span className="text-muted-foreground ml-2 text-sm">TL</span>
          </div>
          {balanceError && <div className="text-red-500 text-xs mt-2 flex items-center gap-1"><Info className="w-3 h-3" /> Yetersiz Bakiye</div>}
        </div>

        <div className="bg-card rounded-xl p-4 flex justify-between items-center cursor-pointer">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs mb-1">İşlemin Gerçekleşeceği Tarih</span>
            <span className="text-white text-[15px]">{today}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>

        <div className="bg-card rounded-xl p-4 focus-within:ring-1 focus-within:ring-primary transition-all">
          <label className="text-muted-foreground text-xs mb-1 block">Açıklama (Zorunlu Değil)</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-transparent text-white text-[15px] w-full outline-none" placeholder="" />
        </div>

        <div className="bg-card rounded-xl p-4 flex justify-between items-center cursor-pointer">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs mb-1">Ödeme Tipi</span>
            <span className="text-white text-[15px]">{paymentType}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>

        <div className="flex items-center space-x-3 px-1 py-3">
          <Checkbox id="save-contact" checked={saveContact} onCheckedChange={setSaveContact} />
          <label htmlFor="save-contact" className="text-gray-300 text-[15px] cursor-pointer select-none">Kişi Bilgilerini Kaydet</label>
        </div>

        {error && <p className="text-red-500 text-sm px-1">{error}</p>}

        <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl text-[17px] transition-colors shadow-lg">Devam</button>
      </form>

      <AnimatePresence>
        {showAccounts && <AccountsSheet account={account} onSelect={() => { setSenderSelected(true); setShowAccounts(false); }} onClose={() => setShowAccounts(false)} />}
      </AnimatePresence>
      {showScanner && <IBANScanner onDetect={(detected) => { setIban((detected.match(/.{1,4}/g) || []).join(' ')); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
    </div>
  );
}