# Haters Marketing — web sitesi

Türkçe, marka kılavuzuna bağlı, lansmana hazır ajans sitesi. Next.js 16.4 (App Router, Cache Components), TypeScript, Tailwind CSS v4, `next/font` (Anton + Inter), `next/image`.

İlgili belgeler: [BRAND_AUDIT.md](BRAND_AUDIT.md) · [CONTENT_TO_CONFIRM.md](CONTENT_TO_CONFIRM.md) · [SITE_PLAN.md](SITE_PLAN.md)

## Kurulum

Gereksinim: Node.js 20.9+ (geliştirmede 24 LTS kullanıldı).

```bash
npm install
```

```bash
npm run dev
```

http://localhost:3000 adresinde açılır.

| Komut | İş |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Production build ve sunucu |
| `npm run lint` | ESLint (`src`, `scripts`) |
| `npm run typecheck` | TypeScript |
| `npm test` | Form doğrulama birim testleri (Node test runner) |
| `npm run images` | Referans afişlerden web görsellerini yeniden üretir |
| `npm run brand:sync` | Brand kit'ten SVG/favicon/OG dosyalarını `public/`'e kopyalar |
| `npm run test:e2e` | Tarayıcı testleri (Playwright): kaydırma sahneleri, başlık girişleri, azaltılmış hareket, erişilebilirlik. Önce `npm run build` |
| `npm run motion:verify` | Hareket katmanlarını (alfa, boyut, ağırlık) doğrular ve durağan kompozitleri üretir |
| `npm run motion:evidence` | Sahnelerin ilerleme adımlarında ekran görüntülerini alır (çalışan bir production sunucusu gerekir) |

## Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın (barındırmada panelden girin). Anahtarları repoya eklemeyin.

| Değişken | Gerekli mi | Açıklama |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Lansmanda evet | Canonical, sitemap, OG, JSON-LD |
| `NEXT_PUBLIC_ALLOW_INDEXING` | — | `true` olana kadar robots.txt ve meta robots aramayı kapatır |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | Biri şart | Formu JSON olarak CRM/otomasyon webhook'una gönderir |
| `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | Biri şart | Formu Resend ile e-posta olarak gönderir |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Hayır | GA4; yalnızca çerez onayından sonra yüklenir |

### Form nasıl çalışır?

`POST /api/lead` → aynı kaynak kontrolü → JSON ve boyut kontrolü → bal küpü alanı → doldurma süresi kontrolü → IP başına istek sınırı (10 dakikada 5) → sunucu tarafı doğrulama (`src/lib/lead.ts`, istemciyle ortak) → yapılandırılmış kanallara teslim (`src/lib/lead-delivery.ts`).

- Hiçbir kanal tanımlı değilse **503** döner ve form "mesajın gönderilmedi" der. Sahte başarı yoktur.
- En az bir kanal kabul ederse **200** ve başarı ekranı.
- Sunucuda kişisel veri saklanmaz; hata loglarına form içeriği yazılmaz.
- Webhook gövdesi: `{ type: "lead", source: "website", submittedAt, lead: { name, company, email, phone, website, services[], brief, budget, kvkk } }`

**Form koruması:** İstek sınırlayıcı bellek içidir ve tek sunucu örneğini korur. Serverless/çok örnekli barındırmada platform güvenlik duvarı kuralı veya paylaşımlı bir depo (ör. Upstash Redis) ekleyin.

## İçerik nerede?

Tüm metin ve iş bilgisi `src/content/` altında, tek kaynaktan yönetilir:

- `site.ts` — iletişim, sosyal medya, KVKK bilgileri (`null` = doğrulanmadı → gösterilmez), menüler, CTA'lar
- `services.ts` — hizmetler (sayfa, menü, sitemap ve form seçenekleri buradan üretilir)
- `home.ts`, `approach.ts`, `gallery.ts`, `images.ts`

## Proje yapısı

```
src/app/            rotalar (Türkçe slug'lar), sitemap.ts, robots.ts, not-found.tsx, api/lead
src/components/     arayüz bileşenleri (home/, consent/)
src/content/        içerik ve iş bilgileri
src/lib/            seo, form doğrulama/teslimat, rate limit, onay, analitik
public/brand/       brand kit'ten orijinal adlarıyla kopyalanan SVG, favicon, sosyal medya, renkler
public/images/      afiş ve nesne görsel türevleri (scripts/prepare-images.mjs); motion/ altında sahne katmanları
assets/motion-src/  sahne katmanlarının manifestosu (artboard, ofset, pivot, notlar)
scripts/            görsel ve marka varlığı senkron script'leri; motion-layers/ katman çıkarma (Python, çevrimdışı)
src/lib/motion/     ilerleme tanımı, yetenek tespiti, koreografi, göz kırpma durum makinesi, sahne denetleyicisi
tests/              birim testleri
e2e/                tarayıcı testleri (Playwright)
docs/motion/        hareket spesifikasyonu, varlık manifestosu, teslim raporu ve kanıt görüntüleri
```

## Marka kuralları (kısa)

- Logo/wordmark yalnızca `public/brand` SVG'leri ile, zemine göre `on-dark` / `on-light` / `on-red`. Dönüştürme, renklendirme, efekt yok. Header'da wordmark (≥72 px), footer'da tam logo (≥120 px), çevresinde H genişliği kadar boşluk.
- Renkler yalnızca `#0C0C0C`, `#F1EDE4`, `#E8432D`. Krem yerine beyaz yok. Kırmızı zeminde küçük metin siyah. Kremde küçük kırmızı metin gerekiyorsa `text-red-ink`.
- Anton: büyük harf başlık, sonunda nokta. Inter: geri kalan her şey.

## SEO, erişilebilirlik, performans

- Her rotada benzersiz Türkçe başlık/açıklama, tek H1, canonical, OG/Twitter kartı (brand kit OG görseli), favicon + webmanifest.
- JSON-LD: `Organization` (yalnızca doğrulanmış alanlar), `Service`, `FAQPage`, `BreadcrumbList`.
- `lang="tr"`, içeriğe geç bağlantısı, görünür odak halkası, klavye ile kullanılabilir mobil menü (Escape, odak tuzağı), header'da "Hizmetler" açılır menüsü (`aria-expanded`/`aria-controls`, Escape ve dışarı tıklama ile kapanır, odak dışına çıkınca kapanır; mobil menüde iç içe hizmet listesi), `<details>` tabanlı SSS, erişilebilir form hataları (özet + alan bazlı, `aria-invalid`/`aria-describedby`), dokunma hedefleri ≥44 px.
- Hareket: açılışta maskeli başlık animasyonu, saf CSS kaydırma animasyonları (`animation-timeline: view()`), `prefers-reduced-motion` ile kapanır; scroll-jacking ve preloader yok.
- Kaydırma sahneleri (kalp ve kutu, baykuş, kartlar, piyonlar) ve yönlü başlık girişleri: sunucuda durağan görsel, istemcide `ViewTimeline` (yoksa paylaşılan kaydırma sürücüsü) ile Web Animations. Ayrıntılar: [docs/motion/MOTION_SPEC.md](docs/motion/MOTION_SPEC.md), katmanlar: [docs/motion/ASSET_MANIFEST.md](docs/motion/ASSET_MANIFEST.md), teslim raporu: [docs/motion/REPORT.md](docs/motion/REPORT.md).
- Tüm sayfalar statik üretilir; görseller AVIF/WebP, lazy-load.

## Dağıtım

Node.js destekleyen herhangi bir platform (Vercel, Netlify, kendi sunucunuz). Cache Components, Node.js runtime gerektirir.

1. Ortam değişkenlerini girin (form kanalı + `NEXT_PUBLIC_SITE_URL`).
2. `npm run build`, ardından `npm start` (veya platformun build adımı).
3. HTTPS ve HSTS'i barındırma/CDN katmanında açın.
4. CONTENT_TO_CONFIRM.md'deki A bölümü tamamlanınca `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## Windows notları

- Proje yolu Türkçe karakter içeriyor (`C:\Users\İSLAM\...`). ESLint'in varsayılan `node_modules` yoksayması bu yolda çalışmadığı için `eslint.config.mjs`'e açıkça eklendi.
- PowerShell 5.1'de `Set-Content -Encoding utf8` dosyaya BOM ekler; `package.json` gibi JSON dosyalarını bu yolla yazmayın (Next.js okuyamaz).
