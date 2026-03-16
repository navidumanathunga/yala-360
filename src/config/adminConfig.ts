/**
 * YALA360 — Admin Configuration
 * ─────────────────────────────
 * Add or remove admin email addresses in the list below.
 * Only accounts with these emails can access the Admin Portal.
 *
 * HOW TO ADD A NEW ADMIN:
 *   1. Add their email address to the ADMIN_EMAILS array below.
 *   2. Save the file.
 *   3. Commit & push to GitHub (git add . && git commit -m "add admin email" && git push)
 */

export const ADMIN_EMAILS: string[] = [
  'vimukthiubeysekera@gmail.com',
  'vimukthi116119@gmail.com',
  'admin@yala360.com',
  // 'newadmin@example.com',   ← add more here
];

/** Returns true if the given email is on the admin list */
export function isAdminEmail(email: string | null | undefined): boolean {
  return ADMIN_EMAILS.includes(email ?? '');
}
