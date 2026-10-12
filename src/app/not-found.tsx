import type { Metadata } from "next";
import Link from "next/link";
import { InvertedLabelAccent } from "@/components/InvertedLabelAccent";
import { ButtonLink } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

const links = [
  { label: "Ana sayfa", href: "/" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Yaklaşımımız", href: "/yaklasimimiz" },
];

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="bg-ink text-cream">
      <div className="shell grid-12 min-h-[calc(100svh-var(--header-h))] content-center gap-y-12 py-20">
        <div className="col-span-4 md:col-span-12">
          <p className="display text-[clamp(5rem,24vw,18rem)] leading-none">
            <InvertedLabelAccent srText="Hata 404">404</InvertedLabelAccent>
          </p>
          <h1 id="nf-title" className="display t-xl mt-10">
            Bu sayfa <span className="text-red">ters gitti.</span>
          </h1>
          <p className="lead mt-6 max-w-xl text-cream/80">
            Aradığın sayfa yok, taşınmış ya da hiç olmamış olabilir. Belki de doğru soru başka bir yerde.
          </p>
        </div>
        <div className="col-span-4 flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-12">
          <ButtonLink href="/iletisim" track="404">
            Projeni konuşalım
          </ButtonLink>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-arrow min-h-11 text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
