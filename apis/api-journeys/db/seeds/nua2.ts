import { PrismaClient } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

export async function nua2(): Promise<void> {
  const slug = 'what-about-the-resurrection'
  const existingJourney = await prisma.journey.findUnique({ where: { slug } })
  if (existingJourney != null) {
    await prisma.action.deleteMany({
      where: { parentBlock: { journeyId: existingJourney.id } }
    })
    await prisma.block.deleteMany({ where: { journeyId: existingJourney.id } })
  }

  const journeyData = {
    id: '2',
    title: 'What About The Resurrection?',
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

  const step7 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 6
    }
  })

  const step6 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'StepBlock',
      locked: false,
      parentOrder: 5,
      nextBlockId: step7.id
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
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step1.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const coverblock = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: card1.id,
      videoId: '7_0-nfs0301',
      videoVariantLanguageId: '529',
      muted: true,
      autoplay: true,
      startAt: 11,
      title: 'What about the resurrection'
    }
  })
  await prisma.block.update({
    where: { id: card1.id },
    data: { coverBlockId: coverblock.id }
  })

  const poster = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: coverblock.id,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Can we trust the story of Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
      parentOrder: 0
    }
  })
  await prisma.block.update({
    where: { id: coverblock.id },
    data: { posterBlockId: poster.id }
  })

  await prisma.block.createMany({
    data: [
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content: 'The Resurection',
        variant: 'h6',
        color: 'primary',
        align: 'left',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card1.id,
        content: 'What About It?',
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
          'Jesus’ tomb was found empty three days after his death-what could have happened to the body?',
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
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card1.id,
      label: 'Find Out',
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

  // third step
  const video = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: videoCard.id,
      videoId: '7_0-nfs0301',
      videoVariantLanguageId: '529',
      autoplay: true,
      title: 'What About The Ressurection?',
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
      journeyId: journey.id,
      typename: 'VideoTriggerBlock',
      parentBlockId: video.id,
      triggerStart: 108,
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
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step3.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const image = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: card3.id,
      src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Where did his body go?',
      width: 1920,
      height: 1080,
      blurhash: 'LFC$sANy00xF_NWF8_af9[n,xtR-'
    }
  })
  await prisma.block.update({
    where: { id: card3.id },
    data: { coverBlockId: image.id }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card3.id,
      content: 'HOW DO YOU THINK?',
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
      parentBlockId: card3.id,
      content: 'Where did his body go?',
      variant: 'h3',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  const question2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioQuestionBlock',
      parentBlockId: card3.id,
      parentOrder: 2
    }
  })

  // fourth step
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question2.id,
      label: 'Someone stole it from the tomb',
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
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question2.id,
      label: "He didn't really die",
      action: {
        create: {
          gtmEventName: 'click',
          blockId: step4.id
        }
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question2.id,
      label: 'He actually rose from the dead',
      action: {
        create: {
          gtmEventName: 'click',
          blockId: step4.id
        }
      },
      parentOrder: 3
    }
  })

  const videoCard1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step4.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // fifth step
  const video1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: videoCard1.id,
      videoId: '7_0-nfs0301',
      videoVariantLanguageId: '529',
      autoplay: true,
      title: 'What About The Ressurection?',
      startAt: 109,
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
      journeyId: journey.id,
      typename: 'VideoTriggerBlock',
      parentBlockId: video1.id,
      triggerStart: 272,
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
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step5.id,
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
        content: 'A QUOTE',
        variant: 'h6',
        color: 'primary',
        align: 'left',
        parentOrder: 0
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card5.id,
        content:
          "...one of the soldiers pierced Jesus' side with a spear, bringing a sudden flow of blood and water.",
        variant: 'subtitle1',
        color: 'primary',
        align: 'left',
        parentOrder: 1
      },
      {
        journeyId: journey.id,
        typename: 'TypographyBlock',
        parentBlockId: card5.id,
        content: '- The Bible, John 19:34',
        variant: 'body1',
        color: 'primary',
        align: 'left',
        parentOrder: 2
      }
    ]
  })

  const image2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: card5.id,
      src: 'https://images.unsplash.com/photo-1616977545092-f4a423c3f22e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=765&q=80',
      alt: 'quote',
      width: 1920,
      height: 1080,
      blurhash: 'L9Db$mOt008_}?oz58M{.8o#rqIU'
    }
  })
  await prisma.block.update({
    where: { id: card5.id },
    data: { coverBlockId: image2.id }
  })

  // sixth step
  const button2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ButtonBlock',
      parentBlockId: card5.id,
      label: 'What does it mean?',
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
      journeyId: journey.id,
      typename: 'IconBlock',
      parentBlockId: button2.id,
      name: 'ContactSupportRounded',
      size: 'md',
      parentOrder: 4
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

  const videoCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step6.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  // seventh step
  const video2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoBlock',
      parentBlockId: videoCard2.id,
      videoId: '7_0-nfs0301',
      videoVariantLanguageId: '529',
      autoplay: true,
      title: 'What About The Ressurection?',
      startAt: 272,
      fullsize: true,
      parentOrder: 0,
      action: {
        create: {
          gtmEventName: 'NavigateToBlockAction',
          blockId: step7.id
        }
      }
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'VideoTriggerBlock',
      parentBlockId: video2.id,
      triggerStart: 348,
      action: {
        create: {
          gtmEventName: 'trigger',
          blockId: step7.id
        }
      },
      parentOrder: 0
    }
  })

  const card7 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'CardBlock',
      parentBlockId: step7.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      parentOrder: 0
    }
  })

  const image3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'ImageBlock',
      parentBlockId: card7.id,
      src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
      alt: 'Who was this Jesus?',
      width: 1920,
      height: 1080,
      blurhash: 'L;KH$$-Rs-kA}ot4bZj@S3R,WWj@'
    }
  })
  await prisma.block.update({
    where: { id: card7.id },
    data: { coverBlockId: image3.id }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'TypographyBlock',
      parentBlockId: card7.id,
      content: "IF IT'S TRUE...",
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
      parentBlockId: card7.id,
      content: 'What is Christianity to you?',
      variant: 'h3',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  })

  const question5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioQuestionBlock',
      parentBlockId: card7.id,
      parentOrder: 2
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question5.id,
      label: 'One of many ways to God',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/whats-jesus-got-to-do-with-me'
        }
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question5.id,
      label: 'One great lie...',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/whats-jesus-got-to-do-with-me'
        }
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      typename: 'RadioOptionBlock',
      parentBlockId: question5.id,
      label: 'One true way to God',
      action: {
        create: {
          gtmEventName: 'LinkAction',
          url: '/whats-jesus-got-to-do-with-me'
        }
      },
      parentOrder: 2
    }
  })
}
