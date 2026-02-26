import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL}`
  : "http://localhost:3000";

export async function sendInviteEmail(params: {
  to: string;
  teamName: string;
  inviterName?: string;
  joinUrl: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set – invite email skipped");
    return { ok: false, skipped: true };
  }

  const { to, teamName, inviterName, joinUrl } = params;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Flux CRM <onboarding@resend.dev>";
  const ownerEmail = process.env.FLUX_OWNER_EMAIL || "shopifydevelopment0@gmail.com";

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    replyTo: ownerEmail,
    subject: `You're invited to join ${teamName} on Flux CRM`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">You're invited to Flux CRM</h2>
        <p>${inviterName ? `${inviterName} has invited you` : "You have been invited"} to join <strong>${teamName}</strong> on Flux CRM.</p>
        <p>Click the button below to join the team and get started:</p>
        <p style="margin: 24px 0;">
          <a href="${joinUrl}" style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Join ${teamName}</a>
        </p>
        <p style="color: #64748b; font-size: 14px;">This link expires in 7 days. If you didn't expect this invite, you can ignore this email.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Flux CRM – Team work management</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    const message = error?.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
    return { ok: false, error: message };
  }
  return { ok: true, data };
}
