/** Transactional email boundary — never silently claims delivery. */
export async function sendEmail(msg: { to: string; subject: string; body: string }): Promise<{ delivered: boolean; reason: string }> {
  if (!process.env.EMAIL_PROVIDER || !process.env.EMAIL_API_KEY) {
    console.info("[email:not-configured]", msg.to, msg.subject);
    return { delivered: false, reason: "No email provider configured; message recorded in-app only." };
  }
  // TODO: implement contracted provider (Resend/Postmark) server-side.
  return { delivered: false, reason: "Email provider adapter not yet implemented." };
}
