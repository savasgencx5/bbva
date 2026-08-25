import { Delete } from 'lucide-react';

export default function PinKeypad({ value, onChange, length = 6 }) {
  const press = (d) => {
    if (value.length >= length) return;
    onChange(value + d);
  };
  const del = () => {
    onChange(value.slice(0, -1));
  };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className="h-14 rounded-xl bg-white/5 active:bg-white/15 text-white text-2xl font-medium flex items-center justify-center transition-colors"
          >
            {k}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press('0')}
          className="h-14 rounded-xl bg-white/5 active:bg-white/15 text-white text-2xl font-medium flex items-center justify-center transition-colors"
        >
          0
        </button>
        <button
          type="button"
          onClick={del}
          disabled={value.length === 0}
          className="h-14 rounded-xl bg-white/5 active:bg-white/15 text-white flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}