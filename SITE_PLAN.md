# Site planı

## Site haritası

| Rota | H1 | SEO hedefi |
| --- | --- | --- |
| `/` | BEĞENİ DEĞİL. İŞ SONUCU. | reklam ajansı, Meta reklam yönetimi, kreatif ajans |
| `/hizmetler` | AZ İŞ. NET İŞ. | dijital pazarlama hizmetleri |
| `/hizmetler/strateji-ve-marka-konumlandirma` | HERKESE DEĞİL. DOĞRU KİŞİYE. | marka konumlandırma, dijital pazarlama stratejisi |
| `/hizmetler/kreatif-konsept-ve-reklam-tasarimi` | GÜZEL OLMASI YETMEZ. | reklam kreatifi, reklam tasarımı |
| `/hizmetler/meta-reklam-yonetimi` | HARCAMA VAR. PEKİ, PLAN? | Meta reklam yönetimi, Facebook/Instagram reklamları |
| `/hizmetler/performans-analizi-ve-donusum-optimizasyonu` | BİR YERDE TAKILIYOR. | dönüşüm optimizasyonu, performans analizi |
| `/hizmetler/e-ticaret-buyume-danismanligi` | ÜRÜNÜN SATIYOR. REKLAMIN NE YAPIYOR? | e-ticaret büyüme danışmanlığı |
| `/yaklasimimiz` | ÖNCE SORU. SONRA REKLAM. | çalışma yöntemi, reklam hesabı ön inceleme |
| `/islerimiz` | GÖSTERİŞE DEĞİL. ETKİYE BAK. | — |
| `/hakkimizda` | ADIMIZ TERS. İŞİMİZ NET. | — |
| `/iletisim` | BİRAZ RAHATSIZ OLALIM. | — |
| `/gizlilik-politikasi`, `/cerez-politikasi`, `/kvkk-aydinlatma-metni` | Belge adı | — |
| 404 | BU SAYFA TERS GİTTİ. | noindex |

## Dönüşüm yolculuğu

1. **Hero** → net konum + "Projeni konuşalım" (birincil) / "Nasıl çalıştığımızı gör" (ikincil).
2. **Manifesto → Teşhis**: tanıdık sorunları adlandırır, her birine ölçülebilir "sonraki adım" verir.
3. **Hizmetler** → hizmet sayfası → hizmete özel CTA (ör. "Reklam planını konuşalım").
4. **Yöntem / Örnek şablonlar** → güven: uydurma kanıt yerine somut süreç. (Kampanya afişleri yalnızca `/islerimiz` sayfasında; ana sayfadaki galeri bölümü 15 Ekim 2026'da kaldırıldı.)
5. **SSS** → ön satış itirazları (bütçe, garanti, süre, kanal).
6. **Kırmızı kapanış** → "Markanı anlat" → `/iletisim#brif`.
7. **Form** → yalnızca sunucu teslimatı onaylarsa başarı ekranı.

Sabit dönüşüm noktası: header'daki kırmızı "Projeni konuşalım" (mobilde "Konuşalım" + menü içinde tam genişlik CTA).

## Ana sayfa ritmi (zemin sırası)

Siyah hero → krem manifesto → siyah teşhis → krem hizmetler → krem yöntem → siyah örnek şablonlar → krem SSS → **kırmızı kapanış** → siyah footer.

## Bileşenler

`SiteHeader` + `HeaderNav` (masaüstünde "Hizmetler" altında beş hizmeti listeleyen açılır menü, mobil menüde iç içe liste), `EditorialHero`, `Manifesto`, `Diagnoses` (ProblemPanel), `ServicesList`, `ProcessSteps`, `ProcessDemo` (CaseStudyPreview yerine dürüst örnek teslimatlar), `FAQAccordion`, `CTASection`, `LeadForm`, `SiteFooter`, `CookieConsent` + `Analytics`, `PageHero`, `LegalDocument`, `InvertedLabelAccent` (logo değil), `Logo`, `Headline`, `JsonLd`.

## Analitik olayları (yalnızca onaydan sonra)

`cta_click` (konum etiketiyle), `lead_submit_success`, `lead_submit_error`, `service_view`, `contact_click`.
