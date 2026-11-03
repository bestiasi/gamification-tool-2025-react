import { expect, type Page } from '@playwright/test';

const project = 'demo-gt-2025';
const firestore = 'http://127.0.0.1:8080';
const auth = 'http://127.0.0.1:9099';
type SeedValue = string | number | readonly string[] | Date;
type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { arrayValue: { values: { stringValue: string }[] } }
  | { timestampValue: string };

async function emulatorFetch(url: string, init: RequestInit): Promise<void> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${init.method} ${url}: ${response.status} ${await response.text()}`);
  }
}

export async function resetEmulators(): Promise<void> {
  await Promise.all([
    emulatorFetch(`${firestore}/emulator/v1/projects/${project}/databases/(default)/documents`, {
      method: 'DELETE',
    }),
    emulatorFetch(`${auth}/emulator/v1/projects/${project}/accounts`, {
      method: 'DELETE',
    }),
  ]);
}

function firestoreValue(value: SeedValue): FirestoreValue {
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new Error(`Not a safe integer: ${value}`);
    return { integerValue: String(value) };
  }
  return { arrayValue: { values: value.map(item => ({ stringValue: item })) } };
}

export async function seedDoc(path: string, fields: Record<string, SeedValue>): Promise<void> {
  const documentPath = path.split('/').map(encodeURIComponent).join('/');
  await emulatorFetch(`${firestore}/v1/projects/${project}/databases/(default)/documents/${documentPath}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValue(value)])),
    }),
  });
}

export async function signIn(page: Page, email: string, name: string): Promise<void> {
  page.on('pageerror', error => console.log(`[browser error] ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') console.log(`[browser console] ${message.text()}`); });
  await page.goto('/login');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'LOGIN', exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await popup.getByRole('button', { name: 'Add new account', exact: true }).click();
  // firebase-tools v14.11.0 widget inputs reference a nonexistent "my-label-id".
  await expect(popup.locator('#email-input')).toBeVisible();
  await popup.locator('#email-input').fill(email);
  await popup.locator('#display-name-input').fill(name);
  await popup.getByRole('button', { name: 'Sign in with Google.com', exact: true }).click();

  if (email.endsWith('@bestis.ro')) {
    await page.waitForURL(url => url.pathname !== '/login');
  } else {
    await expect(page.getByText('Doar emailuri @bestis.ro sunt permise!', { exact: false })).toBeVisible();
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  }
}
