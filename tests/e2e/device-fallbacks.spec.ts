import { expect, test } from '@playwright/test';

const STORAGE_KEY = 'checkup:offline-inspections';

test.describe('fallbacks de cámara y geolocalización', () => {
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

  test('continúa el registro cuando cámara y geolocalización no están autorizadas', async ({ page }) => {
    await page.getByRole('button', { name: 'Usar ubicación' }).click();
    await expect(page.getByTestId('location-fallback-status')).toContainText('Ubicación sintética UTT activa');

    await page.getByRole('button', { name: 'Tomar foto de evidencia' }).click();
    await expect(page.getByTestId('camera-fallback-status')).toContainText('Fallback de cámara activo');
    await expect(page.getByTestId('camera-file-fallback')).toBeVisible();

    await page.locator('#inspection-title').fill('Inspección E2E con permisos denegados');
    await page.getByRole('button', { name: 'Guardar inspección' }).click();

    await expect(page.getByTestId('workflow-message')).toContainText('Inspección sincronizada correctamente');
    await expect(page.getByTestId('local-inspection-list')).toContainText('Inspección E2E con permisos denegados');
  });
});
