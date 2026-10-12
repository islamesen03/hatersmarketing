import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1 },
    { path: "/hizmetler", priority: 0.9 },
    ...services.map((service) => ({ path: `/hizmetler/${service.slug}`, priority: 0.8 })),
    { path: "/yaklasimimiz", priority: 0.7 },
    { path: "/islerimiz", priority: 0.6 },
    { path: "/hakkimizda", priority: 0.6 },
    { path: "/iletisim", priority: 0.8 },
    { path: "/gizlilik-politikasi", priority: 0.2 },
    { path: "/cerez-politikasi", priority: 0.2 },
    { path: "/kvkk-aydinlatma-metni", priority: 0.2 },
  ];
  return pages.map(({ path, priority }) => ({ url: absoluteUrl(path), changeFrequency: "monthly", priority }));
}
