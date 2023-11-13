import { Page } from 'playwright-core'

export class HomePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(): Promise<void> {
    await this.page.goto('/')
  }
}
