import { v4 as uuidv4 } from 'uuid'

import {
  JourneyStatus,
  TextResponseType,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'
import { PrismaClient } from '../../../../libs/prisma/journeys/src/client'

const prisma = new PrismaClient()

export async function nua9(): Promise<void> {
  const slug = 'decision'
  const existingJourney = await prisma.journey.findUnique({ where: { slug } })
  if (existingJourney != null) {
    await prisma.action.deleteMany({
      where: { parentBlock: { journeyId: existingJourney.id } }
    })
    await prisma.block.deleteMany({ where: { journeyId: existingJourney.id } })
  }

  const journeyData = {
    id: '4',
    title: 'Decision',
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    slug,
    status: JourneyStatus.published,
    createdAt: new Date(),
    publishedAt: new Date(),
    featuredAt: new Date(),
    teamId: 'jfp-team'
  }

  const journey = await prisma.journey.upsert({
    where: { id: journeyData.id },
    create: journeyData,
    update: journeyData
  })

  const lastStep = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 13
    }
  })

  const stepNotSure2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 12,
      nextBlockId: lastStep.id
    }
  })

  const stepNotSure = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 11,
      nextBlockId: stepNotSure2.id
    }
  })

  const stepNoThanks2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 10,
      nextBlockId: lastStep.id
    }
  })

  const stepNoThanks = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 9,
      nextBlockId: stepNoThanks2.id
    }
  })

  const stepIAlreadyHave2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 8,
      nextBlockId: lastStep.id
    }
  })

  const stepIAlreadyHave = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 7,
      nextBlockId: stepIAlreadyHave2.id
    }
  })

  const stepPrayer4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 6,
      nextBlockId: lastStep.id
    }
  })

  const stepPrayer3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 5,
      nextBlockId: stepPrayer4.id
    }
  })

  const stepPrayer2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 4,
      nextBlockId: stepPrayer3.id
    }
  })

  const stepPrayer1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 3,
      nextBlockId: stepPrayer2.id
    }
  })

  const questionStep = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 2,
      nextBlockId: stepPrayer1.id
    }
  })

  const step2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 1,
      nextBlockId: questionStep.id
    }
  })

  //   first step
  const step1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 0,
      nextBlockId: step2.id
    }
  })

  const coverBlockId = uuidv4()
  const card1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step1.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const posterBlockId = uuidv4()
  await prisma.block.create({
    data: {
      id: coverBlockId,
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: card1.id,
      videoId: '7_0-nfs0803',
      videoVariantLanguageId: '529',
      muted: true,
      autoplay: true,
      startAt: 11,
      title: 'Decision'
    }
  })
  await prisma.block.update({
    where: { id: card1.id },
    data: { coverBlock: { connect: { id: coverBlockId } } }
  })

  await prisma.block.create({
    data: {
      id: posterBlockId,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: coverBlockId,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Can we trust the story of Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      parentOrder: 0
    }
  })
  await prisma.block.update({
    where: { id: coverBlockId },
    data: { posterBlock: { connect: { id: posterBlockId } } }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card1.id,
      content: 'TRUSTING JESUS',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card1.id,
      content: 'Can I Know Him?',
      variant: 'h3',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card1.id,
      content:
        'Jesus Christ loves you and wants to have a relationship with you. But how does it begin?',
      variant: 'body1',
      color: 'primary',
      align: 'left',
      parentOrder: 2
    }
  })

  //   video step

  const button1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card1.id,
      label: 'Explore Now',
      variant: 'contained',
      color: 'primary',
      size: 'large',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: step2.id
        }
      },
      parentOrder: 3
    }
  })

  const icon1a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button1.id,
      name: 'PlayArrowRounded',
      size: 'lg',
      parentOrder: 0
    }
  })
  const icon1b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button1.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button1.id },
    data: { startIconId: icon1a.id, endIconId: icon1b.id }
  })

  const videoCard = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step2.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // question step!
  const video = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: videoCard.id,
      videoId: '7_0-nfs0803',
      videoVariantLanguageId: '529',
      autoplay: true,
      title: "What' Jesus Got to Do With Me?",
      parentOrder: 0,
      fullsize: true,
      action: {
        create: {
          gtmEventName: 'NavigateToBlockAction',
          blockId: questionStep.id
        }
      }
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoTriggerBlock',
      parentBlockId: video.id,
      triggerStart: 166,
      action: {
        create: {
          gtmEventName: 'trigger',
          blockId: questionStep.id
        }
      },
      parentOrder: 0
    }
  })

  const image1Id = uuidv4()
  const card2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: questionStep.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: image1Id,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: card2.id,
      src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Who was this Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
    }
  })
  await prisma.block.update({
    where: { id: card2.id },
    data: { coverBlockId: image1Id }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card2.id,
      content: 'Would you like to follow Jesus Christ?',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  const question1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioQuestionBlock',
      parentBlockId: card2.id,
      parentOrder: 2
    }
  })

  //   Yes, I would step/option
  //   First part of the prayer
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question1.id,
      label: 'Yes I would',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepPrayer1.id
        }
      },
      parentOrder: 0
    }
  })

  const prayerImageId1 = uuidv4()
  const prayerCard1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepPrayer1.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: prayerImageId1,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: prayerCard1.id,
      src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
    }
  })
  await prisma.block.update({
    where: { id: prayerCard1.id },
    data: { coverBlockId: prayerImageId1 }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard1.id,
      content: '1/3',
      variant: 'h6',
      color: 'primary',
      align: 'right',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard1.id,
      content:
        'Jesus, thank you for loving me, thank you for the worth you speak into my life by dying for my sin.',
      variant: 'subtitle1',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  // Second part of the prayer
  const button2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: prayerCard1.id,
      label: 'Next',
      variant: 'contained',
      color: 'primary',
      size: 'small',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepPrayer2.id
        }
      },
      parentOrder: 3
    }
  })

  const icon2a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button2.id,
      name: 'ChevronRightRounded',
      size: 'sm',
      parentOrder: 0
    }
  })
  const icon2b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button2.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button2.id },
    data: { startIconId: icon2a.id, endIconId: icon2b.id }
  })

  const prayerImageId2 = uuidv4()
  const prayerCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepPrayer2.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: prayerImageId2,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: prayerCard2.id,
      src: 'https://images.unsplash.com/photo-1504227488287-65981d97c2d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'L3D+P*1%00V]0H:%}+^NKHw?^0M|'
    }
  })
  await prisma.block.update({
    where: { id: prayerCard2.id },
    data: { coverBlockId: prayerImageId2 }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard2.id,
      content: '2/3',
      variant: 'h6',
      color: 'primary',
      align: 'right',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard2.id,
      content:
        'I confess, that I need your forgiveness. I want to turn from living for myself and trust you to take the lead in my life,',
      variant: 'subtitle1',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  // Third part of the prayer
  const button3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: prayerCard2.id,
      label: 'Next',
      variant: 'contained',
      color: 'primary',
      size: 'small',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepPrayer3.id
        }
      },
      parentOrder: 3
    }
  })
  const icon3a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button3.id,
      name: 'ChevronRightRounded',
      size: 'sm',
      parentOrder: 0
    }
  })
  const icon3b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button3.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button3.id },
    data: { startIconId: icon3a.id, endIconId: icon3b.id }
  })

  const prayerImageId3 = uuidv4()
  const prayerCard3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepPrayer3.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: prayerImageId3,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: prayerCard3.id,
      src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
    }
  })

  await prisma.block.update({
    where: { id: prayerCard3.id },
    data: { coverBlockId: prayerImageId3 }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard3.id,
      content: '3/3',
      variant: 'h6',
      color: 'primary',
      align: 'right',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard3.id,
      content:
        "I want to join life's adventure with you and become the person you made me to be.",
      variant: 'subtitle1',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  // final part of the prayer
  const button4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: prayerCard3.id,
      label: 'Amen',
      variant: 'contained',
      color: 'primary',
      size: 'small',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepPrayer4.id
        }
      },
      parentOrder: 3
    }
  })
  const icon4a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button4.id,
      name: 'BeenhereRounded',
      size: 'sm',
      parentOrder: 0
    }
  })
  const icon4b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button4.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button4.id },
    data: { startIconId: icon4a.id, endIconId: icon4b.id }
  })

  const prayerImageId4 = uuidv4()
  const prayerCard4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepPrayer4.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: prayerImageId4,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: prayerCard4.id,
      src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
    }
  })

  await prisma.block.update({
    where: { id: prayerCard4.id },
    data: { coverBlockId: prayerImageId4 }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard4.id,
      content: "WHAT'S NEXT?",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: prayerCard4.id,
      content:
        'Get printable card with three most important Bible verses every new Christian should know. ',
      variant: 'h5',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  //   I already have step/option
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question1.id,
      label: 'I already have',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepIAlreadyHave.id
        }
      },
      parentOrder: 2
    }
  })

  const image2Id = uuidv4()
  const card3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepIAlreadyHave.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card3.id,
      content: "THAT'S GREAT!",
      variant: 'overline',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card3.id,
      content: 'Ever thought about telling a friend what this means to you?',
      variant: 'h5',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card3.id,
      content: 'Sharing your story helps you grow with God and others.',
      variant: 'body1',
      color: 'primary',
      align: 'left',
      parentOrder: 2
    }
  })

  await prisma.block.create({
    data: {
      id: image2Id,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: card3.id,
      src: 'https://images.unsplash.com/photo-1527819569483-f188a16975af?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Jesus In History',
      width: 1920,
      height: 1080,
      blurhash: 'LRHUFAIp5qnN~UX8IUoI00xaZ$of'
    }
  })
  await prisma.block.update({
    where: { id: card3.id },
    data: { coverBlockId: image2Id }
  })

  // I already have final card
  const button5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card3.id,
      label: 'Share Now',
      variant: 'contained',
      color: 'primary',
      size: 'large',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepIAlreadyHave2.id
        }
      },
      parentOrder: 4
    }
  })
  const icon5a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button5.id,
      name: 'SendRounded',
      size: 'lg',
      parentOrder: 0
    }
  })
  const icon5b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button5.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button5.id },
    data: { startIconId: icon5a.id, endIconId: icon5b.id }
  })

  const alreadyImageId = uuidv4()
  const alreadyCard4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepIAlreadyHave2.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: alreadyImageId,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: alreadyCard4.id,
      src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
    }
  })
  await prisma.block.update({
    where: { id: alreadyCard4.id },
    data: { coverBlockId: alreadyImageId }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: alreadyCard4.id,
      content: "WHAT'S NEXT?",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: alreadyCard4.id,
      content: 'Get a few tips by email on how to share your faith',
      variant: 'h4',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  //   No thanks step/option
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question1.id,
      label: 'No thanks',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepNoThanks.id
        }
      },
      parentOrder: 3
    }
  })

  const noThanksImageId = uuidv4()
  const noThanksCard = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepNoThanks.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: noThanksCard.id,
      content: 'ALRIGHT!',
      variant: 'overline',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: noThanksCard.id,
      content: "It's awesome that you've looked into another perspective.",
      variant: 'h5',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: noThanksCard.id,
      content: "Don't stop here. Keep exploring and asking questions.",
      variant: 'body1',
      color: 'primary',
      align: 'left',
      parentOrder: 2
    }
  })

  await prisma.block.create({
    data: {
      id: noThanksImageId,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: noThanksCard.id,
      src: 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'No Thanks',
      width: 1920,
      height: 1080,
      blurhash: 'LOCP^oDjkBNF?wIUofs.%gM{ofkC'
    }
  })
  await prisma.block.update({
    where: { id: noThanksCard.id },
    data: { coverBlockId: noThanksImageId }
  })

  // No thanks final card
  const button6 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: noThanksCard.id,
      label: "What's Next?",
      variant: 'contained',
      color: 'primary',
      size: 'large',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepNoThanks2.id
        }
      },
      parentOrder: 4
    }
  })
  const icon6a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button6.id,
      name: 'ContactSupportRounded',
      size: 'lg',
      parentOrder: 0
    }
  })
  const icon6b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button6.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button6.id },
    data: { startIconId: icon6a.id, endIconId: icon6b.id }
  })

  const noThanksImageId2 = uuidv4()
  const noThanksCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepNoThanks2.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: noThanksImageId2,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: noThanksCard2.id,
      src: 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'LOCP^oDjkBNF?wIUofs.%gM{ofkC'
    }
  })

  await prisma.block.update({
    where: { id: noThanksCard2.id },
    data: { coverBlockId: noThanksImageId2 }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: noThanksCard2.id,
      content: "WHAT'S NEXT?",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: noThanksCard2.id,
      content: 'Get new released videos by email.',
      variant: 'h4',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  //   I'm not sure step/option
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question1.id,
      label: "I'm not sure",
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepNotSure.id
        }
      },
      parentOrder: 4
    }
  })

  const notSureImageId = uuidv4()
  const notSureCard = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepNotSure.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: notSureCard.id,
      content: 'NOT SURE?',
      variant: 'overline',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: notSureCard.id,
      content: 'Making this commitment is a big deal, for sure.',
      variant: 'h5',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: notSureCard.id,
      content: 'God can answer your questions and help overcome worries.',
      variant: 'body1',
      color: 'primary',
      align: 'left',
      parentOrder: 2
    }
  })

  await prisma.block.create({
    data: {
      id: notSureImageId,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: notSureCard.id,
      src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Not sure',
      width: 1920,
      height: 1080,
      blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
    }
  })

  await prisma.block.update({
    where: { id: notSureCard.id },
    data: { coverBlockId: notSureImageId }
  })

  // step I'm not sure final card
  const button7 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: notSureCard.id,
      label: "What's Next?",
      variant: 'contained',
      color: 'primary',
      size: 'large',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepNotSure2.id
        }
      },
      parentOrder: 4
    }
  })
  const icon7a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button7.id,
      name: 'ContactSupportRounded',
      size: 'lg',
      parentOrder: 0
    }
  })
  const icon7b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button7.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button7.id },
    data: { startIconId: icon7a.id, endIconId: icon7b.id }
  })

  const notSureImageId2 = uuidv4()
  const notSureCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: stepNotSure2.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      id: notSureImageId2,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: notSureCard2.id,
      src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Decision',
      width: 1920,
      height: 1080,
      blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
    }
  })

  await prisma.block.update({
    where: { id: notSureCard2.id },
    data: { coverBlockId: notSureImageId2 }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: notSureCard2.id,
      content: "WHAT'S NEXT?",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: notSureCard2.id,
      content: 'Get new released videos and ideas to explore your faith',
      variant: 'h4',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  // Very last card
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: prayerCard4.id,
      parentOrder: 2,
      label: 'Name',
      minRows: 1,
      type: TextResponseType.name,
      required: true
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: prayerCard4.id,
      parentOrder: 3,
      label: 'Email',
      minRows: 1,
      type: TextResponseType.email,
      required: true
    }
  })

  const button8 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: prayerCard4.id,
      parentOrder: 4,
      label: 'Submit',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      submitEnabled: true,
      action: {
        create: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })

  const icon8a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button8.id,
      name: 'SendRounded',
      size: 'md',
      parentOrder: 0
    }
  })
  const icon8b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button8.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button8.id },
    data: { startIconId: icon8a.id, endIconId: icon8b.id }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: noThanksCard2.id,
      parentOrder: 2,
      label: 'Name',
      minRows: 1,
      type: TextResponseType.name,
      required: true
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: noThanksCard2.id,
      parentOrder: 3,
      label: 'Email',
      minRows: 1,
      type: TextResponseType.email,
      required: true
    }
  })

  const button9 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: noThanksCard2.id,
      parentOrder: 4,
      label: 'Submit',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      submitEnabled: true,
      action: {
        create: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })

  const icon9a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button9.id,
      name: 'SendRounded',
      size: 'md',
      parentOrder: 0
    }
  })
  const icon9b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button9.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button9.id },
    data: { startIconId: icon9a.id, endIconId: icon9b.id }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: alreadyCard4.id,
      parentOrder: 2,
      label: 'Name',
      minRows: 1,
      type: TextResponseType.name,
      required: true
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: alreadyCard4.id,
      parentOrder: 3,
      label: 'Email',
      minRows: 1,
      type: TextResponseType.email,
      required: true
    }
  })

  const button10 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: alreadyCard4.id,
      parentOrder: 4,
      label: 'Submit',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      submitEnabled: true,
      action: {
        create: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })

  const icon10a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button10.id,
      name: 'SendRounded',
      size: 'md',
      parentOrder: 0
    }
  })
  const icon10b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button10.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button10.id },
    data: { startIconId: icon10a.id, endIconId: icon10b.id }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: notSureCard2.id,
      parentOrder: 2,
      label: 'Name',
      minRows: 1,
      type: TextResponseType.name,
      required: true
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TextResponseBlock',
      parentBlockId: notSureCard2.id,
      parentOrder: 3,
      label: 'Email',
      minRows: 1,
      type: TextResponseType.email,
      required: true
    }
  })

  const button11 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: notSureCard2.id,
      parentOrder: 4,
      label: 'Submit',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      submitEnabled: true,
      action: {
        create: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })

  const icon11a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button11.id,
      name: 'SendRounded',
      size: 'md',
      parentOrder: 0
    }
  })
  const icon11b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button11.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button11.id },
    data: { startIconId: icon11a.id, endIconId: icon11b.id }
  })

  const lastImageId = uuidv4()
  const lastCard = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: lastStep.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: lastCard.id,
      content: 'THANK YOU!',
      variant: 'overline',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: lastCard.id,
      content: 'Check your email for requested materials and keep exploring.',
      variant: 'subtitle1',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      id: lastImageId,
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: lastCard.id,
      src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
      alt: 'Not sure',
      width: 1920,
      height: 1080,
      blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
    }
  })

  await prisma.block.update({
    where: { id: lastCard.id },
    data: { coverBlockId: lastImageId }
  })

  const button12 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: lastCard.id,
      label: 'Watch Other Videos',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: stepNoThanks2.id
        }
      },
      parentOrder: 2
    }
  })
  const icon12a = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button12.id,
      name: 'SubscriptionsRounded',
      size: 'md',
      parentOrder: 0
    }
  })
  const icon12b = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button12.id,
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button12.id },
    data: {
      startIconId: icon12a.id,
      endIconId: icon12b.id
    }
  })
}
