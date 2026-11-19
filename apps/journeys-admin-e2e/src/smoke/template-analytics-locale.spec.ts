import type { Locator, Page, Response } from '@playwright/test'

import { expect, test } from '../fixtures/authenticated'
import { JourneyPage } from '../pages/journey-page'

const locales = [
  {
    locale: 'en-US',
    order: ['Month', 'Day', 'Year'],
    from: '05/04/2026',
    to: '05/06/2026'
  },
  {
    locale: 'en-NZ',
    order: ['Day', 'Month', 'Year'],
    from: '04/05/2026',
    to: '06/05/2026'
  },
  {
    locale: 'ja-JP',
    order: ['Year', 'Month', 'Day'],
    from: '2026/05/04',
    to: '2026/05/06'
  }
] as const

interface BreakdownRequest {
  operationName?: string
  variables?: { where?: { period?: string; date?: string } }
}

function isBreakdownResponse(
  response: Response,
  period: string,
  date?: string
): boolean {
  if (response.request().method() !== 'POST') return false
  const body = response.request().postDataJSON() as BreakdownRequest | null
  return (
    body?.operationName === 'GetTemplateFamilyStatsBreakdown' &&
    body.variables?.where?.period === period &&
    body.variables.where.date === date
  )
}

async function enterDate(field: Locator, day: string): Promise<void> {
  for (const [section, value] of [
    ['Month', '05'],
    ['Day', day],
    ['Year', '2026']
  ]) {
    const input = field.getByRole('spinbutton', { name: section, exact: true })
    await input.click()
    await input.pressSequentially(value)
  }
}

async function selectMayDay(
  page: Page,
  field: Locator,
  day: string
): Promise<void> {
  await field.getByRole('button', { name: 'Choose date', exact: true }).click()
  const monthsToMay = await page.evaluate(() => {
    const today = new Date()
    return (today.getFullYear() - 2026) * 12 + today.getMonth() - 4
  })
  for (let month = 0; month < monthsToMay; month++) {
    await page
      .getByRole('button', { name: 'Previous month', exact: true })
      .click()
  }
  const calendar = page.getByRole('grid', { name: 'May 2026', exact: true })
  await expect(calendar).toBeVisible()
  await calendar.getByRole('gridcell', { name: day, exact: true }).click()
}

for (const { locale, order, from, to } of locales) {
  test.describe(`template analytics browser locale ${locale}`, () => {
    // Keep the app's labels English while exercising the browser's real Intl locale.
    test.use({ locale, extraHTTPHeaders: { 'Accept-Language': 'en' } })

    test('localizes both hints and values and sends identical typed/calendar ranges', async ({
      authedPage: page
    }) => {
      // Login, creating an isolated template and real analytics requests can each
      // encounter cold SSR/API calls, exceeding the normal three-minute budget.
      test.slow()

      const journeyPage = new JourneyPage(page)
      const title = `First journey ${Date.now()} ${locale}`
      let templateId: string | undefined
      try {
        await journeyPage.clickCreateCustomJourney()
        await journeyPage.clickThreeDotBtnOfCustomJourney()
        await page
          .getByRole('menuitem', { name: 'Edit Details', exact: true })
          .click()
        const details = page.getByRole('dialog')
        await details
          .getByRole('textbox', { name: 'Title', exact: true })
          .fill(title)
        await details.getByRole('button', { name: 'Save', exact: true }).click()
        await expect(details).toBeHidden()
        await journeyPage.clickThreeDotBtnOfCustomJourney()
        const created = page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' &&
            (
              response.request().postDataJSON() as {
                operationName?: string
              } | null
            )?.operationName === 'CreateTemplate'
        )
        await page
          .getByRole('menuitem', { name: 'Make Template', exact: true })
          .click()
        const result = (await (await created).json()) as {
          data?: { journeyTemplate?: { id: string } }
          errors?: unknown[]
        }
        expect(result.errors).toBeUndefined()
        templateId = result.data?.journeyTemplate?.id
        expect(templateId).toBeTruthy()
        await expect(
          page.getByRole('tab', { name: 'Team Templates', exact: true })
        ).toHaveAttribute('aria-selected', 'true')
        const card = page
          .locator('div[aria-label="journey-card"]')
          .filter({ hasText: title })
        await card
          .getByRole('button', {
            name: 'journey breakdown analytics',
            exact: true
          })
          .click()
        const dialog = page.getByRole('dialog', {
          name: /Template Breakdown Analytics/
        })
        await expect(dialog).toBeVisible()
        expect(
          await page.evaluate(
            () => new Intl.DateTimeFormat().resolvedOptions().locale
          )
        ).toBe(locale)
        for (const label of ['From', 'To']) {
          const field = dialog.getByRole('group', { name: label, exact: true })
          await expect(field.getByRole('spinbutton')).toHaveText(
            order.map(
              (section) => ({ Month: 'MM', Day: 'DD', Year: 'YYYY' })[section]
            )
          )
        }
        const fromField = dialog.getByRole('group', {
          name: 'From',
          exact: true
        })
        const toField = dialog.getByRole('group', { name: 'To', exact: true })
        const verifyRange = async (
          edit: () => Promise<void>
        ): Promise<void> => {
          const response = page.waitForResponse((result) =>
            isBreakdownResponse(result, 'custom', '2026-05-04,2026-05-06')
          )
          await edit()
          const applied = await response
          expect(applied.ok()).toBe(true)
          expect(
            ((await applied.json()) as { errors?: unknown[] }).errors
          ).toBeUndefined()
          await expect(fromField.getByRole('spinbutton')).toHaveText(
            from.split('/')
          )
          await expect(toField.getByRole('spinbutton')).toHaveText(
            to.split('/')
          )
        }
        await verifyRange(async () => {
          await enterDate(fromField, '04')
          await enterDate(toField, '06')
        })
        const resetResponse = page.waitForResponse((response) =>
          isBreakdownResponse(response, 'all')
        )
        await dialog.getByRole('button', { name: 'Reset date range' }).click()
        expect((await resetResponse).ok()).toBe(true)
        await verifyRange(async () => {
          await selectMayDay(page, fromField, '4')
          await selectMayDay(page, toField, '6')
        })
      } finally {
        if (templateId != null) {
          // Make Template removes the duplicate's user ownership, so the normal
          // owner-based E2E sweep will only find the source journey. Trash this
          // run's template explicitly, leaving existing team templates alone.
          await page.goto(`/journeys/${templateId}`)
          await journeyPage.clickThreeDotBtnOfCustomJourney()
          await page
            .getByRole('menuitem', { name: 'Trash', exact: true })
            .click()
          const trash = page.getByRole('dialog', { name: 'Trash Template?' })
          await trash
            .getByRole('button', { name: 'Delete', exact: true })
            .click()
          await expect(trash).toBeHidden()
        }
      }
    })
  })
}
