import fs from "fs";

const pricing = {
  en: {
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple membership. One organisation fee.",
    pricingLead:
      "Seller, buyer, or both — USD 599 per organisation per year after Corgania Verify approval. Founding Members receive six months free.",
    foundersName: "Founder's Plan",
    foundersPrice: "USD 0",
    foundersPeriod: "first 6 months after approval",
    foundersBody:
      "For organisations approved during our founding window (through 25 Oct 2027). Full marketplace access after Verify. Then converts to Standard Annual.",
    foundersBadge: "Founding Member",
    standardName: "Standard Annual",
    standardPrice: "USD 599",
    standardPeriod: "per organisation / year",
    standardBody:
      "Same access for sellers, buyers, or both. One fee per organisation — not per user. Registration alone never grants trading access.",
    noteVerify: "Membership is approved through Corgania Verify. Payment does not replace verification.",
  },
  fr: {
    pricingEyebrow: "Tarifs",
    pricingTitle: "Adhésion simple. Un forfait par organisation.",
    pricingLead:
      "Vendeur, acheteur ou les deux — 599 USD par organisation et par an après approbation Corgania Verify. Les membres fondateurs bénéficient de six mois gratuits.",
    foundersName: "Offre Fondateur",
    foundersPrice: "0 USD",
    foundersPeriod: "6 premiers mois après approbation",
    foundersBody:
      "Pour les organisations approuvées pendant la fenêtre de fondation (jusqu'au 25 oct. 2027). Accès marketplace complet après Verify. Puis passage à l'annuel standard.",
    foundersBadge: "Membre fondateur",
    standardName: "Annuel standard",
    standardPrice: "599 USD",
    standardPeriod: "par organisation / an",
    standardBody:
      "Même accès pour vendeurs, acheteurs ou les deux. Un forfait par organisation — pas par utilisateur. L'inscription seule ne donne jamais accès au commerce.",
    noteVerify: "L'adhésion est approuvée via Corgania Verify. Le paiement ne remplace pas la vérification.",
  },
  es: {
    pricingEyebrow: "Precios",
    pricingTitle: "Membresía simple. Una tarifa por organización.",
    pricingLead:
      "Vendedor, comprador o ambos — 599 USD por organización al año tras la aprobación de Corgania Verify. Los miembros fundadores reciben seis meses gratis.",
    foundersName: "Plan Fundador",
    foundersPrice: "USD 0",
    foundersPeriod: "primeros 6 meses tras la aprobación",
    foundersBody:
      "Para organizaciones aprobadas durante la ventana de fundación (hasta el 25 oct 2027). Acceso completo al marketplace tras Verify. Luego pasa al Anual estándar.",
    foundersBadge: "Miembro fundador",
    standardName: "Anual estándar",
    standardPrice: "USD 599",
    standardPeriod: "por organización / año",
    standardBody:
      "El mismo acceso para vendedores, compradores o ambos. Una tarifa por organización — no por usuario. El registro solo nunca otorga acceso comercial.",
    noteVerify: "La membresía se aprueba con Corgania Verify. El pago no sustituye la verificación.",
  },
  de: {
    pricingEyebrow: "Preise",
    pricingTitle: "Einfache Mitgliedschaft. Eine Gebühr pro Organisation.",
    pricingLead:
      "Verkäufer, Käufer oder beides — 599 USD pro Organisation und Jahr nach Corgania-Verify-Genehmigung. Gründungsmitglieder erhalten sechs Monate kostenlos.",
    foundersName: "Founder's Plan",
    foundersPrice: "USD 0",
    foundersPeriod: "erste 6 Monate nach Genehmigung",
    foundersBody:
      "Für Organisationen, die im Gründungsfenster genehmigt werden (bis 25. Okt. 2027). Voller Marketplace-Zugang nach Verify. Danach Standard Annual.",
    foundersBadge: "Gründungsmitglied",
    standardName: "Standard Annual",
    standardPrice: "USD 599",
    standardPeriod: "pro Organisation / Jahr",
    standardBody:
      "Gleicher Zugang für Verkäufer, Käufer oder beides. Eine Gebühr pro Organisation — nicht pro Nutzer. Die Registrierung allein gewährt nie Handelszugang.",
    noteVerify: "Mitgliedschaft wird über Corgania Verify genehmigt. Zahlung ersetzt keine Verifizierung.",
  },
  zh: {
    pricingEyebrow: "价格",
    pricingTitle: "简单会员。按组织收费。",
    pricingLead:
      "卖家、买家或两者——经 Corgania Verify 批准后，每组织每年 599 美元。创始会员享六个月免费。",
    foundersName: "创始计划",
    foundersPrice: "0 美元",
    foundersPeriod: "获批后前 6 个月",
    foundersBody:
      "适用于创始窗口期内获批的组织（至 2027 年 10 月 25 日）。Verify 后享完整市场准入，随后转为标准年费。",
    foundersBadge: "创始会员",
    standardName: "标准年费",
    standardPrice: "599 美元",
    standardPeriod: "每组织 / 年",
    standardBody:
      "卖家、买家或两者享有相同准入。按组织收费——非按用户。仅注册绝不授予交易权限。",
    noteVerify: "会员资格经 Corgania Verify 批准。付款不能替代核实。",
  },
};

for (const [loc, vals] of Object.entries(pricing)) {
  const p = new URL(`../messages/${loc}.json`, import.meta.url);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  Object.assign(j.membership, vals);
  fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
  console.log("pricing", loc);
}
