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

  await page.getByRole("link", { name: "Electronics", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Electronics" })).toBeVisible();
});

test("filters and sorts category products through the URL", async ({ page }) => {
  await page.goto("/category/electronics");
  await page.locator('select[name="maxPrice"]').selectOption("100");
  await page.locator('select[name="sort"]').selectOption("price-desc");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page).toHaveURL(/maxPrice=100/);
  await expect(page).toHaveURL(/sort=price-desc/);
  await expect(page.getByText("7 products found")).toBeVisible();
  await expect(page.locator("article").first().getByRole("link", { name: "Orbit Mechanical Keyboard", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "NovaBook Air 14", exact: true })).toHaveCount(0);

  await page.reload();
  await expect(page.locator('select[name="maxPrice"]')).toHaveValue("100");
  await expect(page.locator('select[name="sort"]')).toHaveValue("price-desc");
});

test("persists cart and updates quantities", async ({ page }) => {
  await page.goto("/product/electronics-1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.reload();
  await page.getByRole("link", { name: /Cart/ }).click();

  await expect(page.getByText("NovaBook Air 14")).toBeVisible();
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.getByRole("complementary").getByText("$1,798.00")).toBeVisible();
});

test("normalizes legacy cart items and removes them", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "parcel-cart",
      JSON.stringify([
        { productId: "computers-5", quantity: 1 },
        { productId: "electronics-5", quantity: 1 },
      ]),
    );
  });

  await page.goto("/cart");
  await expect(page.getByText("Drift Wireless Mouse")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("$98.00")).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("heading", { name: "Your cart is ready for fun" })).toBeVisible();
});

test("completes checkout, shows email preview, and tracks an order", async ({ page }) => {
  await page.goto("/product/electronics-1");
  await page.getByRole("button", { name: "Buy now" }).click();

  await page.getByLabel("Full name").fill("Avery Parcel");
  await page.getByLabel("Email for order confirmation").fill("avery@example.com");
  await page.getByLabel("Street address").fill("123 Delivery Lane");
  await page.getByLabel("City").fill("Portland");
  await page.getByLabel("State").fill("OR");
  await page.getByLabel("ZIP code").fill("97205");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByRole("heading", { name: "Placing your order..." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nothing to check out yet" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Your order has been placed!" })).toBeVisible();
  await expect(page.getByText("avery@example.com")).toBeVisible();
  const confettiLayer = page.getByTestId("confetti-layer");
  await expect(confettiLayer).toBeVisible();
  await expect(page.getByTestId("confetti-piece")).toHaveCount(36);
  const confettiCoverage = await confettiLayer.evaluate((element) => {
    const layer = element.getBoundingClientRect();
    const hero = element.parentElement?.getBoundingClientRect();
    return hero ? Math.round(layer.height) === Math.round(hero.height) : false;
  });
  expect(confettiCoverage).toBe(true);
  await page.waitForTimeout(250);
  const confettiDrop = await page.getByTestId("confetti-piece").first().evaluate((element) => {
    return Math.round(element.getBoundingClientRect().top);
  });
  expect(confettiDrop).toBeGreaterThan(-20);
  await page.getByRole("link", { name: "Track package" }).click();
  await page.getByRole("button", { name: /Show next update/ }).click();
  await expect(page.getByRole("heading", { name: "Preparing shipment", exact: true })).toBeVisible();
});

test("saves shipping info for next checkout", async ({ page }) => {
  await page.goto("/product/electronics-1");
  await page.getByRole("button", { name: "Buy now" }).click();

  await page.getByLabel("Full name").fill("Avery Parcel");
  await page.getByLabel("Email for order confirmation").fill("avery@example.com");
  await page.getByLabel("Street address").fill("123 Delivery Lane");
  await page.getByLabel("City").fill("Portland");
  await page.getByLabel("State").fill("OR");
  await page.getByLabel("ZIP code").fill("97205");
  await page.getByLabel("Save my information for next time").check();
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByRole("heading", { name: "Your order has been placed!" })).toBeVisible();
  await page.getByRole("link", { name: "Continue shopping" }).click();
  await page.goto("/product/electronics-1");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: /Cart/ }).click();
  await page.getByRole("link", { name: "Proceed to checkout" }).click();

  await expect(page.getByLabel("Full name")).toHaveValue("Avery Parcel");
  await expect(page.getByLabel("Email for order confirmation")).toHaveValue("avery@example.com");
  await expect(page.getByLabel("Street address")).toHaveValue("123 Delivery Lane");
  await expect(page.getByLabel("Save my information for next time")).toBeChecked();
});

test("shows automatic tracking notifications for older orders", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "parcel-orders",
      JSON.stringify([
        {
          orderId: "PCL-TEST1234",
          createdAt: new Date(Date.now() - 65_000).toISOString(),
          estimatedDeliveryDate: new Date(Date.now() + 86_400_000).toISOString(),
          items: [{ productId: "electronics-1", quantity: 1 }],
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

test("migrates legacy storage into versioned order snapshots", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "parcel-orders",
      JSON.stringify([
        {
          orderId: "PCL-LEGACY",
          createdAt: new Date().toISOString(),
          estimatedDeliveryDate: new Date(Date.now() + 86_400_000).toISOString(),
          items: [
            { productId: "computers-5", quantity: 1 },
            { productId: "electronics-5", quantity: 1 },
          ],
          total: 98,
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
          trackingNumber: "PKGLEGACY123",
          carrier: "Parcel Express",
        },
      ]),
    );
  });
  await page.goto("/orders");

  await expect(page.getByText("PCL-LEGACY")).toBeVisible();
  const storedOrder = await page.evaluate(() => JSON.parse(localStorage.getItem("parcel-orders") ?? "{}"));
  expect(storedOrder.version).toBe(1);
  expect(storedOrder.data[0].items[0].productId).toBe("electronics-5");
  expect(storedOrder.data[0].items[0].quantity).toBe(2);
  expect(storedOrder.data[0].items).toHaveLength(1);
  expect(storedOrder.data[0].items[0].product.name).toBe("Drift Wireless Mouse");
});

test("preserves unsupported future storage versions", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "parcel-cart",
      JSON.stringify({
        version: 99,
        data: [{ productId: "electronics-1", quantity: 3 }],
        futureField: "keep-me",
      }),
    );
  });
  await page.reload();

  await expect(page.getByRole("link", { name: /Cart/ })).not.toContainText("3");
  const storedCart = await page.evaluate(() => localStorage.getItem("parcel-cart"));
  expect(storedCart).toBe(
    JSON.stringify({
      version: 99,
      data: [{ productId: "electronics-1", quantity: 3 }],
      futureField: "keep-me",
    }),
  );
});

test("rejects malformed tracking orders without crashing", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "parcel-orders",
      JSON.stringify([
        {
          orderId: "PCL-BROKEN",
          createdAt: "not-a-date",
          estimatedDeliveryDate: "also-not-a-date",
          items: [{ productId: "electronics-1", quantity: 1 }],
          total: 973.17,
          shippingAddress: {
            fullName: "Avery Parcel",
            email: "avery@example.com",
            street: "123 Delivery Lane",
            city: "Portland",
            state: "OR",
            zip: "97205",
          },
          trackingStatus: "Somewhere",
          trackingStep: 99,
          trackingNumber: "PKGBROKEN123",
          carrier: "Parcel Express",
        },
      ]),
    );
  });
  await page.goto("/orders");

  await expect(page.getByRole("heading", { name: "No orders yet" })).toBeVisible();
  const storedOrders = await page.evaluate(() => JSON.parse(localStorage.getItem("parcel-orders") ?? "{}"));
  expect(storedOrders.data).toEqual([]);
});
