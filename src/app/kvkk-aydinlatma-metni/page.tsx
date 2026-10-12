import type { Metadata } from "next";
import Link from "next/link";
import { Confirm, LegalDocument } from "@/components/LegalDocument";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, Haters Marketing web sitesindeki iletişim formu aracılığıyla işlenen kişisel veriler hakkında aydınlatma metni.",
  path: "/kvkk-aydinlatma-metni",
});

export default function KvkkPage() {
  const { kvkk } = site;
  return (
    <LegalDocument
      title="KVKK Aydınlatma Metni"
      intro={
        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“KVKK”) 10. maddesi uyarınca, web
          sitemizdeki iletişim formu aracılığıyla paylaştığın kişisel verilerin nasıl işlendiğini açıklar.
        </p>
      }
    >
      <section>
        <h2>1. Veri sorumlusu</h2>
        <p>
          Kişisel verilerin, veri sorumlusu sıfatıyla{" "}
          <Confirm value={kvkk.dataController ?? site.legalName} label="ticaret unvanı ve adresi" /> (“Haters
          Marketing”) tarafından işlenir. MERSİS no: <Confirm value={kvkk.mersisNo} label="MERSİS numarası" />.
        </p>
      </section>

      <section>
        <h2>2. İşlenen kişisel veriler</h2>
        <ul>
          <li>Kimlik: ad ve soyad.</li>
          <li>İletişim: e-posta adresi ve (paylaşırsan) telefon numarası.</li>
          <li>Mesleki bilgi: şirket veya marka adı, web sitesi adresi.</li>
          <li>Talep bilgisi: ilgilendiğin hizmetler, brif metni ve (paylaşırsan) bütçe aralığı.</li>
          <li>
            İşlem güvenliği: formun kötüye kullanımını önlemek amacıyla IP adresi geçici olarak işlenir; bu bilgi
            form altyapısında kalıcı olarak saklanmaz.
          </li>
        </ul>
        <p>Brif alanına özel nitelikli kişisel veri yazmamanı rica ederiz.</p>
      </section>

      <section>
        <h2>3. İşleme amaçları</h2>
        <ul>
          <li>Talebini değerlendirmek ve sana geri dönüş yapmak,</li>
          <li>Olası bir iş birliği öncesinde görüşme ve teklif süreçlerini yürütmek,</li>
          <li>Form güvenliğini sağlamak, spam ve kötüye kullanımı önlemek.</li>
        </ul>
      </section>

      <section>
        <h2>4. Hukuki sebepler ve toplama yöntemi</h2>
        <p>
          Kişisel verilerin, web sitemizdeki form aracılığıyla elektronik ortamda toplanır ve KVKK md. 5/2-(c)
          “bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması” ile md. 5/2-(f) “veri
          sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması” hukuki sebeplerine dayanılarak
          işlenir. <Confirm value={null} label="hukuki sebeplerin hukukçu tarafından teyidi" />
        </p>
      </section>

      <section>
        <h2>5. Aktarım</h2>
        <p>
          Form içeriği, talebine yanıt verebilmemiz için kullandığımız e-posta veya müşteri ilişkileri yönetimi
          (CRM) hizmet sağlayıcısına ve web sitesinin barındırma sağlayıcısına aktarılır. Bu sağlayıcıların
          sunucuları yurt dışında bulunabilir; bu durumda aktarım KVKK md. 9 kapsamında gerçekleştirilir.{" "}
          <Confirm value={null} label="kullanılan sağlayıcılar, konumları ve yurt dışı aktarım dayanağı" />
        </p>
      </section>

      <section>
        <h2>6. Saklama süresi</h2>
        <p>
          Kişisel verilerin, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen süreler
          kadar saklanır, sonrasında silinir, yok edilir veya anonim hale getirilir.{" "}
          <Confirm value={null} label="somut saklama süresi" />
        </p>
      </section>

      <section>
        <h2>7. Hakların</h2>
        <p>KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak;</p>
        <ul>
          <li>kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
          <li>işlenmişse buna ilişkin bilgi talep etme,</li>
          <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>KVKK md. 7’deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
          <li>düzeltme, silme ve yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme,</li>
          <li>
            işlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhine bir sonucun
            ortaya çıkmasına itiraz etme,
          </li>
          <li>kanuna aykırı işleme sebebiyle zarara uğraman hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p>haklarına sahipsin.</p>
      </section>

      <section>
        <h2>8. Başvuru</h2>
        <p>
          Taleplerini <Confirm value={kvkk.applicationEmail} label="KVKK başvuru e-posta adresi" /> adresine
          e-posta ile veya <Confirm value={kvkk.kepAddress} label="KEP adresi" /> KEP adresine iletebilirsin.
          Başvurular, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak en geç otuz gün
          içinde sonuçlandırılır.
        </p>
        <p>
          Çerezler hakkında bilgi için <Link href="/cerez-politikasi">Çerez Politikası</Link>’nı, genel bilgi
          için <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>’nı inceleyebilirsin.
        </p>
      </section>
    </LegalDocument>
  );
}
