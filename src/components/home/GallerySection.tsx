import Link from "next/link";
import { posters } from "@/content/gallery";
import { PosterGallery } from "./PosterGallery";
import { Arrow } from "../icons";

export function GallerySection() {
  return (
    <section aria-labelledby="gallery-title" className="section-y overflow-clip bg-ink text-cream">
      <div className="shell">
        <div className="grid-12 gap-y-6">
          <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Kendi kampanya serimiz</p>
          <div className="col-span-4 md:col-span-9">
            <h2 id="gallery-title" className="display t-xl" data-enter="left">
              Biz böyle konuşuruz.
            </h2>
            <p className="mt-6 max-w-2xl text-cream/80">
              Aşağıdaki afişler Haters Marketing&apos;in kendi sosyal medya serisinden. Müşteri işi değiller;
              nasıl düşündüğümüzü ve nasıl konuştuğumuzu gösteriyorlar.
            </p>
          </div>
        </div>
        <div className="mt-14 md:mt-20">
          <PosterGallery posters={posters} />
        </div>
        <Link href="/islerimiz" className="link-arrow mt-10 min-h-11 text-cream">
          Tüm konsept çalışmaları <Arrow className="size-4" />
        </Link>
      </div>
    </section>
  );
}
