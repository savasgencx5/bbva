import { forwardRef } from 'react';
import { formatNumber } from '@/lib/bank';

const ones = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const tens = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];

function below1000(num) {
  let s = "";
  const h = Math.floor(num / 100), r = num % 100;
  if (h) s += (h === 1 ? "" : ones[h] + " ") + "yüz ";
  const t = Math.floor(r / 10), o = r % 10;
  if (t) s += tens[t] + " ";
  if (o) s += ones[o];
  return s.trim();
}
function trWords(n) {
  n = Math.floor(n);
  if (n === 0) return "Sıfır";
  let parts = [];
  const b = Math.floor(n / 1e9); n %= 1e9;
  const m = Math.floor(n / 1e6); n %= 1e6;
  const k = Math.floor(n / 1000); n %= 1000;
  if (b) parts.push((b === 1 ? "" : below1000(b) + " ") + "milyar");
  if (m) parts.push((m === 1 ? "" : below1000(m) + " ") + "milyon");
  if (k) parts.push((k === 1 ? "" : below1000(k) + " ") + "bin");
  if (n) parts.push(below1000(n));
  const w = parts.join(" ").trim();
  return w.charAt(0).toUpperCase() + w.slice(1);
}

const FONT = "'Roboto Mono', monospace";
const GREEN = "#1fa02e";
const BORDER = "#d1d5db";
const TEXT = "#4b5563";
const BOLD = "#1f2937";
const MUTE = "#6b7280";

const boxBorder = { border: `1px solid ${BORDER}`, borderRadius: 20, padding: 20 };
const labelWidth = { display: 'inline-block', width: 185 };
const colonWidth = { display: 'inline-block', width: 25, textAlign: 'center' };
const infoRow = { fontSize: 15, lineHeight: 1.5, color: TEXT };

function Row({ label, children }) {
  return (
    <div style={infoRow}>
      {label !== undefined && <span style={labelWidth}>{label}</span>}
      {label !== undefined && <span style={colonWidth}>:</span>}
      {children}
    </div>
  );
}

const DekontReceipt = forwardRef(function DekontReceipt({ data, account }, ref) {
  const dt = new Date(data.created_date);
  const dateStr = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dt);
  const refNo = (data.id || '').replace(/-/g, '').slice(-10) || '0000000000';
  const accIban = (account?.iban || '').replace(/\s/g, '');
  const accLast = accIban.slice(-10) || '0000000000';
  const accNo = `${accLast.slice(0, 4)}/${accLast.slice(4)}`;
  const recipientIban = (data.iban || '').replace(/\s/g, '');
  const amountWords = trWords(data.amount);
  const serial = new Date(data.created_date).toISOString().replace(/[-:T]/g, '.').split('.')[0] + '.' + String(Date.now()).slice(-6);
  const recipientName = (data.recipient_name || '').toUpperCase();

  return (
    <div ref={ref} style={{ width: 900, margin: '0 auto', background: '#fff', padding: 50, minHeight: 1200, position: 'relative', fontFamily: FONT, color: '#333', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <div style={{ width: '20%' }}>
          <img src="https://media.base44.com/images/public/6a694296a06f82dc8d145685/d0bdd6f20_generated_image.png" alt="Garanti BBVA Logo" style={{ width: '100%' }} crossOrigin="anonymous" />
        </div>
        <div style={{ backgroundColor: GREEN, borderRadius: 25, padding: '15px 40px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '78%' }}>
          <div style={{ fontSize: 32, fontWeight: 600 }}>Dekont</div>
          <div style={{ fontSize: 9, textAlign: 'right', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>T. Garanti Bankası A.Ş.</div>
            <div>Genel Müdürlük: Nispetiye Mah. Aytar Cad. No:2, Beşiktaş, Levent, 34340, İstanbul</div>
            <div>Büyük Mükellefler Vergi Dairesi Başkanlığı Vergi No: 8790017566</div>
            <div>Mersis Numarası: 0879 0017 5660 0379</div>
            <div>www.garantibbva.com.tr</div>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 32, letterSpacing: '0.2em', color: MUTE }}>
        HESAPTAN FAST
      </div>

      {/* First Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={boxBorder}>
          <Row label="ŞUBE ADI">{account?.name || 'MERKEZ'}</Row>
          <Row label="MÜŞTERİ NUMARASI">774510456</Row>
          <Row label="HESAP NUMARASI">{accNo}</Row>
          <Row label="İŞLEM TARİHİ">{dateStr}</Row>
          <Row label="TC KİMLİK NO">-</Row>
          <div style={{ ...infoRow, marginBottom: 32 }}><Row label="İŞLEM YERİ">MOBİL</Row></div>
          <div style={infoRow}>DÜZENLENME TARİHİ: {dateStr}</div>
          <div style={infoRow}>IBAN:{accIban}</div>
        </div>
        <div style={boxBorder}>
          <div style={infoRow}>SAYIN</div>
          <div style={{ ...infoRow, fontWeight: 700, color: BOLD }}>{recipientName}</div>
          
        </div>
      </div>

      {/* Second Row */}
      <div style={{ ...boxBorder, marginBottom: 24, minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Row label="FAST REF NO">{refNo}</Row>
          <Row label="ALACAKLI">{recipientName}</Row>
          <Row label="ALACAKLI IBAN">{recipientIban}</Row>
          <Row label="KOMİSYON HESABI">{accNo} IBAN:{accIban}</Row>
          <Row label="MASRAF">7,97 TL BSMV : 0,40 TL</Row>
          <Row label="KOMİSYON TOPLAMI">8,37 TL</Row>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={infoRow}>YALNIZ {amountWords}TL.</div>
        </div>
      </div>

      {/* Third Row */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ ...boxBorder, flexGrow: 1 }}>
          <div style={infoRow}><span>SIRA NO : {serial}</span></div>
        </div>
        <div style={{ ...boxBorder, width: 350 }}>
          <div style={{ ...infoRow, display: 'flex', justifyContent: 'space-between' }}>
            <span>TUTAR :</span>
            <span>- {formatNumber(data.amount)} TL</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: 12, fontWeight: 700 }}>1/1</div>
    </div>
  );
});

export default DekontReceipt;