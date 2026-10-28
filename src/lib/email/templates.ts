import { env } from "@/lib/env";

const BRAND_BLUE = "#123b7a";
const BRAND_RED = "#dc2626";
const INK = "#0f1c2e";
const MUTED = "#44536a";
const LINE = "#dbe2ec";
const SURFACE = "#f6f8fb";

function siteUrl() {
  return (env.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://corgania.com").replace(/\/$/, "");
}

function layout(opts: { preview: string; title: string; bodyHtml: string; ctaLabel?: string; ctaHref?: string }) {
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<p style="margin:28px 0 0;">
          <a href="${opts.ctaHref}" style="display:inline-block;background:${BRAND_RED};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:6px;">
            ${opts.ctaLabel}
          </a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preview}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${SURFACE};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND_BLUE};padding:22px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:700;">Corgania</p>
              <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:22px;color:#ffffff;font-weight:600;">${opts.title}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:${INK};font-size:15px;line-height:1.6;">
              ${opts.bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid ${LINE};background:${SURFACE};font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};line-height:1.5;">
              Private membership-based B2B trading · Verified African producers · Qualified global buyers<br/>
              <a href="${siteUrl()}" style="color:${BRAND_BLUE};text-decoration:none;">corgania.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type EmailPayload = { subject: string; html: string; text: string };

export function welcomeEmail(opts: { fullName: string; organisationName?: string }): EmailPayload {
  const name = opts.fullName || "there";
  const org = opts.organisationName ? ` for <strong>${escapeHtml(opts.organisationName)}</strong>` : "";
  return {
    subject: "Welcome to Corgania",
    text: `Welcome to Corgania, ${name}. Your account is ready. Complete onboarding to begin Corgania Verify.`,
    html: layout({
      preview: "Your Corgania account is ready. Complete onboarding to begin verification.",
      title: "Welcome to Corgania",
      bodyHtml: `<p style="margin:0 0 14px;">Hello ${escapeHtml(name)},</p>
        <p style="margin:0 0 14px;">Thank you for joining Corgania${org}. Your account is set up. Marketplace access opens only after Corgania Verify approval.</p>
        <p style="margin:0;">Next step: create your organisation profile and submit your seller or buyer application.</p>`,
      ctaLabel: "Continue onboarding",
      ctaHref: `${siteUrl()}/en/onboarding`,
    }),
  };
}

export function verificationDecisionEmail(opts: {
  organisationName: string;
  decision: "approved" | "rejected";
  kind: string;
  notes?: string;
  planLabel?: string;
}): EmailPayload {
  const approved = opts.decision === "approved";
  const subject = approved
    ? `Membership approved — ${opts.organisationName}`
    : `Application decision — ${opts.organisationName}`;
  const notes = opts.notes
    ? `<p style="margin:14px 0 0;padding:12px 14px;background:${SURFACE};border-left:3px solid ${BRAND_BLUE};color:${MUTED};font-size:14px;">${escapeHtml(opts.notes)}</p>`
    : "";
  const plan = approved && opts.planLabel
    ? `<p style="margin:14px 0 0;">Plan activated: <strong>${escapeHtml(opts.planLabel)}</strong>.</p>`
    : "";

  return {
    subject,
    text: approved
      ? `Your ${opts.kind} membership for ${opts.organisationName} has been approved.${opts.planLabel ? ` Plan: ${opts.planLabel}.` : ""}`
      : `Your ${opts.kind} application for ${opts.organisationName} was not approved.`,
    html: layout({
      preview: approved ? "Your Corgania membership is approved." : "Update on your Corgania application.",
      title: approved ? "Membership approved" : "Application decision",
      bodyHtml: `<p style="margin:0 0 14px;">Regarding <strong>${escapeHtml(opts.organisationName)}</strong> (${escapeHtml(opts.kind)}):</p>
        <p style="margin:0;">${
          approved
            ? "Corgania Verify has approved your membership. You can now access the members-only marketplace."
            : "Corgania Verify has declined this application. You may review the notes and contact support if you need clarification."
        }</p>
        ${plan}
        ${notes}`,
      ctaLabel: approved ? "Open marketplace" : "View application status",
      ctaHref: approved ? `${siteUrl()}/en/marketplace` : `${siteUrl()}/en/onboarding/status`,
    }),
  };
}

export function verificationStatusEmail(opts: {
  organisationName: string;
  statusLabel: string;
  detail?: string;
}): EmailPayload {
  return {
    subject: `Verification update — ${opts.organisationName}`,
    text: `Verification status for ${opts.organisationName}: ${opts.statusLabel}. ${opts.detail ?? ""}`,
    html: layout({
      preview: `Verification update for ${opts.organisationName}`,
      title: "Verification update",
      bodyHtml: `<p style="margin:0 0 14px;">Your case for <strong>${escapeHtml(opts.organisationName)}</strong> is now:</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND_BLUE};">${escapeHtml(opts.statusLabel)}</p>
        ${opts.detail ? `<p style="margin:14px 0 0;color:${MUTED};">${escapeHtml(opts.detail)}</p>` : ""}`,
      ctaLabel: "View status",
      ctaHref: `${siteUrl()}/en/onboarding/status`,
    }),
  };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
