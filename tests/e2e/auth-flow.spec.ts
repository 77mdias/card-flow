import { test, expect } from "@playwright/test";

const hasAuthCredentials = Boolean(process.env.E2E_AUTH_EMAIL && process.env.E2E_AUTH_PASSWORD);

test.describe("Better Auth user lifecycle", () => {
  test.skip(!hasAuthCredentials, "Defina E2E_AUTH_EMAIL e E2E_AUTH_PASSWORD para executar os cenarios reais.");

  test("login -> dashboard -> logout", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Entrar" }).click();

    await page.locator('input[name="username"], input[type="email"]').first().fill(process.env.E2E_AUTH_EMAIL!);
    await page.locator('input[name="password"], input[type="password"]').first().fill(process.env.E2E_AUTH_PASSWORD!);

    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard inicial" })).toBeVisible();

    await page.getByRole("link", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("usuario INACTIVE e bloqueado na area privada", async ({ page }) => {
    test.skip(
      process.env.E2E_EXPECT_BLOCKED_USER !== "true",
      "Ative E2E_EXPECT_BLOCKED_USER=true e use credenciais de usuario inativo.",
    );

    await page.goto("/");
    await page.getByRole("link", { name: "Entrar" }).click();

    await page.locator('input[name="username"], input[type="email"]').first().fill(process.env.E2E_AUTH_EMAIL!);
    await page.locator('input[name="password"], input[type="password"]').first().fill(process.env.E2E_AUTH_PASSWORD!);

    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/account-blocked/);
    await expect(page.getByRole("heading", { name: "Conta sem acesso" })).toBeVisible();
  });
});
