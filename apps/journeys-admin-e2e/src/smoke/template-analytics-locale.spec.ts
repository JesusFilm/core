import type { Locator, Page, Response } from '@playwright/test'

import { expect, test } from '../fixtures/authenticated'
import { JourneyPage } from '../pages/journey-page'

const locales = [
  {
    locale: 'en-US',
    placeholder: 'MM/DD/YYYY',
    from: '05/04/2026',
    to: '05/06/2026'
  },
  {
    locale: 'en-NZ',
    placeholder: 'DD/MM/YYYY',
    from: '04/05/2026',
    to: '06/05/2026'
  },
  {
    locale: 'ja-JP',
    placeholder: 'YYYY/MM/DD',
    from: '2026/05/04',
    to: '2026/05/06'
  }
] as const

interface GraphQLRequest {
  operationName?: string
  variables?: { where?: { period?: string; date?: string } }
}

function getOperation(response: Response): GraphQLRequest | undefined {
  const request = response.request()
  if (
    request.method() !== 'POST' ||
    request.headers()['content-type']?.split(';')[0] !== 'application/json'
  )
    return
  return request.postDataJSON() as GraphQLRequest | undefined
}

function isBreakdownResponse(
  response: Response,
  period: string,
  date?: string
): boolean {
  const body = getOperation(response)
  return (
    body?.operationName === 'GetTemplateFamilyStatsBreakdown' &&
    body.variables?.where?.period === period &&
    body.variables.where.date === date
  )
}

async function expectBreakdown(response: Response): Promise<void> {
  expect(response.ok()).toBe(true)
  const result = (await response.json()) as {
    errors?: unknown[]
    data?: { templateFamilyStatsBreakdown?: unknown[] }
  }
  expect(result.errors).toBeUndefined()
  expect(result.data?.templateFamilyStatsBreakdown).toEqual(expect.any(Array))
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
  dialog: Locator,
  label: 'From' | 'To',
  day: string
): Promise<void> {
  const field = dialog.getByRole('group', { name: label, exact: true })
  await field.getByRole('button', { name: 'Choose date', exact: true }).click()
  const picker = page.getByRole('dialog', { name: label, exact: true })
  const monthLabel = await picker.getByRole('grid').evaluate((grid) => {
    const labelId = grid.getAttribute('aria-labelledby') ?? ''
    return document.getElementById(labelId)?.textContent
  })
  const displayed = new Date(`1 ${monthLabel}`)
  expect(Number.isFinite(displayed.getTime())).toBe(true)
  const target = new Date(2026, 4, 1)
  const direction = displayed < target ? 1 : -1
  while (displayed.getTime() !== target.getTime()) {
    await picker
      .getByRole('button', {
        name: direction === 1 ? 'Next month' : 'Previous month',
        exact: true
      })
      .click()
    displayed.setMonth(displayed.getMonth() + direction)
    const name = displayed.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
    await expect(picker.getByRole('grid', { name, exact: true })).toBeVisible()
  }
  const calendar = picker.getByRole('grid', { name: 'May 2026', exact: true })
  const date = calendar.getByRole('gridcell', { name: day, exact: true })
  await expect(date).toHaveCount(1)
  await date.click()
}

for (const { locale, placeholder, from, to } of locales) {
  test.describe(`template analytics browser locale ${locale}`, () => {
    test.use({ locale })
    test.beforeEach(async ({ context, baseURL }) => {
      if (baseURL == null) throw new Error('The app URL is required for login')
      // Set the app's language before the authentication fixture opens the sign-in page.
      await context.addCookies([
        { name: 'NEXT_LOCALE', value: '00004---en', url: baseURL }
      ])
    })

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
        const [created] = await Promise.all([
          page.waitForResponse(
            (response) =>
              getOperation(response)?.operationName === 'CreateTemplate'
          ),
          page
            .getByRole('menuitem', { name: 'Make Template', exact: true })
            .click()
        ])
        const result = (await created.json()) as {
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
          await expect(field).toContainText(placeholder)
        }
        const fromField = dialog.getByRole('group', {
          name: 'From',
          exact: true
        })
        const toField = dialog.getByRole('group', { name: 'To', exact: true })
        const verifyRange = async (
          edit: () => Promise<void>
        ): Promise<void> => {
          const [applied] = await Promise.all([
            page.waitForResponse((result) =>
              isBreakdownResponse(result, 'custom', '2026-05-04,2026-05-06')
            ),
            edit()
          ])
          await expectBreakdown(applied)
          await expect(fromField).toContainText(from)
          await expect(toField).toContainText(to)
        }
        await verifyRange(async () => {
          await enterDate(fromField, '04')
          await enterDate(toField, '06')
        })
        const [reset] = await Promise.all([
          page.waitForResponse((response) =>
            isBreakdownResponse(response, 'all')
          ),
          dialog.getByRole('button', { name: 'Reset date range' }).click()
        ])
        await expectBreakdown(reset)
        await verifyRange(async () => {
          await selectMayDay(page, dialog, 'From', '4')
          await selectMayDay(page, dialog, 'To', '6')
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
