import { Page } from 'playwright-core'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(): Promise<void> {
    await this.page.goto('https://admin.nextstep.is')
  }

  async goToLoginPage(): Promise<void> {
    await this.page.click('a[routerlink="/login"]')
  }

  async userIsLoggedIn(): Promise<boolean> {
    const editorLink = await this.page.isVisible('a[routerlink="/editor"]')
    return Boolean(editorLink)
  }

  async goToSettings(): Promise<void> {
    await this.page.click('a[routerlink="/settings"]')
  }
}
