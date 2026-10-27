"use client";

import { useTranslations } from "next-intl";
import { createOrganisation } from "@/app/actions/onboarding";
import { ActionForm } from "@/components/onboarding/action-form";
import { Input, Label } from "@/components/ui/primitives";

const COUNTRY_CODES = ["CM", "NG", "GH", "CI", "KE", "SN", "ZA", "EG", "FR", "DE", "GB", "US", "CN", "AE", "NL"] as const;

export function OrgCreateForm({ defaultIntent = "seller", defaultName = "" }: { defaultIntent?: string; defaultName?: string }) {
  const t = useTranslations("onboarding");
  const countries = useTranslations("countries");

  return (
    <ActionForm action={createOrganisation} submitLabel={t("submitOrg")} className="space-y-4">
      <div>
        <Label htmlFor="legalName">{t("legalName")}</Label>
        <Input id="legalName" name="legalName" required defaultValue={defaultName} autoComplete="organization" />
      </div>
      <div>
        <Label htmlFor="tradingName">{t("tradingName")}</Label>
        <Input id="tradingName" name="tradingName" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="registrationCountry">{t("country")}</Label>
          <select
            id="registrationCountry"
            name="registrationCountry"
            className="h-11 w-full rounded-md border border-line px-3 text-sm"
            defaultValue="CM"
            required
          >
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>
                {countries(code)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="registrationNumber">{t("registrationNumber")}</Label>
          <Input id="registrationNumber" name="registrationNumber" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="contactPhone">{t("contactPhone")}</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" />
        </div>
      </div>
      <div>
        <Label htmlFor="intent">{t("membershipIntent")}</Label>
        <select id="intent" name="intent" className="h-11 w-full rounded-md border border-line px-3 text-sm" defaultValue={defaultIntent}>
          <option value="seller">{t("intentSellerShort")}</option>
          <option value="buyer">{t("intentBuyerShort")}</option>
          <option value="both">{t("intentBothShort")}</option>
        </select>
      </div>
    </ActionForm>
  );
}
