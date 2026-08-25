import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/bank';

export default function AccountsSheet({ account, onSelect, onClose }) {
  const available = account.balance - (account.blocked_balance || 0);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <motion.div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="relative bg-[#1a1a1c] w-full max-w-md mx-auto rounded-t-2xl flex flex-col h-[90%] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="flex justify-between items-center px-4 py-4 shrink-0">
            <h2 className="text-[17px] font-medium text-white">Ödeme Aracı Seçimi</h2>
          </div>
          <div className="flex px-4 pb-4 space-x-2 shrink-0">
            <button className="flex-1 bg-white text-black py-2 rounded-lg font-medium text-[15px]">Test Banka</button>
            <button className="flex-1 bg-[#2a2a2c] text-gray-300 py-2 rounded-lg font-medium text-[15px]">Diğer Bankalar</button>
          </div>
          <div className="px-4 py-2 text-muted-foreground text-xs tracking-wider shrink-0">HESAPLAR</div>
          <div className="overflow-y-auto flex-1 pb-8">
            <button onClick={onSelect} className="w-full flex justify-between px-4 py-4 border-b border-[#2a2a2c] hover:bg-[#252527] text-left">
              <div className="flex flex-col gap-0.5">
                <div className="text-white text-[15px] font-medium tracking-wide">{account.iban.replace(/\s/g, '').slice(-10)}</div>
                <div className="text-gray-400 text-xs">Bakiye</div>
                <div className="text-gray-400 text-xs">Kullanılabilir Bakiye</div>
              </div>
              <div className="text-right flex flex-col gap-0.5">
                <div className="text-gray-400 text-[11px] uppercase mt-1">{account.name}</div>
                <div className="text-white text-sm">{formatNumber(account.balance)} TL</div>
                <div className="text-white text-sm">{formatNumber(available)} TL</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}