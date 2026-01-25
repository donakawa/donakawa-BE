export type WishitemType = "AUTO" | "MANUAL";
export function isWishitemType(v: unknown): v is WishitemType {
  return v === "AUTO" || v === "MANUAL";
}
export type WishitemStatus = "WISHLISTED" | "DROPPED" | "BOUGHT";
export function isWishitemStatus(v: unknown): v is WishitemStatus {
  return v === "WISHLISTED" || v === "DROPPED" || v === "BOUGHT";
}
