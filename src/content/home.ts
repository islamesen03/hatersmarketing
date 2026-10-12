import { objects } from "./images";
import type { Faq, Headline, Picture } from "./types";

export const hero = {
  eyebrow: "Strateji · Kreatif · Meta reklam yönetimi",
  headline: [{ text: "Beğeni değil." }, { text: "İş sonucu.", accent: true }] satisfies Headline,
  lead: "İyi görünen işler yetmez. Ne değiştirdiğine bakalım.",
  body: "Strateji, reklam kreatifi ve Meta reklam yönetimini tek bir soruya bağlıyoruz: bu iş, satışa ne kattı?",
  secondary: { label: "Nasıl çalıştığımızı gör", href: "/yaklasimimiz" },
  image: objects.knot,
  caption: "Bir yerde takılıyor. Birlikte çözelim.",
};

export const manifesto = {
  eyebrow: "Adımız neden ters?",
  flipped: "Duymak istediğini değil,",
  upright: "duyman gerekeni",
  close: "söyleriz.",
  body: [
    "Adımızın sonundaki “ters”, Türkçede baş aşağı, tersine, aksi demek. Logomuzda da öyle: o dört harf kırmızı bir etiketin üzerinde baş aşağı duruyor, okuma sırası bozulmadan.",
    "Bu bir kabalık değil, bir bakış açısı. Bazen doğru soru, yanlış bildiğin yerden başlar.",
  ],
  aside:
    "Kimseden nefret etmiyoruz. Tembel varsayımlardan, boş raporlardan ve “algoritma böyle” bahanesinden hoşlanmıyoruz.",
};

export type Diagnosis = {
  label: string;
  headline: Headline;
  body: string;
  nextStep: string;
  image: Picture;
};

export const diagnoses: Diagnosis[] = [
  {
    label: "Teşhis 01 · Hedef",
    headline: [{ text: "Beğeni geldi." }, { text: "Sipariş?", accent: true }],
    body: "Etkileşim artınca her şey yolunda görünür. Ama beğeni bir sinyaldir, satış değil. İkisini aynı rapora aynı ağırlıkla yazmayı bırakıyoruz.",
    nextStep: "Başarıyı sipariş, nitelikli talep ya da sepet değeri gibi bir iş sonucuna bağlamak.",
    image: objects.heartBox,
  },
  {
    label: "Teşhis 02 · Kreatif",
    headline: [{ text: "Aynı görsel." }, { text: "Yeni beklenti.", accent: true }],
    body: "Aynı kreatifi farklı bir bütçeyle yeniden yayınlamak strateji değildir. Yorulan reklam sessizce pahalanır, rapor ise bunu çoğu zaman söylemez.",
    nextStep: "Her dönem hangi değişkeni neden test ettiğini gösteren bir kreatif test planı.",
    image: objects.cards,
  },
  {
    label: "Teşhis 03 · Temel",
    headline: [{ text: "Algoritmayı" }, { text: "suçlamadan önce.", accent: true }],
    body: "Teklif net mi? Ölçüm doğru mu? Sayfa vaadini tutuyor mu? Algoritma, ona verdiğin sinyallerle çalışır. Önce temele bakarız.",
    nextStep: "Ölçüm, teklif ve açılış sayfası için önceliklendirilmiş bir kontrol listesi.",
    image: objects.owl,
  },
];

export type MethodStep = { word: string; body: string; output: string };

export const method: MethodStep[] = [
  {
    word: "Dinle.",
    body: "Markanı, hedefini ve bugüne kadar neyi denediğini dinleriz. Varsayım değil, bağlam toplarız.",
    output: "Ortak hedef ve yazılı bir başarı tanımı",
  },
  {
    word: "Sorgula.",
    body: "Hesapları, ölçümü, teklifi ve kreatifleri inceleriz. Rahatsız edici sorular burada sorulur.",
    output: "Ön inceleme notu: kaçaklar ve öncelikler",
  },
  {
    word: "Kurgula.",
    body: "Konumu, mesajı, kreatifi ve kampanya yapısını tek bir planda birleştiririz.",
    output: "Test planı ve kreatif brif",
  },
  {
    word: "Yayına al.",
    body: "Kampanyaları ve kreatif varyasyonları kontrollü biçimde yayına alırız. Her değişikliğin bir sebebi olur.",
    output: "Yayın kontrol listesi",
  },
  {
    word: "Ölç.",
    body: "Neyi denedik, ne öğrendik, sırada ne var? Kararı veriye bağlar, döngüyü yeniden başlatırız.",
    output: "Haftalık karar notu",
  },
];

/** Örnek teslimatlar. Gerçek müşteri verisi DEĞİLDİR ve sayfada böyle etiketlenir. */
export const sampleDocs = [
  {
    kind: "Ön inceleme notu",
    title: "Kaçaklar ve öncelikler",
    rows: [
      ["Ölçüm", "Satın alma olayı iki kez sayılıyor mu?", "Yüksek"],
      ["Teklif", "İndirim dışında bir seçilme sebebi var mı?", "Yüksek"],
      ["Sayfa", "Reklamdaki vaat ilk ekranda görünüyor mu?", "Orta"],
      ["Kreatif", "Son 60 günde yeni bir fikir test edildi mi?", "Orta"],
    ],
  },
  {
    kind: "Kreatif test planı",
    title: "Bir değişken, bir hipotez",
    rows: [
      ["Değişken", "Açılış cümlesi", ""],
      ["Hipotez", "Sorunla açılan metin, özellikle açılandan daha çok durdurur.", ""],
      ["Ölçüt", "Tıklama değil, sepete ekleme oranı", ""],
      ["Karar", "İki hafta sonra, belirlenen eşikle", ""],
    ],
  },
  {
    kind: "Haftalık karar notu",
    title: "Rapor değil, cevap",
    rows: [
      ["Neyi denedik?", "Aynı ürün için iki farklı teklif", ""],
      ["Ne öğrendik?", "Kargo vurgusu, indirim vurgusundan daha çok sepet getirdi", ""],
      ["Sırada ne var?", "Kazanan teklifi yeni kreatiflerle sınamak", ""],
    ],
  },
];

export const homeFaqs: Faq[] = [
  {
    q: "Kimlerle çalışıyorsunuz?",
    a: "Aktif satış yapan e-ticaret markaları, büyümek isteyen KOBİ'ler ve reklam yönetimini değiştirmeyi düşünen ekiplerle. En iyi işi, karar vericinin sürece dahil olduğu ve verisini paylaşmaya hazır markalarla çıkarıyoruz. Herkese hitap etmiyoruz; uyumlu olup olmadığımızı ilk görüşmede birlikte görürüz.",
  },
  {
    q: "İlk görüşmede ne konuşuyoruz?",
    a: "Markanı, hedefini ve şimdiye kadar neyi denediğini. Reklam hesapların ve ölçüm kurulumun hakkında sorular sorarız. Görüşmenin sonunda ya net bir sonraki adım önerir ya da açıkça uygun olmadığımızı söyleriz.",
  },
  {
    q: "Reklam bütçesi hizmet ücretine dahil mi?",
    a: "Hayır. Hizmet bedeli ve reklam bütçesi ayrı planlanır. Reklam bütçesi reklam platformunda harcanan tutardır; hizmet bedeli ise strateji, kreatif ve yönetim emeğinin karşılığıdır. İkisinin kapsamı da ilk görüşmeden sonra netleşir.",
  },
  {
    q: "Sonuç garantisi veriyor musunuz?",
    a: "Hayır. Reklam sonuçları ürüne, teklife, rekabete ve bütçeye bağlıdır; bunları garanti eden bir vaade temkinli yaklaşmanı öneririz. Garanti edebileceğimiz şey süreçtir: neyi test ettiğimizi, ne öğrendiğimizi ve sıradaki adımı açıkça paylaşmak.",
  },
  {
    q: "Ne kadar sürede sonuç görürüm?",
    a: "Başlangıç noktana bağlı. Ölçüm kurulumu, ürünün, teklifin ve bütçenin durumu takvimi doğrudan etkiler. Mevcut tabloyu gördükten sonra gerçekçi bir takvim konuşuruz; önceden kesin süre vaat etmeyiz.",
  },
  {
    q: "Hangi kanallarda çalışıyorsunuz?",
    a: "Odağımız Meta (Facebook ve Instagram) reklamları, reklam kreatifi, strateji ve dönüşüm tarafı. Başka bir kanala ihtiyacın varsa dinleriz; kapsamımızda değilse bunu da açıkça söyleriz.",
  },
];

export const closer = {
  headline: [{ text: "Aynı şeyi yapıp" }, { text: "farklı sonuç bekleme.", accent: true }] satisfies Headline,
  body: "Markanı, hedefini ve takıldığın yeri anlat. İlk görüşmede ya net bir sonraki adım ya da dürüst bir “uygun değiliz” duyarsın.",
};
