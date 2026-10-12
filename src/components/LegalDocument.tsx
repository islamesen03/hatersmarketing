import Link from "next/link";
import { site } from "@/content/site";

/** Shows a confirmed value, or a clearly marked gap. Never a guess. */
export function Confirm({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return (
    <mark className="bg-red/20 px-1 font-semibold text-ink not-italic">[Onaylanacak: {label}]</mark>
  );
}

type Props = {
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
};

export function LegalDocument({ title, intro, children }: Props) {
  return (
    <article className="bg-cream text-ink">
      <div className="shell grid-12 gap-y-10 pt-12 pb-24 md:pt-20 md:pb-32">
        <header className="col-span-4 md:col-span-10">
          <nav aria-label="Sayfa konumu" className="text-sm text-ink/70">
            <Link href="/" className="hover:text-ink">
              Ana sayfa
            </Link>{" "}
            / <span aria-current="page">{title}</span>
          </nav>
          <h1 className="display t-xl mt-8">{title}.</h1>
          <p className="mt-4 text-sm text-ink/70">
            Son güncelleme: <Confirm value={site.kvkk.lastUpdated} label="yayın tarihi" />
          </p>
        </header>

        <div role="note" className="col-span-4 border-2 border-ink bg-ink p-5 text-cream md:col-span-8 md:p-6">
          <p className="eyebrow text-red">Taslak metin</p>
          <p className="mt-2">
            Bu metin bir taslaktır ve tek başına yasal uyumluluk sağlamaz. Yayına almadan önce bir hukuk
            uzmanı tarafından incelenmeli ve işaretli alanlar doğrulanmış şirket bilgileriyle tamamlanmalıdır.
          </p>
        </div>

        <div className="col-span-4 md:col-span-8">
          <div className="lead text-ink/85">{intro}</div>
          <div className="legal mt-12 space-y-12 [&_h2]:font-display [&_h2]:text-[1.75rem] [&_h2]:leading-none [&_h2]:uppercase [&_li]:mt-2 [&_p]:mt-4 [&_p_a]:underline [&_p_a]:underline-offset-4 [&_p]:max-w-[68ch] [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}
