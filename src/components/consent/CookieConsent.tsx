"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  OPEN_SETTINGS,
  analyticsConfigured,
  getConsent,
  getServerConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";

const noopSubscribe = () => () => {};

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);

  useEffect(() => {
    function open() {
      setAnalyticsChoice(getConsent()?.analytics ?? false);
      dialogRef.current?.showModal();
    }
    window.addEventListener(OPEN_SETTINGS, open);
    return () => window.removeEventListener(OPEN_SETTINGS, open);
  }, []);

  // The banner appears only when there is something optional to agree to.
  const showBanner = hydrated && analyticsConfigured && consent === null;

  function decide(analytics: boolean) {
    saveConsent(analytics);
    dialogRef.current?.close();
  }

  return (
    <>
      {showBanner && (
        <section
          aria-label="Çerez tercihleri"
          className="fixed inset-x-3 bottom-3 z-60 border border-cream/20 bg-ink p-5 text-cream shadow-[0_0_0_1px_#0c0c0c] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md"
        >
          <p className="font-semibold">Ölçüm için iznini istiyoruz.</p>
          <p className="mt-2 text-sm text-cream/80">
            Zorunlu olanlar dışında hiçbir çerez, sen onay vermeden çalışmaz. Analitik çerezleri, sitenin
            hangi bölümlerinin işe yaradığını anlamak için kullanırız.{" "}
            <Link href="/cerez-politikasi" className="underline underline-offset-4">
              Çerez politikası
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-red min-h-11 px-4 text-base" onClick={() => decide(true)}>
              Kabul et
            </button>
            <button
              type="button"
              className="btn btn-ghost-cream min-h-11 px-4 text-base"
              onClick={() => decide(false)}
            >
              Sadece zorunlu
            </button>
            <button
              type="button"
              className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4"
              onClick={() => {
                setAnalyticsChoice(false);
                dialogRef.current?.showModal();
              }}
            >
              Tercihler
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="consent-title"
        className="m-auto w-[min(34rem,calc(100vw-2rem))] border border-cream/20 bg-ink p-0 text-cream backdrop:bg-ink/80"
      >
        <form
          method="dialog"
          className="p-6 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            decide(analyticsChoice);
          }}
        >
          <h2 id="consent-title" className="display t-sm">
            Çerez tercihleri.
          </h2>
          <fieldset className="mt-6 space-y-5">
            <legend className="sr-only">Çerez kategorileri</legend>
            <div className="border-t border-cream/15 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Zorunlu</span>
                <span className="text-sm text-cream/70">Her zaman açık</span>
              </div>
              <p className="mt-2 text-sm text-cream/75">
                Sitenin çalışması ve bu tercihin hatırlanması için gereken kayıtlar.
              </p>
            </div>
            <div className="border-t border-cream/15 pt-5">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="font-semibold">Analitik</span>
                <input
                  type="checkbox"
                  className="size-5 accent-red"
                  checked={analyticsChoice}
                  disabled={!analyticsConfigured}
                  onChange={(event) => setAnalyticsChoice(event.target.checked)}
                />
              </label>
              <p className="mt-2 text-sm text-cream/75">
                {analyticsConfigured
                  ? "Ziyaret istatistikleri. Onay vermezsen hiçbir analitik kodu yüklenmez."
                  : "Şu anda sitede analitik aracı kullanılmıyor; bu kategori etkin değil."}
              </p>
            </div>
          </fieldset>
          <div className="mt-8 flex flex-wrap gap-2">
            <button type="submit" className="btn btn-red min-h-11 px-4 text-base">
              Kaydet
            </button>
            <button
              type="button"
              className="btn btn-ghost-cream min-h-11 px-4 text-base"
              onClick={() => dialogRef.current?.close()}
            >
              Vazgeç
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
