// Sunucuya taşındığında hiçbir dış servise ihtiyaç duymayan yerel veri katmanı.
// Başlangıç verileri proje içindeki /data.json dosyasından okunur;
// kullanıcının yaptığı işlemler o tarayıcıda (localStorage) saklanır.

const KEY = (name) => `local_db_${name}`;
const NAMES = ['Account', 'Profile', 'Transaction'];

let seedPromise = null;

const has = (name) => {
  try { return localStorage.getItem(KEY(name)) !== null; } catch { return false; }
};

// data.json değiştiğinde (imzası farklıysa) veriler dosyadan yeniden yüklenir,
// yani dosyadaki düzenleme uygulamaya anında yansır.
const SIG_KEY = 'local_db_seed_sig';

const ensureSeeded = () => {
  if (!seedPromise) {
    seedPromise = fetch('/data.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((file) => {
        if (!file) return;
        const sig = JSON.stringify(file);
        let storedSig = null;
        try { storedSig = localStorage.getItem(SIG_KEY); } catch {}
        const fileChanged = storedSig !== sig;
        NAMES.forEach((name) => {
          if (fileChanged || !has(name)) write(name, file[name] || []);
        });
        try {
          if (fileChanged) ['cache_account', 'cache_profile', 'cache_transactions'].forEach((k) => localStorage.removeItem(k));
          localStorage.setItem(SIG_KEY, sig);
        } catch {}
      });
  }
  return seedPromise;
};

const read = (name) => {
  try {
    const raw = localStorage.getItem(KEY(name));
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const write = (name, rows) => {
  try { localStorage.setItem(KEY(name), JSON.stringify(rows)); } catch {}
};

const sortRows = (rows, sort) => {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (desc ? -1 : 1);
  });
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const entity = (name) => ({
  async list(sort, limit) {
    await ensureSeeded();
    const rows = sortRows(read(name), sort);
    return limit ? rows.slice(0, limit) : rows;
  },
  async filter(query = {}, sort, limit) {
    await ensureSeeded();
    const rows = sortRows(read(name), sort).filter((r) =>
      Object.entries(query).every(([k, v]) => r[k] === v)
    );
    return limit ? rows.slice(0, limit) : rows;
  },
  async get(id) {
    await ensureSeeded();
    return read(name).find((r) => r.id === id) || null;
  },
  async create(data) {
    await ensureSeeded();
    const now = new Date().toISOString();
    const row = { id: newId(), created_date: now, updated_date: now, ...data };
    write(name, [row, ...read(name)]);
    return row;
  },
  async update(id, data) {
    await ensureSeeded();
    let updated = null;
    const next = read(name).map((r) => {
      if (r.id !== id) return r;
      updated = { ...r, ...data, updated_date: new Date().toISOString() };
      return updated;
    });
    write(name, next);
    return updated;
  },
  async delete(id) {
    await ensureSeeded();
    write(name, read(name).filter((r) => r.id !== id));
  },
});

export const localEntities = {
  Account: entity('Account'),
  Profile: entity('Profile'),
  Transaction: entity('Transaction'),
};