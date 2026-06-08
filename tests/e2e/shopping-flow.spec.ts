import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("searches products and browses a category", async ({ page }) => {
  await page.getByLabel("Search products").fill("NovaBook");
  await page.getByLabel("Search products").press("Enter");
  await expect(page.getByText("1 products found")).toBeVisible();
  await expect(page.getByRole("link", { name: "NovaBook Air 14", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Gaming", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Gaming" })).toBeVisible();
});

test("persists cart and updates quantities", async ({ page }) => {
  await page.goto("/product/computers-1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.reload();
  await page.getByRole("link", { name: /Cart/ }).click();

  await expect(page.getByText("NovaBook Air 14")).toBeVisible();
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.getByRole("complementary").getByText("$1,798.00")).toBeVisible();
});

test("completes checkout, shows email preview, and tracks an order", async ({ page }) => {
  await page.goto("/product/computers-1");
  await page.getByRole("button", { name: "Buy now" }).click();

  await page.getByLabel("Full name").fill("Avery Parcel");
  await page.getByLabel("Email for order confirmation").fill("avery@example.com");
  await page.getByLabel("Street address").fill("123 Delivery Lane");
  await page.getByLabel("City").fill("Portland");
  await page.getByLabel("State").fill("OR");
  await page.getByLabel("ZIP code").fill("97205");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByRole("heading", { name: "Your order has been placed!" })).toBeVisible();
  await expect(page.getByText("avery@example.com")).toBeVisible();
  await page.getByRole("link", { name: "Track package" }).click();
  await page.getByRole("button", { name: /Show next update/ }).click();
  await expect(page.getByRole("heading", { name: "Preparing shipment", exact: true })).toBeVisible();
});

test("shows automatic tracking notifications for older orders", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "parcel-orders",
      JSON.stringify([
        {
          orderId: "PCL-TEST1234",
          createdAt: new Date(Date.now() - 65_000).toISOString(),
          estimatedDeliveryDate: new Date(Date.now() + 86_400_000).toISOString(),
          items: [{ productId: "computers-1", quantity: 1 }],
          total: 973.17,
          shippingAddress: {
            fullName: "Avery Parcel",
            email: "avery@example.com",
            street: "123 Delivery Lane",
            city: "Portland",
            state: "OR",
            zip: "97205",
          },
          trackingStatus: "Order placed",
          trackingStep: 0,
          trackingNumber: "PKGTEST123456",
          carrier: "Parcel Express",
        },
      ]),
    );
  });
  await page.reload();

  await page.getByLabel("Notifications").click();
  await expect(page.getByText("Shipped", { exact: true })).toBeVisible();
});
