"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/site";
import { cn } from "@/lib/cn";
import { Arrow, Close } from "./icons";

type Props = { items: NavItem[]; cta: NavItem };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ items, cta }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Route changes close the menu (layouts persist across navigations).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
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

  return (
    <>
      <nav aria-label="Ana menü" className="hidden items-center gap-8 lg:flex">
        <ul className="flex items-center gap-7 text-[0.9375rem] font-semibold">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 transition-colors duration-150 hover:text-red",
                    active &&
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-red",
                  )}
                >
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
