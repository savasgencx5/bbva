import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/tesseract.js@v4.0.1/dist/tesseract.min.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Tesseract yüklenemedi'));
    document.body.appendChild(s);
  });
}

export default function IBANScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const scanningRef = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadTesseract();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        intervalRef.current = setInterval(scan, 1000);
      } catch (err) {
        setError('Kameraya erişilemedi: ' + (err.message || 'izin verilmedi'));
      }
    })();
    return () => { cancelled = true; cleanup(); };
  }, []);

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const scan = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || scanningRef.current) return;
    scanningRef.current = true;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const result = await window.Tesseract.recognize(canvas, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      });
      const text = (result.data.text || '').replace(/[\s\n\r]/g, '').toUpperCase();
      const match = text.match(/TR[0-9]{24}/);
      if (match) onDetect(match[0]);
    } catch (e) {
      // ignore OCR errors
    } finally {
      scanningRef.current = false;
    }
  };

  const stop = () => { cleanup(); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="relative flex-1">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-16 border-2 border-primary rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        </div>
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
          <button onClick={stop} className="text-white text-xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <span className="text-white font-medium">IBAN Tara</span>
          <div className="w-10" />
        </div>
        {error && <div className="absolute bottom-10 left-4 right-4 text-center text-red-400 text-sm">{error}</div>}
      </div>
    </div>
  );
}