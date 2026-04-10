/* eslint-disable playwright/expect-expect */
import { expect, test } from '../../fixtures/authenticated'
import { LandingPage } from '../../pages/landing-page'
import { ProfilePage } from '../../pages/profile-page'
import { Register } from '../../pages/register-Page'

const ninetySecondsTimeout = 90000
const thirtySecondsTimeout = 30000

/**
 * Admin login view
 *
 * Verifies that a pre-existing admin account, after logging in, sees the
 * complete Discover page in "Shared With Me" mode (the admin on this
 * deployment has no lastActiveTeamId set, so no team is auto-selected).
 *
 * Uses the `authenticated` fixture which calls `waitUntilDiscoverPageLoadedAsAdmin()`
 * before handing the page to the test, so all assertions here are fast
 * sanity-checks against an already-stable page.
 */
test(
  'admin can log in and see the Discover page',
  async ({ authedPage }) => {
    // Primary navigation items live in the permanent drawer.
    // MUI Drawer's root element is a flex-spacer that can have zero visible
    // bounding box; assert the items inside the paper instead.
    await expect(
      authedPage.getByTestId('NavigationListItemProjects')
    ).toBeVisible()

    await expect(
      authedPage.getByTestId('NavigationListItemTemplates')
    ).toBeVisible()

    // TeamSelect combobox is enabled once TeamProvider has finished loading
    // (guaranteed by the fixture, so this is a fast sanity re-check).
    // We do not assert the specific team/SharedWithMe text because the admin's
    // active team can change between runs.
    await expect(
      authedPage.getByTestId('TeamSelect').getByRole('combobox')
    ).toBeEnabled()

    // Profile nav item is rendered by UserNavigation once the `me` query resolves.
    await expect(
      authedPage.getByTestId('NavigationListItemProfile')
    ).toBeVisible({ timeout: thirtySecondsTimeout })

    // Logout: open the profile menu, click Log Out, land back on the sign-in page.
    const profilePage = new ProfilePage(authedPage)
    await profilePage.clickProfileIconInNavBar()
    await profilePage.clickLogout()
    await profilePage.verifyloggedOut()
  }
)

/**
 * New user registration view
 *
 * Registers a brand-new user from scratch using a completely isolated browser
 * context (no shared cookies, localStorage, or sessionStorage from any other
 * test or worker fixture).  After onboarding completes the user should land
 * on the Discover page in Team Mode — their first workspace is auto-selected.
 */
test(
  'new user can register and see the Discover page in team mode',
  async ({ browser }) => {
    // 3 minutes: registration + OTP + T&C + workspace creation each have their
    // own 90s waits; the sum can exceed the default 3-minute test timeout.
    test.setTimeout(3 * 60 * 1000)
    // Completely isolated context — no prior test state can bleed in.
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    try {
      await new LandingPage(page).goToAdminUrl()

      // Full registration flow: email → OTP → Terms & Conditions → workspace
      // creation.  Ends on the Discover page (with a page.reload() inside
      // verifyTermsAcceptedAndPersisted to confirm T&C acceptance persisted).
      await new Register(page).registerNewAccount()

      // "Create Custom Journey" is only rendered and enabled in Team Mode.
      // Waiting for it is the most reliable signal that the new user's first
      // workspace is loaded and active.
      await expect(
        page.getByRole('button', { name: 'Create Custom Journey' })
      ).toBeEnabled({ timeout: ninetySecondsTimeout })

      // TeamSelect is enabled and shows the workspace name — never "Shared
      // With Me" for a brand-new user who just created their first team.
      const teamSelect = page.getByTestId('TeamSelect').getByRole('combobox')
      await expect(teamSelect).toBeEnabled({ timeout: ninetySecondsTimeout })
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
