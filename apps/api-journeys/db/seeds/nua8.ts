import { aql } from 'arangojs'
import { PrismaClient } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()
const db = ArangoDB()

export async function nua8(): Promise<void> {
  const slug = 'whats-jesus-got-to-do-with-me'
  const existingJourney = await prisma.journey.findUnique({ where: { slug } })
  if (existingJourney != null) {
    await db.query(aql`
        FOR block in blocks
            FILTER block.journeyId == ${existingJourney.id}
            REMOVE block IN blocks`)
    await prisma.journey.delete({ where: { slug } })
  }

  const journey = await prisma.journey.create({
    data: {
      id: '3',
      title: "What's Jesus Got to Do With Me",
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
  })

  // first step
  const step1 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 0
  })

  const card1 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step1._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const coverblock = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoBlock',
    parentBlockId: card1._key,
    videoId: '5_0-NUA0803-0-0',
    videoVariantLanguageId: '529',
    muted: true,
    autoplay: true,
    startAt: 11,
    title: 'Decision'
  })
  await db
    .collection('blocks')
    .update(card1._key, { coverBlockId: coverblock._key })

  const poster = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ImageBlock',
    parentBlockId: coverblock._key,
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Can we trust the story of Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG',
    parentOrder: 0
  })
  await db
    .collection('blocks')
    .update(coverblock._key, { posterBlockId: poster._key })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: "JESUS' DEATH AND RESURRECTION",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: 'Does It Matter?',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: 'Why did Jesus have to die, and does it affect my life at all?',
      variant: 'body1',
      color: 'primary',
      align: 'left',
      parentOrder: 2
    }
  ])

  // second step
  const step2 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 1
  })

  const button1 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ButtonBlock',
    parentBlockId: card1._key,
    label: 'Explore Now',
    variant: 'contained',
    color: 'primary',
    size: 'large',
    action: {
      gtmEventName: 'click',
      blockId: step2._key
    },
    parentOrder: 3
  })

  const icon1a = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'IconBlock',
    parentBlockId: button1._key,
    name: 'PlayArrowRounded',
    size: 'lg',
    parentOrder: 0
  })
  const icon1b = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'IconBlock',
    parentBlockId: button1._key,
    name: null
  })
  await db
    .collection('blocks')
    .update(button1._key, { startIconId: icon1a._key, endIconId: icon1b._key })

  const videoCard = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoBlock',
    parentBlockId: videoCard._key,
    videoId: '5_0-NUA0803-0-0',
    videoVariantLanguageId: '529',
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    parentOrder: 0,
    fullsize: true
  })
  await db.collection('blocks').update(video._id, {
    action: {
      parentBlockId: video._id,
      gtmEventName: 'NavigateAction',
      blockId: null,
      journeyId: null,
      url: null,
      target: null
    }
  })

  // third step
  const step3 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 2
  })

  await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoTriggerBlock',
    parentBlockId: video._key,
    triggerStart: 161,
    action: {
      gtmEventName: 'trigger',
      blockId: step3._key
    },
    parentOrder: 0
  })

  const card3 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step3._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const image = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ImageBlock',
    parentBlockId: card3._key,
    src: 'https://images.unsplash.com/photo-1527268835115-be8ff4ff5dec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1235&q=80',
    alt: "What's Jesus Got to Do With Me?",
    width: 1920,
    height: 1080,
    blurhash: 'L3B|d2_N%$9F-B?b00NG4nIV00IA'
  })
  await db.collection('blocks').update(card3._key, { coverBlockId: image._key })

  await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'HOW DO YOU THINK?',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'Do you need to change to be good enough for God?',
    variant: 'h3',
    color: 'primary',
    align: 'left',
    parentOrder: 1
  })

  const question2 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'RadioQuestionBlock',
    parentBlockId: card3._key,
    parentOrder: 2
  })

  // fourth step
  const step4 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 3
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: question2._key,
      label: 'Yes, God likes good people',
      action: {
        gtmEventName: 'click',
        blockId: step4._key
      },
      parentOrder: 0
    },
    {
      journeyId: journey.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: question2._key,
      label: 'No, He will accept me as I am',
      action: {
        gtmEventName: 'click',
        blockId: step4._key
      },
      parentOrder: 1
    }
  ])

  const videoCard1 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step4._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video1 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoBlock',
    parentBlockId: videoCard1._key,
    videoId: '5_0-NUA0803-0-0',
    videoVariantLanguageId: '529',
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    startAt: 158,
    fullsize: true,
    parentOrder: 0
  })
  await db.collection('blocks').update(video1._id, {
    action: {
      parentBlockId: video1._id,
      gtmEventName: 'NavigateAction',
      blockId: null,
      journeyId: null,
      url: null,
      target: null
    }
  })

  // fifth step
  const step5 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 4
  })

  await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoTriggerBlock',
    parentBlockId: video1._key,
    triggerStart: 221,
    action: {
      gtmEventName: 'trigger',
      blockId: step5._key
    },
    parentOrder: 0
  })

  const card5 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step5._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content: 'A QUOTE',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content:
        '"God sent his Son into the world not to judge the world, but to save the world through him."',
      variant: 'subtitle1',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content: '- The Bible, John 3:17',
      variant: 'body1',
      color: 'primary',
      align: 'left',
      parentOrder: 2
    }
  ])

  const image2 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ImageBlock',
    parentBlockId: card5._key,
    src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'quote',
    width: 1920,
    height: 1080,
    blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
  })
  await db
    .collection('blocks')
    .update(card5._key, { coverBlockId: image2._key })

  // sixth step
  const step6 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 5
  })

  const button2 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ButtonBlock',
    parentBlockId: card5._key,
    label: 'What does it mean?',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    action: {
      gtmEventName: 'click',
      blockId: step6._key
    },
    parentOrder: 4
  })

  const icon2a = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'IconBlock',
    parentBlockId: button2._key,
    name: 'ContactSupportRounded',
    size: 'md',
    parentOrder: 4
  })
  const icon2b = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'IconBlock',
    parentBlockId: button2._key,
    name: null
  })
  await db
    .collection('blocks')
    .update(button2._key, { startIconId: icon2a._key, endIconId: icon2b._key })

  const videoCard2 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step6._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video2 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoBlock',
    parentBlockId: videoCard2._key,
    videoId: '5_0-NUA0803-0-0',
    videoVariantLanguageId: '529',
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    startAt: 221,
    fullsize: true,
    parentOrder: 0
  })
  await db.collection('blocks').update(video2._id, {
    action: {
      parentBlockId: video2._id,
      gtmEventName: 'NavigateAction',
      blockId: null,
      journeyId: null,
      url: null,
      target: null
    }
  })

  // seventh step
  const step7 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 6
  })

  await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'VideoTriggerBlock',
    parentBlockId: video2._key,
    triggerStart: 382,
    action: {
      gtmEventName: 'trigger',
      blockId: step7._key
    },
    parentOrder: 0
  })

  const card7 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: step7._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: true,
    parentOrder: 0
  })

  const image3 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'ImageBlock',
    parentBlockId: card7._key,
    src: 'https://images.unsplash.com/photo-1552676382-77b33d7639fa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Who was this Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'L5AwUX~5080QHwNdD.%I0%E5%b$~'
  })
  await db
    .collection('blocks')
    .update(card7._key, { coverBlockId: image3._key })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card7._key,
      content: "IF IT'S TRUE...",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey.id,
      __typename: 'TypographyBlock',
      parentBlockId: card7._key,
      content: 'What does Jesus have to do with me',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  ])

  const question5 = await db.collection('blocks').save({
    journeyId: journey.id,
    __typename: 'RadioQuestionBlock',
    parentBlockId: card7._key,
    parentOrder: 2
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: 'He loves me',
      action: {
        gtmEventName: 'click',
        journeyId: '4'
      },
      parentOrder: 0
    },
    {
      journeyId: journey.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: 'He came to free me from sin',
      action: {
        gtmEventName: 'click',
        journeyId: '4'
      },
      parentOrder: 1
    },
    {
      journeyId: journey.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: "He doesn't care about me",
      action: {
        gtmEventName: 'click',
        journeyId: '4'
      },
      parentOrder: 2
    },
    {
      journeyId: journey.id,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: "I'm not sure",
      action: {
        gtmEventName: 'click',
        journeyId: '4'
      },
      parentOrder: 3
    }
  ])
}
