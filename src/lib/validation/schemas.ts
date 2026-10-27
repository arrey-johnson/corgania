import { z } from "zod";
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2), organisationName: z.string().min(2),
  country: z.string().length(2), intent: z.enum(["buyer", "seller", "both"]),
});
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from the current password",
    path: ["newPassword"],
  });
export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export const orgCreateSchema = z.object({
  legalName: z.string().min(2).max(200),
  tradingName: z.string().max(200).optional(),
  registrationCountry: z.string().length(2),
  registrationNumber: z.string().max(100).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  intent: z.enum(["buyer", "seller", "both"]),
});
export const sellerApplicationSchema = z.object({
  industry: z.string().min(2).max(120),
  description: z.string().min(20).max(4000),
  productsOffered: z.string().min(5).max(2000),
  exportExperience: z.string().min(5).max(2000),
  annualCapacity: z.string().max(200).optional(),
  certifications: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
});
export const buyerApplicationSchema = z.object({
  industry: z.string().min(2).max(120),
  description: z.string().min(20).max(4000),
  targetCommodities: z.string().min(5).max(2000),
  sourcingRegions: z.string().min(2).max(500),
  annualVolume: z.string().max(200).optional(),
  authorisedRepresentative: z.string().min(2).max(200),
  website: z.string().url().optional().or(z.literal("")),
});
export const adminReviewSchema = z.object({
  caseId: z.string().uuid(),
  notes: z.string().max(4000).optional(),
});
export const adminRecommendSchema = adminReviewSchema.extend({
  recommendation: z.string().min(10).max(4000),
});
export const adminDecisionSchema = adminReviewSchema.extend({
  decision: z.enum(["approved", "rejected"]),
  decisionNotes: z.string().min(5).max(4000),
});
export const scheduleInspectionSchema = z.object({
  caseId: z.string().uuid(),
  scheduledAt: z.string().min(1),
  location: z.string().min(2).max(500),
});
export const completeInspectionSchema = z.object({
  inspectionId: z.string().uuid(),
  findings: z.string().min(10).max(8000),
  outcome: z.enum(["pass", "fail", "inconclusive"]),
});
export const rfqSchema = z.object({
  productName: z.string().min(2), specifications: z.string().min(10),
  quantity: z.coerce.number().positive(), unit: z.string().min(1),
  destinationCountry: z.string().length(2), deliveryLocation: z.string().min(2),
  deadline: z.string().min(1),
});
export const contactSchema = z.object({
  name: z.string().min(2), email: z.string().email(), company: z.string().optional(),
  message: z.string().min(10),
});
export type RfqInput = z.infer<typeof rfqSchema>;
export type OrgCreateInput = z.infer<typeof orgCreateSchema>;
export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
export type BuyerApplicationInput = z.infer<typeof buyerApplicationSchema>;
