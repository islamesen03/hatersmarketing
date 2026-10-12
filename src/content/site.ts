/**
 * İşletme bilgileri, gezinme ve ortak CTA metinleri için tek kaynak.
 *
 * KURAL: `null` = henüz doğrulanmadı. Doğrulanmayan bilgi sitede GÖSTERİLMEZ
 * ve yapılandırılmış veriye (JSON-LD) EKLENMEZ. Tahmini numara, adres, e-posta,
 * sosyal medya hesabı yazmayın. Açık maddeler: CONTENT_TO_CONFIRM.md
 */

export type NavItem = { label: string; href: string };

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const site = {
  name: "Haters Marketing",
  /** Ticaret unvanı — ONAY BEKLİYOR (KVKK metinlerinde "veri sorumlusu" olarak geçer). */
  legalName: null as string | null,
  url: siteUrl,
  /** Lansman onayı verilene kadar arama motorları dışarıda tutulur. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  locale: "tr_TR",
  tagline: "Beğeni değil. İş sonucu.",
  description:
    "Haters Marketing; strateji, reklam kreatifi ve Meta reklam yönetimini ölçülebilir iş sonuçlarına bağlayan bir pazarlama ajansı. Duymak istediğini değil, duyman gerekeni konuşuruz.",

  contact: {
    /** ONAY BEKLİYOR */
    email: null as string | null,
    /** ONAY BEKLİYOR — +90 ile başlayan, doğrulanmış numara */
    phone: null as string | null,
    /** Yalnızca doğrulanmış WhatsApp Business numarası, örn. "905XXXXXXXXX" (ONAY BEKLİYOR) */
    whatsapp: null as string | null,
    /** ONAY BEKLİYOR — fiziksel ofis yoksa null kalmalı */
    address: null as string | null,
    /** Randevu bağlantısı (Calendly, Cal.com vb.) — ONAY BEKLİYOR */
    calendarUrl: null as string | null,
  },

  /** Yalnızca doğrulanmış hesaplar. Örn. { label: "Instagram", href: "https://instagram.com/..." } */
  social: [] as NavItem[],

  /** KVKK aydınlatma metni için gerekli bilgiler — hepsi ONAY BEKLİYOR */
  kvkk: {
    dataController: null as string | null,
    mersisNo: null as string | null,
    applicationEmail: null as string | null,
    kepAddress: null as string | null,
    lastUpdated: null as string | null,
  },
};

export const mainNav: NavItem[] = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Yaklaşımımız", href: "/yaklasimimiz" },
  { label: "İşlerimiz", href: "/islerimiz" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
];

export const legalNav: NavItem[] = [
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
  { label: "KVKK Aydınlatma Metni", href: "/kvkk-aydinlatma-metni" },
];

export const cta = {
  primary: { label: "Projeni konuşalım", href: "/iletisim" },
  brief: { label: "Markanı anlat", href: "/iletisim#brif" },
  sendBrief: { label: "Brif gönder", href: "/iletisim#brif" },
};

/** Doğrulanmış bir iletişim kanalı var mı? (Yoksa form tek kanal olarak sunulur.) */
export function hasDirectContact() {
  const { email, phone, whatsapp, calendarUrl } = site.contact;
  return Boolean(email || phone || whatsapp || calendarUrl);
}
