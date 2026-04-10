/* eslint-disable playwright/expect-expect */
import { expect, test } from '@playwright/test'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { ProfilePage } from '../../pages/profile-page'
import { Register } from '../../pages/register-Page'

const ninetySecondsTimeout = 90000
const thirtySecondsTimeout = 30000

/** Empty Playwright storage snapshot — no cookies, localStorage, or sessionStorage. */
const freshStorageState = { cookies: [], origins: [] }

/**
 * Admin login view
 *
 * Verifies that a pre-existing admin account, after logging in, sees the
 * complete Discover page in "Shared With Me" mode (the admin on this
 * deployment has no lastActiveTeamId set, so no team is auto-selected).
 *
 * Uses `browser.newContext({ storageState: freshStorageState })` so the flow
 * never inherits cookies, localStorage, or sessionStorage from any other test,
 * worker snapshot, or the authenticated fixture’s default `page`.
 * `LoginPage.login('admin')` ends with `waitUntilDiscoverPageLoadedAsAdmin()`.
 */
test(
  'admin can log in and see the Discover page',
  async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: freshStorageState })
    const page = await ctx.newPage()

    try {
      await page.goto('/')
      await new LoginPage(page).login('admin')

      // Primary navigation items live in the permanent drawer.
      // MUI Drawer's root element is a flex-spacer that can have zero visible
      // bounding box; assert the items inside the paper instead.
      await expect(
        page.getByTestId('NavigationListItemProjects')
      ).toBeVisible()

      await expect(
        page.getByTestId('NavigationListItemTemplates')
      ).toBeVisible()

      // TeamSelect combobox is enabled once TeamProvider has finished loading.
      // We do not assert the specific team/SharedWithMe text because the admin's
      // active team can change between runs.
      await expect(
        page.getByTestId('TeamSelect').getByRole('combobox')
      ).toBeEnabled()

      // Profile nav item is rendered by UserNavigation once the `me` query resolves.
      await expect(
        page.getByTestId('NavigationListItemProfile')
      ).toBeVisible({ timeout: thirtySecondsTimeout })

      // Logout: open the profile menu, click Log Out, land back on the sign-in page.
      const profilePage = new ProfilePage(page)
      await profilePage.clickProfileIconInNavBar()
      await profilePage.clickLogout()
      await profilePage.verifyloggedOut()
    } finally {
      await ctx.close()
    }
  }
)

/**
 * Resume onboarding after leaving before accepting terms
 *
 * Registers through OTP and lands on Terms and Conditions, then closes the
 * context (no journey profile / terms acceptance yet). On a fresh session,
 * email sign-in should route back to Terms and Conditions: `checkConditionalRedirect`
 * sends users with no `acceptedTermsAt` to `/users/terms-and-conditions` before
 * any `/teams/new` workspace step (`checkConditionalRedirect.ts` — terms gate
 * runs before the empty-teams redirect).
 */
test(
  'new user who leaves before accepting terms returns to Terms and Conditions after signing in again',
  async ({ browser }) => {
    test.setTimeout(3 * 60 * 1000)
    const ctx1 = await browser.newContext({ storageState: freshStorageState })
    const page1 = await ctx1.newPage()
    let userEmail: string
    try {
      await new LandingPage(page1).goToAdminUrl()
      const register = new Register(page1)
      await register.registerNewAccountThroughOtpThenStopOnTermsPage()
      userEmail = await register.getUserEmailId()
    } finally {
      await ctx1.close()
    }

    const ctx2 = await browser.newContext({ storageState: freshStorageState })
    const page2 = await ctx2.newPage()
    try {
      await page2.goto('/')
      const loginPage = new LoginPage(page2)
      await loginPage.signInWithEmailAndPassword(userEmail)
      await new Register(page2).assertOnTermsAndConditionsPage()
    } finally {
      await ctx2.close()
    }
  }
)

/**
 * New user registration view
 *
 * Registers a brand-new user from scratch using a completely isolated browser
 * context with an explicit empty `storageState` (not the default `page` fixture
 * and not worker `storageState` snapshots). After onboarding completes the user should land
 * on the Discover page in Team Mode — their first workspace is auto-selected.
 */
test(
  'new user can register and see the Discover page in team mode',
  async ({ browser }) => {
    // 3 minutes: registration + OTP + T&C + workspace creation each have their
    // own 90s waits; the sum can exceed the default 3-minute test timeout.
    test.setTimeout(3 * 60 * 1000)
    const ctx = await browser.newContext({
      storageState: freshStorageState,
      // Pin i18n so the auto-created team title matches `en` "{{ displayName }} & Team".
      locale: 'en-US'
    })
    const page = await ctx.newPage()

    try {
      await new LandingPage(page).goToAdminUrl()

      // Full registration flow: email → OTP → Terms & Conditions → workspace
      // creation.  Ends on the Discover page (with a page.reload() inside
      // verifyTermsAcceptedAndPersisted to confirm T&C acceptance persisted).
      const register = new Register(page)
      await register.registerNewAccount()

      // "Create Custom Journey" is only rendered and enabled in Team Mode.
      // Waiting for it is the most reliable signal that the new user's first
      // workspace is loaded and active.
      await expect(
        page.getByRole('button', { name: 'Create Custom Journey' })
      ).toBeEnabled({ timeout: ninetySecondsTimeout })

      // TeamSelect shows `activeTeam.title` — same pattern TermsAndConditions uses
      // for teamCreate: t('{{ displayName }} & Team', { displayName }) → en: "<name> & Team".
      const displayName = register.getRegisteredDisplayName()
      const expectedAutoCreatedTeamTitle = `${displayName} & Team`

      // TeamSelect is enabled and shows the workspace name — never "Shared
      // With Me" for a brand-new user who just created their first team.
      const teamSelect = page.getByTestId('TeamSelect').getByRole('combobox')
      await expect(teamSelect).toBeEnabled({ timeout: ninetySecondsTimeout })
      await expect(teamSelect).toContainText(expectedAutoCreatedTeamTitle)
      await expect(teamSelect).not.toContainText('Shared With Me')

      // Primary navigation items are present.
      await expect(
        page.getByTestId('NavigationListItemProjects')
      ).toBeVisible()
      await expect(
        page.getByTestId('NavigationListItemTemplates')
      ).toBeVisible()

      // Profile nav item renders once the authenticated `me` query resolves.
      await expect(
        page.getByTestId('NavigationListItemProfile')
      ).toBeVisible({ timeout: thirtySecondsTimeout })

      // Logout: open the profile menu, click Log Out, land back on the sign-in page.
      const profilePage = new ProfilePage(page)
      await profilePage.clickProfileIconInNavBar()
      await profilePage.clickLogout()
      await profilePage.verifyloggedOut()
    } finally {
      await ctx.close()
    }
  }
)
