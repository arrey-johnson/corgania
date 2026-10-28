"use server";

import { welcomeEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/providers/email";

/** Fire-and-forget welcome after successful registration (non-blocking for the client). */
export async function sendWelcomeNotification(input: {
  email: string;
  fullName: string;
  organisationName?: string;
}): Promise<{ ok: boolean }> {
  try {
    const tpl = welcomeEmail({
      fullName: input.fullName,
      organisationName: input.organisationName,
    });
    await sendEmail({
      to: input.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
