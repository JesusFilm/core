/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable playwright/prefer-web-first-assertions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect, Page, TestType } from '@playwright/test'

export class BasePage {
  page: Page

  url: string
  adminLogo: string

  rightNavBtn: string
  leftNavBtn: string
  paginationBullet: string

  cardIndex: string
  playBtn: string
  playVideo: string
  unMuteBtn: string
  pauseVideo: string
  scrubBarPointer: string
  scrubBarPointerInput: string
  videoFullScreen: string
  videoOfYoutube: string
  videofSource: string

  infoIcon: string
  shareIcon: string
  thumbsUpIcon: string
  thumbsDownIcon: string
  hostIcon: string
  titleText: string
  chatIcon: string

  infoContainer: string
  teamName: string
  reportContentBtn: string
  termAndConditionBtn: string

  nextBtn: string
  bgVideoBtn: string
  bgImgBtn: string
  bgVideo: string
  bgOverLayContent: string
  bgYoutubeVideo: string

  bgOverLayBgImgBtn: string
  bgOverLayKeepBtn: string

  bgImg: string
  cardVideo: string

  pollImages: string
  pollButton: string
  pollInput: string
  pollSubmitButton: string
  pollWarningMessage: string
  pollResponseMessage: string
  journeyVideoDataTestId: string

  test: TestType<any, any>
  constructor(page: Page, test: TestType<any, any>) {
    this.page = page
    this.test = test

    this.url = 'https://journeys-daily-e2e-jesusfilm.vercel.app/e2e-priority'
    this.adminLogo = '[data-testid="StepFooterHostAvatars"]'

    this.rightNavBtn = 'button[data-testid="ConductorNavigationButtonNext"]'
    this.leftNavBtn = 'button[data-testid="ConductorNavigationButtonPrevious"]'
    this.paginationBullet = 'div[data-testid="pagination-bullets"] svg'
    this.unMuteBtn = `//div[contains(@class,"active-card")]//div[@data-testid="CardExpandedCover"]//button[@aria-label="center-unmute-button"]`

    this.cardIndex = `//*[name()='svg'][@data-testid="bullet-active"]//ancestor::div[@id="__next"]`
    this.videoFullScreen = `//div[contains(@class,"active-card")]//div[@data-testid="mobile-controls"]//button[@aria-label="fullscreen"]`
    this.videoOfYoutube = `//div[contains(@class,"active-card")]//iframe[contains(@src,"https://www.youtube.com/embed/")]`
    this.videofSource = `//div[contains(@class,"active-card")]//div[@data-testid="CardExpandedCover"]//video`

    this.infoIcon = 'button[data-testid="InformationButton"]'
    this.shareIcon =
      'div[data-testid="StepFooterButtonList"] button [data-testid="ShareIcon"]'
    this.thumbsUpIcon =
      'div[data-testid="StepFooterButtonList"] button [data-testid="ThumbsUpIcon"]'
    this.thumbsDownIcon =
      'div[data-testid="StepFooterButtonList"] button [data-testid="ThumbsDownIcon"]'
    this.hostIcon = 'div[data-testid="StepFooterHostAvatars"]'
    this.titleText = 'h6[class*="MuiTypography-subtitle1"]'
    this.chatIcon = 'div[data-testid="StepFooterChatButtons"] button'

    this.infoContainer = `div[class*="MuiMenu-paper"] ul[aria-labelledby="more-info"]`
    this.teamName = `ul[aria-labelledby="more-info"] li[role="menuitem"] p`
    this.reportContentBtn = `ul[aria-labelledby="more-info"]  a[role="menuitem"]`
    this.termAndConditionBtn = `ul[aria-labelledby="more-info"]  li[role="menuitem"] a:text-is("Terms & Conditions")`

    this.nextBtn = `div[data-testid*="JourneysButton"] button p`
    this.bgVideoBtn = `div[class*="active-card"] button p`
    this.bgImgBtn = `div[class*="active-card"] div[data-testid*="JourneysButton"] button p`

    this.bgVideo = `div[class*="active-card"] div[data-testid="CardContainedBackgroundVideo"] video`
    this.bgOverLayContent = `div[class*="active-card"] div[data-testid="CardOverlayContentContainer"]`

    this.bgYoutubeVideo = `div[class*="active-card"] div[data-testid="CardContainedBackgroundVideo"] iframe[src*="https://www.youtube.com/embed/"]`

    this.bgOverLayBgImgBtn = `div[class*="active-card"] div[data-testid="CardOverlayContentContainer"] button p`
    this.bgOverLayKeepBtn = `div[class*="active-card"] div[data-testid="CardOverlayContentContainer"] button p`

    this.bgImg = `div[class*="active-card"] div[data-testid="CardOverlayImageContainer"] img[data-testid="background-image"]`

    this.journeyVideoDataTestId =
      'div[class*="active-card"] div[data-testid="CardExpandedCover"] div[data-testid ^="JourneysVideo-"]'
    this.cardVideo = `div[class*="active-card"] div[data-testid="CardExpandedCover"] video`
    this.playBtn = `//div[contains(@class,"active-card")]//div[@data-testid="CardExpandedCover"]//button[@aria-label="center-play-button"]`
    this.playVideo = `//div[contains(@class,"active-card")]//div[@data-testid="CardExpandedCover"]//div[contains(@class,"playing")]`
    this.pauseVideo = `//div[contains(@class,"active-card")]//div[@data-testid="CardExpandedCover"]//div[contains(@class,"paused")]`

    this.scrubBarPointer =
      'div[class*="active-card"] div[data-testid="CardExpandedCover"] span.MuiSlider-thumb'
    this.scrubBarPointerInput = 'input[aria-label="mobile-progress-control"]'

    this.pollImages = `div[class*="active-card"] div[data-testid="CardOverlayContent"] img[src]`
    this.pollButton = `div[class*="active-card"] div[data-testid="CardOverlayContent"] button[data-testid="JourneysRadioOptionList"]`
    this.pollInput = `div[class*="active-card"] div[data-testid="CardOverlayContent"] textarea[id="textResponse-field"]`
    this.pollSubmitButton = `div[class*="active-card"] div[data-testid="CardOverlayContent"] button[type="submit"]`
    this.pollWarningMessage = `div[class*="active-card"] p[class*="Mui-error"]`
    this.pollResponseMessage = `div[class*="active-card"] div[data-testid="CardOverlayContent"] h2`
  }

  async clickWithPaginationBullet(
    navType: 'left' | 'right' | 'auto',
    videoDurationMs: number = 60000
  ) {
    const bullets = await this.page.locator(this.paginationBullet).all()

    let beforeActiveIndex = -1
    await this.test.step(
      'Getting Active Card pagination index before move to next/previous card',
      async () => {
        for (let i = 0; i < bullets.length; i++) {
          const attr = await bullets[i].getAttribute('data-testid')
          if (attr === 'bullet-active') {
            beforeActiveIndex = i
            break
          }
        }
      }
    )

    if (navType === 'right') {
      await this.clickTheCard()
      await this.page.click(this.rightNavBtn)
    } else if (navType === 'left') {
      await this.clickTheCard()
      await this.page.click(this.leftNavBtn)
    } else {
      console.log('Waiting for auto-slide navigation (video end)...')
    }

    const interval = 500
    const maxRetries = Math.ceil(videoDurationMs / interval)
    let afterActiveIndex = beforeActiveIndex

    await this.test.step(
      'Getting Active Card pagination index after move to next/previous card',
      async () => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // eslint-disable-next-line playwright/no-wait-for-timeout
          await this.page.waitForTimeout(interval)

          for (let j = 0; j < bullets.length; j++) {
            const attr = await bullets[j].getAttribute('data-testid')
            if (attr === 'bullet-active') {
              afterActiveIndex = j
              break
            }
          }
          if (afterActiveIndex !== beforeActiveIndex) break
        }
      }
    )

    if (beforeActiveIndex === afterActiveIndex) {
      expect
        .soft(
          beforeActiveIndex,
          `Slide did NOT change after ${navType === 'auto' ? 'video auto-play' : navType} navigation.`
        )
        .not.toEqual(afterActiveIndex)
    } else {
      console.log(
        `Slide moved from ${beforeActiveIndex} → ${afterActiveIndex} (${navType})`
      )
    }

    return afterActiveIndex
  }

  async clickTheCard() {
    await this.page.locator(`[id="__next"]`).click()
  }

  async getCurrentPaginationIndex() {
    let currentIndex = -1
    await this.test.step('Getting current pagination index...', async () => {
      const bullets = await this.page.locator(this.paginationBullet).all()

      for (let i = 0; i < bullets.length; i++) {
        const attr = await bullets[i].getAttribute('data-testid')
        if (attr === 'bullet-active') {
          currentIndex = i
          break
        }
      }
      console.log(`Validating video card at index: ${currentIndex}`)
    })
    return currentIndex
  }

  async getCurrentCardLocator(currentIndex: number) {
    return this.page.locator('div[id="__next"]', {
      has: this.page.locator(
        `svg[data-testid *="bullet"]:nth-child(${currentIndex + 1})`
      )
    })
  }
  async waitForFirstVideoCardToAutoNavigate() {
    const currentCardIndex = await this.getCurrentPaginationIndex()
    // Wait for Auto Navigation
    const maxVideoDurationMs = 15000
    const nextIndex = await this.autoNavigateCheck(
      currentCardIndex,
      maxVideoDurationMs
    )
    console.log(
      `Active Pagination index Current : ${currentCardIndex} | Next : ${nextIndex}`
    )
  }
  async verifyVideoCard(maxVideoDurationMs: number = 30000) {
    const currentIndex = await this.getCurrentPaginationIndex()
    const currentCard = await this.getCurrentCardLocator(currentIndex)

    try {
      await this.waitForvideoLoading(5000)
      await expect(
        currentCard.locator(this.scrubBarPointer, {
          has: this.page.locator(this.scrubBarPointerInput)
        })
      ).not.toHaveAttribute('style', 'left: 0%;', { timeout: 120000 })
      // Click to Pause the Video
      await this.clickTheCard()

      // Scrub bar before play
      const scrubLocator = currentCard.locator(
        `${this.scrubBarPointer} ${this.scrubBarPointerInput}`
      )

      let beforePlayed: string | null = null
      beforePlayed = await scrubLocator.getAttribute('aria-valuenow')

      // Play/Pause Validation
      const unMuteBtn = currentCard.locator(this.unMuteBtn)
      const playBtn = currentCard.locator(this.playVideo)
      const pauseBtn = currentCard.locator(this.pauseVideo)

      await expect.soft(pauseBtn).toBeVisible()

      // Click to Play Video
      await this.clickTheCard()
      await expect.soft(playBtn).toBeVisible()

      // Scrub bar progress
      const afterPlayed = await scrubLocator.getAttribute('aria-valuenow')
      expect.soft(beforePlayed).not.toEqual(afterPlayed)

      // Full Screen Validation
      await this.verifyVideoFullScreen()
    } catch (err) {
      expect
        .soft(false, `Video validation failed at index ${currentIndex}`)
        .toBeTruthy()
    }

    // Wait for Auto Navigation
    const nextIndex = await this.autoNavigateCheck(
      currentIndex,
      maxVideoDurationMs
    )
    console.log(
      `Active Pagination index Current : ${currentIndex} | Next : ${nextIndex}`
    )
  }

  async autoNavigateCheck(currentIndex: number, maxVideoDurationMs: number) {
    // Wait for Auto Navigation
    const interval = 500
    const maxRetries = Math.ceil(maxVideoDurationMs / interval)
    let nextIndex = currentIndex
    let autoMoved = false

    await this.test.step(
      'Waiting for auto-slide navigation (video end)...',
      async () => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // eslint-disable-next-line playwright/no-wait-for-timeout
          await this.page.waitForTimeout(interval)
          const updatedBullets = await this.page
            .locator(this.paginationBullet)
            .all()

          for (let i = 0; i < updatedBullets.length; i++) {
            const attr = await updatedBullets[i].getAttribute('data-testid')
            if (attr === 'bullet-active' && i !== currentIndex) {
              nextIndex = i
              autoMoved = true
              break
            }
          }
          if (autoMoved) break
        }
      }
    )
    if (!autoMoved) {
      await this.clickWithPaginationBullet('right')
      nextIndex = currentIndex + 1

      expect
        .soft(
          false,
          `Video at card ${currentIndex} did not auto-navigate within timeout`
        )
        .toBeTruthy()
    }

    console.log(`Moved to next video card index: ${nextIndex}`)
    return nextIndex
  }
  async verifyVideoFullScreen() {
    await this.waitForvideoLoading()
    const beforeFullScreen = await this.page
      .locator(`div[data-testid="JourneysStepHeader"]`)
      .getAttribute('class')

    // Click to Pause the Video
    await this.clickTheCard()
    await expect(this.page.locator(this.pauseVideo)).toBeVisible()

    await this.page.locator(this.videoFullScreen).click()

    await this.waitForvideoLoading()
    const afterFullScreen = await this.page
      .locator(`div[data-testid="JourneysStepHeader"]`)
      .getAttribute('class')
    expect
      .soft(
        beforeFullScreen,
        `FullScreen Before : ${beforeFullScreen} | After : ${afterFullScreen}`
      )
      .not.toEqual(afterFullScreen)

    if (beforeFullScreen != afterFullScreen) {
      await this.waitForvideoLoading()
      await this.page.locator(this.videoFullScreen).click()
    } else {
      console.log('Full screen toggle failed so not need to exit full screen')
    }

    // Click to Play the Video
    await this.clickTheCard()
    await expect(this.page.locator(this.playVideo)).toBeVisible()
  }

  async verifyPollContent() {
    let pollImagesCount = await this.page.locator(this.pollImages).count()
    expect(pollImagesCount).toBeGreaterThan(1)

    let pollButtonCount = await this.page.locator(this.pollButton).count()
    expect(pollButtonCount).toBeGreaterThan(1)
  }

  async verifySubmitPoll() {
    await this.page
      .locator(this.pollButton)
      .filter({ hasText: 'House by the beach' })
      .click()
    await expect(this.page.locator(this.pollSubmitButton)).toBeVisible()

    await this.page.locator(this.pollInput).click()
    await this.page.locator(this.pollSubmitButton).click()
    await expect(
      this.page
        .locator(this.pollResponseMessage)
        .filter({ hasText: 'E2E Priority Test Done!' })
    ).toBeVisible()
    await this.clickWithPaginationBullet('left')
    await expect(
      this.page
        .locator(this.pollWarningMessage)
        .filter({ hasText: 'This field is required' })
    ).toBeVisible()

    await this.page.locator(this.pollInput).fill('good!')
    await this.page.locator(this.pollSubmitButton).click()

    await expect(this.page.locator(this.pollSubmitButton)).toBeHidden()
    await expect(
      this.page
        .locator(this.pollResponseMessage)
        .filter({ hasText: 'E2E Priority Test Done!' })
    ).toBeVisible()
  }

  async waitForvideoLoading(timeoutInMilliSecond = 1500) {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(timeoutInMilliSecond)
  }
}