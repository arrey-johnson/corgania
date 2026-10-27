import fs from "fs";

const countries = {
  en: {
    CM: "Cameroon",
    NG: "Nigeria",
    GH: "Ghana",
    CI: "Côte d'Ivoire",
    KE: "Kenya",
    SN: "Senegal",
    ZA: "South Africa",
    EG: "Egypt",
    FR: "France",
    DE: "Germany",
    GB: "United Kingdom",
    US: "United States",
    CN: "China",
    AE: "United Arab Emirates",
    NL: "Netherlands",
  },
  fr: {
    CM: "Cameroun",
    NG: "Nigéria",
    GH: "Ghana",
    CI: "Côte d'Ivoire",
    KE: "Kenya",
    SN: "Sénégal",
    ZA: "Afrique du Sud",
    EG: "Égypte",
    FR: "France",
    DE: "Allemagne",
    GB: "Royaume-Uni",
    US: "États-Unis",
    CN: "Chine",
    AE: "Émirats arabes unis",
    NL: "Pays-Bas",
  },
  es: {
    CM: "Camerún",
    NG: "Nigeria",
    GH: "Ghana",
    CI: "Costa de Marfil",
    KE: "Kenia",
    SN: "Senegal",
    ZA: "Sudáfrica",
    EG: "Egipto",
    FR: "Francia",
    DE: "Alemania",
    GB: "Reino Unido",
    US: "Estados Unidos",
    CN: "China",
    AE: "Emiratos Árabes Unidos",
    NL: "Países Bajos",
  },
  de: {
    CM: "Kamerun",
    NG: "Nigeria",
    GH: "Ghana",
    CI: "Côte d'Ivoire",
    KE: "Kenia",
    SN: "Senegal",
    ZA: "Südafrika",
    EG: "Ägypten",
    FR: "Frankreich",
    DE: "Deutschland",
    GB: "Vereinigtes Königreich",
    US: "Vereinigte Staaten",
    CN: "China",
    AE: "Vereinigte Arabische Emirate",
    NL: "Niederlande",
  },
  zh: {
    CM: "喀麦隆",
    NG: "尼日利亚",
    GH: "加纳",
    CI: "科特迪瓦",
    KE: "肯尼亚",
    SN: "塞内加尔",
    ZA: "南非",
    EG: "埃及",
    FR: "法国",
    DE: "德国",
    GB: "英国",
    US: "美国",
    CN: "中国",
    AE: "阿拉伯联合酋长国",
    NL: "荷兰",
  },
};

const extras = {
  en: {
    registrationNumber: "Registration number",
    contactEmail: "Contact email",
    contactPhone: "Contact phone",
    membershipIntent: "Membership intent",
    intentSellerShort: "Seller / exporter",
    intentBuyerShort: "Buyer",
    intentBothShort: "Both buyer & seller",
  },
  fr: {
    registrationNumber: "Numéro d'enregistrement",
    contactEmail: "E-mail de contact",
    contactPhone: "Téléphone de contact",
    membershipIntent: "Intention d'adhésion",
    intentSellerShort: "Vendeur / exportateur",
    intentBuyerShort: "Acheteur",
    intentBothShort: "Acheteur et vendeur",
  },
  es: {
    registrationNumber: "Número de registro",
    contactEmail: "Correo de contacto",
    contactPhone: "Teléfono de contacto",
    membershipIntent: "Intención de membresía",
    intentSellerShort: "Vendedor / exportador",
    intentBuyerShort: "Comprador",
    intentBothShort: "Comprador y vendedor",
  },
  de: {
    registrationNumber: "Registrierungsnummer",
    contactEmail: "Kontakt-E-Mail",
    contactPhone: "Kontakttelefon",
    membershipIntent: "Mitgliedschaftsziel",
    intentSellerShort: "Verkäufer / Exporteur",
    intentBuyerShort: "Käufer",
    intentBothShort: "Käufer und Verkäufer",
  },
  zh: {
    registrationNumber: "注册号",
    contactEmail: "联系邮箱",
    contactPhone: "联系电话",
    membershipIntent: "会员意向",
    intentSellerShort: "卖家 / 出口商",
    intentBuyerShort: "买家",
    intentBothShort: "买家与卖家",
  },
};

for (const loc of Object.keys(countries)) {
  const p = new URL(`../messages/${loc}.json`, import.meta.url);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.countries = countries[loc];
  Object.assign(j.onboarding, extras[loc]);
  // ensure liveNoteAfter on en
  if (loc === "en" && j.markets && !j.markets.liveNoteAfter) {
    j.markets.liveNoteAfter =
      "once a licensed data source is connected, with full source attribution.";
  }
  fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
  console.log("countries+", loc);
}
