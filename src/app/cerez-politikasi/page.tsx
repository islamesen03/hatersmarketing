import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import { ConsentSettingsButton } from "@/components/consent/ConsentSettingsButton";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Çerez Politikası",
  description:
    "Haters Marketing web sitesinde kullanılan zorunlu ve isteğe bağlı çerezler, amaçları ve çerez tercihlerini nasıl değiştirebileceğin.",
  path: "/cerez-politikasi",
});

const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export default function CookiePage() {
  return (
    <LegalDocument
      title="Çerez Politikası"
      intro={
        <p>
          Çerezler ve benzeri teknolojiler, tarayıcında küçük bilgiler saklar. Bu sitede zorunlu olanlar dışında
          hiçbir çerez, sen onay vermeden çalışmaz.
        </p>
      }
    >
      <section>
        <h2>Zorunlu kayıtlar</h2>
        <p>Sitenin çalışması için gereklidir ve kapatılamaz.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-2 pr-4">Ad</th>
                <th scope="col" className="py-2 pr-4">Tür</th>
                <th scope="col" className="py-2 pr-4">Amaç</th>
                <th scope="col" className="py-2">Süre</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink/20 align-top">
                <td className="py-3 pr-4 font-semibold">hm-consent</td>
                <td className="py-3 pr-4">Yerel depolama</td>
                <td className="py-3 pr-4">Çerez tercihini hatırlamak</td>
                <td className="py-3">Sen silene kadar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Analitik çerezler (isteğe bağlı)</h2>
        {analyticsEnabled ? (
          <>
            <p>
              Onay verirsen, sitenin hangi bölümlerinin işe yaradığını anlamak için Google Analytics 4
              kullanırız. Onay vermezsen analitik kodu hiç yüklenmez.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-left text-[0.9375rem]">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className="py-2 pr-4">Ad</th>
                    <th scope="col" className="py-2 pr-4">Sağlayıcı</th>
                    <th scope="col" className="py-2 pr-4">Amaç</th>
                    <th scope="col" className="py-2">Süre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-ink/20 align-top">
                    <td className="py-3 pr-4 font-semibold">_ga, _ga_*</td>
                    <td className="py-3 pr-4">Google</td>
                    <td className="py-3 pr-4">Ziyaretçileri ayırt ederek istatistik üretmek</td>
                    <td className="py-3">En fazla 2 yıl</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>Şu anda sitede herhangi bir analitik ya da reklam çerezi kullanılmıyor.</p>
        )}
      </section>

      <section>
        <h2>Tercihlerini değiştirmek</h2>
        <p>Verdiğin onayı istediğin zaman geri alabilir ya da değiştirebilirsin.</p>
        <p>
          <ConsentSettingsButton className="btn btn-ink min-h-11 px-5 text-base" />
        </p>
        <p>
          Tarayıcının ayarlarından da çerezleri silebilir veya engelleyebilirsin; bu durumda tercihin yeniden
          sorulur.
        </p>
      </section>
    </LegalDocument>
  );
}
