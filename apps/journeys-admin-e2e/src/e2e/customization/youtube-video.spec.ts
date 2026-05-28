import { expect, test } from '../../fixtures/authenticated'
import { CustomizationMediaPage } from '../../pages/customization-media-page'

const TEMPLATE_ID = '00dc45d7-9d37-434e-bbc8-7c89eeb6229a'
const YOUTUBE_URL =
  'https://www.youtube.com/watch?v=JHdB1dYAteA&pp=ygUKam9obiBwaXBlcg%3D%3D'

test.use({
  video: 'on'
})

test.describe('YouTube video section on Media screen', () => {
  test('should display VideosSection with input and upload button', async ({
    authedPage
  }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToMediaScreen(TEMPLATE_ID)
    await mediaPage.verifyVideosSectionVisible()
    await mediaPage.verifyYouTubeInputVisible()
    await mediaPage.verifyUploadButtonVisible()
  })

  test('should show placeholder and helper text on YouTube input', async ({
    authedPage
  }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToMediaScreen(TEMPLATE_ID)

    const input = authedPage
      .getByTestId('VideosSection-youtube-input')
      .locator('input')
    await expect(input).toHaveAttribute(
      'placeholder',
      'Paste a YouTube link...'
    )

    const helperText = await mediaPage.getYouTubeHelperText()
    expect(helperText).toBe('youtube.com, youtu.be and shorts links supported')
  })

  test('should auto-submit valid YouTube URL and show video preview', async ({
    authedPage
  }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToMediaScreen(TEMPLATE_ID)
    await mediaPage.pasteYouTubeUrl(YOUTUBE_URL)
    await mediaPage.waitForAutoSubmit()

    const inputValue = await mediaPage.getYouTubeInputValue()
    expect(inputValue).toBe(YOUTUBE_URL)
    await mediaPage.verifyVideoPreviewVisible()
  })

  test('should show error for invalid YouTube URL', async ({ authedPage }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToMediaScreen(TEMPLATE_ID)
    await mediaPage.pasteYouTubeUrl('not-a-valid-url')
    await mediaPage.waitForAutoSubmitError()

    const helperText = await mediaPage.getYouTubeHelperText()
    expect(helperText).toBe('Please enter a valid YouTube URL')
  })

  test('should render upload button at medium size', async ({ authedPage }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToMediaScreen(TEMPLATE_ID)

    const uploadButton = authedPage.getByTestId('VideosSection-upload-button')
    await expect(uploadButton).toBeVisible()

    // Verify Max size text is not present
    await expect(authedPage.getByText('Max size is 1 GB')).toBeHidden()
  })

  test('should use filled variant styling on YouTube input', async ({
    authedPage
  }) => {
    const mediaPage = new CustomizationMediaPage(authedPage)
    await mediaPage.navigateToMediaScreen(TEMPLATE_ID)

    // Filled variant renders with MuiFilledInput class
    const filledInput = authedPage
      .getByTestId('VideosSection-youtube-input')
      .locator('.MuiFilledInput-root')
    await expect(filledInput).toBeVisible()
  })
})
