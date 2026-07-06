export function maskUsername(username: string) {
  if (!username) return "";
  if (username.length <= 2) {
    return username[0] + "*".repeat(Math.max(0, username.length - 1));
  }
  return username.slice(0, 2) + "******";
}
