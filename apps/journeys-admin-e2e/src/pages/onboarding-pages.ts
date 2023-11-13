import { Page } from 'playwright-core'

export class OnboardingPages {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.locator('input[type="email"]').click()
    await this.page.locator('input[type="email"]').fill(email)
  }

  async clickNextButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Next' }).click()
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.locator('input[type="password"]').click()
    await this.page.locator('input[type="password"]').fill(password)
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async createUser(
    email: string,
    firstAndLastName: string,
    password: string
  ): Promise<void> {

    await this.fillEmail(email)
    await this.clickNextButton()
    await this.page.getByLabel('First & last name').click()
    await this.page.getByLabel('First & last name').fill(firstAndLastName)
    await this.fillPassword(password)
    await this.page.getByRole('button', { name: 'Save' }).click()

    await this.page
      .getByLabel('I agree with listed above conditions and requirements')
      .check()
    await this.page.getByRole('button', { name: 'Next' }).click()

    // Save Email and Password as environment variables for later use
    process.env.EMAIL = email
    process.env.PASSWORD = password
    process.env.FIRST_AND_LAST_NAME = firstAndLastName
  }

  async fillOnboardingForm(teamName: string, legalName: string): Promise<void> {
    await this.page.locator('input[name="nsStage"]').click()
    await this.page.locator('input[name="nsStage"]').fill('NS - Stage - Answer')
    await this.page.locator('#ZtEx_m-Hg').click()
    await this.page.locator('#ZtEx_m-Hg').fill('Question-edit answer')
    await this.page.getByRole('button', { name: 'Next' }).click()

    await this.page.click('textarea#lWcpw1ey7[name="onboarding"]')
    await this.page.fill(
      'textarea#lWcpw1ey7[name="onboarding"]',
      'onboarding long question - answer'
    )

    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.check('input[type="radio"][value="Option 1"]')
    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.check('input[type="checkbox"][value="Option 1"]')
    await this.page.check('input[type="checkbox"][value="Option 2"]')
    await this.page.getByRole('button', { name: 'Next' }).click()
    await this.page.click('input[type="text"][id="title"]')
    await this.page.fill('input[type="text"][id="title"]', teamName)

    await this.page.click('input[type="text"][id="publicTitle"]')
    await this.page.fill('input[type="text"][id="publicTitle"]', legalName)

    await this.page.getByRole('button', { name: 'Create' }).click()

    await this.page.getByRole('button', { name: 'Skip' }).click()

    process.env.TEAM_NAME = teamName
    process.env.LEGAL_NAME = legalName
  }
}
