"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/shared/info-page";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/primitives";
import { contactSchema } from "@/lib/validation/schemas";

export default function Page() {
  const t = useTranslations("contact");
  const [state, setState] = useState<"idle" | "error" | "sent">("idle");
  const [msg, setMsg] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      setState("error");
      setMsg(parsed.error.issues[0]?.message ?? t("formError"));
      return;
    }
    setState("sent");
    setMsg(t("thanks"));
  }

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="max-w-xl p-8">
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="email">{t("workEmail")}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="company">{t("company")}</Label>
              <Input id="company" name="company" autoComplete="organization" />
            </div>
            <div>
              <Label htmlFor="message">{t("message")}</Label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
              />
            </div>
            {state !== "idle" && (
              <p role="alert" className={state === "error" ? "text-sm font-medium text-brand-red" : "text-sm text-slate-body"}>
                {msg}
              </p>
            )}
            <Button type="submit" variant="red" className="w-full">
              {t("send")}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
