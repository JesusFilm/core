import { PrismaClient, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'

export async function nua2(prisma: PrismaClient): Promise<void> {
  let journey = await prisma.journey.findFirst({
    where: { title: 'What About The Resurrection?' }
  })
  const nuaEp8 = await prisma.journey.findFirst({
    where: { title: "What's Jesus Got to Do With Me?" }
  })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: 'What About The Resurrection?',
        publishedAt: '2021-11-15T03:42:22.322Z',
        locale: 'en-US',
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        slug: 'what-about-the-resurrection'
      }
    })
  }
  await prisma.response.deleteMany({
    where: { block: { journeyId: journey.id } }
  })
  await prisma.block.deleteMany({ where: { journeyId: journey.id } })
  const nextBlockId = uuidv4()

  //   first step
  const step1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 0
    }
  })
  const coverBlockId = uuidv4()
  const card1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step1.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId
      },
      parentOrder: 0
    }
  })
  const posterBlockId = uuidv4()
  await prisma.block.create({
    data: {
      id: coverBlockId,
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: card1.id,
      extraAttrs: {
        videoContent: {
          mediaComponentId: '5_0-NUA0301-0-0',
          languageId: '529'
        },
        posterBlockId,
        muted: true,
        autoplay: true,
        startAt: 11,
        title: 'What about the resurrection'
      }
    }
  })
  await prisma.block.create({
    data: {
      id: posterBlockId,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: coverBlockId,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Can we trust the story of Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card1.id,
      extraAttrs: {
        content: 'The Resurection',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card1.id,
      extraAttrs: {
        content: 'What About It?',
        variant: 'h3',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card1.id,
      extraAttrs: {
        content:
          'Jesus’ tomb was found empty three days after his death-what could have happened to the body?',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })

  //   second step
  const step2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: card1.id,
      extraAttrs: {
        label: 'Find Out',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrowRounded'
        },
        action: {
          gtmEventName: 'click',
          blockId: step2.id
        }
      },
      parentOrder: 3
    }
  })
  const video = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: step2.id,
      extraAttrs: {
        videoContent: {
          mediaComponentId: '5_0-NUA0301-0-0',
          languageId: '529'
        },
        autoplay: true,
        title: 'What About The Ressurection?'
      }
    }
  })

  //   third step
  const step3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoTriggerBlock',
      parentBlockId: video.id,
      extraAttrs: {
        triggerStart: 108,
        action: {
          gtmEventName: 'trigger',
          blockId: step3.id
        }
      }
    }
  })
  const image1Id = uuidv4()
  const card3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step3.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image1Id
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: image1Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card3.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Where did his body go?',
        width: 1920,
        height: 1080,
        blurhash: 'LFC$sANy00xF_NWF8_af9[n,xtR-'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card3.id,
      extraAttrs: {
        content: 'HOW DO YOU THINK?',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  const question2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: card3.id,
      extraAttrs: {
        label: 'Where did his body go?'
      },
      parentOrder: 2
    }
  })

  //   fourth step
  const step4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question2.id,
      extraAttrs: {
        label: 'Someone stole it from the tomb',
        action: {
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
      blockType: 'RadioOptionBlock',
      parentBlockId: question2.id,
      extraAttrs: {
        label: "He didn't really die",
        action: {
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
      blockType: 'RadioOptionBlock',
      parentBlockId: question2.id,
      extraAttrs: {
        label: 'He actually rose from the dead',
        action: {
          gtmEventName: 'click',
          blockId: step4.id
        }
      },
      parentOrder: 3
    }
  })
  const video1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: step4.id,
      extraAttrs: {
        videoContent: {
          mediaComponentId: '5_0-NUA0301-0-0',
          languageId: '529'
        },
        autoplay: true,
        title: 'What About The Ressurection?',
        startAt: 109
      }
    }
  })

  //   fifth step
  const step5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 4
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoTriggerBlock',
      parentBlockId: video1.id,
      extraAttrs: {
        triggerStart: 272,
        action: {
          gtmEventName: 'trigger',
          blockId: step5.id
        }
      }
    }
  })
  const image2Id = uuidv4()
  const card5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step5.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image2Id
      },
      parentOrder: 0
    }
  })

  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        content: 'A QUOTE',
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        content:
          "...one of the soldiers pierced Jesus' side with a spear, bringing a sudden flow of blood and water.",
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        content: '- The Bible, John 19:34',
        variant: 'caption',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      id: image2Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1616977545092-f4a423c3f22e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=765&q=80',
        alt: 'quote',
        width: 1920,
        height: 1080,
        blurhash: 'L9Db$mOt008_}?oz58M{.8o#rqIU'
      },
      parentOrder: 0
    }
  })

  //   sixth step is now a video
  const step6 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 5
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        label: 'What does it mean?',
        variant: 'contained',
        color: 'primary',
        size: 'medium',
        startIcon: {
          name: 'ContactSupportRounded'
        },
        action: {
          gtmEventName: 'click',
          blockId: step6.id
        }
      },
      parentOrder: 4
    }
  })
  const video2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: step6.id,
      extraAttrs: {
        videoContent: {
          mediaComponentId: '5_0-NUA0301-0-0',
          languageId: '529'
        },
        autoplay: true,
        title: 'What About The Ressurection?',
        startAt: 272
      }
    }
  })

  // seventh step
  const step7 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false
      },
      parentOrder: 6
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoTriggerBlock',
      parentBlockId: video2.id,
      extraAttrs: {
        triggerStart: 348,
        action: {
          gtmEventName: 'trigger',
          blockId: step7.id
        }
      }
    }
  })
  const image3Id = uuidv4()
  const card7 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step7.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image3Id,
        fullscreen: false
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: image3Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card7.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
        alt: 'Who was this Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'L;KH$$-Rs-kA}ot4bZj@S3R,WWj@'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: card7.id,
      extraAttrs: {
        content: "IF IT'S TRUE...",
        variant: 'h6',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  const question5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: card7.id,
      extraAttrs: {
        label: 'What is Christianity to you?',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: 'One of many ways to God',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: 'One great lie...',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question5.id,
      extraAttrs: {
        label: 'One true way to God',
        action: {
          gtmEventName: 'click',
          journeyId: nuaEp8?.id
        }
      },
      parentOrder: 3
    }
  })
}
