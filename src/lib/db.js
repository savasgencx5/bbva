// Tek veri erişim noktası.
// Veriler telefonun kendi hafızasında (localStorage) tutulur:
// uygulamayı kapatıp açsan da işlemler silinmez, sunucuya ihtiyaç yoktur.
import { localEntities } from '@/lib/localStore';

export const db = localEntities;
export const isStandalone = true;