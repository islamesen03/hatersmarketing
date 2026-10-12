# Yayından önce onaylanması gerekenler

Kural: doğrulanmayan bilgi sitede gösterilmiyor, uydurulmuyor. Değerler `src/content/site.ts` içinde `null` duruyor; doldurulduğunda site otomatik gösterir.

## A. Lansmanı engelleyenler

| # | Konu | Nerede | Not |
| --- | --- | --- | --- |
| 1 | **Form teslim kanalı** (webhook/CRM veya Resend e-posta) | `.env` → `LEAD_WEBHOOK_URL` veya `RESEND_API_KEY` + `LEAD_EMAIL_TO` + `LEAD_EMAIL_FROM` | Yapılandırılmadan form dürüstçe "gönderilmedi" der. |
| 2 | **Alan adı** | `.env` → `NEXT_PUBLIC_SITE_URL` | Canonical, sitemap, OG, JSON-LD. |
| 3 | **Ticaret unvanı ve adresi** (KVKK veri sorumlusu) | `site.legalName`, `site.kvkk.dataController` | Yasal metinlerde "[Onaylanacak]" olarak görünür. |
| 4 | **KVKK başvuru e-postası / KEP, MERSİS no** | `site.kvkk.*` | |
| 5 | **Yasal metinlerin hukuki incelemesi** | `/kvkk-aydinlatma-metni`, `/gizlilik-politikasi`, `/cerez-politikasi` | Taslaktır; tek başına uyumluluk sağlamaz. Saklama süresi, kullanılan sağlayıcılar, yurt dışı aktarım dayanağı belirlenmeli. Hukuki inceleme sonrası "Taslak metin" kutusu `LegalDocument.tsx`'ten kaldırılır. |
| 6 | **Arama motoru açılışı** | `.env` → `NEXT_PUBLIC_ALLOW_INDEXING=true` | 1–5 tamamlanınca. |

## B. İşletme bilgileri (yoksa gösterilmez)

- İletişim e-postası, telefon (+90…), doğrulanmış **WhatsApp Business** numarası, randevu bağlantısı → `site.contact`
- Fiziksel ofis/şehir (yoksa boş kalmalı; "İstanbul" vb. eklenmedi) → `site.contact.address`
- Sosyal medya hesapları (afişlerde "DM açık" geçiyor ama hesap adı verilmedi) → `site.social`
- Ekip/kurucu bilgisi ve fotoğrafları (Hakkımızda'da ekip bölümü bu yüzden yok)
- Müşteri referansları, vaka çalışmaları, yayın izinleri (İşlerimiz şu an iskeleti ve konsept çalışmalarını gösteriyor)

## C. Hizmet ve ticari içerik

- **Hizmet listesi önerilen bir yapıdır.** 5 hizmet ve teslimat maddeleri (`src/content/services.ts`) onaylanmalı. Google Ads, video prodüksiyon, SEO, sosyal medya yönetimi bilinçli olarak eklenmedi.
- Hizmet sayfalarındaki "dürüst notlar"daki kapsam dışı ifadeleri (logo tasarımı, site geliştirme, operasyon/lojistik danışmanlığı) gerçek durumla karşılaştırın.
- Süreç taahhütleri: "haftalık karar notu", "değişiklikleri önceden yazılı paylaşma", "ön inceleme notu", "90 günlük yol haritası" — gerçekten verilecek teslimatlar mı?
- "Hizmet bedeli ve reklam bütçesi ayrı planlanır" ifadesi ajansın kendi afişlerinden alındı; doğruluğunu teyit edin.
- Formdaki **bütçe aralıkları** (25 bin / 75 bin / 200 bin ₺) örnektir → `src/lib/lead.ts` `budgetOptions`.
- JSON-LD'de hizmet bölgesi belirtilmedi; Türkiye geneli hizmet veriliyorsa `areaServed` eklenebilir.
- Ana sayfadaki "Örnek şablon" kartları (`sampleDocs`) temsilîdir, gerçek veri değildir; gerçek şablonlarınızla değiştirmek isteyebilirsiniz.

## D. Marka / görsel

- Afişlerdeki küçük harfli "haters marketing" imzası resmî logodan farklı. Afişler galeride kalsın mı, yoksa resmî logolu versiyonları mı üretilsin? (BRAND_AUDIT §5)
- Afişlerin ve fotoğrafların kullanım hakkı (üretim kaynağı, lisans) teyit edilmeli; sitede "kendi kampanya serimiz" olarak etiketli.
- Analitik kullanılacaksa sağlayıcı (GA4 hazır) ve `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
