import Link from "next/link";
import { services } from "@/content/services";
import { cta, mainNav } from "@/content/site";
import { Logo } from "./Logo";
import { HeaderNav, type ServiceNavItem } from "./HeaderNav";

/**
 * Brand guide p.3: the wordmark is the version for "low, wide spaces such as a website header".
 * 112px wide → H clear space ≈ 16px, kept by the 72px bar height and the gap to the nav.
 */
export function SiteHeader() {
  // The services disclosure under "Hizmetler" is generated from the same list as the
  // pages, the sitemap and the form options; removing a service removes it here too.
  const serviceItems: ServiceNavItem[] = services.map((service) => ({
    number: service.number,
    label: service.name,
    href: `/hizmetler/${service.slug}`,
    oneLiner: service.oneLiner,
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-ink text-cream">
      <div className="shell flex h-(--header-h) items-center justify-between gap-6">
        <Link href="/" className="-m-1 shrink-0 p-1" aria-label="Haters Marketing ana sayfa">
          <Logo kind="wordmark" variant="on-dark" width={112} priority />
        </Link>
        <HeaderNav items={mainNav} cta={cta.primary} services={serviceItems} />
      </div>
    </header>
  );
}
