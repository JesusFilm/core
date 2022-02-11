import { aql } from 'arangojs'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const db = ArangoDB()

export async function nua8(): Promise<void> {
  const slug = 'whats-jesus-got-to-do-with-me'
  await db.query(aql`
        FOR journey in journeys
            FILTER journey.slug == ${slug}
            FOR block in blocks
                FILTER block.journeyId == journey._key
                REMOVE block IN blocks`)
  await db.query(aql`
    FOR journey in journeys
        FILTER journey.slug == ${slug}
        REMOVE journey IN journeys`)

  const journey = await db.collection('journeys').save({
    _key: '3',
    title: "What's Jesus Got to Do With Me",
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    slug: slug,
    status: JourneyStatus.published,
    createdAt: new Date('2031-12-25T12:34:56.647Z'),
    publishedAt: new Date('2031-12-25T12:34:56.647Z')
  })

  // first step
  const step1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 0
  })

  const card1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step1._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const coverblock = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: card1._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0803-0-0',
      languageId: '529'
    },
    muted: true,
    autoplay: true,
    startAt: 11,
    title: 'Decision'
  })
  await db
    .collection('blocks')
    .update(card1._key, { coverBlockId: coverblock._key })

  const poster = await db.collection('blocks').save({
    journeyId: journey._key,
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
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: "JESUS' DEATH AND RESURRECTION",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: 'Does It Matter?',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    },
    {
      journeyId: journey._key,
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
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 1
  })
  await db.collection('blocks').update(step1._key, { nextBlockId: step2._key })

  const button1 = await db.collection('blocks').save({
    journeyId: journey._key,
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

  const icon1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'IconBlock',
    parentBlockId: button1._key,
    name: 'PlayArrowRounded',
    color: 'primary',
    size: 'lg',
    parentOrder: 0
  })
  await db
    .collection('blocks')
    .update(button1._key, { startIconId: icon1._key })

  const video = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: step2._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0803-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    parentOrder: 0
  })

  // third step
  const step3 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 2
  })
  await db.collection('blocks').update(step2._key, { nextBlockId: step3._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
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
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step3._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const image = await db.collection('blocks').save({
    journeyId: journey._key,
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
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'HOW DO YOU THINK?',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  const question2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioQuestionBlock',
    parentBlockId: card3._key,
    label: 'Do you need to change to be good enough for God?',
    parentOrder: 1
  })

  // fourth step
  const step4 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 3
  })
  await db.collection('blocks').update(step3._key, { nextBlockId: step4._key })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey._key,
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
      journeyId: journey._key,
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

  const video1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: step4._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0803-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    startAt: 158,
    parentOrder: 0
  })

  // fifth step
  const step5 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 4
  })
  await db.collection('blocks').update(step4._key, { nextBlockId: step5._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
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
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step5._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content: 'A QUOTE',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
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
      journeyId: journey._key,
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
    journeyId: journey._key,
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
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 5
  })
  await db.collection('blocks').update(step5._key, { nextBlockId: step6._key })

  const button2 = await db.collection('blocks').save({
    journeyId: journey._key,
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

  const icon2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'IconBlock',
    parentBlockId: button2._key,
    name: 'ContactSupportRounded',
    color: 'primary',
    size: 'md',
    parentOrder: 4
  })
  await db
    .collection('blocks')
    .update(button2._key, { startIconId: icon2._key })

  const video2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: step6._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0803-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: "What' Jesus Got to Do With Me?",
    startAt: 221,
    parentOrder: 0
  })

  // seventh step
  const step7 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'StepBlock',
    locked: false,
    parentOrder: 6
  })
  await db.collection('blocks').update(step6._key, { nextBlockId: step7._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
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
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step7._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: true,
    parentOrder: 0
  })

  const gridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: card7._key,
    spacing: 6,
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    parentOrder: 0
  })

  const gridItemLeft = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: gridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 0
  })

  const gridItemRight = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridItemBlock',
    parentBlockId: gridContainer._key,
    xl: 6,
    lg: 6,
    sm: 6,
    parentOrder: 1
  })

  const image3 = await db.collection('blocks').save({
    journeyId: journey._key,
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
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: gridItemLeft._key,
      content: "IF IT'S TRUE...",
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: gridItemLeft._key,
      content: 'What does Jesus have to do with me',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  ])

  const question5 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioQuestionBlock',
    parentBlockId: gridItemRight._key,
    label: '',
    parentOrder: 2
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey._key,
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
      journeyId: journey._key,
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
      journeyId: journey._key,
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
      journeyId: journey._key,
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
