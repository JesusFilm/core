import { Browser, BrowserContext, Page } from '@playwright/test'
import { LandingPage } from '../pages/landing-page'
import { LoginPage } from '../pages/login-page'
import { Register } from '../pages/register-Page'

interface AuthState {
  userEmail: string
  storageState: string
}

let authState: AuthState | null = null

export async function setupGlobalAuth(browser: Browser): Promise<AuthState> {
  if (authState) return authState

  // Create a new browser context
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // Register a new user
  const landingPage = new LandingPage(page)
  const register = new Register(page)
  await landingPage.goToAdminUrl()
  await register.registerNewAccount()
  const userEmail = await register.getUserEmailId()

  // Store the authentication state
  const storageState = `auth-state-${Date.now()}.json`
  await context.storageState({ path: storageState })
  
  // Close the browser context
  await context.close()

  authState = { userEmail, storageState }
  return authState
}

export async function getAuthenticatedContext(browser: Browser): Promise<{ context: BrowserContext; userEmail: string }> {
  const state = await setupGlobalAuth(browser)
  const context = await browser.newContext({
    storageState: state.storageState
  })
  return { context, userEmail: state.userEmail }
}

export async function loginWithStoredCredentials(page: Page): Promise<void> {
  if (!authState) {
    throw new Error('Auth state not initialized. Call setupGlobalAuth first.')
  }
  
  const landingPage = new LandingPage(page)
  const loginPage = new LoginPage(page)
  await landingPage.goToAdminUrl()
  await loginPage.logInWithCreatedNewUser(authState.userEmail)
} 