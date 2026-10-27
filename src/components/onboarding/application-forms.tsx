"use client";

import { useTranslations } from "next-intl";
import { submitBuyerApplication, submitSellerApplication, uploadVerificationDocument } from "@/app/actions/onboarding";
import { ActionForm } from "@/components/onboarding/action-form";
import { Input, Label, Textarea } from "@/components/ui/primitives";

const SELLER_DOC_IDS = ["business_registration", "tax_id", "export_licence", "quality_cert"] as const;
const BUYER_DOC_IDS = ["business_registration", "authorised_rep", "trade_reference"] as const;

const SELLER_DOC_KEYS = {
  business_registration: "docBusinessReg",
  tax_id: "docTax",
  export_licence: "docExport",
  quality_cert: "docQuality",
} as const;

const BUYER_DOC_KEYS = {
  business_registration: "docCompanyReg",
  authorised_rep: "docRep",
  trade_reference: "docTradeRef",
} as const;

export function SellerApplicationForm() {
  const t = useTranslations("onboarding");
  return (
    <ActionForm action={submitSellerApplication} submitLabel={t("submitSeller")} className="space-y-4">
      <div>
        <Label htmlFor="industry">{t("industry")}</Label>
        <Input id="industry" name="industry" required placeholder={t("industryPh")} />
      </div>
      <div>
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea id="description" name="description" required placeholder={t("descriptionPh")} />
      </div>
      <div>
        <Label htmlFor="productsOffered">{t("productsOffered")}</Label>
        <Textarea id="productsOffered" name="productsOffered" required />
      </div>
      <div>
        <Label htmlFor="exportExperience">{t("exportExperience")}</Label>
        <Textarea id="exportExperience" name="exportExperience" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="annualCapacity">{t("annualCapacity")}</Label>
          <Input id="annualCapacity" name="annualCapacity" />
        </div>
        <div>
          <Label htmlFor="website">{t("website")}</Label>
          <Input id="website" name="website" type="url" placeholder="https://" />
        </div>
      </div>
      <div>
        <Label htmlFor="certifications">{t("certifications")}</Label>
        <Input id="certifications" name="certifications" />
      </div>
    </ActionForm>
  );
}

export function BuyerApplicationForm() {
  const t = useTranslations("onboarding");
  return (
    <ActionForm action={submitBuyerApplication} submitLabel={t("submitBuyer")} className="space-y-4">
      <div>
        <Label htmlFor="industry">{t("industryShort")}</Label>
        <Input id="industry" name="industry" required />
      </div>
      <div>
        <Label htmlFor="description">{t("companyDesc")}</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="targetCommodities">{t("targetCommodities")}</Label>
        <Textarea id="targetCommodities" name="targetCommodities" required />
      </div>
      <div>
        <Label htmlFor="sourcingRegions">{t("sourcingRegions")}</Label>
        <Input id="sourcingRegions" name="sourcingRegions" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="annualVolume">{t("annualVolume")}</Label>
          <Input id="annualVolume" name="annualVolume" />
        </div>
        <div>
          <Label htmlFor="website">{t("website")}</Label>
          <Input id="website" name="website" type="url" placeholder="https://" />
        </div>
      </div>
      <div>
        <Label htmlFor="authorisedRepresentative">{t("authorisedRep")}</Label>
        <Input id="authorisedRepresentative" name="authorisedRepresentative" required />
      </div>
    </ActionForm>
  );
}

export function DocumentUploadForm({ caseId, kind }: { caseId: string; kind: "seller" | "buyer" }) {
  const t = useTranslations("onboarding");
  const ids = kind === "seller" ? SELLER_DOC_IDS : BUYER_DOC_IDS;
  const keyMap = kind === "seller" ? SELLER_DOC_KEYS : BUYER_DOC_KEYS;

  return (
    <ActionForm
      action={uploadVerificationDocument}
      submitLabel={t("uploadDoc")}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <Label htmlFor="docType">{t("docType")}</Label>
        <select id="docType" name="docType" className="h-11 w-full rounded-md border border-line px-3 text-sm" required>
          {ids.map((id) => (
            <option key={id} value={id}>
              {t(keyMap[id as keyof typeof keyMap])}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="file">{t("fileLabel")}</Label>
        <Input id="file" name="file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" required />
      </div>
    </ActionForm>
  );
}
