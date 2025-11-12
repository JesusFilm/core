import {
  BrowserContext,
  Locator,
  Page,
  TestType,
  expect
} from '@playwright/test'

import { BasePage } from './preview-screen-page'

export class PreviewScreenPage extends BasePage {
  context: BrowserContext

  constructor(page: Page, context: BrowserContext, test: TestType<any, any>) {
    super(page, test)
    this.context = context
  }

  async goto(): Promise<void> {
    await this.page.goto('/e2e-priority', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })
  }

  async verifyLandingPage(): Promise<void> {
    await expect
      .soft(
        this.page.locator(this.adminLogo),
        `Landing page should be displayed`
      )
      .toBeVisible()
  }

  async verifyNextNavigation(): Promise<void> {
    await this.clickWithPaginationBullet('right')
  }

  async verifyCardIconsAndChatWidgets(): Promise<void> {
    const viewport = this.page.viewportSize()
    if (!viewport) throw new Error('Viewport not available')

    const { width, height } = viewport

    // Helper to get element position
    const getPosition = async (
      selector: string,
      nth = 0
    ): Promise<{ x: number; y: number; width: number; height: number }> => {
      const box = await this.page.locator(selector).nth(nth).boundingBox()
      if (!box) throw new Error(`Element ${selector} not visible`)
      return box
    }

    await expect
      .soft(this.page.locator(this.infoIcon), `Info Icon should be displayed`)
      .toBeVisible()
    await expect
      .soft(
        this.page.locator(this.shareIcon).nth(0),
        `Share Icon should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(
        this.page.locator(this.thumbsUpIcon).nth(0),
        `ThumbsUp Icon should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(
        this.page.locator(this.thumbsDownIcon).nth(0),
        `ThumbsDown Icon should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(this.page.locator(this.hostIcon), `Host Icon should be displayed`)
      .toBeVisible()
    await expect
      .soft(
        this.page.locator(this.titleText).filter({ hasText: 'E2E Priority' }),
        `Title should be displayed`
      )
      .toBeVisible()

    // Validate positions approximately
    const infoPos = await getPosition(this.infoIcon)
    const sharePos = await getPosition(this.shareIcon)
    const thumbsUpPos = await getPosition(this.thumbsUpIcon)
    const thumbsDownPos = await getPosition(this.thumbsDownIcon)
    const hostPos = await getPosition(this.hostIcon)
    const titlePos = await getPosition(this.titleText)

    expect
      .soft(
        infoPos.y,
        `Info icon should be near the top (top-right area). Actual: ${infoPos.y}. Expected: < ${height * 0.2}`
      )
      .toBeLessThan(height * 0.2)
    expect
      .soft(
        infoPos.x,
        `Info icon should be on the right side of the screen. Actual: ${infoPos.x}. Expected: > ${width * 0.7}`
      )
      .toBeGreaterThan(width * 0.7)

    expect
      .soft(
        sharePos.y,
        `Share button should be near the bottom (bottom-left area). Actual: ${sharePos.y}. Expected: > ${height * 0.7}`
      )
      .toBeGreaterThan(height * 0.7)
    expect
      .soft(
        sharePos.x,
        `Share button should be aligned to the left side. Actual: ${sharePos.x}. Expected: < ${width * 0.3}`
      )
      .toBeLessThan(width * 0.3)

    expect
      .soft(
        thumbsUpPos.y,
        `Like button should appear near the bottom (bottom-left area). Actual: ${thumbsUpPos.y}. Expected: > ${height * 0.7}`
      )
      .toBeGreaterThan(height * 0.7)
    expect
      .soft(
        thumbsUpPos.x,
        `Like button should be positioned slightly right from the left edge. Actual: ${thumbsUpPos.x}. Expected: < ${width * 0.4}`
      )
      .toBeLessThan(width * 0.4)

    expect
      .soft(
        thumbsDownPos.y,
        `Dislike button should be near the bottom (bottom-left area). Actual: ${thumbsDownPos.y}. Expected: > ${height * 0.7}`
      )
      .toBeGreaterThan(height * 0.7)
    expect
      .soft(
        thumbsDownPos.x,
        `Dislike button should be slightly right from the Like button. Actual: ${thumbsDownPos.x}. Expected: < ${width * 0.5}`
      )
      .toBeLessThan(width * 0.5)

    expect
      .soft(
        hostPos.y,
        `Host text should appear near the bottom (bottom-left area). Actual: ${hostPos.y}. Expected: > ${height * 0.7}`
      )
      .toBeGreaterThan(height * 0.7)
    expect
      .soft(
        hostPos.x,
        `Host text should align left below buttons. Actual: ${hostPos.x}. Expected: < ${width * 0.3}`
      )
      .toBeLessThan(width * 0.3)

    expect
      .soft(
        titlePos.y,
        `Journey title should be near the bottom (bottom-left area). Actual: ${titlePos.y}. Expected: > ${height * 0.7}`
      )
      .toBeGreaterThan(height * 0.7)
    expect
      .soft(
        titlePos.x,
        `Journey title should be aligned mid-left area. Actual: ${titlePos.x}. Expected: < ${width * 0.6}`
      )
      .toBeLessThan(width * 0.6)

    await this.validateChatWidgetWithLinks()
  }

  async validateChatWidgetWithLinks(): Promise<void> {
    const chatLinks = [
      'https://www.messenger.com',
      'https://api.whatsapp.com/',
      'https://m.facebook.com'
    ]

    const chatWidgetsCount = (await this.page.locator(this.chatIcon).all())
      .length
    expect
      .soft(
        chatWidgetsCount,
        `Chat Widget button : Actual - ${chatWidgetsCount} | Expected - 2`
      )
      .toBe(2)

    for (let btnIndex = 0; btnIndex < 2; btnIndex++) {
      const [newPage] = await Promise.all([
        this.context.waitForEvent('page', { timeout: 30000 }),
        this.page.locator(this.chatIcon).nth(btnIndex).click()
      ])
      const chatUrl = newPage.url()
      const chatDomain = chatLinks.find((widgetUrl) =>
        chatUrl.includes(widgetUrl)
      )
      // Ensure we never pass undefined into the template literal and give a helpful failure
      if (chatDomain == null) {
        expect
          .soft(
            chatDomain,
            `Unexpected chat URL: ${chatUrl}. Allowed domains: ${chatLinks.join(', ')}`
          )
          .toBeDefined()
      }
      expect
        .soft(
          chatDomain,
          `URL from application : ${chatUrl} should be one of ${chatLinks.join(', ')}`
        )
        .toBeTruthy()
      await newPage.close()
    }
  }

  async verifyInfoIcon(): Promise<void> {
    await expect
      .soft(this.page.locator(this.infoIcon), `Info Icon should be displayed`)
      .toBeVisible()
    await this.page.locator(this.infoIcon).click()

    await expect
      .soft(
        this.page.locator(this.infoContainer),
        `Info Popup Container Icon should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(
        this.page
          .locator(this.teamName)
          .filter({ hasText: '01 Stage - QA Team Journeys' }),
        `Team Name should be displayed`
      )
      .toBeVisible()

    await expect
      .soft(
        this.page.locator(this.reportContentBtn),
        `Report this Content Option should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(
        this.page
          .locator(this.termAndConditionBtn)
          .filter({ hasText: 'Terms & Conditions' }),
        `Terms & Conditions Option should be displayed`
      )
      .toBeVisible()
  }

  async verifyReportContent(): Promise<void> {
    const reportBtn = this.page
      .locator(this.reportContentBtn)
      .filter({ hasText: 'Report this content' })

    const mailHref = await reportBtn.getAttribute('href')
    if (mailHref === null) {
      throw new Error('Expected an href attribute value, but got null')
    }
    const decodedHrefMailLink = decodeURI(mailHref)

    const mailtoRequestPromise = this.page.waitForRequest(
      (request) => request.url().includes('mailto:'),
      { timeout: 10000 }
    )
    await reportBtn.click({ timeout: 10000, noWaitAfter: true })
    const mailtoRequest = await mailtoRequestPromise
    const decodeRequestUrl = decodeURI(mailtoRequest.url())

    expect
      .soft(
        decodeRequestUrl,
        `When Click the Report this Content to decode request url & href url should be same`
      )
      .toBe(decodedHrefMailLink)
  }

  async validateTermsAndCondition(): Promise<void> {
    const termsAndConditionLink = ['https://www.cru.org/']

    await this.page.locator(this.infoIcon).click()
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page', { timeout: 10000 }),
      this.page.locator(this.termAndConditionBtn).click()
    ])
    await newPage.waitForLoadState('load', { timeout: 60000 })
    const termAndConditionUrl = newPage.url()
    const termAndConditionDomain = termsAndConditionLink.find((widgetUrl) =>
      termAndConditionUrl.includes(widgetUrl)
    )
    const domainForMsg = termAndConditionDomain ?? 'not-found'
    expect(
      termAndConditionDomain,
      `URL from application : ${termAndConditionUrl} → matched: ${domainForMsg}; allowed: ${termsAndConditionLink.join(', ')}`
    ).toBeTruthy()
    await newPage.close()
  }

  async verifyNextButtonCard(): Promise<void> {
    await this.clickWithPaginationBullet('right')
    await expect
      .soft(
        this.page.locator(this.nextBtn).filter({ hasText: 'Next' }),
        `Next Button should be displayed`
      )
      .toBeVisible()
  }

  async verifyTapLeftRight(): Promise<void> {
    await this.clickWithPaginationBullet('left')
    await this.clickWithPaginationBullet('right')
  }

  async verifyBgVideoImgBtnCard(): Promise<void> {
    await expect
      .soft(
        this.page.locator(this.nextBtn).filter({ hasText: 'Next' }),
        `Next Button should be displayed`
      )
      .toBeVisible()
    await this.page.locator(this.nextBtn).filter({ hasText: 'Next' }).click()
    await this.test.info().attach('slide-navigation', {
      body: JSON.stringify({ message: 'Slide moved from 3 → 4 (right)' }),
      contentType: 'application/json'
    })
    await expect
      .soft(
        this.page
          .locator(this.bgVideoBtn)
          .filter({ hasText: 'Background Video' }),
        `Background Video Button should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(
        this.page
          .locator(this.bgImgBtn)
          .filter({ hasText: 'Background Image' }),
        `Background Image Button should be displayed`
      )
      .toBeVisible()
  }

  async verifyJesusVideo(): Promise<void> {
    const videoButton = this.page
      .locator(this.bgVideoBtn)
      .filter({ hasText: 'Background Video' })
    await videoButton.click()

    const video = this.page.locator(this.bgVideo)
    const overlay = this.page.locator(this.bgOverLayContent)

    // Verify the background video
    await expect(
      video,
      `Background Jesus video should be displayed`
    ).toBeVisible()
    await expect(
      overlay,
      `Background Jesus video in Overlay content should be displayed`
    ).toBeVisible()

    // Verify the autoplaying
    const autoplayAttr = await video.getAttribute('autoplay')
    if (autoplayAttr !== null) {
      expect
        .soft(true, `Background Jesus video should be Autoplayed`)
        .toBeTruthy()
    }

    // Verify the background video
    const isBackgroundVideo = await video.evaluate((el: HTMLVideoElement) => {
      if (!(el instanceof HTMLVideoElement)) return false

      const style = window.getComputedStyle(el)
      return (
        (style.position === 'absolute' || style.position === 'fixed') &&
        parseFloat(style.opacity || '1') < 1.1
      )
    })
    expect
      .soft(isBackgroundVideo, 'Background Jesus video should be Background')
      .toBeTruthy()

    // Verify the filling the screen
    const box = await video.boundingBox()
    const viewport = this.page.viewportSize()
    if (box && viewport) {
      await this.test.info().attach('video-dimensions', {
        body: JSON.stringify({
          videoWidth: box.width,
          viewportWidth: viewport.width
        }),
        contentType: 'application/json'
      })
      expect
        .soft(
          box.width,
          `Background Jesus Video should be same width of video box and viewport size`
        )
        .toEqual(viewport.width)

      await this.test.info().attach('video-dimensions-height', {
        body: JSON.stringify({
          videoHeight: box.height,
          viewportHeight: viewport.height
        }),
        contentType: 'application/json'
      })
      expect
        .soft(
          box.height,
          `Background Jesus Video should be same height of video box and viewport size`
        )
        .toEqual(viewport.height)
    }

    // Verify card has content overlay/gradient on the bottom half of the card
    const isBottomHalfOverlay = await overlay.evaluate((el) => {
      if (!(el instanceof HTMLElement)) return false
      const parent = el.parentElement
      if (!parent) return false

      const overlayRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()

      const startsInBottomHalf =
        overlayRect.top >= parentRect.top + parentRect.height / 2

      return startsInBottomHalf
    })
    expect(
      isBottomHalfOverlay,
      'Background Jesus Video Overlay covers bottom half of the card'
    ).toBeTruthy()

    // Check texts/icons appear in white
    const textElements = overlay.getByTestId('JourneysTypography')
    const iconElements = overlay.locator('svg').or(overlay.locator('img'))
    const allElements = [textElements, iconElements]
    await this.checkColorForTextImg(allElements, /rgb\(254,\s*254,\s*254\)/)
  }

  async verifyYoutubeVideoOrLink(): Promise<void> {
    await this.clickWithPaginationBullet('right')

    const video = this.page.locator(this.bgYoutubeVideo)
    const overlay = this.page.locator(this.bgOverLayContent)

    // Verify the background video
    await expect
      .soft(video, `Background Youtube Video should be displayed`)
      .toBeVisible()
    await expect
      .soft(
        overlay,
        `Background Youtube Video on Overlay content should be displayed`
      )
      .toBeVisible()

    // Verify the autoplaying
    const isLoaded = await video.evaluate((iframe: HTMLIFrameElement) => {
      return !!iframe.contentWindow
    })
    expect
      .soft(isLoaded, `Background Youtube video should be Autoplayed`)
      .toBe(true)

    // Locator for the iframe containing the video
    const iframeLocator = this.page.locator(`iframe[id*="video"]`).first()
    const frame = await iframeLocator
      .elementHandle()
      .then((handle) => handle?.contentFrame())
    if (!frame) throw new Error('Iframe not found or not loaded')

    const isBackgroundVideo = await video.evaluate((el: HTMLVideoElement) => {
      const style = window.getComputedStyle(el)
      return (
        (style.position === 'absolute' || style.position === 'fixed') &&
        parseFloat(style.opacity || '1') < 1.1
      )
    })
    expect
      .soft(isBackgroundVideo, `Background Youtube Video Should be Backgroud`)
      .toBeTruthy()

    // Verify the filling the screen
    const box = await video.boundingBox()
    const viewport = this.page.viewportSize()
    await this.test.info().attach('youtube-video-dimensions', {
      body: JSON.stringify({
        videoWidth: box?.width,
        viewportWidth: viewport?.width
      }),
      contentType: 'application/json'
    })
    expect(
      box?.width,
      `Background Youtube Video should be same width of video box and viewport size`
    ).toBeGreaterThanOrEqual((viewport?.width || 0) * 0.9)

    await this.test.info().attach('youtube-video-dimensions-height', {
      body: JSON.stringify({
        videoHeight: box?.height,
        viewportHeight: viewport?.height
      }),
      contentType: 'application/json'
    })
    expect(
      box?.height,
      `Background Youtube Video should be same height of video box and viewport size`
    ).toBeGreaterThanOrEqual((viewport?.height || 0) * 0.9)

    // Verify the has colour overlay/gradient on the bottom half of the card
    const isBottomHalfOverlay = await overlay.evaluate((el) => {
      if (!(el instanceof HTMLElement)) return false
      const parent = el.parentElement
      if (!parent) return false

      const overlayRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()

      const startsInBottomHalf =
        overlayRect.top >= parentRect.top + parentRect.height / 2
      return startsInBottomHalf
    })
    expect(
      isBottomHalfOverlay,
      'Background Youtube Video Overlay covers bottom half of the card'
    ).toBeTruthy()

    // Check texts/icons appear in white
    const textElements = overlay.getByTestId('JourneysTypography')
    const iconElements = overlay.locator('svg').or(overlay.locator('img'))
    const allElements = [textElements, iconElements]
    await this.checkColorForTextImg(allElements, /rgb\(254,\s*254,\s*254\)/)
  }

  async verifyVideoWithKeep(): Promise<void> {
    await this.clickWithPaginationBullet('right')

    const video = this.page.locator(this.bgVideo)
    const overlay = this.page.locator(this.bgOverLayContent)
    const overlayBgImgBtn = this.page
      .locator(this.bgOverLayBgImgBtn)
      .filter({ hasText: 'Check Background Images' })
    const overlayKeepBtn = this.page
      .locator(this.bgOverLayKeepBtn)
      .filter({ hasText: 'Keep Going' })

    await expect(
      video,
      `Background Custom Video should be displayed`
    ).toBeVisible()
    await expect(
      overlay,
      `Background Custom Video on Overlay content should be displayed`
    ).toBeVisible()

    // Verify the Autoplaying
    const autoplayAttr = await video.getAttribute('autoplay')
    expect(
      autoplayAttr !== null,
      `Background Custom video should be Autoplayed`
    ).toBeTruthy()

    await expect
      .soft(
        overlayBgImgBtn,
        `Background Custom Video on Overlay content in Backgroud Image Button should be displayed`
      )
      .toBeVisible()
    await expect
      .soft(
        overlayKeepBtn,
        `Background Custom Video on Overlay content in Keep Button should be displayed`
      )
      .toBeVisible()

    // Verify the background video
    const isBackgroundVideo = await video.evaluate((el: HTMLVideoElement) => {
      if (!(el instanceof HTMLVideoElement)) return false

      const style = window.getComputedStyle(el)
      return (
        (style.position === 'absolute' || style.position === 'fixed') &&
        parseFloat(style.opacity || '1') < 1.1
      )
    })
    expect(
      isBackgroundVideo,
      `Background Custom Video Should be Backgroud`
    ).toBeTruthy()

    // Verify the filling the screen
    const box = await video.boundingBox()
    const viewport = this.page.viewportSize()
    if (box && viewport) {
      await this.test.info().attach('custom-video-dimensions', {
        body: JSON.stringify({
          videoWidth: box.width,
          viewportWidth: viewport.width
        }),
        contentType: 'application/json'
      })
      expect
        .soft(
          box.width,
          `Background Custom Video should be same width of video box and viewport size`
        )
        .toBeGreaterThanOrEqual(viewport.width * 0.9)

      await this.test.info().attach('custom-video-dimensions-height', {
        body: JSON.stringify({
          videoHeight: box.height,
          viewportHeight: viewport.height
        }),
        contentType: 'application/json'
      })
      expect
        .soft(
          box.height,
          `Background Custom Video should be same height of video box and viewport size`
        )
        .toBeGreaterThanOrEqual(viewport.height * 0.9)
    }

    // Verify the has colour overlay/gradient on the bottom half of the card
    const isBottomHalfOverlay = await overlay.evaluate((el) => {
      if (!(el instanceof HTMLElement)) return false
      const parent = el.parentElement
      if (!parent) return false

      const overlayRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()

      const startsInBottomHalf =
        overlayRect.top >= parentRect.top + parentRect.height / 3

      return startsInBottomHalf
    })
    await this.test.info().attach('overlay-position', {
      body: JSON.stringify({ startsInBottomHalf: isBottomHalfOverlay }),
      contentType: 'application/json'
    })
    expect(
      isBottomHalfOverlay,
      'Background Custom Video Overlay covers bottom half of the card'
    ).toBeTruthy()

    // Check texts/icons appear in white
    const textElements = overlay.getByTestId('JourneysTypography')
    const iconElements = overlay.locator('svg').or(overlay.locator('img'))
    const allElements = [textElements, iconElements]
    await this.checkColorForTextImg(allElements, /rgb\(254,\s*254,\s*254\)/)
  }
  async checkColorForTextImg(
    allElements: Locator[],
    colorRegex = /rgb\(254,\s*254,\s*254\)/
  ): Promise<void> {
    for (const el of allElements) {
      const count = await el.count()
      for (let i = 0; i < count; i++) {
        const color = await el.nth(i).evaluate((node) => {
          const style = window.getComputedStyle(node as HTMLElement)
          return style.color || style.fill
        })
        expect
          .soft(
            color,
            `Background Custom Video on Overlay Content in Text and Icon Color Should be White ${colorRegex.toString()}`
          )
          .toMatch(colorRegex)
      }
    }
  }
  async verifyBgImage(): Promise<void> {
    await this.page
      .locator(this.bgOverLayBgImgBtn)
      .filter({ hasText: 'Check Background Images' })
      .click()
    await this.page
      .locator(this.bgImgBtn)
      .filter({ hasText: 'Background Image' })
      .click()
    await expect(
      this.page.locator(this.bgImg),
      `Gallery Background Image should be displayed`
    ).toBeVisible()

    // Verify the background image is filling the screen
    await expect(
      this.page.locator(this.bgImg),
      `Gallery Background Image should be Fill the Screen`
    ).toHaveAttribute('data-nimg', 'fill')
    await expect(
      this.page.locator(this.bgOverLayContent),
      `Gallery Background Image on Overlay Content should be displayed`
    ).toBeVisible()

    // Check texts/icons appear in white
    const overlay = this.page.locator(this.bgOverLayContent)
    const textElements = overlay.getByTestId('JourneysTypography')
    const iconElements = overlay.locator('svg').or(overlay.locator('img'))
    const allElements = [textElements, iconElements]
    await this.checkColorForTextImg(allElements, /rgb\(254,\s*254,\s*254\)/)
  }

  async verifyOtherBgImage(): Promise<void> {
    await this.clickWithPaginationBullet('right')
    await expect(
      this.page.locator(this.bgImg),
      `Uploaded Background Image should be displayed`
    ).toBeVisible()

    // Verify the background image is filling the screen
    await expect(
      this.page.locator(this.bgImg),
      `Uploaded Background Image should be Fill the Screen`
    ).toHaveAttribute('data-nimg', 'fill')
    await expect(
      this.page.locator(this.bgOverLayContent),
      `Uploaded Background Image on Overlay Content should be displayed`
    ).toBeVisible()

    // Check texts/icons appear in white
    const overlay = this.page.locator(this.bgOverLayContent)
    const textElements = overlay.getByTestId('JourneysTypography')
    const iconElements = overlay.locator('svg').or(overlay.locator('img'))
    const allElements = [textElements, iconElements]
    await this.checkColorForTextImg(allElements, /rgb\(254,\s*254,\s*254\)/)
  }

  async verifyAIBgImage(): Promise<void> {
    await this.clickWithPaginationBullet('right')
    await expect(
      this.page.locator(this.bgImg),
      `AI Background Image should be displayed`
    ).toBeVisible()

    // Verify the background image is filling the screen
    await expect(
      this.page.locator(this.bgImg),
      `AI Background Image should be Fill the Screen`
    ).toHaveAttribute('data-nimg', 'fill')
    await expect(
      this.page.locator(this.bgOverLayContent),
      `AI Background Image on Overlay Content should be displayed`
    ).toBeVisible()

    await expect(
      this.page
        .locator(this.bgVideoBtn)
        .filter({ hasText: 'Background Video' }),
      `AI Background Image on Overlay Content in Background Video Button should be displayed`
    ).toBeVisible()
    await expect(
      this.page
        .locator(this.bgOverLayKeepBtn)
        .filter({ hasText: 'Keep Going' }),
      `AI Background Image on Overlay Content in Keep Going should be displayed`
    ).toBeVisible()

    // Check texts/icons appear in white
    const overlay = this.page.locator(this.bgOverLayContent)
    const textElements = overlay.getByTestId('JourneysTypography')
    const iconElements = overlay.locator('svg').or(overlay.locator('img'))
    const allElements = [textElements, iconElements]
    await this.checkColorForTextImg(allElements, /rgb\(254,\s*254,\s*254\)/)
  }

  async verifyKeepGoing(): Promise<void> {
    await this.page
      .locator(this.bgOverLayKeepBtn)
      .filter({ hasText: 'Keep Going' })
      .click()
    await this.clickWithPaginationBullet('right')
    await expect(
      this.page.locator(this.cardVideo),
      `Jesus Video should be displayed`
    ).toBeVisible()

    // Close the Context
    await this.page.close()
  }

  async verifyYoutubeVideos(): Promise<void> {
    await expect(this.page.locator(this.journeyVideoDataTestId)).toBeVisible()
    await this.verifyVideoCard()
  }

  async verifyCustomVideos(): Promise<void> {
    await expect(this.page.locator(this.cardVideo)).toBeVisible()
    await this.verifyVideoCard()
  }

  async verifyPollContentWithSubmission(): Promise<void> {
    await this.verifyPollContent()
    await this.verifySubmitPoll()
  }
}
