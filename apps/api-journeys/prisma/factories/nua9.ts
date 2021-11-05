import { PrismaClient, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { v4 as uuidv4 } from 'uuid'

export async function nua9(prisma: PrismaClient): Promise<void> {
  let journey = await prisma.journey.findFirst({
    where: { title: 'Decision' }
  })
  if (journey == null) {
    journey = await prisma.journey.create({
      data: {
        title: 'Decision',
        published: true,
        locale: 'en-US',
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        slug: 'decision'
      }
    })
  }
  await prisma.response.deleteMany({
    where: { block: { journeyId: journey.id } }
  })
  await prisma.block.deleteMany({ where: { journeyId: journey.id } })
  const nextBlockId = uuidv4()

  //   first step
  const step = await prisma.block.create({
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
  const card = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: step.id,
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
      parentBlockId: card.id,
      extraAttrs: {
        videoContent: {
          mediaComponentId: '5_0-NUA1001-0-0',
          languageId: '529'
        },
        posterBlockId,
        muted: true,
        autoplay: true,
        startAt: 10,
        title: 'Decision'
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
      parentBlockId: card.id,
      extraAttrs: {
        content: 'TRUSTING JESUS',
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
      parentBlockId: card.id,
      extraAttrs: {
        content: 'Can I Know Him?',
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
      parentBlockId: card.id,
      extraAttrs: {
        content:
          'Jesus Christ loves you and wants to have a relationship with you. But how does it begin?',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })

  //   video step
  const step1 = await prisma.block.create({
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
      parentBlockId: card.id,
      extraAttrs: {
        label: 'Explore Now',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: step1.id
        }
      },
      parentOrder: 3
    }
  })
  const video = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'VideoBlock',
      parentBlockId: step1.id,
      extraAttrs: {
        videoContent: {
          mediaComponentId: '5_0-NUA1001-0-0',
          languageId: '529'
        },
        autoplay: true,
        title: "What' Jesus Got to Do With Me?"
      },
      parentOrder: 0
    }
  })

  // question step!
  const questionStep = await prisma.block.create({
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
        triggerStart: 166,
        action: {
          gtmEventName: 'trigger',
          blockId: questionStep.id
        }
      }
    }
  })
  const image1Id = uuidv4()
  const card5 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: questionStep.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: image1Id,
        fullscreen: true
      },
      parentOrder: 0
    }
  })
  const gridContainer = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridContainerBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  })
  const gridItemLeft = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: gridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 0
    }
  })
  const gridItemRight = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: gridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      id: image1Id,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: card5.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Who was this Jesus?',
        width: 1920,
        height: 1080,
        blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: gridItemLeft.id,
      extraAttrs: {
        content: 'Would you like to follow Jesus Christ?',
        variant: 'h2',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })
  const question1 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioQuestionBlock',
      parentBlockId: gridItemRight.id,
      extraAttrs: {
        label: ''
      },
      parentOrder: 2
    }
  })

  //   Yes, I would step/option
  //   First part of the prayer
  const stepPrayer1 = await prisma.block.create({
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
      parentBlockId: question1.id,
      extraAttrs: {
        label: 'Yes I would',
        action: {
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
      blockType: 'CardBlock',
      parentBlockId: stepPrayer1.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId1
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId1,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1433324168539-154874446945?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'L5AVCm=Z4VIW004T.Awb8w_2b_jE'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        content: '1/3',
        variant: 'h6',
        color: 'primary',
        align: 'right'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        content:
          'Jesus, thank you for loving me, thank you for the worth you speak into my life by dying for my sin.',
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })

  // Second part of the prayer
  const stepPrayer2 = await prisma.block.create({
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
      blockType: 'ButtonBlock',
      parentBlockId: prayerCard1.id,
      extraAttrs: {
        label: 'Next',
        variant: 'contained',
        color: 'primary',
        size: 'small',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: stepPrayer2.id
        }
      },
      parentOrder: 3
    }
  })
  const prayerImageId2 = uuidv4()
  const prayerCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepPrayer2.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId2
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId2,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1504227488287-65981d97c2d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'L3D+P*1%00V]0H:%}+^NKHw?^0M|'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        content: '2/3',
        variant: 'h6',
        color: 'primary',
        align: 'right'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        content:
          'I confess, that I need your forgiveness. I want to turn from living for myself and trust you to take the lead in my life,',
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })

  // Third part of the prayer
  const stepPrayer3 = await prisma.block.create({
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
      parentBlockId: prayerCard2.id,
      extraAttrs: {
        label: 'Next',
        variant: 'contained',
        color: 'primary',
        size: 'small',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: stepPrayer3.id
        }
      },
      parentOrder: 3
    }
  })
  const prayerImageId3 = uuidv4()
  const prayerCard3 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepPrayer3.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId3
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId3,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard3.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard3.id,
      extraAttrs: {
        content: '3/3',
        variant: 'h6',
        color: 'primary',
        align: 'right'
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerCard3.id,
      extraAttrs: {
        content:
          "I want to join life's adventure with you and become the person you made me to be.",
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })

  // final part of the prayer
  const stepPrayer4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 6
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: prayerCard3.id,
      extraAttrs: {
        label: 'Amen',
        variant: 'contained',
        color: 'primary',
        size: 'small',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: stepPrayer4.id
        }
      },
      parentOrder: 3
    }
  })
  const prayerImageId4 = uuidv4()
  const prayerCard4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepPrayer4.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: prayerImageId4,
        fullscreen: true
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: prayerImageId4,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: prayerCard4.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
      },
      parentOrder: 0
    }
  })
  const prayerGridContainer = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridContainerBlock',
      parentBlockId: prayerCard4.id,
      extraAttrs: {
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  })
  const prayerGridItemLeft = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: prayerGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 0
    }
  })
  const prayerGridItemRight = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: prayerGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: prayerGridItemLeft.id,
      extraAttrs: {
        content: "WHAT'S NEXT?",
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
      parentBlockId: prayerGridItemLeft.id,
      extraAttrs: {
        content:
          'Get printable card with three most important Bible verses every new Christian should know. ',
        variant: 'h5',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 0
    }
  })

  //   I already have step/option
  const stepIAlreadyHave = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 7
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question1.id,
      extraAttrs: {
        label: 'I already have',
        action: {
          gtmEventName: 'click',
          blockId: stepIAlreadyHave.id
        }
      },
      parentOrder: 2
    }
  })
  const image2Id = uuidv4()
  const card2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepIAlreadyHave.id,
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
      parentBlockId: card2.id,
      extraAttrs: {
        content: "THAT'S GREAT!",
        variant: 'overline',
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
      parentBlockId: card2.id,
      extraAttrs: {
        content: 'Ever thought about telling a friend what this means to you?',
        variant: 'h5',
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
      parentBlockId: card2.id,
      extraAttrs: {
        content: 'Sharing your story helps you grow with God and others.',
        variant: 'body1',
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
      parentBlockId: card2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1527819569483-f188a16975af?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Jesus In History',
        width: 1920,
        height: 1080,
        blurhash: 'LRHUFAIp5qnN~UX8IUoI00xaZ$of'
      },
      parentOrder: 0
    }
  })

  // I already have final card
  const stepIAlreadyHave2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 8
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: card2.id,
      extraAttrs: {
        label: 'Share Now',
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEvenName: 'click',
          blockId: stepIAlreadyHave2.id
        }
      },
      parentOrder: 4
    }
  })
  const alreadyImageId = uuidv4()
  const alreadyCard4 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepIAlreadyHave2.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: alreadyImageId,
        fullscreen: true
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: alreadyImageId,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: alreadyCard4.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1519373344801-14c1f9539c9c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'LqJs65}=R%so$,s:R*jb58Iqs:bH'
      },
      parentOrder: 0
    }
  })
  const alreadyGridContainer = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridContainerBlock',
      parentBlockId: alreadyCard4.id,
      extraAttrs: {
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  })
  const alreadyGridItemLeft = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: alreadyGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 0
    }
  })
  const alreadyGridItemRight = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: alreadyGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: alreadyGridItemLeft.id,
      extraAttrs: {
        content: "WHAT'S NEXT?",
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
      parentBlockId: alreadyGridItemLeft.id,
      extraAttrs: {
        content: 'Get a few tips by email on how to share your faith',
        variant: 'h4',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })

  //   No thanks step/option
  const stepNoThanks = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 9
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question1.id,
      extraAttrs: {
        label: 'No thanks',
        action: {
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
      blockType: 'CardBlock',
      parentBlockId: stepNoThanks.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: noThanksImageId
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: noThanksCard.id,
      extraAttrs: {
        content: 'ALRIGHT!',
        variant: 'overline',
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
      parentBlockId: noThanksCard.id,
      extraAttrs: {
        content: "It's awesome that you've looked into another perspective.",
        variant: 'h5',
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
      parentBlockId: noThanksCard.id,
      extraAttrs: {
        content: "Don't stop here. Keep exploring and asking questions.",
        variant: 'body1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      id: noThanksImageId,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: noThanksCard.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'No Thanks',
        width: 1920,
        height: 1080,
        blurhash: 'LOCP^oDjkBNF?wIUofs.%gM{ofkC'
      },
      parentOrder: 0
    }
  })

  // No thanks final card
  const stepNoThanks2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 10
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: noThanksCard.id,
      extraAttrs: {
        label: "What's Next?",
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEvenName: 'click',
          blockId: stepNoThanks2.id
        }
      },
      parentOrder: 4
    }
  })
  const noThanksImageId2 = uuidv4()
  const noThanksCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepNoThanks2.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: noThanksImageId2,
        fullscreen: true
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: noThanksImageId2,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: noThanksCard2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1532200624530-cc3d3d0d636c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'LOCP^oDjkBNF?wIUofs.%gM{ofkC'
      },
      parentOrder: 1
    }
  })
  const noThanksGridContainer = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridContainerBlock',
      parentBlockId: noThanksCard2.id,
      extraAttrs: {
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  })
  const noThanksGridItemLeft = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: noThanksGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 0
    }
  })
  const noThanksGridItemRight = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: noThanksGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: noThanksGridItemLeft.id,
      extraAttrs: {
        content: "WHAT'S NEXT?",
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
      parentBlockId: noThanksGridItemLeft.id,
      extraAttrs: {
        content: 'Get new released videos by email.',
        variant: 'h4',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })

  //   I'm not sure step/option
  const stepNotSure = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 11
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'RadioOptionBlock',
      parentBlockId: question1.id,
      extraAttrs: {
        label: "I'm not sure",
        action: {
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
      blockType: 'CardBlock',
      parentBlockId: stepNotSure.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: notSureImageId
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: notSureCard.id,
      extraAttrs: {
        content: 'NOT SURE?',
        variant: 'overline',
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
      parentBlockId: notSureCard.id,
      extraAttrs: {
        content: 'Making this commitment is a big deal, for sure.',
        variant: 'h5',
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
      parentBlockId: notSureCard.id,
      extraAttrs: {
        content: 'God can answer your questions and help overcome worries.',
        variant: 'body1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 3
    }
  })
  await prisma.block.create({
    data: {
      id: notSureImageId,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: notSureCard.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Not sure',
        width: 1920,
        height: 1080,
        blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
      },
      parentOrder: 0
    }
  })

  // step I'm not sure final card
  const stepNotSure2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false,
        nextBlockId
      },
      parentOrder: 12
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: notSureCard.id,
      extraAttrs: {
        label: "What's Next?",
        variant: 'contained',
        color: 'primary',
        size: 'large',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEvenName: 'click',
          blockId: stepNotSure2.id
        }
      },
      parentOrder: 4
    }
  })
  const notSureImageId2 = uuidv4()
  const notSureCard2 = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: stepNotSure2.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: notSureImageId2,
        fullscreen: true
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      id: notSureImageId2,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: notSureCard2.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Decision',
        width: 1920,
        height: 1080,
        blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
      },
      parentOrder: 0
    }
  })
  const notSureGridContainer = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridContainerBlock',
      parentBlockId: notSureCard2.id,
      extraAttrs: {
        spacing: 6,
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  })
  const notSureGridItemLeft = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: notSureGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 0
    }
  })
  const notSureGridItemRight = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'GridItemBlock',
      parentBlockId: notSureGridContainer.id,
      extraAttrs: {
        xl: 6,
        lg: 6,
        sm: 6
      },
      parentOrder: 1
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: notSureGridItemLeft.id,
      extraAttrs: {
        content: "WHAT'S NEXT?",
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
      parentBlockId: notSureGridItemLeft.id,
      extraAttrs: {
        content: 'Get new released videos and ideas to explore your faith',
        variant: 'h4',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 1
    }
  })

  // Very last card
  const lastStep = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'StepBlock',
      extraAttrs: {
        locked: false
      },
      parentOrder: 13
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'SignUpBlock',
      parentBlockId: prayerGridItemRight.id,
      extraAttrs: {
        submitLabel: 'Submit',
        submitIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'SignUpBlock',
      parentBlockId: noThanksGridItemRight.id,
      extraAttrs: {
        submitLabel: 'Submit',
        submitIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'SignUpBlock',
      parentBlockId: alreadyGridItemRight.id,
      extraAttrs: {
        submitLabel: 'Submit',
        submitIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'SignUpBlock',
      parentBlockId: notSureGridItemRight.id,
      extraAttrs: {
        submitLabel: 'Submit',
        submitIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEventName: 'click',
          blockId: lastStep.id
        }
      }
    }
  })
  const lastImageId = uuidv4()
  const lastCard = await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'CardBlock',
      parentBlockId: lastStep.id,
      extraAttrs: {
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        coverBlockId: lastImageId
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'TypographyBlock',
      parentBlockId: lastCard.id,
      extraAttrs: {
        content: 'THANK YOU!',
        variant: 'overline',
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
      parentBlockId: lastCard.id,
      extraAttrs: {
        content: 'Check your email for requested materials and keep exploring.',
        variant: 'subtitle1',
        color: 'primary',
        align: 'left'
      },
      parentOrder: 2
    }
  })
  await prisma.block.create({
    data: {
      id: lastImageId,
      journeyId: journey.id,
      blockType: 'ImageBlock',
      parentBlockId: lastCard.id,
      extraAttrs: {
        src: 'https://images.unsplash.com/photo-1585011070837-1bf8e294a858?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80',
        alt: 'Not sure',
        width: 1920,
        height: 1080,
        blurhash: 'LnIqS]tRx]%L~Vbc-o%1aJR%s,s.'
      },
      parentOrder: 0
    }
  })
  await prisma.block.create({
    data: {
      journeyId: journey.id,
      blockType: 'ButtonBlock',
      parentBlockId: lastCard.id,
      extraAttrs: {
        label: 'Watch Other Videos',
        variant: 'contained',
        color: 'primary',
        size: 'medium',
        startIcon: {
          name: 'PlayArrow'
        },
        action: {
          gtmEvenName: 'click',
          blockId: stepNoThanks2.id
        }
      },
      parentOrder: 3
    }
  })
}
