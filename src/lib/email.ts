// Thin wrapper around the Resend SDK.
// Keeping send logic here means the cron route stays clean and
// the email template is easy to update without touching API code.

import { Resend } from 'resend'

// Resend client — initialized lazily so the module can be imported
// in environments where RESEND_API_KEY might not be set (e.g. CI).
let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

export interface ReminderEmailPayload {
  to:       string
  name:     string | null
  company:  string
  role:     string
  status:   string
  daysSinceUpdate: number
}

const STATUS_LABELS: Record<string, string> = {
  WISHLIST: 'Wishlist', APPLIED: 'Applied', PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected',
}

export async function sendReminderEmail(payload: ReminderEmailPayload) {
  const { to, name, company, role, status, daysSinceUpdate } = payload
  const label   = STATUS_LABELS[status] ?? status
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi,'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      <div style="width:36px;height:36px;background:#eff6ff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">💼</div>
      <span style="font-weight:700;font-size:18px;color:#1e3a5f">JobTrack</span>
    </div>
    <p style="margin:0 0 8px;color:#374151">${greeting}</p>
    <p style="margin:0 0 20px;color:#374151">
      It's been <strong>${daysSinceUpdate} days</strong> since you last updated your application to
      <strong>${company}</strong> for the <strong>${role}</strong> role.
    </p>
    <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Current stage</p>
      <p style="margin:0;font-weight:600;color:#1e293b">${label}</p>
    </div>
    <p style="margin:0 0 24px;color:#374151">
      Consider following up with the recruiter or updating your board.
    </p>
    <a href="${process.env.NEXTAUTH_URL ?? 'https://jobtrack-sandy.vercel.app'}"
       style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px">
      Open JobTrack →
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
      You're receiving this because you set a follow-up reminder on this application.
      Open the card and clear the date to stop reminders for this role.
    </p>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from:    'JobTrack <reminders@yourdomain.com>',   // replace with your verified domain
    to,
    subject: `⏰ Follow up: ${role} at ${company}`,
    html,
  })
}
