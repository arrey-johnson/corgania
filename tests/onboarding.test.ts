import { describe, expect, it } from "vitest";
import { MEMBERSHIP_TRANSITIONS, canTransition } from "@/lib/domain/state-machines";
import {
  buyerApplicationSchema,
  orgCreateSchema,
  sellerApplicationSchema,
} from "@/lib/validation/schemas";

describe("Phase 2 onboarding validation", () => {
  it("accepts a valid organisation create payload", () => {
    const parsed = orgCreateSchema.safeParse({
      legalName: "Agro Export SARL",
      registrationCountry: "CM",
      contactEmail: "ops@example.com",
      intent: "seller",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short seller descriptions", () => {
    const parsed = sellerApplicationSchema.safeParse({
      industry: "Cocoa",
      description: "Too short",
      productsOffered: "Beans",
      exportExperience: "None yet really",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a buyer application", () => {
    const parsed = buyerApplicationSchema.safeParse({
      industry: "Food processing",
      description: "European importer of African cocoa and coffee for industrial use.",
      targetCommodities: "Cocoa beans, coffee",
      sourcingRegions: "Cameroon",
      authorisedRepresentative: "Jane Buyer",
    });
    expect(parsed.success).toBe(true);
  });

  it("allows rejected → submitted resubmit path", () => {
    expect(canTransition(MEMBERSHIP_TRANSITIONS, "rejected", "submitted")).toBe(true);
    expect(canTransition(MEMBERSHIP_TRANSITIONS, "draft", "approved")).toBe(false);
  });
});
