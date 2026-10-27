import { describe, it, expect } from "vitest";
import { canTransition, ORDER_TRANSITIONS, RFQ_TRANSITIONS, MEMBERSHIP_TRANSITIONS, canCreateOrderFromQuotation } from "@/lib/domain/state-machines";

describe("order lifecycle", () => {
  it("allows shipped → delivered → completed", () => {
    expect(canTransition(ORDER_TRANSITIONS, "shipped", "delivered")).toBe(true);
    expect(canTransition(ORDER_TRANSITIONS, "delivered", "completed")).toBe(true);
  });
  it("blocks skipping and resurrecting completed orders", () => {
    expect(canTransition(ORDER_TRANSITIONS, "inquiry", "shipped")).toBe(false);
    expect(canTransition(ORDER_TRANSITIONS, "completed", "inquiry")).toBe(false);
  });
});
describe("RFQ → order rule", () => {
  it("an RFQ is never an order; only accepted quotations create orders", () => {
    expect(canCreateOrderFromQuotation("accepted")).toBe(true);
    expect(canCreateOrderFromQuotation("submitted")).toBe(false);
    expect(canTransition(RFQ_TRANSITIONS, "draft", "published")).toBe(true);
    expect(canTransition(RFQ_TRANSITIONS, "awarded", "published")).toBe(false);
  });
});
describe("membership gate", () => {
  it("registration path reaches review but approval is a decision", () => {
    expect(canTransition(MEMBERSHIP_TRANSITIONS, "draft", "submitted")).toBe(true);
    expect(canTransition(MEMBERSHIP_TRANSITIONS, "submitted", "approved")).toBe(false);
    expect(canTransition(MEMBERSHIP_TRANSITIONS, "verification_in_progress", "approved")).toBe(true);
    expect(canTransition(MEMBERSHIP_TRANSITIONS, "approved", "suspended")).toBe(true);
  });
});
