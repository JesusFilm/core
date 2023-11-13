import { expect, test } from '@playwright/test'

import { UserCreation } from '../pages/user-creation'

/* 
Test that a user can create an account and logout
*/
test('User creation and logout', async ({ page }) => {
  await page.goto('https://journeys-admin-2024-jesusfilm.vercel.app')
  await page.getByRole('button', { name: 'Sign in with email' }).click()
  await page.getByLabel('Email').click()

  const now = new Date()
  const epochTime = now.getTime()
  const email = `playwright.tester${epochTime}@example.com`
  const firstAndLastName = `FirstName LastName-${epochTime}`
  const password = `playwright-${epochTime}`
  const teamName = `Team Name-${epochTime}`
  const legalName = `Legal Name-${epochTime}`

  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('First & last name').click()
  await page.getByLabel('First & last name').fill(firstAndLastName)
  await page.getByLabel('Choose password').click()
  await page.getByLabel('Choose password').fill(password)
  await page.getByRole('button', { name: 'Save' }).click()

  await page
    .getByLabel('I agree with listed above conditions and requirements')
    .check()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('input[name="nsStage"]').click()
  await page.locator('input[name="nsStage"]').fill('NS - Stage - Answer')
  await page.locator('#ZtEx_m-Hg').click()
  await page.locator('#ZtEx_m-Hg').fill('Question-edit answer')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.click('textarea#lWcpw1ey7[name="onboarding"]')
  await page.fill(
    'textarea#lWcpw1ey7[name="onboarding"]',
    'onboarding long question - answer'
  )

  await page.getByRole('button', { name: 'Next' }).click()
  await page.check('input[type="radio"][value="Option 1"]')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.check('input[type="checkbox"][value="Option 1"]')
  await page.check('input[type="checkbox"][value="Option 2"]')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.click('input[type="text"][id="title"]')
  await page.fill('input[type="text"][id="title"]', teamName)

  await page.click('input[type="text"][id="publicTitle"]')
  await page.fill('input[type="text"][id="publicTitle"]', legalName)

  await page.getByRole('button', { name: 'Create' }).click()

  // await page.waitForLoadState('domcontentloaded')
  await page.getByRole('button', { name: 'Skip' }).click()

  // Test that Team details are recorded correctly
  await page.getByRole('button', { name: teamName }).click()
  const teamNameLocatoreInDropdown =
    'ul[role="listbox"] li[aria-selected="true"]'
  expect(await page.textContent(teamNameLocatoreInDropdown)).toContain(teamName)
  // Close team name drop down
  await page.click(teamNameLocatoreInDropdown)

  // Click on Profile
  await page.getByTestId('Profile-list-item').click()
  // Test name is correct
  expect(
    await page.textContent('div.MuiMenu-paper div p.MuiTypography-body1')
  ).toContain(firstAndLastName)
  // Test email is correct
  expect(
    await page.textContent('div.MuiMenu-paper div p.MuiTypography-body2')
  ).toContain(email)

  // Click on Log out
  await page.click('div ul li[role="menuitem"]')

  // Test that log out was successfully
  expect(
    await page.textContent('button[data-provider-id="password"]')
  ).toContain('Sign in with email')
})
