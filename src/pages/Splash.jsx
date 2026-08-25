import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 bg-[#F8F8FA] flex items-center justify-center overflow-hidden">
      <img
        src="https://media.base44.com/images/public/6a694296a06f82dc8d145685/dca0427fc_WhatsAppImage2026-06-21at153915.jpg"
        alt="Garanti BBVA"
        className="w-full h-full object-cover"
      />
    </div>
  );
}