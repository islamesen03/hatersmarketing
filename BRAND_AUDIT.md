# HATERS MARKETING — Brand Audit

Tarih: 13 Ekim 2026 · Kaynaklar fiilen açılıp incelendi (aşağıda). Marka kılavuzu ile referans görseller çeliştiğinde **kılavuz geçerlidir**.

## 1. İncelenen kaynaklar

| Kaynak | Konum | Not |
| --- | --- | --- |
| Brand kit v1.0 (Ekim 2026) | `Desktop/haters-marketing-brandkit/` (ZIP değil, açılmış klasör olarak verildi) | 01–07 klasörleri, README.txt |
| Marka kılavuzu (9 sayfa) | `haters-marketing_brand-guide.pdf` | Metni pdfjs ile çıkarıldı; sayfa görüntüsü üretilemedi (poppler yok) |
| Renkler | `07-colors/colors.json`, `colors.css` | 3 renk |
| Logo SVG'leri | `01-logo/svg`, `02-wordmark/svg`, `03-icon/*/svg` | Harfler vektöre çevrilmiş, font gerektirmez |
| Favicon seti + head snippet | `04-favicon/` | `site.webmanifest`, `paste-into-website-head.html` |
| Sosyal medya / OG | `06-social-media/` | `link-preview-og-image_dark_1200x630.png` OG olarak kullanıldı |
| Referans afişler | `Desktop/haters marketing/` | **40 PNG** (1122×1402). Prompt "18 JPEG / 9 çift" diyordu; gerçekte 40 farklı adlı afiş var. Hepsi incelendi. |

## 2. Doğrulanmış marka kuralları (kılavuzdan)

- **İsim fikri (s.2):** "Ters" = baş aşağı/tersine/aksi. Logoda "HA" dik; "TERS" kırmızı etiket üzerinde dikey çevrilmiş, harfler okuma sırasında; "MARKETING" logonun tam genişliğine yayılır. Ajans "markalara duymak istediklerinin tersini söyler".
- **Versiyonlar (s.3):** Logo (öncelikli), Wordmark ("web sitesi header'ı gibi alçak, geniş alanlar için"), Icon (kare/yuvarlak alanlar, favicon).
- **Zemine göre seçim (s.4):** on-dark (siyah/koyu), on-light (krem/açık), on-red (yalnızca marka kırmızısı), mono-black (tek renk baskı), mono-white (bize ait olmayan renk/fotoğraf). **Asla yeniden renklendirme yok.**
- **Boşluk (s.5):** Logonun çevresinde H harfi genişliği kadar boşluk. Minimum: logo 120 px, wordmark 72 px, ikon 32 px (16 px'te sade favicon).
- **Renk (s.6):** Siyah `#0C0C0C` (zemin ve metin, layout'un çoğu), Krem `#F1EDE4` (zemin ve metin, **asla saf beyaz değil**), Kırmızı `#E8432D` ("etiket, bir başlık satırı, bir buton — her şey kırmızıysa hiçbir şey kırmızı değildir"). Kontrast: krem/siyah 16.7:1; kırmızı/siyah 4.9:1 (başlıklar); krem/kırmızı 3.4:1 **yalnızca büyük metin**; kırmızı zeminde küçük metin siyah.
- **Tipografi (s.7):** Anton — başlıklar, her zaman büyük harf, sıkı satır aralığı, sonunda nokta. Inter — diğer her şey; Regular okuma, Semi Bold vurgu. **Başlık kalıbı:** düz cümle siyah/krem, rahatsız eden kısım kırmızı ("BEĞENİ GELDİ. / SİPARİŞ?").
- **Yanlış kullanım (s.8):** TERS'i düzeltme, etiket rengini değiştirme, esnetme, döndürme, gölge/parlama/kontur ekleme, etiketin kaybolduğu zemine koyma.

## 3. Sitede uygulanışı

| Kural | Uygulama |
| --- | --- |
| Header'da wordmark | `SiteHeader` → `haters-marketing_wordmark_on-dark.svg`, 112 px (≥72 px). 72 px bar yüksekliği ≈16 px H-boşluğunu korur. |
| Footer'da tam logo | `on-dark`, 200 px, H-genişliği kadar padding (`Logo clearSpace`). |
| Zemine göre varyant | Hakkımızda: siyah→on-dark, krem→on-light, kırmızı→on-red. |
| Logo dönüşümü yok | `Logo` bileşeni yalnızca orijinal SVG'yi `<img>` olarak basar; CSS dönüşümü/filtre yok. Scroll efektleri logoya uygulanmaz. |
| Renk token'ları | `globals.css` → Tailwind teması **yalnızca** ink/cream/red (+ erişilebilirlik için `red-ink #B5301C`, sadece kremde küçük kırmızı metin, 5.3:1). Varsayılan Tailwind paleti kapatıldı. |
| Kırmızı ölçülü | Her bölümde tek kırmızı başlık satırı + tek buton; tam kırmızı zemin yalnızca kapanış CTA'larında. |
| Buton metni | Kırmızı butonda **siyah** metin (küçük metin kuralı). Afişlerdeki krem-üstü-kırmızı buton metni bu yüzden uygulanmadı. |
| Fontlar | `next/font/google`: Anton 400 + Inter, `latin` + `latin-ext` alt kümeleri (İ ı Ş ş Ğ ğ latin-ext'te). Self-host, FOUT'suz. |
| Favicon / manifest | `04-favicon` dosyaları site köküne kopyalandı; head snippet `metadata.icons` + `manifest` ile birebir uygulandı; `theme-color #0C0C0C`. |
| OG görseli | `06-social-media/link-preview-og-image_dark_1200x630.png`. |

## 4. Referans afişlerden çıkan görsel dil

**Ortak gramer:** Dev Anton başlık (2–3 satır, nokta ile biter) · tek bir fiziksel nesne fotoğrafı (stüdyo ışığı, krem/siyah/kırmızı set) · çoğunlukla krem veya siyah zemin, nadiren tam kırmızı · küçük Inter alt metin · köşede küçük imza + "NN / KONU" etiketi · bol boşluk · süs yok.

**Tekrarlayan motifler ve sitedeki karşılıkları**

| Afiş | Fikir | Sitede |
| --- | --- | --- |
| Beğeni geldi. Sipariş? (kalp balon + boş kutu) | Vanity metrik ≠ satış | Teşhis 01 görseli; hero mesajı "Beğeni değil. İş sonucu." |
| Aynı görsel. Yeni beklenti. (kart destesi) | Kreatif tekrarı | Teşhis 02, Kreatif hizmet görseli |
| Algoritmayı suçlamadan önce. (baykuş, kırmızı) | Önce temele bak | Teşhis 03 (tek tam kırmızı fotoğraf) |
| Bir yerde takılıyor. (kırmızı düğüm) | Dönüşüm darboğazı | Hero nesnesi |
| Rakibini kopyaladın. (piyonlar) | Farklılaşma | Strateji hizmet görseli |
| Yeni ajans. Aynı belirsizlik? (defterler) | Ajans değiştirme | Meta reklam yönetimi görseli |
| Bütçeyi artırdık. Sorun da büyüdü. (musluk) | Kaçağı bul | Performans/dönüşüm görseli |
| Satın almak istiyordum. (labirent) | Sepet sürtünmesi | E-ticaret görseli |
| Bu kez baştan konuşalım. (defter + kalem) | Önce strateji | Yaklaşımımız hero görseli |
| Biraz rahatsız olalım. | Konforlu olmayan netlik | İletişim sayfası H1 |
| Herkese hitap etmiyoruz. | Seçici duruş | Hakkımızda kapanışı, SSS |
| Önce soru, sonra tasarım (01/02/03 sorular) | Üç soru | Yaklaşımımız "Üç soru" bölümü |
| Rapor geldi, cevap gelmedi / Bu rapor çok şey saklıyor | Şeffaf raporlama | "Haftalık karar notu" örnek şablonu |

Ayrıca incelenen ve galeriye/tona katkı veren diğer afişler: Daha çok harcamadan önce, Hemen dönüyoruz (kum saati), Her şeyi anlattık (megafon), Toplantıda çok gülmüştük (baykuş), İçerik takvimin dolu (2 versiyon), İlk cümlede kaybettik (perde), İndirim bitti, Herkes kaliteli (büyüteç), Para gidiyor nereye, Mesaj var uygun müşteri?, Bizim dilimiz, Biz buna alıştık, Müşterin senin kadar bilmiyor, Reklam kapıyı çalar, Yorumu sildik, Her trendin peşinden koşma, Başlayalım ama neyle?, Tek paket her işe uymaz, Ürünün satıyor, Bize bir sorun getir, Aynı ürün daha net bir neden, Fikir biraz nefes alsın, Logoyu büyüttük peki ya fikri?, İşinin başına dön.

## 5. Çatışmalar ve kararlar

1. **Afişlerdeki imza resmî logo değil.** Afişlerin köşesinde küçük harfli "haters / marketing" yazısı var; brand kit'teki resmî logo "HA + ters çevrilmiş TERS etiketi". **Karar:** Site kimliği yalnızca resmî SVG'leri kullanır. Afişler, ajansın kendi sosyal medya serisi olarak, olduğu gibi (imzasıyla) "Konsept çalışması — müşteri projesi değildir" etiketiyle gösterilir. → Bu imzanın güncellenip güncellenmeyeceği CONTENT_TO_CONFIRM'de.
2. **Afiş butonları krem metin + kırmızı zemin** (küçük metin). Kılavuz kontrast kuralı gereği sitede kırmızı butonda siyah metin.
3. **Gri zeminli afiş** ("Dolu takvim, boş içerik-5"): marka paletinde gri yok; kullanılmadı. Aynı konseptin siyah versiyonu mevcut.
4. **Kopyalar:** "İçerik takvimin dolu" iki versiyon (gri/siyah) → tek konsept. Prompt'taki "9 çift" yapısı mevcut dosyalarla örtüşmüyor; her afiş konsept bazında değerlendirildi.
5. **Krem zeminde küçük kırmızı metin** kılavuza göre okunaklı değil (3.4:1) → yalnızca bu durum için `#B5301C` erişilebilir kırmızı mürekkep tanımlandı; marka rengi olarak kullanılmaz.

## 6. Görsel türevleri

`scripts/prepare-images.mjs` (sharp):
- `public/images/posters/*.jpg` — 10 seçili afiş, PNG 1.5 MB → JPEG 80–250 KB. Next/Image AVIF/WebP'ye çevirir.
- `public/images/objects/*.jpg` — 10 afişten metinsiz nesne kırpımı. Kırpım kenarına denk gelen afiş yazısı parçaları, aynı zeminden örneklenen düz renk yamasıyla örtüldü (kalp-kutu, baykuş, defter-kalem). Tüm kırpımlar görsel olarak kontrol edildi.
- Orijinal 40 PNG repoya kopyalanmadı (kaynak klasörde duruyor).
- Her görsel için Türkçe, içerik betimleyen `alt` metni `src/content/images.ts` ve `gallery.ts` içinde.
