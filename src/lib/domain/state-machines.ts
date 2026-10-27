/** Pure domain state machines — the single source of truth, mirrored by DB enums. Unit-tested. */
export const ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  inquiry: ["quotation", "cancelled"],
  quotation: ["negotiation", "accepted", "cancelled"],
  negotiation: ["accepted", "cancelled"],
  accepted: ["ordered", "cancelled"],
  ordered: ["documentation", "cancelled"],
  documentation: ["payment_arranged", "disputed"],
  payment_arranged: ["preparing", "disputed"],
  preparing: ["inspection", "shipped", "disputed"],
  inspection: ["shipped", "disputed"],
  shipped: ["delivered", "disputed"],
  delivered: ["completed", "disputed"],
  completed: [], disputed: ["ordered", "cancelled"], cancelled: [],
};
export const RFQ_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["published", "cancelled"], published: ["closed", "awarded", "cancelled", "expired"],
  closed: ["awarded", "expired"], awarded: [], cancelled: [], expired: [],
};
export const MEMBERSHIP_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["submitted"], submitted: ["under_review"],
  under_review: ["info_required", "verification_in_progress", "rejected"],
  info_required: ["under_review"], verification_in_progress: ["approved", "rejected", "info_required"],
  approved: ["suspended", "expired"], rejected: ["submitted"], suspended: ["approved", "expired"], expired: ["submitted"],
};
export function canTransition(map: Record<string, readonly string[]>, from: string, to: string): boolean {
  return map[from]?.includes(to) ?? false;
}
export function assertTransition(map: Record<string, readonly string[]>, from: string, to: string): void {
  if (!canTransition(map, from, to)) throw new Error(`Invalid status transition: ${from} → ${to}`);
}
/** An RFQ is NOT an order: only an accepted quotation can create one. */
export const canCreateOrderFromQuotation = (s: string) => s === "accepted";
