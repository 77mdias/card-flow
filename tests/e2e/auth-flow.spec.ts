import { test, expect } from "@playwright/test";

const hasAuthCredentials = Boolean(
  process.env.E2E_AUTH0_EMAIL && process.env.E2E_AUTH0_PASSWORD,
);

test.describe("Auth0 user lifecycle", () => {
  test.skip(
    !hasAuthCredentials,
    "Defina E2E_AUTH0_EMAIL e E2E_AUTH0_PASSWORD para executar os cenarios reais de Auth0.",
  );

  test("login -> dashboard -> logout", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Entrar com Auth0" }).click();

    await page
      .locator('input[name="username"], input[type="email"]')
      .first()
      .fill(process.env.E2E_AUTH0_EMAIL!);
    await page
      .locator('input[name="password"], input[type="password"]')
      .first()
      .fill(process.env.E2E_AUTH0_PASSWORD!);

    await page.getByRole("button", { name: /continuar|continue|log in|entrar/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Dashboard inicial" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("usuario INACTIVE e bloqueado na area privada", async ({ page }) => {
    test.skip(
      process.env.E2E_EXPECT_BLOCKED_USER !== "true",
      "Ative E2E_EXPECT_BLOCKED_USER=true e use credenciais de usuario inativo.",
    );

    await page.goto("/");
    await page.getByRole("link", { name: "Entrar com Auth0" }).click();

    await page
      .locator('input[name="username"], input[type="email"]')
      .first()
      .fill(process.env.E2E_AUTH0_EMAIL!);
    await page
      .locator('input[name="password"], input[type="password"]')
      .first()
      .fill(process.env.E2E_AUTH0_PASSWORD!);

    await page.getByRole("button", { name: /continuar|continue|log in|entrar/i }).click();

    await expect(page).toHaveURL(/\/account-blocked/);
    await expect(page.getByRole("heading", { name: "Conta sem acesso" })).toBeVisible();
  });
});
