/**
 * Haters Marketing'in KENDİ sosyal medya kampanya serisi.
 * Bu afişler müşteri işi değildir ve sitede her yerde böyle etiketlenir.
 * Kaynak dosyalar: masaüstündeki "haters marketing" klasörü → scripts/prepare-images.mjs
 */

export type Poster = {
  slug: string;
  tag: string;
  headline: string;
  sub: string;
  note: string;
  src: string;
  alt: string;
};

const size = { width: 1122, height: 1402 } as const;
export const posterSize = size;

export const posters: Poster[] = [
  {
    slug: "herkese-hitap-etmiyoruz",
    tag: "01 / Tavır",
    headline: "Herkese hitap etmiyoruz.",
    sub: "Sana ediyorsa, konuşalım.",
    note: "Herkese seslenen marka, kimseye seslenmez. Bu cümle aynı zamanda kimlerle çalıştığımızın da özeti.",
    src: "/images/posters/herkese-hitap-etmiyoruz.jpg",
    alt: "Krem zemin üzerinde dev siyah harflerle 'Herkese hitap etmiyoruz.' yazan afiş; altında eğik kırmızı bir şeritte 'Sana ediyorsa, konuşalım.'",
  },
  {
    slug: "begeni-geldi-siparis",
    tag: "13 / Hedef",
    headline: "Beğeni geldi. Sipariş?",
    sub: "İkisini aynı şey saymayalım.",
    note: "Vanity metrikler raporu güzelleştirir, kasayı değil. Başarı tanımı her zaman bir iş sonucuna bağlanmalı.",
    src: "/images/posters/begeni-geldi-siparis.jpg",
    alt: "Krem zeminde siyah 'Beğeni geldi.' ve kırmızı 'Sipariş?' başlıklı afiş; boş bir karton kutudan kırmızı kalp balon yükseliyor.",
  },
  {
    slug: "rakibini-kopyaladin",
    tag: "04 / Fark",
    headline: "Rakibini kopyaladın. Şimdi iki tane var.",
    sub: "Farkın nerede?",
    note: "Benzemek güvenli hissettirir, ama seçilmenin önündeki en büyük engel de odur.",
    src: "/images/posters/rakibini-kopyaladin.jpg",
    alt: "Beş siyah satranç piyonunun yanında tek bir kırmızı piyonun durduğu, 'Rakibini kopyaladın. Şimdi iki tane var.' yazan krem afiş.",
  },
  {
    slug: "algoritmayi-suclamadan-once",
    tag: "07 / Teklif",
    headline: "Algoritmayı suçlamadan önce.",
    sub: "Teklife bir bakalım.",
    note: "Reklam platformu, verdiğin sinyallerle çalışır. Zayıf bir teklifi en iyi hedefleme de kurtaramaz.",
    src: "/images/posters/algoritmayi-suclamadan-once.jpg",
    alt: "Kırmızı zemin üzerinde krem harflerle 'Algoritmayı suçlamadan önce.' yazan afiş; sağda sert bakışlı siyah beyaz bir baykuş.",
  },
  {
    slug: "butceyi-artirdik",
    tag: "19 / Bütçe",
    headline: "Bütçeyi artırdık. Sorun da büyüdü.",
    sub: "Önce kaçağı bulalım.",
    note: "Delik bir kovaya daha çok su dökmek, sadece daha hızlı boşalmasını sağlar.",
    src: "/images/posters/butceyi-artirdik.jpg",
    alt: "Musluktan damlayan kırmızı damlaların delik bir lavabodan yere aktığı, 'Bütçeyi artırdık. Sorun da büyüdü.' yazan krem afiş.",
  },
  {
    slug: "her-seyi-anlattik",
    tag: "10 / Mesaj",
    headline: "Her şeyi anlattık. Kimse bir şey anlamadı.",
    sub: "Bir gönderi. Bir ana fikir.",
    note: "Her şeyi söylemeye çalışan reklam, hiçbir şeyi akılda bırakmaz.",
    src: "/images/posters/her-seyi-anlattik.jpg",
    alt: "Ağzından kâğıt şeritler taşan kırmızı-beyaz bir megafon; üstte 'Her şeyi anlattık.', altta kırmızıyla 'Kimse bir şey anlamadı.' yazıyor.",
  },
  {
    slug: "satin-almak-istiyordum",
    tag: "22 / Süreç",
    headline: "Satın almak istiyordum. Sonra yol uzadı.",
    sub: "Her gereksiz adım, yeni bir vazgeçme sebebi.",
    note: "Reklam müşteriyi kapıya getirir. Kapıdan kasaya giden yol kısa değilse, bütçe yolda kalır.",
    src: "/images/posters/satin-almak-istiyordum.jpg",
    alt: "Beyaz bir labirentin içinden dolanan kırmızı ipin çıkıştaki alışveriş çantasına ulaştığı, 'Satın almak istiyordum.' yazan krem afiş.",
  },
  {
    slug: "bu-rapor-cok-sey-sakliyor",
    tag: "02 / Şeffaflık",
    headline: "Bu rapor çok şey saklıyor.",
    sub: "Mesela neyin işe yaramadığını.",
    note: "İyi rapor, başarısız denemeleri de yazar. Öğrenmenin yarısı oradadır.",
    src: "/images/posters/bu-rapor-cok-sey-sakliyor.jpg",
    alt: "Siyah zemin üzerinde, satırları siyah bantla karartılmış bir rapordan katlanmış kâğıt uçak; üstte 'Bu rapor çok şey saklıyor.' yazıyor.",
  },
  {
    slug: "hemen-donuyoruz",
    tag: "20 / İletişim",
    headline: "Hemen dönüyoruz. Müşteri bekliyor.",
    sub: "Yanıt süresi de deneyimin bir parçası.",
    note: "Reklam mesajı getirir. Cevap gecikirse, rakip yazıyor demektir.",
    src: "/images/posters/hemen-donuyoruz.jpg",
    alt: "Siyah zemin üzerinde kırmızı kumu akan bir kum saati; üstte krem harflerle 'Hemen dönüyoruz.' ve kırmızıyla 'Müşteri bekliyor.' yazıyor.",
  },
  {
    slug: "yeni-ajans-ayni-belirsizlik",
    tag: "R02 / Meta",
    headline: "Yeni ajans. Aynı belirsizlik?",
    sub: "Neyi test ettiğimizi, neden değiştirdiğimizi konuşalım.",
    note: "Ajans değiştirmek tek başına bir çözüm değil. Değişmesi gereken şey, belirsizliğin kendisi.",
    src: "/images/posters/yeni-ajans-ayni-belirsizlik.jpg",
    alt: "Siyah zemin üzerinde iki krem defter, biri kapalı biri içi kırmızı açık; üstte 'Yeni ajans. Aynı belirsizlik?' yazan afiş.",
  },
];
