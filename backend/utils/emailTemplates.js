import { config } from "../config/env.js";

// Names come from users. Escape them before putting them in HTML so nobody can inject markup into an email.
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const clientUrl = config.clientOrigins[0];

const layout = (title, body) => `<!doctype html>
<html><body style="margin:0;background:#faf8f4;font-family:Arial,sans-serif;color:#1e293b">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <tr><td style="background:#124238;padding:24px 32px;color:#fff;font-size:22px;font-weight:bold">EstateHub</td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:22px">${title}</h1>
        ${body}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

const button = (href, label) =>
  `<p style="margin:28px 0"><a href="${esc(href)}" style="background:#156451;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">${esc(label)}</a></p>`;

export const welcomeCustomerEmail = (user) => ({
  subject: "Welcome to EstateHub",
  text: `Hi ${user.name}, welcome to EstateHub! Browse properties at ${clientUrl}/properties`,
  html: layout(
    `Welcome, ${esc(user.name)}!`,
    `<p>Your customer account is ready. You can now browse properties and send inquiries straight to agencies.</p>${button(`${clientUrl}/properties`, "Browse properties")}`
  ),
});

export const welcomeAgencyEmail = (user, tenant) => ({
  subject: `Your agency workspace "${tenant.name}" is ready`,
  text: `Hi ${user.name}, your agency workspace ${tenant.name} is ready. Dashboard: ${clientUrl}/dashboard`,
  html: layout(
    `Your agency workspace is ready`,
    `<p>Hi ${esc(user.name)}, <strong>${esc(tenant.name)}</strong> now has its own private workspace.</p>
     <p>Next steps: add your first property, then invite your agents from the Team page.</p>
     ${button(`${clientUrl}/dashboard`, "Open dashboard")}
     <p style="color:#64748b;font-size:13px">Your public page: ${esc(clientUrl)}/agency/${esc(tenant.slug)}</p>`
  ),
});

export const teamInviteEmail = (member, tenant, invitedBy) => ({
  subject: `${invitedBy.name} added you to ${tenant.name} on EstateHub`,
  text: `Hi ${member.name}, ${invitedBy.name} added you to ${tenant.name} as ${member.role}. Log in at ${clientUrl}/login`,
  html: layout(
    `You've been added to ${esc(tenant.name)}`,
    `<p>Hi ${esc(member.name)}, ${esc(invitedBy.name)} created an account for you as <strong>${esc(member.role.replace("_", " "))}</strong>.</p>
     <p>Log in with this email address and the temporary password your admin shared with you, then change it.</p>
     ${button(`${clientUrl}/login`, "Log in")}`
  ),
});

export const newInquiryEmail = ({ recipientName, customerName, propertyTitle, message }) => ({
  subject: `New inquiry about "${propertyTitle}"`,
  text: `${customerName} asked about ${propertyTitle}: ${message}`,
  html: layout(
    `New inquiry`,
    `<p>Hi ${esc(recipientName)}, <strong>${esc(customerName)}</strong> is interested in <strong>${esc(propertyTitle)}</strong>:</p>
     <blockquote style="margin:16px 0;padding:12px 16px;background:#f1f5f9;border-radius:8px">${esc(message)}</blockquote>
     ${button(`${clientUrl}/dashboard/inquiries`, "Reply in your inbox")}`
  ),
});