import type { Metadata } from "next";
import Link from "next/link";
import { Confirm, LegalDocument } from "@/components/LegalDocument";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gizlilik Politikası",
  description:
    "Haters Marketing web sitesinde hangi bilgilerin toplandığı, nasıl kullanıldığı ve nasıl korunduğu hakkında gizlilik politikası.",
  path: "/gizlilik-politikasi",
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Gizlilik Politikası"
      intro={
        <p>
          Bu sitede yalnızca işimizi yapmak için gereken bilgiyi isteriz. Bu sayfa, hangi bilgiyi neden
          topladığımızı ve onu nasıl koruduğumuzu sade bir dille anlatır.
        </p>
      }
    >
      <section>
        <h2>Kim olduğumuz</h2>
        <p>
          Bu site <Confirm value={site.legalName} label="ticaret unvanı" /> tarafından işletilir. Kişisel
          verilerin işlenmesine ilişkin ayrıntılı bilgi{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>’nde yer alır.
        </p>
      </section>

      <section>
        <h2>Topladığımız bilgiler</h2>
        <ul>
          <li>
            <strong>İletişim formu:</strong> ad soyad, şirket/marka adı, e-posta, (isteğe bağlı) telefon ve web
            sitesi, ilgilendiğin hizmetler, brif metni ve (isteğe bağlı) bütçe aralığı.
          </li>
          <li>
            <strong>Teknik veriler:</strong> sitenin güvenli çalışması için barındırma sağlayıcısının tuttuğu
            standart sunucu kayıtları (IP adresi, tarayıcı türü, ziyaret zamanı).
          </li>
          <li>
            <strong>Ölçüm verileri:</strong> yalnızca analitik çerezlere onay verirsen ve sitede bir analitik
            aracı etkinse. Ayrıntılar <Link href="/cerez-politikasi">Çerez Politikası</Link>’nda.
          </li>
        </ul>
      </section>

      <section>
        <h2>Bilgileri nasıl kullanıyoruz</h2>
        <p>
          Form bilgilerini yalnızca talebine yanıt vermek ve olası bir iş birliğini konuşmak için kullanırız.
          Bilgilerini satmayız, reklam amaçlı üçüncü kişilerle paylaşmayız ve izin vermediğin sürece sana
          pazarlama e-postası göndermeyiz.
        </p>
      </section>

      <section>
        <h2>Paylaşım ve hizmet sağlayıcılar</h2>
        <p>
          Form içeriği, sana dönebilmemiz için kullandığımız e-posta veya CRM hizmetine iletilir. Site, bir
          barındırma sağlayıcısında çalışır. <Confirm value={null} label="kullanılan sağlayıcıların listesi" />
        </p>
      </section>

      <section>
        <h2>Güvenlik</h2>
        <p>
          Site HTTPS üzerinden yayınlanır; form verileri şifreli bağlantıyla iletilir. Form, spam ve kötüye
          kullanıma karşı sunucu tarafında doğrulama ve istek sınırlaması ile korunur. Hiçbir sistem kusursuz
          değildir; bir güvenlik sorunu fark edersen bize bildirmeni rica ederiz.
        </p>
      </section>

      <section>
        <h2>Değişiklikler ve iletişim</h2>
        <p>
          Bu politikayı güncelleyebiliriz; güncel sürüm her zaman bu sayfada yer alır. Sorularını{" "}
          <Confirm value={site.contact.email} label="iletişim e-postası" /> adresine iletebilirsin.
        </p>
      </section>
    </LegalDocument>
  );
}
