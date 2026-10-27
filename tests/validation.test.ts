import { describe, it, expect } from "vitest";
import { rfqSchema, registerSchema } from "@/lib/validation/schemas";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/primitives";
import React from "react";

describe("validation", () => {
  it("rejects RFQs with non-positive quantity", () => {
    expect(rfqSchema.safeParse({ productName: "Cocoa", specifications: "Grade 1 beans", quantity: 0, unit: "MT", destinationCountry: "NL", deliveryLocation: "Rotterdam", deadline: "2027-01-01" }).success).toBe(false);
  });
  it("accepts a well-formed RFQ and registration", () => {
    expect(rfqSchema.safeParse({ productName: "Cocoa", specifications: "Grade 1 beans", quantity: 25, unit: "MT", destinationCountry: "NL", deliveryLocation: "Rotterdam", deadline: "2027-01-01" }).success).toBe(true);
    expect(registerSchema.safeParse({ email: "a@b.co", password: "password1", fullName: "Ada Buyer", organisationName: "Buyer GmbH", country: "DE", intent: "buyer" }).success).toBe(true);
  });
});
describe("EmptyState (honest-data component)", () => {
  it("renders its title", () => { render(React.createElement(EmptyState, { title: "Nothing here yet" }, "body")); expect(screen.getByText("Nothing here yet")).toBeInTheDocument(); });
});
