/** Transactional email boundary — never silently claims delivery. */
export async function sendEmail(msg: {
  to: string;
  subject: string;
  body?: string;
  html?: string;
  text?: string;
}): Promise<{ delivered: boolean; reason: string }> {
  const text = msg.text ?? msg.body ?? "";
  const html = msg.html;

  if (!process.env.EMAIL_PROVIDER || !process.env.EMAIL_API_KEY) {
    console.info("[email:not-configured]", msg.to, msg.subject);
    return { delivered: false, reason: "No email provider configured; message recorded in-app only." };
  }

  const provider = process.env.EMAIL_PROVIDER.toLowerCase();
  const from = process.env.EMAIL_FROM || "Corgania <noreply@corgania.com>";

  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [msg.to],
          subject: msg.subject,
          html: html ?? `<pre style="font-family:sans-serif">${escapeHtml(text)}</pre>`,
          text: text || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[email:resend]", res.status, err);
        return { delivered: false, reason: `Resend error ${res.status}` };
      }
      return { delivered: true, reason: "sent" };
    }

    console.info("[email:unsupported-provider]", provider, msg.to, msg.subject);
    return { delivered: false, reason: `Unsupported EMAIL_PROVIDER: ${provider}` };
  } catch (e) {
    console.error("[email:error]", e);
    return { delivered: false, reason: e instanceof Error ? e.message : "send failed" };
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
