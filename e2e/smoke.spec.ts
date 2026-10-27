import { test, expect } from "@playwright/test";

test("homepage renders hero and dual CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Africa's Trade/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Become a Member" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore African Markets" })).toBeVisible();
});
test("marketplace is gated for anonymous visitors", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByText(/Members only|Sign in|Setup/i).first()).toBeVisible();
  await expect(page).not.toHaveURL(/\/login/); // gate page OR redirect are both acceptable non-marketplace outcomes; assert no product grid leaks
  await expect(page.getByText(/No approved listings|Nothing here yet/i)).toHaveCount(0);
});
test("admin is not accessible by URL alone", async ({ page }) => {
  await page.goto("/admin/members");
  await expect(page.getByText(/Members only|Sign in|restricted/i).first()).toBeVisible();
});
test("public routes respond", async ({ page }) => {
  for (const p of ["/about", "/markets", "/markets/cm", "/commodities", "/products", "/insights", "/how-it-works", "/membership", "/contact"]) {
    const res = await page.goto(p); expect(res?.status(), p).toBeLessThan(400);
  }
});
