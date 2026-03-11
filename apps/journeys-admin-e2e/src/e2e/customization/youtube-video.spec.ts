import { test, expect } from '../../fixtures/authenticated'

import { CustomizationMediaPage } from '../../pages/customization-media-page'

const TEMPLATE_ID = '8d4c24c3-5fe0-428d-b221-af9e46975933'

test.use({
  video: 'on'
})

test.describe('YouTube video section on Media screen', () => {
  test('should display VideosSection after navigating to Media screen', async ({
    authedPage
  }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToCustomize(TEMPLATE_ID)
    await mediaPage.navigateToMediaScreen()
    await mediaPage.verifyVideosSectionVisible()
    await mediaPage.verifyYouTubeInputVisible()
    await mediaPage.verifyUploadButtonVisible()
  })
})
