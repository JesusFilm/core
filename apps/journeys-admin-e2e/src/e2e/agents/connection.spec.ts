import { createHash, randomBytes } from 'node:crypto'

import {
  type APIRequestContext,
  type Page,
  expect,
  test
} from '@playwright/test'

import { getEmail, getPassword } from '../../framework/helpers'
import { LoginPage } from '../../pages/login-page'

function setting(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} for local agent qualification`)
  return value
}

interface ConsentDetails {
  journeys: Array<{ id: string; title: string }>
}
interface BrowserConnection {
  issuer: string
  audience: string
  callback: string
  clientId: string
  verifier: string
  state: string
  details: ConsentDetails
}

async function signInFromAuthorization(
  page: Page,
  request: APIRequestContext,
  baseURL: string | undefined,
  account: 'admin' | 'admin2'
): Promise<BrowserConnection> {
  if (!baseURL) throw new Error('Admin baseURL is required')
  const admin = new URL(baseURL)
  const issuer = new URL(setting('AUTH_E2E_ISSUER'))
  for (const url of [admin, issuer]) {
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
      throw new Error('This qualification requires local synthetic databases')
    }
  }
  expect(admin.hostname).toBe(issuer.hostname)
  const audience = setting('AUTH_E2E_AUDIENCE')
  const callback = `${admin.origin}/agents/oauth-qualification-callback`
  // Only the synthetic OAuth client's callback is controlled. Firebase, Admin,
  // the issuer, gateway and owning backend requests use their real endpoints.
  await page.route(`${callback}**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'OAuth callback reached'
    })
  )
  const registered = await request.post(`${issuer.origin}/reg`, {
    data: {
      client_name: 'Local browser qualification',
      redirect_uris: [callback],
      response_types: ['code'],
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none'
    }
  })
  expect(registered.status()).toBe(201)
  const { client_id: clientId } = (await registered.json()) as {
    client_id: string
  }
  const verifier = randomBytes(32).toString('base64url')
  const state = randomBytes(32).toString('base64url')
  const authorization = new URL('/auth', issuer)
  authorization.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    response_type: 'code',
    resource: audience,
    scope: 'journeys:read journeys:edit offline_access',
    state,
    code_challenge_method: 'S256',
    code_challenge: createHash('sha256').update(verifier).digest('base64url')
  }).toString()
  await page.goto(authorization.href)
  const login = new LoginPage(page)
  await login.fillExistingEmail(await getEmail(account))
  await login.clickSubmitButton()
  await login.fillExistingPassword(await getPassword(account))
  const detailsResponse = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return (
      url.origin === issuer.origin &&
      /\/interaction\/[^/]+\/details$/.test(url.pathname)
    )
  })
  await login.clickSubmitButton()
  // 90s: cold Admin SSR, Firebase verification and gateway eligibility reads.
  await expect(
    page.getByRole('heading', {
      name: 'Connect an agent',
      level: 4,
      exact: true
    })
  ).toBeVisible({ timeout: 90000 })
  const response = await detailsResponse
  expect(response.status()).toBe(200)
  return {
    issuer: issuer.origin,
    audience,
    callback,
    clientId,
    verifier,
    state,
    details: (await response.json()) as ConsentDetails
  }
}

// Auth codes, Firebase credentials and token responses must not enter traces.
test.use({ trace: 'off', video: 'off', screenshot: 'off' })

test.describe('local agent connection @manual', () => {

  test('sign in, approve selected View only access and rotate credentials', async ({
    page,
    request,
    baseURL
  }) => {
    const connection = await signInFromAuthorization(
      page,
      request,
      baseURL,
      'admin'
    )
    const titleA = setting('AUTH_E2E_JOURNEY_A_TITLE')
    const titleB = setting('AUTH_E2E_JOURNEY_B_TITLE')
    const journeyA = connection.details.journeys.find(
      (journey) => journey.title === titleA
    )
    expect(journeyA).toBeDefined()
    await expect(
      page.getByRole('checkbox', { name: titleA, exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('checkbox', { name: titleB, exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Connection duration' })
    ).toHaveText('One week')
    await page.getByRole('radio', { name: 'View only', exact: true }).check()
    await page.getByRole('checkbox', { name: titleA, exact: true }).check()
    await expect(
      page.getByRole('checkbox', { name: titleB, exact: true })
    ).not.toBeChecked()
    const reviewResponse = page.waitForResponse((response) =>
      /\/interaction\/[^/]+\/review$/.test(new URL(response.url()).pathname)
    )
    await page
      .getByRole('button', { name: 'Review connection', exact: true })
      .click()
    const reviewed = await reviewResponse
    expect(reviewed.status()).toBe(200)
    const review = (await reviewed.json()) as {
      expiresAt: string
      journeyIds: string[]
    }
    expect(review.journeyIds).toEqual([journeyA!.id])
    await expect(
      page.getByText(review.expiresAt, { exact: false })
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Approve connection', exact: true })
      .click()
    await page.waitForURL(
      (url) => `${url.origin}${url.pathname}` === connection.callback
    )
    const callback = new URL(page.url())
    expect(callback.searchParams.get('state')).toBe(connection.state)
    expect(callback.searchParams.get('iss')).toBe(connection.issuer)
    const code = callback.searchParams.get('code')
    expect(code).not.toBeNull()
    const exchanged = await request.post(`${connection.issuer}/token`, {
      form: {
        grant_type: 'authorization_code',
        code: code!,
        client_id: connection.clientId,
        code_verifier: connection.verifier,
        redirect_uri: connection.callback,
        resource: connection.audience
      }
    })
    expect(exchanged.status()).toBe(200)
    const tokens = (await exchanged.json()) as {
      access_token: string
      refresh_token: string
      scope: string
    }
    expect(typeof tokens.access_token).toBe('string')
    expect(tokens.scope).toBe('journeys:read')
    const introspect = async (token: string) => {
      const response = await request.post(
        `${connection.issuer}/token/introspection`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${setting('AUTH_INTROSPECTION_CLIENT_ID')}:${setting('AUTH_INTROSPECTION_CLIENT_SECRET')}`).toString('base64')}`
          },
          form: { token }
        }
      )
      expect(response.status()).toBe(200)
      return response.json() as Promise<Record<string, unknown>>
    }
    const expected = {
      active: true,
      mode: 'view',
      journey_ids: [journeyA!.id],
      aud: connection.audience,
      iss: connection.issuer,
      consent_expires_at: Math.floor(Date.parse(review.expiresAt) / 1000)
    }
    expect(await introspect(tokens.access_token)).toMatchObject(expected)
    const refreshed = await request.post(`${connection.issuer}/token`, {
      form: {
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: connection.clientId,
        resource: connection.audience
      }
    })
    expect(refreshed.status()).toBe(200)
    const rotated = (await refreshed.json()) as {
      access_token: string
      refresh_token: string
    }
    expect(rotated.refresh_token !== tokens.refresh_token).toBe(true)
    expect(await introspect(rotated.access_token)).toMatchObject(expected)
  })

  test('another signed-in user cannot approve a tampered journey selection', async ({
    page,
    request,
    baseURL
  }) => {
    const connection = await signInFromAuthorization(
      page,
      request,
      baseURL,
      'admin2'
    )
    const ownTitle = setting('AUTH_E2E_STRANGER_JOURNEY_TITLE')
    const foreignTitle = setting('AUTH_E2E_JOURNEY_A_TITLE')
    const foreignId = setting('AUTH_E2E_JOURNEY_A_ID')
    await expect(
      page.getByRole('checkbox', { name: foreignTitle, exact: true })
    ).toHaveCount(0)
    await page.getByRole('checkbox', { name: ownTitle, exact: true }).check()
    await page.route(`${connection.issuer}/interaction/*/review`, (route) => {
      const input = route.request().postDataJSON() as Record<string, unknown>
      return route.continue({
        postData: JSON.stringify({ ...input, journeyIds: [foreignId] })
      })
    })
    const rejectedReview = page.waitForResponse((response) =>
      /\/interaction\/[^/]+\/review$/.test(new URL(response.url()).pathname)
    )
    await page
      .getByRole('button', { name: 'Review connection', exact: true })
      .click()
    expect((await rejectedReview).status()).toBe(403)
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Approve connection', exact: true })
    ).toHaveCount(0)
  })

  test('denying the browser interaction returns no authorization code', async ({
    page,
    request,
    baseURL
  }) => {
    const connection = await signInFromAuthorization(
      page,
      request,
      baseURL,
      'admin'
    )
    await page
      .getByRole('button', { name: 'Deny connection', exact: true })
      .click()
    await page.waitForURL(
      (url) => `${url.origin}${url.pathname}` === connection.callback
    )
    const callback = new URL(page.url())
    expect(callback.searchParams.get('state')).toBe(connection.state)
    expect(callback.searchParams.get('error')).toBe('access_denied')
    expect(callback.searchParams.has('code')).toBe(false)
  })
})
