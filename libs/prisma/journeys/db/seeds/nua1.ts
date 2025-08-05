import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'
import { PrismaClient } from '../../src/client'

const prisma = new PrismaClient()

export async function nua1(): Promise<void> {
  const slug = 'fact-or-fiction'
  const existingJourney = await prisma.journey.findUnique({ where: { slug } })
  if (existingJourney != null) {
    await prisma.action.deleteMany({
      where: { parentBlock: { journeyId: existingJourney.id } }
    })
    await prisma.block.deleteMany({ where: { journeyId: existingJourney.id } })
  }

  const journeyData = {
    id: '1',
    title: 'Fact or Fiction',
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    slug,
    status: JourneyStatus.published,
    teamId: 'jfp-team',
    createdAt: new Date(),
    publishedAt: new Date(),
    featuredAt: new Date()
  }
  const journey = await prisma.journey.upsert({
    where: { id: journeyData.id },
    create: journeyData,
    update: journeyData
  })

  const step6 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 5
    }
  })

  const step5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 4,
      nextBlockId: step6.id
    }
  })

  const step4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 3,
      nextBlockId: step5.id
    }
  })

  const step3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 2,
      nextBlockId: step4.id
    }
  })

  const step2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 1,
      nextBlockId: step3.id
    }
  })

  // first step
  const step1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 0,
      nextBlockId: step2.id
    }
  })

  const card1 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: { connect: { id: step1.id } },
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const coverblock = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'VideoBlock',
      parentBlock: { connect: { id: card1.id } },
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      muted: true,
      autoplay: true,
      startAt: 11,
      title: 'Fact or fiction',
      description:
        'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
    }
  })
  await prisma.block.update({
    where: { id: card1.id },
    data: {
      coverBlock: { connect: { id: coverblock.id } }
    }
  })

  const poster = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ImageBlock',
      parentBlock: { connect: { id: coverblock.id } },
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Can we trust the story of Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      parentOrder: 0,
      posterBlockParent: { connect: { id: coverblock.id } }
    }
  })
  await prisma.block.update({
    where: { id: coverblock.id },
    data: {
      posterBlock: { connect: { id: poster.id } }
    }
  })

  await prisma.block.createMany({
    data: [
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content: 'JESUS CHRIST:',
        variant: 'h6',
        color: 'primary',
        align: 'left',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content: 'Fact or Fiction',
        variant: 'h2',
        color: 'primary',
        align: 'left',
        parentOrder: 1
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content:
          'In this 5-minute video, explore the arguments for and against the Gospel accounts.',
        variant: 'body1',
        color: 'primary',
        align: 'left',
        parentOrder: 2
      }
    ]
  })

  // second step
  const button1 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ButtonBlock',
      parentBlock: { connect: { id: card1.id } },
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
      parentOrder: 4
    }
  })

  const icon1a = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'IconBlock',
      parentBlock: { connect: { id: button1.id } },
      name: 'PlayArrowRounded',
      size: 'lg'
    }
  })
  const icon1b = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'IconBlock',
      parentBlock: { connect: { id: button1.id } },
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button1.id },
    data: { startIconId: icon1a.id, endIconId: icon1b.id }
  })

  const videoCard = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: { connect: { id: step2.id } },
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // third step
  const video = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'VideoBlock',
      parentBlock: { connect: { id: videoCard.id } },
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      autoplay: true,
      title: 'Fact or fiction',
      description:
        'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.',
      fullsize: true,
      parentOrder: 0,
      action: {
        create: {
          gtmEventName: 'NavigateToBlockAction',
          blockId: step3.id
        }
      }
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'VideoTriggerBlock',
      parentBlock: { connect: { id: video.id } },
      triggerStart: 133,
      action: {
        create: {
          gtmEventName: 'trigger',
          blockId: step3.id
        }
      },
      parentOrder: 0
    }
  })

  const card3 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: { connect: { id: step3.id } },
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const image = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ImageBlock',
      parentBlock: { connect: { id: card3.id } },
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Can we trust the story of Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG'
    }
  })
  await prisma.block.update({
    where: { id: card3.id },
    data: {
      coverBlock: { connect: { id: image.id } }
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card3.id } },
      content: 'What do you think?',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'TypographyBlock',
      parentBlock: { connect: { id: card3.id } },
      content: 'Can we trust the story of Jesus?',
      variant: 'h3',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  const question2 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'RadioQuestionBlock',
      parentBlock: { connect: { id: card3.id } },
      parentOrder: 2
    }
  })

  // fourth step
  await prisma.block.create({
    data: {
      journey: {
        connect: { id: journey.id }
      },
      typename: 'RadioOptionBlock',
      parentBlock: {
        connect: { id: question2.id }
      },
      label: 'Yes, it’s a true story 👍',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: step4.id
        }
      },
      parentOrder: 1
    }
  })

  await prisma.block.create({
    data: {
      journey: {
        connect: { id: journey.id }
      },
      typename: 'RadioOptionBlock',
      parentBlock: {
        connect: { id: question2.id }
      },
      label: 'No, it’s a fake fabrication 👎',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: step4.id
        }
      },
      parentOrder: 2
    }
  })

  const videoCard1 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: { connect: { id: step4.id } },
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // fifth step
  const video1 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'VideoBlock',
      parentBlock: { connect: { id: videoCard1.id } },
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      autoplay: true,
      title: 'Fact or fiction',
      startAt: 134,
      fullsize: true,
      parentOrder: 0,
      action: {
        create: {
          gtmEventName: 'NavigateToBlockAction',
          blockId: step5.id
        }
      }
    }
  })

  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'VideoTriggerBlock',
      parentBlock: { connect: { id: video1.id } },
      triggerStart: 306,
      action: {
        create: {
          gtmEventName: 'trigger',
          blockId: step5.id
        }
      },
      parentOrder: 0
    }
  })

  const card5 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: { connect: { id: step5.id } },
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  await prisma.block.createMany({
    data: [
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card5.id,
        content: 'SOME FACTS...',
        variant: 'h6',
        color: 'primary',
        align: 'left',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card5.id,
        content: 'Jesus in History',
        variant: 'h2',
        color: 'primary',
        align: 'left',
        parentOrder: 1
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card5.id,
        content:
          'We have more accurate historical accounts for the story of Jesus than for Alexander the Great or Julius Caesar.',
        variant: 'body1',
        color: 'primary',
        align: 'left',
        parentOrder: 2
      }
    ]
  })

  const image2 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ImageBlock',
      parentBlock: { connect: { id: card5.id } },
      src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
      alt: 'Jesus In History',
      width: 1920,
      height: 1080,
      blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW'
    }
  })
  await prisma.block.update({
    where: { id: card5.id },
    data: {
      coverBlock: { connect: { id: image2.id } }
    }
  })

  // sixth step
  const button2 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ButtonBlock',
      parentBlock: { connect: { id: card5.id } },
      label: 'One question remains...',
      variant: 'contained',
      color: 'primary',
      size: 'medium',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: step6.id
        }
      },
      parentOrder: 4
    }
  })

  const icon2a = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'IconBlock',
      parentBlock: {
        connect: { id: button2.id }
      },
      name: 'ContactSupportRounded',
      size: 'md'
    }
  })
  const icon2b = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'IconBlock',
      parentBlock: {
        connect: { id: button2.id }
      },
      name: null
    }
  })
  await prisma.block.update({
    where: { id: button2.id },
    data: { startIconId: icon2a.id, endIconId: icon2b.id }
  })

  const card6 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'CardBlock',
      parentBlock: {
        connect: { id: step6.id }
      },
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      parentOrder: 0
    }
  })

  const image3 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'ImageBlock',
      parentBlock: {
        connect: { id: card6.id }
      },
      src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
      alt: 'Who was this Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW'
    }
  })
  await prisma.block.update({
    where: { id: card6.id },
    data: {
      coverBlock: { connect: { id: image3.id } }
    }
  })

  await prisma.block.createMany({
    data: [
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card6.id,
        content: "IF IT'S TRUE...",
        variant: 'h6',
        color: 'primary',
        align: 'left',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card6.id,
        content: 'Who was this Jesus?',
        variant: 'h2',
        color: 'primary',
        align: 'left',
        parentOrder: 1
      }
    ]
  })

  const question4 = await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'RadioQuestionBlock',
      parentBlock: {
        connect: { id: card6.id }
      },
      parentOrder: 2
    }
  })

  await prisma.block.create({
    data: {
      journey: {
        connect: { id: journey.id }
      },
      typename: 'RadioOptionBlock',
      parentBlock: {
        connect: { id: question4.id }
      },
      label: 'A great influencer',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/what-about-the-resurrection'
        }
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'RadioOptionBlock',
      parentBlock: {
        connect: { id: question4.id }
      },
      label: 'The Son of God',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/what-about-the-resurrection'
        }
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'RadioOptionBlock',
      parentBlock: {
        connect: {
          id: question4.id
        }
      },
      label: 'A popular prophet',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/what-about-the-resurrection'
        }
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journey: { connect: { id: journey.id } },
      typename: 'RadioOptionBlock',
      parentBlock: {
        connect: { id: question4.id }
      },
      label: 'A fake historical figure',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/what-about-the-resurrection'
        }
      },
      parentOrder: 3
    }
  })
}
