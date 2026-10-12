import type { Picture } from "./types";

/**
 * Object stills cropped from Haters Marketing's own campaign posters
 * (scripts/prepare-images.mjs). They are agency visuals, never client work.
 */
export const objects = {
  knot: {
    src: "/images/objects/kirmizi-dugum.jpg",
    alt: "Krem zemin üzerinde ortasından sıkıca düğümlenmiş kırmızı bir ayakkabı bağcığı.",
    width: 1122,
    height: 300,
    tone: "cream",
  },
  heartBox: {
    src: "/images/objects/kalp-ve-kutu.jpg",
    alt: "Boş bir karton kutudan yükselen kırmızı, kalp şeklinde folyo balon.",
    width: 640,
    height: 660,
    tone: "cream",
  },
  cards: {
    src: "/images/objects/kartlar.jpg",
    alt: "Ortasında siyah daire olan krem kart destesinin önünde, iki krem daireli tek bir kırmızı kart.",
    width: 860,
    height: 572,
    tone: "cream",
  },
  owl: {
    src: "/images/objects/baykus-kirmizi.jpg",
    alt: "Kırmızı zemin önünde, kaşlarını çatmış gibi doğrudan bakan siyah beyaz bir puhu kuşu.",
    width: 692,
    height: 715,
    tone: "red",
  },
  pawns: {
    src: "/images/objects/piyonlar.jpg",
    alt: "Yan yana dizilmiş beş siyah satranç piyonu ve en sağda tek bir kırmızı piyon.",
    width: 1042,
    height: 270,
    tone: "cream",
  },
  notebooks: {
    src: "/images/objects/defterler.jpg",
    alt: "Siyah zemin üzerinde iki krem defter: biri kapalı, diğeri aralanmış ve içi kırmızı.",
    width: 822,
    height: 497,
    tone: "ink",
  },
  hourglass: {
    src: "/images/objects/kum-saati.jpg",
    alt: "Siyah zemin üzerinde kırmızı kumu akan bir kum saati.",
    width: 420,
    height: 748,
    tone: "ink",
  },
  maze: {
    src: "/images/objects/labirent.jpg",
    alt: "Beyaz bir labirentin içinden dolanarak çıkışta küçük siyah bir alışveriş çantasına uzanan kırmızı ip.",
    width: 900,
    height: 610,
    tone: "cream",
  },
  faucet: {
    src: "/images/objects/musluk.jpg",
    alt: "Musluktan damlayan kırmızı damlaların, delik bir lavabodan geçip yere biriktiği sahne.",
    width: 700,
    height: 725,
    tone: "cream",
  },
  notebookPencil: {
    src: "/images/objects/defter-ve-kalem.jpg",
    alt: "Boş sayfalarıyla açık duran siyah kapaklı bir defter ve ortasında kırmızı bir kurşun kalem.",
    width: 875,
    height: 500,
    tone: "cream",
  },
} satisfies Record<string, Picture>;
