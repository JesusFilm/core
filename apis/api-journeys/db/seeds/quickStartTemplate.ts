import { prisma } from '../../../../libs/prisma/journeys/src/client'
import {
  ButtonAction,
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../src/app/__generated__/graphql'

const QUICK_START_TEMPLATE = {
  id: 'b4a4e122-2b7f-4e6f-a2d1-81c1f792c92b',
  slug: 'quick-start-template'
}

const CUSTOMIZATION_DESCRIPTION = [
  'Hi {{ name: Friend }}, welcome to {{ church_name: Our Church }}!',
  'We are glad you are here.',
  'Feel free to {{ feedback_label: share your thoughts }} with us.',
  'Visit us at {{ website_label: our website }} or {{ email_label: email us }}.'
].join(' ')

export async function quickStartTemplate(action?: 'reset'): Promise<void> {
  if (action === 'reset') {
    const existingJourney = await prisma.journey.findUnique({
      where: { slug: QUICK_START_TEMPLATE.slug }
    })
    if (existingJourney != null) {
      await prisma.journey.delete({ where: { id: existingJourney.id } })
    }
  }

  const existingJourney = await prisma.journey.findUnique({
    where: { slug: QUICK_START_TEMPLATE.slug }
  })
  if (existingJourney != null) return

  const journey = await prisma.journey.create({
    data: {
      id: QUICK_START_TEMPLATE.id,
      title: 'Quick Start',
      description: 'A customizable quick start template to get you going.',
      languageId: '529',
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      slug: QUICK_START_TEMPLATE.slug,
      status: JourneyStatus.published,
      template: true,
      createdAt: new Date(),
      publishedAt: new Date(),
      teamId: 'jfp-team',
      journeyCustomizationDescription: CUSTOMIZATION_DESCRIPTION,
      customizable: true
    }
  })

  // Customization fields parsed from the description
  await prisma.journeyCustomizationField.createMany({
    data: [
      { journeyId: journey.id, key: 'name', defaultValue: 'Friend' },
      {
        journeyId: journey.id,
        key: 'church_name',
        defaultValue: 'Our Church'
      },
      {
        journeyId: journey.id,
        key: 'feedback_label',
        defaultValue: 'share your thoughts'
      },
      {
        journeyId: journey.id,
        key: 'website_label',
        defaultValue: 'our website'
      },
      {
        journeyId: journey.id,
        key: 'email_label',
        defaultValue: 'email us'
      }
    ]
  })

  // ── Primary image ──
  const primaryImageBlock = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
      alt: 'quick start primary',
      width: 1152,
      height: 768,
      blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
      parentOrder: 1
    }
  })
  await prisma.journey.update({
    where: { id: journey.id },
    data: { primaryImageBlockId: primaryImageBlock.id }
  })

  // ── Chat button (customizable link) ──
  await prisma.chatButton.create({
    data: {
      journeyId: journey.id,
      link: 'https://m.me/your-page',
      platform: MessagePlatform.facebook,
      customizable: true
    }
  })

  // ════════════════════════════════════════════════════
  // Step 1 – Welcome (TypographyBlock, ButtonBlock, customizable ImageBlock)
  // ════════════════════════════════════════════════════
  const step1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 0
    }
  })

  const card1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step1.id,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // Cover image for card 1 (customizable media)
  const coverBlock1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/ae95a856-1401-41e1-6f3e-7b4e6f707f00/public',
      alt: 'quick start card cover',
      width: 1152,
      height: 768,
      blurhash: 'UbLX6?~p9FtRkX.8ogD%IUj@M{adxaM_ofkW',
      parentBlockId: card1.id,
      customizable: true
    }
  })
  await prisma.block.update({
    where: { id: card1.id },
    data: { coverBlockId: coverBlock1.id }
  })

  // TypographyBlock – content with template variable
  await prisma.block.createMany({
    data: [
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content: 'Welcome, {{ name }}!',
        variant: 'h3',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content: '{{ church_name }} invites you to start your journey.',
        variant: 'body1',
        parentOrder: 1
      }
    ]
  })

  // ButtonBlock – label with template variable + NavigateToBlockAction
  const getStartedButton = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card1.id,
      label: 'Get Started',
      variant: 'contained',
      color: 'primary',
      size: 'large',
      parentOrder: 2
    }
  })

  // ════════════════════════════════════════════════════
  // Step 2 – Video (customizable VideoBlock)
  // ════════════════════════════════════════════════════
  const step2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 1
    }
  })

  // Wire "Get Started" button → step 2
  await prisma.action.create({
    data: {
      parentBlockId: getStartedButton.id,
      gtmEventName: ButtonAction.NavigateToBlockAction,
      blockId: step2.id,
      journeyId: journey.id
    }
  })

  const card2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step2.id,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // VideoBlock (customizable media)
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: card2.id,
      title: '{{ video_title: Welcome Video }}',
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      startAt: 0,
      muted: false,
      autoplay: true,
      parentOrder: 0,
      customizable: true,
      notes: 'Replace with your own welcome or intro video.'
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card2.id,
      content: '{{ video_description: A short video to inspire you. }}',
      variant: 'body2',
      parentOrder: 1
    }
  })

  const continueButton = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card2.id,
      label: 'Continue',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      parentOrder: 2
    }
  })

  // ════════════════════════════════════════════════════
  // Step 3 – Feedback (RadioOptionBlock, TextResponseBlock)
  // ════════════════════════════════════════════════════
  const step3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 2
    }
  })

  // Wire "Continue" button → step 3
  await prisma.action.create({
    data: {
      parentBlockId: continueButton.id,
      gtmEventName: ButtonAction.NavigateToBlockAction,
      blockId: step3.id,
      journeyId: journey.id
    }
  })

  const card3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step3.id,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card3.id,
      content: '{{ response_question: What did you think? }}',
      variant: 'h6',
      parentOrder: 0
    }
  })

  // RadioQuestionBlock with RadioOptionBlocks (customizable labels)
  const radioQuestion = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioQuestionBlock',
      parentBlockId: card3.id,
      parentOrder: 1
    }
  })

  const radioOption1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion.id,
      label: '{{ option_1: Great }}',
      parentOrder: 0
    }
  })

  const radioOption2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion.id,
      label: '{{ option_2: Interested }}',
      parentOrder: 1
    }
  })

  const radioOption3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: radioQuestion.id,
      label: '{{ option_3: Need More Info }}',
      parentOrder: 2
    }
  })

  // TextResponseBlock (customizable label, placeholder, hint)
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: card3.id,
      label: '{{ feedback_label: Share your thoughts }}',
      hint: '{{ feedback_hint: We would love to hear from you }}',
      minRows: 3,
      parentOrder: 2
    }
  })

  const nextButton = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card3.id,
      label: 'Next',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      parentOrder: 3
    }
  })

  // ════════════════════════════════════════════════════
  // Step 4 – Connect (SignUpBlock, LinkAction, EmailAction)
  // ════════════════════════════════════════════════════
  const step4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 3
    }
  })

  // Wire "Next" button → step 4
  await prisma.action.create({
    data: {
      parentBlockId: nextButton.id,
      gtmEventName: ButtonAction.NavigateToBlockAction,
      blockId: step4.id,
      journeyId: journey.id
    }
  })

  // Wire radio options → step 4
  await Promise.all(
    [radioOption1, radioOption2, radioOption3].map((opt) =>
      prisma.action.create({
        data: {
          parentBlockId: opt.id,
          gtmEventName: ButtonAction.NavigateToBlockAction,
          blockId: step4.id,
          journeyId: journey.id
        }
      })
    )
  )

  const card4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step4.id,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card4.id,
      content: '{{ connect_title: Stay Connected }}',
      variant: 'h3',
      parentOrder: 0
    }
  })

  // SignUpBlock (customizable submitLabel)
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'SignUpBlock',
      parentBlockId: card4.id,
      submitLabel: '{{ signup_label: Sign Up }}',
      parentOrder: 1
    }
  })

  // ButtonBlock with LinkAction (customizable link)
  const websiteButton = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card4.id,
      label: '{{ website_label: Visit Our Website }}',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      parentOrder: 2
    }
  })
  await prisma.action.create({
    data: {
      parentBlockId: websiteButton.id,
      gtmEventName: ButtonAction.LinkAction,
      url: 'https://your-website.com',
      journeyId: journey.id,
      customizable: true
    }
  })

  // ButtonBlock with EmailAction (customizable link)
  const emailButton = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card4.id,
      label: '{{ email_label: Email Us }}',
      variant: 'outlined',
      color: 'primary',
      size: 'medium',
      parentOrder: 3
    }
  })
  await prisma.action.create({
    data: {
      parentBlockId: emailButton.id,
      gtmEventName: ButtonAction.EmailAction,
      email: 'hello@your-church.com',
      journeyId: journey.id,
      customizable: true
    }
  })
}
