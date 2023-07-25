const puppeteer = require('puppeteer')

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:4200/'

;(async () => {
  const browser = await puppeteer.launch()

  const page = await browser.newPage()
  if (page != null) {
    await page.goto(`${DEPLOYMENT_URL}/users/sign-in`)

    await page.click('.firebaseui-id-idp-button')

    await page.type('#ui-sign-in-email-input', 'test@gmail.com')
    await page.type('#ui-sign-in-password-input', 'test123456')
    await page.click('.firebaseui-id-submit')

    await page.waitForNavigation({ waitUntil: 'networkidle0' })
  }

  await browser.close()
})()
