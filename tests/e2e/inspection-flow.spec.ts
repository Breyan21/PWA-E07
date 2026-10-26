import { expect, test } from '@playwright/test';

const STORAGE_KEY = 'checkup:offline-inspections';

test.describe('flujo de inspección offline y reconexión', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await context.clearPermissions();
    await page.goto('/inspecciones');
    await page.evaluate(async (key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.clear();
      const databases = await indexedDB.databases();
      await Promise.all(databases.map((database) => new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(database.name ?? '');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      })));
    }, STORAGE_KEY);
    await page.reload();
    await expect(page.locator('#inspection-title')).toBeVisible();
  });

  test('persiste una inspección offline tras recargar y la sincroniza una sola vez al reconectar', async ({ context, page }) => {
    await page.locator('#inspection-title').fill('Inspección E2E sin conexión');
    await page.locator('#inspection-status').selectOption('attention');

    await context.setOffline(true);
    await page.getByRole('button', { name: 'Guardar inspección' }).click();

    await expect(page.getByTestId('workflow-message')).toContainText('guardada localmente y pendiente');
    await expect(page.getByTestId('pending-inspection-count')).toContainText('1');

    // La recarga con red deshabilitada debe conservar el registro local. Si el
    // service worker entrega el fallback, localStorage sigue siendo del mismo origen.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(async () => page.evaluate((key) => {
      const records = JSON.parse(window.localStorage.getItem(key) ?? '[]');
      return records.filter((record: { title?: string; syncStatus?: string }) =>
        record.title === 'Inspección E2E sin conexión' && record.syncStatus === 'pending'
      ).length;
    }, STORAGE_KEY)).toBe(1);

    await context.setOffline(false);
    await page.goto('/inspecciones');
    await expect(page.getByTestId('local-inspection-list')).toContainText('Inspección E2E sin conexión');

    await page.getByRole('button', { name: 'Sincronizar pendientes' }).click();
    await expect(page.getByTestId('workflow-message')).toContainText('Sincronización completada: 1 inspección');
    await expect(page.getByTestId('pending-inspection-count')).toContainText('0');
    await expect(page.getByTestId('synced-inspection-count')).toContainText('1');

    // Un segundo intento no debe crear otra copia de la misma mutación local.
    await page.getByRole('button', { name: 'Sincronizar pendientes' }).click();
    await expect(page.getByTestId('local-inspection-list').locator('li')).toHaveCount(1);
    await expect(page.getByTestId('synced-inspection-count')).toContainText('1');
  });
});
