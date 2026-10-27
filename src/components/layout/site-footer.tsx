import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const c = await getTranslations("common");
  const n = await getTranslations("nav");

  const cols: [string, [string, string][]][] = [
    [
      t("ecosystem"),
      [
        [t("insightsBrand"), "/insights"],
        [t("marketplaceMembers"), "/marketplace"],
        [t("verify"), "/how-it-works"],
        [t("tradeServices"), "/how-it-works"],
      ],
    ],
    [
      n("markets"),
      [
        [n("africanMarkets"), "/markets"],
        [n("commodities"), "/commodities"],
        [t("products"), "/products"],
        [n("tradeOpportunities"), "/trade-opportunities"],
      ],
    ],
    [
      n("membership"),
      [
        [t("overview"), "/membership"],
        [n("forSellers"), "/membership/sellers"],
        [n("forBuyers"), "/membership/buyers"],
        [t("apply"), "/register"],
      ],
    ],
    [
      t("company"),
      [
        [t("aboutShort"), "/about"],
        [n("howItWorks"), "/how-it-works"],
        [c("contact"), "/contact"],
        [c("login"), "/login"],
      ],
    ],
  ];

  return (
    <footer className="bg-brand-blue-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-6 lg:px-8">
        <div className="lg:col-span-2">
          <div className="inline-block rounded-lg bg-white px-3 py-2">
            <Image src="/brand/corgania-logo.png" alt="Corgania" width={300} height={120} className="h-14 w-auto" />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">{t("tagline")}</p>
          <p className="mt-4 text-xs text-white/50">{t("launchMarket")}</p>
          <div className="mt-5">
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
        {cols.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
            <ul className="mt-4 space-y-2.5">
              {links.map(([l, h]) => (
                <li key={h + l}>
                  <Link href={h} className="text-sm text-white/75 hover:text-white">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{c("allRights", { year: new Date().getFullYear() })}</p>
          <p>{c("marketplaceRestricted")}</p>
        </div>
      </div>
    </footer>
  );
}
