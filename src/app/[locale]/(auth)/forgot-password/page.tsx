import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("pageForgot") };
}

export default function Page() {
  return <AuthForm mode="forgot" />;
}
