import Link from "next/link";
import { cacheLife } from "next/cache";
import { legalNav, mainNav, site } from "@/content/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";
import { ConsentSettingsButton } from "./consent/ConsentSettingsButton";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  const { email, phone, address } = site.contact;

  return (
    <footer className="border-t border-cream/10 bg-ink text-cream">
      <div className="shell grid-12 gap-y-14 pt-16 pb-10 md:pt-24">
        <div className="col-span-4 md:col-span-5">
          {/* Full logo, cream + red label on black, with its H-width clear space. */}
          <Logo variant="on-dark" width={200} clearSpace />
          <p className="mt-4 max-w-sm text-cream/75">
            Duymak istediğini değil, duyman gerekeni konuşan bir pazarlama ajansı.
          </p>
        </div>

        <nav aria-label="Alt menü" className="col-span-2 md:col-span-2 md:col-start-7">
          <p className="eyebrow text-cream/60">Site</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/" className="hover:text-red">
                Ana sayfa
              </Link>
            </li>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-red">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Hizmetler" className="col-span-2 md:col-span-3">
          <p className="eyebrow text-cream/60">Hizmetler</p>
          <ul className="mt-5 space-y-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/hizmetler/${service.slug}`} prefetch={true} className="hover:text-red">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {(email || phone || address || site.social.length > 0) && (
          <div className="col-span-4 md:col-span-3 md:col-start-7">
            <p className="eyebrow text-cream/60">İletişim</p>
            <ul className="mt-5 space-y-3">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-red">
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-red">
                    {phone}
                  </a>
                </li>
              )}
              {address && <li className="text-cream/75">{address}</li>}
              {site.social.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-red">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="shell flex flex-col gap-6 border-t border-cream/10 py-8 text-sm text-cream/70 lg:flex-row lg:items-center lg:justify-between">
        <p>
          © <CurrentYear /> {site.legalName ?? site.name}. Kişisel verilerin yalnızca talebine yanıt vermek
          için işlenir; ayrıntılar{" "}
          <Link href="/kvkk-aydinlatma-metni" className="underline underline-offset-4 hover:text-cream">
            aydınlatma metninde
          </Link>
          .
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-cream">
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <ConsentSettingsButton className="hover:text-cream" />
          </li>
        </ul>
      </div>
    </footer>
  );
}
