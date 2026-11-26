import { test } from '@playwright/test'

import { PreviewScreenPage } from '../pages/preview-screen-action'

test('waits for chat popup navigation before checking its destination', async ({
  page,
  context
}) => {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === 'fixture.invalid') {
      await route.fulfill({
        contentType: 'text/html',
        body: `
          <button onclick="const popup = window.open('about:blank'); queueMicrotask(() => popup.location = 'https://www.messenger.com/owned-fixture')">Chat one</button>
          <button onclick="const popup = window.open('about:blank'); queueMicrotask(() => popup.location = 'https://api.whatsapp.com/owned-fixture')">Chat two</button>
        `
      })
      return
    }
    if (
      url.pathname === '/owned-fixture' &&
      ['www.messenger.com', 'api.whatsapp.com'].includes(url.hostname)
    ) {
      await route.fulfill({
        contentType: 'text/html',
        body: '<p>Owned synthetic chat destination</p>'
      })
      return
    }
    await route.abort()
  })
  await page.goto('https://fixture.invalid')
  const previewScreenPage = new PreviewScreenPage(page, context, test)
  previewScreenPage.chatIcon = 'button'
  await previewScreenPage.validateChatWidgetWithLinks()
})
