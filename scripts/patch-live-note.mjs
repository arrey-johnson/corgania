import fs from "fs";

const dir = new URL("../messages/", import.meta.url);
const patches = {
  fr: {
    liveNote:
      "L'offre et les prix au niveau membre ne sont visibles que dans la marketplace réservée aux membres approuvés. L'intelligence matières premières publique pour ce marché apparaîtra sur le",
    liveNoteAfter:
      "une fois qu'une source de données sous licence est connectée, avec attribution complète de la source.",
  },
  es: {
    liveNote:
      "La oferta y los precios a nivel de miembro solo son visibles dentro del marketplace para miembros aprobados. La inteligencia pública de materias primas para este mercado aparecerá en el",
    liveNoteAfter:
      "una vez que se conecte una fuente de datos con licencia, con atribución completa de la fuente.",
  },
  de: {
    liveNote:
      "Live-Angebot und Preise auf Mitgliedsebene sind nur im Marketplace für genehmigte Mitglieder sichtbar. Öffentliche Rohstoffintelligence für diesen Markt erscheint auf dem",
    liveNoteAfter:
      "sobald eine lizenzierte Datenquelle verbunden ist — mit vollständiger Quellenangabe.",
  },
  zh: {
    liveNote:
      "会员级实时供应与价格仅在获批会员市场内可见。该市场的公开大宗商品情报将显示在",
    liveNoteAfter: "一旦接入授权数据源，并完整注明出处。",
  },
};

for (const [loc, vals] of Object.entries(patches)) {
  const p = new URL(`${loc}.json`, dir);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.markets.liveNote = vals.liveNote;
  j.markets.liveNoteAfter = vals.liveNoteAfter;
  fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
  console.log("patched", loc);
}
