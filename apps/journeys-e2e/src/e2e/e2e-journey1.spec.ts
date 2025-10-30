import { test, devices } from '@playwright/test'
import { PreviewScreenPage } from '../pages/preview-screen-action'

test.use({
  ...devices['Pixel 5'],
  viewport: { width: 340, height: 680 },
  channel: 'chrome',
  actionTimeout: 3000
})
test.describe('Preview Screen Slides', () => {
  test('Journey Slides E2E', async ({ page, context }) => {
    // Increase timeout to reduce flakiness on desktop where pagination animations take longer
    test.setTimeout(120000)
    const previewScreenPage = new PreviewScreenPage(page, context, test)

    await test.step(`1. Verify the Landing Page
       - Should have land on this page.
       - (verfied the landing page)`, async () => {
      await previewScreenPage.goto()
      await previewScreenPage.verifyLandingPage()
    })

    await test.step(`2. Verify the Swipe/Click right to go to next card
      - Should take you to the next card.
      - Pagination dots moved
      - Info button on top right
      - Share button on bottom left
      - Like/Dislike button on bottom left
      - Host is shown on bottom left
      - Journey Title on bottom left
      - Chat widget takes you to respectful links
      - (Verified the Active Pagination index should be increased, Icons Visibled with position)`, async () => {
      await previewScreenPage.verifyNextNavigation()
      await previewScreenPage.verifyCardIconsAndChatWidgets()
    })

    await test.step(`3. Verify the Open Info button/Click (i) icon 
      - Pop up 
      - Team name 
      - Report this content option 
      - Terms & Conditions option
      - (Verified the Popup with Inner Content Visibled)`, async () => {
      await previewScreenPage.verifyInfoIcon()
    })

    await test.step(`4. Verify the Click on 'Report this Content'
      - Opened Email
      - (Verified the Wait for request triggered when 'Report this content' option is clicked and get the url from that request, decode both request url &  href url and verify both are same)`, async () => {
      await previewScreenPage.verifyReportContent()
    })

    await test.step(`5. Verify the Click on 'Terms and Condition'
      - Open the link for - https://www.cru.org/us/en/about/terms-of-use.html
      - (Verified the Link URL should be opened the New Tab)`, async () => {
      await previewScreenPage.validateTermsAndCondition()
    })

    await test.step(`6. Verify the Tap Right arrow to go the next card
       - Should take you to the next card
       - (Verified the Active Pagination index should be increased, Next Button is Visibled)`, async () => {
      await previewScreenPage.verifyNextButtonCard()
    })

    await test.step(`7. Verify the Tap Left Arrow, swipe left to right, swipe right to left
      - Navigate between cards, and as you move through, the pagination dots should update accordingly
      - Swiping left will take you to the next default card/step
      - Swiping right will take you to the previous default card/step
      - (Verified the Active Pagination index should be decreased, Active Pagination index should be increased)`, async () => {
      await previewScreenPage.verifyTapLeftRight()
    })

    await test.step(`8. Verify the Click "Next" button
      - Should take you to this card
      - (Verified the "Background Video" and "Background Image" buttons Visibled)`, async () => {
      await previewScreenPage.verifyBgVideoImgBtnCard()
    })

    await test.step(`9. Verify the Click "Background Video" button 
      - Library Jesus Video
      - This is testing a video from the Jesus Film Library.
      - Check that the background video
      - Autoplaying
      - Filling the screen
      - Has colour overlay on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Video should be Autoplaying, Background Video, Filling the screen, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyJesusVideo()
    })

    await test.step(`10. Verify the Swipe/Click to go to the next card. 
      - (Youtube Video)
      - This is testing a video from the Youtube Library
      - Check that the background video
      - Autoplaying
      - Filling the screen
      - Has colour overlay on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Video should be Autoplaying, Background Video, Filling the screen, overlay on the bottom half of the card, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyYoutubeVideoOrLink()
    })

    await test.step(`11. Verify the Swipe/Click to go to the next card. 
      - (Youtube Link Video)
      - This is testing a video from the Youtube Library
      - Check that the background video
      - Autoplaying
      - Filling the screen
      - Has colour overlay on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Video should be Autoplaying, Background Video, Filling the screen, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyYoutubeVideoOrLink()
    })

    await test.step(`12. Verify the Swipe/Click to go to the next card 
      - (Custom Upload Youtube Video)
      - This is testing a video from the Youtube Library
      - Check that the background video
      - Autoplaying
      - Filling the screen
      - Has colour overlay on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Video should be Autoplaying, Background Video, Filling the screen, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyVideoWithKeep()
    })

    await test.step(`13. Verify the Click "Check Background Image" button 
       - Click the "Check Background Image" button 
      14. Verify the Click 'Background Image' button 
      - (Image from Gallery)
      - This is testing an image from the 'Gallery'
      - Check that the background image is filling the screen
      - has colour overlay/gradient on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Image should be Filling the screen, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyBgImage()
    })

    await test.step(`15. Verify the Click/Swipe "Right" arrow 
      - (Uploaded Image File)
      - This is testing an Uploaded Image
      - Check that the background image is filling the screen
      - has colour overlay/gradient on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Image should be Filling the screen, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyOtherBgImage()
    })

    await test.step(`16. Verify the Click/Swipe "Right" arrow to go to the next card. 
      - (AI Generated Image)
      - This is testing an AI Generated Image
      - Check that the background image is filling the screen
      - has colour overlay/gradient on the bottom half of the card
      - texts and icons appear in white
      - (Verified the Image should be Filling the screen, Texts and Icons appear in white)`, async () => {
      await previewScreenPage.verifyAIBgImage()
    })

    // Video Loading Issue
    await test.step(`17. Verify the Click/Swipe 'Keep Going' button then navigate once more to the next card 
      - Video from Library (Jesus)
      - Should take you to this card with a video block
      - This is testing a video from Jesus Film Library
   
      18. Verify the Click/Swipe/Tap anywhere on the screen.
      - The video should pause.
   
      19. Verify the Click/Swipe/Tap anywhere on the screen.
      - Video should play again.
   
      20. Verify the Move the scrub bar to adjust the video playback position.
      - The video playback position should update smoothly as you move the scrub bar, allowing you to jump to different parts of the video without any issues.

    21. Verify the Click/Swipe/Tap full screen
      - The video should expand to full screen, with all controls remaining accessible and the playback continuing smoothly.

    22. Verify the Click/Swipe/Exit full screen
      - The video should exit full screen mode and return to its original size, with playback and controls functioning as expected.

    23. Verify the video play till the end
      - You should automatically land on the next card once the video has finished playing.

      - (Verified the video should be Visibled, Pause, Play, Full Screen, Video Playback time Changing, Automatically Navigate the Next Card)`, async () => {
      await previewScreenPage.verifyKeepGoing()
    })

    // Not showing that Video
    test.skip(
      true,
      `Commented Out- 24. Verify the Repeat steps 18-22 on this card and then swipe to go to next card. 
      - (Video from Youtube Link)
      - This is testing a video from YouTube library
      - (Verified the video should be Visibled, Pause, Play, Full Screen, Video Playback time Changing, Automatically Navigate the Next Card)`
    )

    test.skip(
      true,
      `Commented Out - 25. Verify the Repeat steps 18-22 on this card and then swipe to go to next card. 
      - (Video from Youtube Link)
      - This is testing a video from YouTube library
      - (Verified the video should be Visibled, Pause, Play, Full Screen, Video Playback time Changing, Automatically Navigate the Next Card)`
    )

    // Video Loading Issue
    test.skip(
      true,
      `Commented Out - 26. Verify the Repeat steps 18-22 on this card and then swipe to go to next card. 
      - Uploaded Video
      - This is testing a Uploded video
      - (Verified the video should be Visibled, Pause, Play, Full Screen, Video Playback time Changing, Automatically Navigate the Next Card)`
    )

    // Video Loading Issue
    test.skip(
      true,
      `Commented Out - 27. Verify the Swipe to go to next card. 
      - Should take you to this card with image blocks and a poll
      
      28. Verify the Select 'House by the beach' option. 
        - Should take you to this card with a background image and a response field
        - This response field is required
      
      29. Verify the Input Field. 
        - A notification should be appear below the text input box
      
      30. Verify the Click "submit" button without entering any text.
        - You can still move onto the next even if you haven't filled out the response field
        - This is an expected behaviour`
    )
  })
})