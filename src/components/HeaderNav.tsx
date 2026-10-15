"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/content/site";
import { cn } from "@/lib/cn";
import { Arrow, Chevron, Close } from "./icons";

export type ServiceNavItem = { number: string; label: string; href: string; oneLiner: string };

type Props = {
  items: NavItem[];
  cta: NavItem;
  /** The five services, listed under "Hizmetler" on desktop (disclosure) and in the mobile menu. */
  services: ServiceNavItem[];
  servicesHref?: string;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ items, cta, services, servicesHref = "/hizmetler" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  // A hover-opened panel closes when the pointer leaves; a click-opened one stays until
  // it is dismissed, so clicking the chevron while hovering never closes what just opened.
  const openedBy = useRef<"hover" | "click" | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const servicesItemRef = useRef<HTMLLIElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const servicesMenuId = useId();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  const closeServices = useCallback((restoreFocus = false) => {
    openedBy.current = null;
    setServicesOpen(false);
    if (restoreFocus) servicesButtonRef.current?.focus();
  }, []);

  function toggleServices() {
    if (!servicesOpen || openedBy.current === "hover") {
      openedBy.current = "click";
      setServicesOpen(true);
    } else {
      closeServices();
    }
  }

  // Route changes close both menus (layouts persist across navigations).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    openedBy.current = null;
    setServicesOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      // Keep focus inside the menu and its toggle while it is open.
      const focusables = [
        toggleRef.current,
        ...panelRef.current.querySelectorAll<HTMLElement>("a, button"),
      ].filter(Boolean) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Desktop disclosure: Escape closes and returns focus; a press outside closes.
  useEffect(() => {
    if (!servicesOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!servicesItemRef.current?.contains(event.target as Node)) closeServices();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeServices(true);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen, closeServices]);

  useEffect(
    () => () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    },
    [],
  );

  function hoverOpen(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    if (!servicesOpen) {
      openedBy.current = "hover";
      setServicesOpen(true);
    }
  }

  function hoverClose(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    if (openedBy.current !== "hover") return;
    // a short grace period bridges the gap between the item and its panel
    hoverTimer.current = window.setTimeout(() => {
      if (openedBy.current === "hover") closeServices();
    }, 160);
  }

  function onServicesBlur(event: React.FocusEvent) {
    if (!servicesItemRef.current?.contains(event.relatedTarget as Node | null)) closeServices();
  }

  const linkClass = (active: boolean) =>
    cn(
      "relative py-2 transition-colors duration-150 hover:text-red",
      active && "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-red",
    );

  return (
    <>
      <nav aria-label="Ana menü" className="hidden items-center gap-8 lg:flex">
        <ul className="flex items-center gap-7 text-[0.9375rem] font-semibold">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            if (item.href === servicesHref) {
              return (
                <li
                  key={item.href}
                  ref={servicesItemRef}
                  className="relative"
                  onPointerEnter={hoverOpen}
                  onPointerLeave={hoverClose}
                  onBlur={onServicesBlur}
                >
                  <div className="flex items-center gap-0.5">
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                      {item.label}
                    </Link>
                    <button
                      ref={servicesButtonRef}
                      type="button"
                      className="flex size-8 items-center justify-center transition-colors duration-150 hover:text-red"
                      aria-expanded={servicesOpen}
                      aria-controls={servicesMenuId}
                      aria-label={servicesOpen ? "Hizmet menüsünü kapat" : "Hizmet menüsünü aç"}
                      onClick={toggleServices}
                    >
                      <Chevron className={cn("size-3.5 transition-transform duration-150", servicesOpen && "rotate-180")} />
                    </button>
                  </div>

                  <div
                    id={servicesMenuId}
                    hidden={!servicesOpen}
                    className="absolute top-full left-0 z-50 mt-3 w-[26rem] border border-cream/15 bg-ink p-2 text-cream"
                  >
                    <ul className="divide-y divide-cream/10">
                      {services.map((service) => {
                        const current = pathname === service.href;
                        return (
                          <li key={service.href}>
                            <Link
                              href={service.href}
                              prefetch={true}
                              aria-current={current ? "page" : undefined}
                              onClick={() => closeServices()}
                              className="group grid grid-cols-[2.5rem_1fr] gap-x-3 px-3 py-3 transition-colors duration-150 hover:bg-cream hover:text-ink focus-visible:bg-cream focus-visible:text-ink"
                            >
                              <span className="eyebrow pt-1 text-red group-hover:text-red-ink group-focus-visible:text-red-ink">
                                {service.number}
                              </span>
                              <span>
                                <span className={cn("block font-semibold", current && "underline decoration-red decoration-2 underline-offset-4")}>
                                  {service.label}
                                </span>
                                <span className="mt-0.5 block text-sm font-normal text-cream/70 group-hover:text-ink/75 group-focus-visible:text-ink/75">
                                  {service.oneLiner}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <Link
                      href={servicesHref}
                      onClick={() => closeServices()}
                      className="link-arrow mt-2 flex min-h-11 items-center px-3 text-sm"
                    >
                      Tüm hizmetler <Arrow className="size-4" />
                    </Link>
                  </div>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href={cta.href}
          className="btn btn-red min-h-11 px-5 text-base"
          data-track="cta_click"
          data-track-label="header"
        >
          {cta.label}
        </Link>
      </nav>

      <div className="flex items-center gap-3 lg:hidden">
        <Link
          href={cta.href}
          className="btn btn-red min-h-11 px-4 text-base max-[22rem]:hidden"
          data-track="cta_click"
          data-track-label="header-mobile"
        >
          Konuşalım
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="btn btn-ghost-cream min-h-11 px-4 text-base"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => (open ? close() : setOpen(true))}
        >
          {open ? (
            <>
              Kapat <Close className="size-4" />
            </>
          ) : (
            "Menü"
          )}
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-(--header-h) bottom-0 z-40 overflow-y-auto bg-ink lg:hidden"
      >
        <nav aria-label="Mobil menü" className="shell flex min-h-full flex-col justify-between gap-12 py-10">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => close(false)}
                    className={cn(
                      "display block py-1 text-[clamp(2.75rem,13vw,4.5rem)]",
                      active ? "text-red" : "text-cream",
                    )}
                  >
                    {item.label}.
                  </Link>
                  {item.href === servicesHref && (
                    <ul aria-label="Hizmetler" className="mt-1 mb-5 ml-1 border-l-2 border-cream/20 pl-5">
                      {services.map((service) => {
                        const current = pathname === service.href;
                        return (
                          <li key={service.href}>
                            <Link
                              href={service.href}
                              aria-current={current ? "page" : undefined}
                              onClick={() => close(false)}
                              className={cn(
                                "flex min-h-11 items-baseline gap-3 py-2 text-lg font-semibold",
                                current ? "text-red" : "text-cream",
                              )}
                            >
                              <span className="eyebrow text-red">{service.number}</span>
                              {service.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            href={cta.href}
            onClick={() => close(false)}
            className="btn btn-red w-full"
            data-track="cta_click"
            data-track-label="mobile-menu"
          >
            {cta.label} <Arrow className="size-5" />
          </Link>
        </nav>
      </div>
    </>
  );
}
