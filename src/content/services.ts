import { objects } from "./images";
import type { Faq, Headline, Picture } from "./types";

/**
 * ÖNERİLEN hizmet mimarisi — onaylanmış bir katalog değildir (CONTENT_TO_CONFIRM.md).
 * Fiyat, süre, sonuç garantisi ya da doğrulanmamış kanal (Google Ads, video prodüksiyon,
 * SEO vb.) eklemeyin. Bir hizmeti kaldırmak için diziden silmeniz yeterli: sayfası,
 * menüsü, site haritası ve form seçeneği otomatik olarak güncellenir.
 */

export type Service = {
  slug: string;
  number: string;
  name: string;
  /** Hizmetler listesindeki tek satırlık, sonuç odaklı açıklama. */
  oneLiner: string;
  headline: Headline;
  intro: string;
  forWhom: string[];
  deliverables: { title: string; detail: string }[];
  honestNotes: string[];
  faqs: Faq[];
  cta: string;
  image: Picture;
  seo: { title: string; description: string };
};

export const services: Service[] = [
  {
    slug: "strateji-ve-marka-konumlandirma",
    number: "01",
    name: "Strateji ve Marka Konumlandırma",
    oneLiner:
      "Kime, neyi, neden söylediğini netleştirir; reklama geçmeden önce mesajın omurgasını kurarız.",
    headline: [{ text: "Herkese değil." }, { text: "Doğru kişiye.", accent: true }],
    intro:
      "Bir markanın en pahalı sorunu çoğu zaman bütçe değil, belirsizliktir. Hedef kitleni, rakip kalabalığını ve teklifini aynı masaya koyuyor; her kanalda tekrar edebileceğin net bir konum cümlesine indiriyoruz. Rakibini kopyalamak kolaydır. Sonra iki tane olursunuz.",
    forWhom: [
      "Rakiplerinden farkını tek cümlede anlatamayan markalar",
      "Yeni ürün, yeni pazar ya da yeniden konumlanma eşiğindeki işletmeler",
      "Reklama bütçe ayırmadan önce temeli sağlamlaştırmak isteyen ekipler",
    ],
    deliverables: [
      {
        title: "Hedef kitle ve satın alma motivasyonu haritası",
        detail: "Kim alıyor, neden alıyor, almadan önce neyden çekiniyor?",
      },
      {
        title: "Rakip mesaj analizi",
        detail: "Herkesin söylediği ve kimsenin söylemediği şeylerin listesi.",
      },
      {
        title: "Konumlandırma cümlesi ve mesaj hiyerarşisi",
        detail: "Ana vaat, destekleyici kanıtlar ve hangi mesajın nerede kullanılacağı.",
      },
      {
        title: "Teklif ve itiraz listesi",
        detail: "Müşterinin aklındaki 'ama'lara verilen net cevaplar.",
      },
      {
        title: "Kreatif ekip için brif şablonu",
        detail: "Kampanyalar strateji belgesinden kopmasın diye.",
      },
    ],
    honestNotes: [
      "Logo ya da görsel kimlik tasarımı bu hizmetin parçası olarak tanımlanmadı; ihtiyacın varsa ilk görüşmede konuşalım.",
      "Kapsam ve takvim, markanın bugünkü durumuna göre birlikte belirlenir.",
    ],
    faqs: [
      {
        q: "Zaten bir marka kılavuzumuz var. Yine de gerekir mi?",
        a: "Gerekmeyebilir. Kılavuz genelde nasıl göründüğünü anlatır; konumlandırma ise neden seçilmen gerektiğini. Mevcut belgeni birlikte okuyup eksik kalan yeri gösteririz.",
      },
      {
        q: "Bu çalışmanın sonunda elimizde ne olur?",
        a: "Ekibinin, ajansının ve reklamlarının aynı cümleyi kurmasını sağlayan yazılı bir konum ve mesaj belgesi.",
      },
    ],
    cta: "Konumunu konuşalım",
    image: objects.pawns,
    seo: {
      title: "Strateji ve Marka Konumlandırma",
      description:
        "Hedef kitle, rakip mesaj analizi ve net bir konum cümlesi. Reklama bütçe ayırmadan önce markanın neden seçilmesi gerektiğini netleştiren dijital pazarlama stratejisi.",
    },
  },
  {
    slug: "kreatif-konsept-ve-reklam-tasarimi",
    number: "02",
    name: "Kreatif Konsept ve Reklam Tasarımı",
    oneLiner:
      "Akışta durduran, tek bir fikri net anlatan ve test edilebilir varyasyonlarla üretilen reklam kreatifleri.",
    headline: [{ text: "Güzel olması" }, { text: "yetmez.", accent: true }],
    intro:
      "Bir gönderi, bir ana fikir. Her kreatifi bir hipotez gibi kuruyoruz: hangi mesaj, hangi görsel, hangi açılış cümlesi? Sonra varyasyonlar üretiyor ve hangisinin işe yaradığını tahminle değil, veriyle seçiyoruz. Aynı görseli yeni bir bütçeyle tekrar yayınlamak strateji değildir.",
    forWhom: [
      "Aylardır aynı kreatiflerle reklam veren markalar",
      "Çok şey anlatan ama akılda bir şey bırakmayan reklamlar için",
      "Kreatif üretimini test planına bağlamak isteyen ekipler",
    ],
    deliverables: [
      {
        title: "Kampanya konsepti ve ana fikir",
        detail: "Tek cümleye sığan, tekrar edilebilir bir fikir.",
      },
      {
        title: "Statik reklam tasarımları",
        detail: "Tekil görseller ve karusel kurguları, yerleşim formatlarına göre.",
      },
      {
        title: "Başlık ve metin varyasyonları",
        detail: "Açılış cümlesi, başlık ve çağrı metni için alternatifler.",
      },
      {
        title: "Kreatif test matrisi",
        detail: "Hangi değişkeni, neden ve hangi ölçütle test ettiğimizin kaydı.",
      },
    ],
    honestNotes: [
      "Video prodüksiyon ve çekim hizmetleri bu listede yer almıyor; kapsam onaylanırsa eklenecek.",
      "Kreatif performansı ürüne, teklife ve bütçeye bağlıdır. Garanti değil, düzenli test sunuyoruz.",
    ],
    faqs: [
      {
        q: "Kaç kreatif üretiyorsunuz?",
        a: "Sayıyı hedeften ve bütçeden geriye doğru hesaplıyoruz. Az sayıda iyi kurgulanmış varyasyon, çoğu zaman rastgele bir yığından daha çok şey öğretir.",
      },
      {
        q: "Kendi tasarım ekibimiz var. Birlikte çalışabilir miyiz?",
        a: "Evet, konsept ve test planını biz kurup üretimi ekibinle paylaşabiliriz. Kapsamı ilk görüşmede netleştiririz.",
      },
    ],
    cta: "Kreatifini konuşalım",
    image: objects.cards,
    seo: {
      title: "Kreatif Konsept ve Reklam Tasarımı",
      description:
        "Tek bir net fikre dayanan, test edilebilir varyasyonlarla üretilen reklam kreatifleri. Kreatif test matrisi, başlık ve metin varyasyonları, statik reklam tasarımı.",
    },
  },
  {
    slug: "meta-reklam-yonetimi",
    number: "03",
    name: "Meta Reklam Yönetimi",
    oneLiner:
      "Facebook ve Instagram reklamlarında kurulum, kreatif testleri, bütçe yönetimi ve açık raporlama.",
    headline: [{ text: "Harcama var." }, { text: "Peki, plan?", accent: true }],
    intro:
      "Kampanya kurmak işin en kolay kısmı. Zor olan; hangi hedefle, hangi teklifle, hangi kreatifle ve neyi ölçerek ilerlediğini bilmek. Hesap yapısını, ölçüm kurulumunu ve test planını netleştiriyor, kampanyaları haftalık karar notlarıyla yönetiyoruz. Raporun sonunda bir cevap olmalı: neyi denedik, ne öğrendik, sırada ne var?",
    forWhom: [
      "Meta reklamlarında düzenli bütçe harcayan aktif işletmeler",
      "Ajans değişikliği düşünen ve bu kez baştan konuşmak isteyen markalar",
      "Reklamı tek başına yönetmekten yorulan işletme sahipleri",
    ],
    deliverables: [
      {
        title: "Hesap ve ölçüm kontrolü",
        detail: "Piksel, Conversions API ve olay kurgusu doğru veriyi mi gönderiyor?",
      },
      {
        title: "Kampanya yapısı ve hedef kitle kurgusu",
        detail: "Bütçeyi bölen değil, öğrenmeyi hızlandıran bir yapı.",
      },
      {
        title: "Kreatif test planı ve düzenli optimizasyon",
        detail: "Neyi neden değiştirdiğimizin kayıt altında olduğu bir test takvimi.",
      },
      {
        title: "Haftalık karar notu",
        detail: "Neyi denedik? Ne öğrendik? Bir sonraki adım ne? Kısa ve okunur.",
      },
    ],
    honestNotes: [
      "Hizmet bedeli ve reklam bütçesi ayrı planlanır.",
      "Düzenli bir reklam bütçesi gerektirir; bütçe ve hedef ilk görüşmede birlikte konuşulur.",
      "Sonuç garantisi vermiyoruz. Neyi test ettiğimizi ve neden değiştirdiğimizi açıkça raporluyoruz.",
    ],
    faqs: [
      {
        q: "Reklam hesabı kimin adına olur?",
        a: "Reklam hesabının ve verinin markada kalmasını öneriyoruz. Biz yalnızca gerekli yetkilerle çalışırız.",
      },
      {
        q: "Mevcut kampanyalarımızı durduracak mısınız?",
        a: "Önce inceleriz. Çalışan bir şeyi sırf yeni ajans geldi diye kapatmayız; neyin neden değişeceğini önceden yazılı olarak paylaşırız.",
      },
    ],
    cta: "Reklam planını konuşalım",
    image: objects.notebooks,
    seo: {
      title: "Meta Reklam Yönetimi (Facebook ve Instagram Reklamları)",
      description:
        "Meta reklam yönetimi: hesap ve ölçüm kontrolü, kampanya yapısı, kreatif testleri ve haftalık karar notlarıyla açık raporlama. Hizmet bedeli ve reklam bütçesi ayrı planlanır.",
    },
  },
  {
    slug: "performans-analizi-ve-donusum-optimizasyonu",
    number: "04",
    name: "Performans Analizi ve Dönüşüm Optimizasyonu",
    oneLiner:
      "Reklamdan ödemeye kadar yolu adım adım inceler, kaçağın nerede olduğunu bulur ve önceliklendiririz.",
    headline: [{ text: "Bir yerde" }, { text: "takılıyor.", accent: true }],
    intro:
      "Bütçeyi artırmak, kaçağı büyütmekten başka bir işe yaramayabilir. Önce kaçağı buluyoruz: ölçüm doğru mu, sayfa ne vaat ediyor, sepet kaç adım, ödeme nerede yarıda kalıyor? Bulduklarımızı etki ve efora göre sıralayıp bir düzeltme planına çeviriyoruz.",
    forWhom: [
      "Trafiği olan ama satışa dönmeyen siteler",
      "Raporlarında farklı araçların farklı rakamlar gösterdiği ekipler",
      "Bütçeyi artırmadan önce neyi çoğalttığını görmek isteyen markalar",
    ],
    deliverables: [
      {
        title: "Ölçüm ve izleme denetimi",
        detail: "GA4, piksel ve olay kurgusunda eksik ya da çift sayılan veriler.",
      },
      {
        title: "Huni analizi",
        detail: "Reklam, açılış sayfası, ürün, sepet ve ödeme adımlarında kayıp noktaları.",
      },
      {
        title: "Sayfa inceleme notları",
        detail: "Açılış ve ürün sayfaları için net, uygulanabilir öneriler.",
      },
      {
        title: "Öncelikli test listesi",
        detail: "Etki ve efora göre sıralanmış, sırayla uygulanacak işler.",
      },
    ],
    honestNotes: [
      "Site geliştirme ya da yazılım işleri kapsamda tanımlı değil; öneriler ekibine ya da geliştiricine uygulanabilir bir listeyle teslim edilir.",
      "Analizin derinliği, verilere erişim düzeyine bağlıdır.",
    ],
    faqs: [
      {
        q: "Hangi verilere erişim gerekiyor?",
        a: "Genellikle analitik, reklam hesabı ve e-ticaret paneline okuma yetkisi yeterli. Neye ihtiyaç olduğunu başlamadan önce listeleriz.",
      },
      {
        q: "Sadece analiz alıp uygulamayı kendimiz yapabilir miyiz?",
        a: "Bunu ilk görüşmede konuşalım. Amaç, ekibinin uygulayabileceği kadar net bir liste bırakmak.",
      },
    ],
    cta: "Kaçağı bulalım",
    image: objects.faucet,
    seo: {
      title: "Performans Analizi ve Dönüşüm Optimizasyonu",
      description:
        "Ölçüm denetimi, huni analizi ve önceliklendirilmiş test listesi. Reklamdan ödemeye kadar satışın nerede takıldığını bulan dönüşüm optimizasyonu.",
    },
  },
  {
    slug: "e-ticaret-buyume-danismanligi",
    number: "05",
    name: "E-ticaret Büyüme Danışmanlığı",
    oneLiner:
      "Aktif satış yapan markalar için teklif, kreatif, reklam ve site deneyimini tek bir büyüme planında birleştiririz.",
    headline: [{ text: "Ürünün satıyor." }, { text: "Reklamın ne yapıyor?", accent: true }],
    intro:
      "İyi bir ürün, kötü bir yolculuğu tek başına taşıyamaz. Ürün ve kategori önceliklerinden indirim takvimine, yorumlardan ödeme adımına kadar büyümeyi etkileyen parçaları birlikte ele alıyoruz. Satın almak isteyen müşterinin yolunu uzatan her adım, yeni bir vazgeçme sebebidir.",
    forWhom: [
      "Aktif satış yapan ve büyümenin bir sonraki adımını arayan e-ticaret markaları",
      "İndirim bitince satışları da biten markalar",
      "Reklam, site ve operasyon kararlarını tek bir planda görmek isteyen kurucular",
    ],
    deliverables: [
      {
        title: "Ürün ve kategori önceliklendirmesi",
        detail: "Hangi ürün reklamı taşır, hangisi sepeti büyütür?",
      },
      {
        title: "Teklif ve kampanya takvimi değerlendirmesi",
        detail: "İndirim dışında seni seçmek için başka hangi sebep var?",
      },
      {
        title: "Sepet ve ödeme sürtünme analizi",
        detail: "Gereksiz adımlar, beklenmedik maliyetler, güven boşlukları.",
      },
      {
        title: "Yorum ve geri bildirim içgörüsü",
        detail: "Müşterinin kendi cümleleri, bir sonraki reklamın hammaddesidir.",
      },
      {
        title: "90 günlük büyüme yol haritası",
        detail: "Öncelik sırası net, sorumlusu belli, ölçütü yazılı bir plan.",
      },
    ],
    honestNotes: [
      "Operasyon, lojistik ve muhasebe danışmanlığı kapsam dışıdır.",
      "Yol haritası bir plan, sonuç garantisi değildir.",
    ],
    faqs: [
      {
        q: "Hangi e-ticaret altyapılarıyla çalışıyorsunuz?",
        a: "Altyapıdan bağımsız düşünüyoruz; önemli olan veriye ve panele erişim. Kullandığın platformu ilk görüşmede konuşalım.",
      },
      {
        q: "Yeni kurulan bir mağaza için uygun mu?",
        a: "Bu hizmet, aktif satış yapan ve verisi olan markalar için tasarlandı. Yeni başlıyorsan strateji ve konumlandırmadan başlamak daha doğru olabilir.",
      },
    ],
    cta: "Büyüme planını konuşalım",
    image: objects.maze,
    seo: {
      title: "E-ticaret Büyüme Danışmanlığı",
      description:
        "Aktif satış yapan e-ticaret markaları için teklif, kreatif, reklam ve sepet deneyimini tek planda birleştiren büyüme danışmanlığı ve 90 günlük yol haritası.",
    },
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export const serviceOptions = services.map((service) => ({
  value: service.slug,
  label: service.name,
}));
