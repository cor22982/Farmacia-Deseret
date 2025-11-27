// Admin authentication utility
const ADMIN_PASSWORD = "admin123"

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function getAdminPasswordHint(): string {
  return "Hint: Common default password"
}
