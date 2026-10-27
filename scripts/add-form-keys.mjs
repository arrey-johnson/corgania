import fs from "fs";

const extras = {
  en: {
    targetCommodities: "Target commodities",
    authorisedRep: "Authorised representative",
    companyDesc: "Company description",
    industryShort: "Industry",
  },
  fr: {
    targetCommodities: "Matières premières cibles",
    authorisedRep: "Représentant autorisé",
    companyDesc: "Description de l'entreprise",
    industryShort: "Industrie",
  },
  es: {
    targetCommodities: "Materias primas objetivo",
    authorisedRep: "Representante autorizado",
    companyDesc: "Descripción de la empresa",
    industryShort: "Industria",
  },
  de: {
    targetCommodities: "Ziel-Rohstoffe",
    authorisedRep: "Bevollmächtigter Vertreter",
    companyDesc: "Unternehmensbeschreibung",
    industryShort: "Branche",
  },
  zh: {
    targetCommodities: "目标大宗商品",
    authorisedRep: "授权代表",
    companyDesc: "公司简介",
    industryShort: "行业",
  },
};

for (const [loc, vals] of Object.entries(extras)) {
  const p = new URL(`../messages/${loc}.json`, import.meta.url);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  Object.assign(j.onboarding, vals);
  fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
  console.log("form keys", loc);
}
