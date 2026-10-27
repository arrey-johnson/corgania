export const SELLER_DOC_TYPES = [
  { id: "business_registration", label: "Business registration certificate" },
  { id: "tax_id", label: "Tax / TIN certificate" },
  { id: "export_licence", label: "Export licence (if applicable)" },
  { id: "quality_cert", label: "Quality / certification evidence" },
] as const;

export const BUYER_DOC_TYPES = [
  { id: "business_registration", label: "Company registration" },
  { id: "authorised_rep", label: "Authorised representative proof" },
  { id: "trade_reference", label: "Trade reference or bank letter" },
] as const;

export const ALLOWED_DOC_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
export const MAX_DOC_BYTES = 20 * 1024 * 1024;
