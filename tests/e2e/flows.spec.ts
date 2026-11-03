import { expect, test, type Page } from '@playwright/test';
import { resetEmulators, seedDoc, signIn } from './emulator';

const member = { email: 'member@bestis.ro', name: 'E2E Member' };
const admin = { email: 'it-admin@bestis.ro', name: 'E2E IT Admin' };
const itTask = { department: 'IT', description: 'E2E IT task', points: 15 };
const hrTask = { department: 'HR', description: 'E2E HR task', points: 7 };
type Task = typeof itTask;

const card = (page: Page, task: Task) =>
  page.getByRole('article').filter({ has: page.getByText(task.description, { exact: true }) });

async function openRequestDetails(page: Page, task: Task): Promise<void> {
  await page.goto('/requests');
  await page.getByRole('button', { name: 'Adaugă Cerere Nouă', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Cerere Nouă de Puncte', exact: true });
  await dialog.getByRole('button', { name: task.department, exact: true }).click();
  await dialog.getByRole('button', {
    name: `${task.description} (${task.points} puncte)`, exact: true,
  }).click();
  await dialog.getByRole('button', { name: 'Astăzi', exact: true }).click();
  await dialog.getByRole('button', { name: 'Următorul Pas', exact: true }).click();
}

async function submitRequest(page: Page, task: Task, repetitions = 2): Promise<void> {
  await openRequestDetails(page, task);
  const dialog = page.getByRole('dialog', { name: 'Cerere Nouă de Puncte', exact: true });
  await dialog.getByLabel('Număr de repetări', { exact: true }).fill(String(repetitions));
  await dialog.getByRole('button', { name: 'Trimite Cererea', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(card(page, task).getByText('În așteptare', { exact: true })).toBeVisible();
  await expect(card(page, task).getByText(`${repetitions}x`, { exact: true })).toBeVisible();
}

test.beforeEach(async () => {
  await resetEmulators();
  await seedDoc('departmentTasks/e2e-it', itTask);
});

test('refuses an account outside bestis.ro and displays the reason', async ({ page }) => {
  await signIn(page, 'outsider@example.com', 'E2E Outsider');
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByText(
    'Doar emailuri @bestis.ro sunt permise! Te rog folosește contul tău BEST.',
    { exact: false },
  )).toBeVisible();
  await expect(page.getByRole('button', { name: 'LOGIN', exact: true })).toBeEnabled();
});

test('a member submits two repetitions and sees a persisted pending request', async ({ page }) => {
  await signIn(page, member.email, member.name);
  await submitRequest(page, itTask);
  await page.reload();
  await expect(card(page, itTask).getByText('În așteptare', { exact: true })).toBeVisible();
  await expect(card(page, itTask).getByText('2x', { exact: true })).toBeVisible();
});

test('a member is denied access to admin moderation', async ({ page }) => {
  await signIn(page, member.email, member.name);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Acces Interzis', exact: true })).toBeVisible();
  await expect(page.getByText('Nu ai permisiuni de administrator.', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Moderare cereri' })).toHaveCount(0);
});

test('a different IT admin approves the request and its doubled score reaches the leaderboard', async ({ page, browser }) => {
  await seedDoc(`admins/${admin.email}`, { departments: ['IT'] });
  await signIn(page, member.email, member.name);
  await submitRequest(page, itTask);

  const adminContext = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  try {
    const adminPage = await adminContext.newPage();
    await signIn(adminPage, admin.email, admin.name);
    await adminPage.goto('/admin');
    await expect(adminPage.getByRole('heading', { name: 'Panou Admin', exact: true })).toBeVisible();
    const request = card(adminPage, itTask);
    await expect(request.getByText(member.name, { exact: true })).toBeVisible();
    await request.getByRole('button', { name: 'Aprobă / Respinge', exact: true }).click();
    await request.getByRole('button', { name: 'Confirmă Aprobare', exact: true }).click();
    await expect(request).toHaveCount(0);
    await expect(adminPage.getByRole('alert')).toHaveCount(0);

    await page.reload();
    await expect(card(page, itTask).getByText('Aprobat', { exact: true })).toBeVisible();
    await page.goto('/it');
    const row = page.getByRole('row').filter({
      has: page.getByRole('cell', { name: member.name, exact: true }),
    });
    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell').nth(1)).toHaveText(String(itTask.points * 2));
    await expect(row.getByText(`2 x ${itTask.description} (${itTask.points} puncte) = ${itTask.points * 2} puncte`, {
      exact: true,
    })).toBeVisible();
  } finally {
    await adminContext.close();
  }
});

test('an IT admin cannot see or approve a pending HR request', async ({ page, browser }) => {
  await seedDoc('departmentTasks/e2e-hr', hrTask);
  await seedDoc(`admins/${admin.email}`, { departments: ['IT'] });
  await signIn(page, member.email, member.name);
  await submitRequest(page, hrTask);

  const adminContext = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  try {
    const adminPage = await adminContext.newPage();
    await signIn(adminPage, admin.email, admin.name);
    await adminPage.goto('/admin');
    await expect(adminPage.getByRole('heading', { name: 'Panou Admin', exact: true })).toBeVisible();
    const moderation = adminPage.getByRole('region', { name: 'Moderare cereri', exact: true });
    await expect(moderation.getByText('Nu există cereri.', { exact: true })).toBeVisible();
    await expect(moderation.getByRole('alert')).toHaveCount(0);
    await expect(moderation.getByLabel('Departament', { exact: true }).getByRole('option')).toHaveText(['Toate', 'IT']);
    await expect(card(adminPage, hrTask)).toHaveCount(0);
    await expect(moderation.getByRole('button', { name: 'Aprobă / Respinge', exact: true })).toHaveCount(0);
    await expect(moderation.getByRole('button', { name: 'Confirmă Aprobare', exact: true })).toHaveCount(0);

    await page.reload();
    await expect(card(page, hrTask).getByText('În așteptare', { exact: true })).toBeVisible();
  } finally {
    await adminContext.close();
  }
});

test('repetitions reject 101 without creating a request and accept the boundary 100', async ({ page }) => {
  await signIn(page, member.email, member.name);
  await openRequestDetails(page, itTask);
  const dialog = page.getByRole('dialog', { name: 'Cerere Nouă de Puncte', exact: true });
  const repetitions = dialog.getByLabel('Număr de repetări', { exact: true });
  await expect(repetitions).toHaveAttribute('max', '100');
  await repetitions.fill('101');
  await dialog.getByRole('button', { name: 'Trimite Cererea', exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Numărul de repetări poate fi cel mult 100.');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Închide formularul', exact: true }).click();
  await page.reload();
  await expect(page.getByText('Nu ai cereri', { exact: false })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await submitRequest(page, itTask, 100);
});
