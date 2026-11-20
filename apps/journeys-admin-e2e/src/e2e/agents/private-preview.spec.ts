import { Page, expect, test } from '@playwright/test'

import { getEmail, getPassword } from '../../framework/helpers'
import { LoginPage } from '../../pages/login-page'

function setting(name: string): string {
  const value = process.env[name]
  if (!value)
    throw new Error(
      `Missing ${name}; seed the isolated private preview fixture first`
    )
  return value
}

async function signIn(page: Page, account: string): Promise<void> {
  await page.goto('/users/sign-in')
  const login = new LoginPage(page)
  await login.fillExistingEmail(await getEmail(account))
  await login.clickSubmitButton()
  await login.fillExistingPassword(await getPassword(account))
  await login.clickSubmitButton()
  await expect(page).not.toHaveURL(/\/users\/sign-in/)
}

// Normal Firebase sign-in and local services. Tokens and credentials must stay out of artifacts.
test.use({ trace: 'off', video: 'off', screenshot: 'off' })

test.describe('private playback and human publication @manual', () => {
  test('plays saved branches without effects and keeps warmed page data private', async ({
    page,
    browser,
    baseURL
  }) => {
    const id = setting('PRIVATE_PREVIEW_JOURNEY_ID')
    await signIn(page, 'admin2')
    const effects: string[] = []
    page.on('request', (request) => {
      if (/plausible|google-analytics|growthspaces/i.test(request.url()))
        effects.push('analytics or integration request')
      const body = request.postData()
      if (body && /mutation\s+\w*(Event|Visitor|Submission)/.test(body))
        effects.push('visitor mutation')
    })
    await page.goto(`/journeys/${id}/preview`)
    await expect(
      page.getByRole('heading', { name: 'Preview start saved' })
    ).toBeVisible()
    await expect(page.getByText('Synthetic location')).toBeVisible()
    await page
      .getByRole('textbox', { name: 'Contact email' })
      .fill('synthetic@example.com')
    await page.getByRole('button', { name: 'Submit preview form' }).click()
    page.on('popup', (popup) => {
      effects.push('external popup')
      void popup.close()
    })
    await page.getByRole('button', { name: 'External example' }).click()
    await page.getByRole('button', { name: 'Answer branch' }).click()
    await expect(
      page.getByRole('heading', { name: 'Preview answer saved' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Previous', exact: true }).click()
    await page.getByRole('button', { name: 'Default branch' }).click()
    await expect(
      page.getByRole('heading', { name: 'Preview default saved' })
    ).toBeVisible()
    expect(effects).toEqual([])
    await expect(
      page.getByRole('link', { name: 'Open in Admin' })
    ).toHaveAttribute('href', `/journeys/${id}`)
    const buildId = await page
      .locator('#__NEXT_DATA__')
      .evaluate(
        (element) =>
          (JSON.parse(element.textContent ?? '{}') as { buildId: string })
            .buildId
      )
    const anonymous = await browser.newContext()
    try {
      for (const path of [
        `/journeys/${id}/preview`,
        `/_next/data/${buildId}/journeys/${id}/preview.json`
      ]) {
        const response = await anonymous.request.get(
          new URL(path, baseURL).href,
          { maxRedirects: 0 }
        )
        expect(await response.text()).not.toContain('Preview start saved')
        expect(response.headers()['cache-control']).toContain('no-store')
      }
    } finally {
      await anonymous.close()
    }
  })

  test('keeps website card routes private and denies stranger playback and Editor Publish', async ({
    page
  }) => {
    const id = setting('PRIVATE_PREVIEW_WEBSITE_ID')
    await signIn(page, 'admin2')
    await page.goto(`/journeys/${id}/preview`)
    await page.getByRole('button', { name: 'Answer branch' }).click()
    await expect(page).toHaveURL(
      new RegExp(`/journeys/${id}/preview\\?stepId=`)
    )
    await expect(
      page.getByRole('heading', { name: 'Preview answer saved' })
    ).toBeVisible()
    await page.goto(`/journeys/${id}`)
    await expect(
      page.getByRole('button', { name: 'Publish', exact: true })
    ).toHaveCount(0)
  })

  test('denies a signed-in stranger after another user has warmed playback', async ({
    page
  }) => {
    await signIn(page, 'admin3')
    await page.goto(
      `/journeys/${setting('PRIVATE_PREVIEW_JOURNEY_ID')}/preview`
    )
    await expect(
      page.getByRole('heading', { name: 'Preview start saved' })
    ).toHaveCount(0)
    expect(await page.content()).not.toContain('Private preview sentinel 10563')
  })

  test('publishes from the normal editor with Manage rights and enables public playback', async ({
    page
  }) => {
    const id = setting('PRIVATE_PREVIEW_JOURNEY_ID')
    const publicUrl = setting('PRIVATE_PREVIEW_PUBLIC_URL')
    const before = await page.request.get(publicUrl)
    expect(await before.text()).not.toContain('Preview start saved')
    await signIn(page, 'admin')
    await page.goto(`/journeys/${id}`)
    await page.getByRole('button', { name: 'Publish', exact: true }).click()
    await expect(page.getByText('Journey published')).toBeVisible()
    // 90s: the public viewer may retain the earlier not-found ISR result for 60s.
    await expect(async () => {
      await page.goto(publicUrl)
      await expect(
        page.getByRole('heading', { name: 'Preview start saved' })
      ).toBeVisible()
    }).toPass({ timeout: 90000 })
  })
})
