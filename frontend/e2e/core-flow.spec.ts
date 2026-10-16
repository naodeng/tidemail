import { expect, test, type Page } from "@playwright/test";

const inboxEmail = {
  id: "mail-1",
  messageFrom: "sender@example.org",
  messageTo: "inbox@temp.example.net",
  headers: [],
  from: { address: "sender@example.org", name: "Test sender" },
  messageId: "<mail-1@example.org>",
  subject: "Quarterly update",
  text: "The inbox flow received this message.",
  html: "<p>The inbox flow received this message.</p>",
  createdAt: "2026-10-15T10:00:00.000Z",
  updatedAt: "2026-10-15T10:00:00.000Z",
  date: "2026-10-15T10:00:00.000Z",
};

async function mockWorker(
  page: Page,
  options: { sitePasswordEnabled?: boolean } = {},
) {
  const sentMessages: Array<{
    authorization: string | undefined;
    body: Record<string, unknown>;
  }> = [];
  let emailDeleted = false;
  let siteUnlocked = false;

  await page.addInitScript(() => {
    localStorage.setItem("i18nextLng", "en");
  });
  await page.route("https://cloud.umami.is/**", (route) => route.abort());
  await page.route("**/auth/**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/auth/status") {
      return route.fulfill({
        json: {
          unlocked: siteUnlocked,
          sitePasswordEnabled: options.sitePasswordEnabled ?? false,
        },
      });
    }
    if (pathname === "/auth/unlock" && request.method() === "POST") {
      const { password } = request.postDataJSON() as { password: string };
      if (password !== "site-secret") {
        return route.fulfill({
          status: 401,
          json: { message: "Invalid password" },
        });
      }
      siteUnlocked = true;
      return route.fulfill({ json: { success: true } });
    }
    return route.fulfill({ status: 404, json: { message: "Not mocked" } });
  });

  await page.route("**/config", (route) =>
    route.fulfill({
      json: {
        emailDomain: ["mail.example.com", "temp.example.net"],
        turnstileKey: "",
        turnstileEnabled: false,
        sitePasswordEnabled: options.sitePasswordEnabled ?? false,
        cookiesSecret: "test-cookie-secret",
        sendChannel: "resend",
        senderEmail: "send@tidemail.test",
      },
    }),
  );

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== new URL(page.url()).origin) {
      return route.continue();
    }
    const pathname = requestUrl.pathname;

    if (pathname === "/api/verify") {
      const { domain } = request.postDataJSON() as { domain: string };
      return route.fulfill({
        json: {
          success: true,
          mailbox: `inbox@${domain}`,
          mailboxToken: "test-mailbox-token",
        },
      });
    }

    if (pathname === "/api/emails" && request.method() === "POST") {
      return route.fulfill({ json: emailDeleted ? [] : [inboxEmail] });
    }

    if (pathname === "/api/emails/meta") {
      return route.fulfill({
        json: {
          count: emailDeleted ? 0 : 1,
          latestEmailCreatedAt: emailDeleted ? null : inboxEmail.createdAt,
        },
      });
    }

    if (pathname === "/api/delete-emails") {
      emailDeleted = true;
      return route.fulfill({ json: { count: 1 } });
    }

    if (pathname === "/api/send" && request.method() === "POST") {
      sentMessages.push({
        authorization: request.headers().authorization,
        body: request.postDataJSON() as Record<string, unknown>,
      });
      return route.fulfill({ json: { success: true } });
    }

    return route.fulfill({ status: 404, json: { message: "Not mocked" } });
  });

  return { sentMessages };
}

async function openMailbox(page: Page, domain = "temp.example.net") {
  const domainSelect = page.getByRole("combobox", { name: "Domain" });
  await domainSelect.click();
  await page.getByText(`@${domain}`, { exact: true }).click();
  await page.getByRole("button", { name: "Create temporary email" }).click();
  await expect(page.getByText(`inbox@${domain}`)).toBeVisible();
}

test("creates a mailbox on a selected domain, reads and deletes a message", async ({
  page,
}) => {
  await mockWorker(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Virtual Temporary Email" }),
  ).toBeVisible();

  await openMailbox(page);
  const messageRow = page.getByRole("button", { name: /Quarterly update/ });
  await expect(messageRow).toBeVisible();
  await messageRow.click();
  await expect(page.getByRole("article")).toBeVisible();
  await expect(page.getByTitle("Email content")).toHaveAttribute(
    "srcdoc",
    /The inbox flow received this message/,
  );

  await page.getByRole("button", { name: "Return to email list" }).click();
  await page.getByLabel("Test sender: Quarterly update").check();
  await page.getByRole("button", { name: "Delete selected" }).click();
  await expect(page.getByText("Waiting for emails...")).toBeVisible();
});

test("sends email with the mailbox bearer authorization", async ({ page }) => {
  const { sentMessages } = await mockWorker(page);
  await page.goto("/");
  await openMailbox(page);

  await page.getByRole("button", { name: "Send email" }).click();
  await page.getByLabel("Sending name").fill("Inbox owner");
  await page.getByLabel("Recipient email *").fill("recipient@example.org");
  await page.getByLabel("Email subject *").fill("A reply from tidemail");
  await page
    .getByLabel("Email content *")
    .fill("Hello from the temporary inbox.");
  await page.getByRole("button", { name: "Send", exact: true }).click();

  await expect.poll(() => sentMessages.length).toBeGreaterThan(0);
  expect(sentMessages).toHaveLength(1);
  expect(sentMessages[0]).toEqual({
    authorization: "Bearer test-mailbox-token",
    body: {
      senderName: "Inbox owner",
      receiverEmail: "recipient@example.org",
      subject: "A reply from tidemail",
      content: "Hello from the temporary inbox.",
      type: "text/plain",
    },
  });
  await expect(page.getByText("Message sent")).toBeVisible();
});

test("keeps the site password gate and unlocks after authentication", async ({
  page,
}) => {
  await mockWorker(page, { sitePasswordEnabled: true });
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Site locked" }),
  ).toBeVisible();
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid password");

  await page.getByLabel("Password").fill("site-secret");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(
    page.getByRole("heading", { name: "Virtual Temporary Email" }),
  ).toBeVisible();
});

test("switches theme, follows the system, and keeps language choices to English and Chinese", async ({
  page,
}) => {
  await mockWorker(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Settings" }).click();
  const themeSelect = page.getByRole("combobox", { name: "Theme" });
  await themeSelect.click();
  const themeOptions = page.getByRole("listbox", { name: "Theme" });
  await expect(themeOptions).toBeVisible();
  const themeSelectBox = await themeSelect.boundingBox();
  const themeOptionsBox = await themeOptions.boundingBox();
  expect(themeSelectBox).not.toBeNull();
  expect(themeOptionsBox).not.toBeNull();
  expect(themeOptionsBox!.y).toBeGreaterThanOrEqual(
    themeSelectBox!.y + themeSelectBox!.height,
  );
  expect(themeOptionsBox!.width).toBeGreaterThanOrEqual(
    themeSelectBox!.width - 1,
  );
  await expect(page.getByRole("option", { name: "Dark" })).toBeVisible();
  await page.getByRole("option", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("tidemail-theme")))
    .toBe("dark");

  await themeSelect.click();
  await expect(
    page.getByRole("option", { name: "System default" }),
  ).toBeVisible();
  await page.getByRole("option", { name: "System default" }).click();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  const languageSelect = page.getByRole("combobox", { name: "Language" });
  await languageSelect.click();
  await expect(page.getByRole("option", { name: "English" })).toBeVisible();
  await expect(page.getByRole("option", { name: "简体中文" })).toBeVisible();
  await page.getByRole("option", { name: "简体中文" }).click();
  await expect(
    page.getByRole("heading", { name: "虚拟临时邮箱" }),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileThemeSelect = page.getByRole("combobox", { name: "主题" });
  await mobileThemeSelect.click();
  const mobileThemeOptions = page.getByRole("listbox", { name: "主题" });
  await expect(mobileThemeOptions).toBeVisible();
  const mobileSelectBox = await mobileThemeSelect.boundingBox();
  const mobileOptionsBox = await mobileThemeOptions.boundingBox();
  expect(mobileSelectBox).not.toBeNull();
  expect(mobileOptionsBox).not.toBeNull();
  expect(mobileOptionsBox!.y).toBeGreaterThanOrEqual(
    mobileSelectBox!.y + mobileSelectBox!.height,
  );
  expect(mobileOptionsBox!.width).toBeGreaterThanOrEqual(
    mobileSelectBox!.width - 1,
  );
  await expect(page.getByRole("option", { name: "浅色" })).toBeVisible();
  await page.getByRole("option", { name: "跟随系统" }).click();
});

test("keeps the mailbox and long dialogs usable from phone to desktop widths", async ({
  page,
}) => {
  await mockWorker(page);
  await page.goto("/");
  await openMailbox(page);

  for (const [width, height] of [
    [320, 700],
    [390, 844],
    [768, 1024],
    [1024, 900],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }

  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "Send email" }).click();
  const senderDialog = page.getByRole("dialog");
  await expect(
    senderDialog.getByRole("button", { name: "Send", exact: true }),
  ).toBeInViewport();
  await senderDialog.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("button", { name: "Privacy" }).last().click();
  const privacyDialog = page.getByRole("dialog");
  await expect(privacyDialog).toBeVisible();
  await expect
    .poll(() =>
      privacyDialog.locator(".modal-scroll").evaluate((element) => {
        return element.scrollHeight > element.clientHeight;
      }),
    )
    .toBe(true);
});
