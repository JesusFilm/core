import { aql } from 'arangojs'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  IconColor,
  IconName,
  IconSize
} from '../../src/app/__generated__/graphql'

const db = ArangoDB()

export async function nua1(): Promise<void> {
  const slug = 'fact-or-fiction'
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
    _key: '1',
    title: 'Fact or Fiction',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    slug: 'fact-or-fiction',
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
      mediaComponentId: '5_0-NUA0201-0-0',
      languageId: '529'
    },
    muted: true,
    autoplay: true,
    startAt: 11,
    title: 'Fact or fiction',
    description:
      'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
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
      content: 'JESUS CHRIST:',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: 'Fact or Fiction',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content:
        'In this 5-minute video, explore the arguments for and against the Gospel accounts.',
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
      mediaComponentId: '5_0-NUA0201-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: 'Fact or fiction',
    description:
      'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.',
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
    triggerStart: 133,
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
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Can we trust the story of Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'LQEVc~^kXkI.*IyD$RnOyXTJRjjG'
  })
  await db.collection('blocks').update(card3._key, { coverBlockId: image._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card3._key,
    content: 'What do you think?',
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  const question2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioQuestionBlock',
    parentBlockId: card3._key,
    label: 'Can we trust the story of Jesus?',
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
      label: 'Yes, it’s a true story 👍',
      action: {
        gtmEventName: 'click',
        blockId: step4._key
      },
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question2._key,
      label: 'No, it’s a fake fabrication 👎',
      action: {
        gtmEventName: 'click',
        blockId: step4._key
      },
      parentOrder: 2
    }
  ])

  const video1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: step4._key,
    videoContent: {
      mediaComponentId: '5_0-NUA0201-0-0',
      languageId: '529'
    },
    autoplay: true,
    title: 'Fact or fiction',
    startAt: 134,
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
    triggerStart: 306,
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
      content: 'SOME FACTS...',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content: 'Jesus in History',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content:
        'We have more accurate historical accounts for the story of Jesus than for Alexander the Great or Julius Caesar.',
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
    src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
    alt: 'Jesus In History',
    width: 1920,
    height: 1080,
    blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW'
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
    label: 'One question remains...',
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

  const card6 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step6._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: true,
    parentOrder: 0
  })

  const gridContainer = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'GridContainerBlock',
    parentBlockId: card6._key,
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
    parentBlockId: card6._key,
    src: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
    alt: 'Who was this Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'LBAdAn~qOFbIWBofxuofsmWBRjWW'
  })
  await db
    .collection('blocks')
    .update(card6._key, { coverBlockId: image3._key })

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
      content: 'Who was this Jesus?',
      variant: 'h2',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    }
  ])

  const question4 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioQuestionBlock',
    parentBlockId: gridItemRight._key,
    label: '',
    parentOrder: 0
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question4._key,
      label: 'A great influencer',
      action: {
        gtmEventName: 'click',
        journeyId: '2'
      },
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question4._key,
      label: 'The Son of God',
      action: {
        gtmEventName: 'click',
        journeyId: '2'
      },
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question4._key,
      label: 'A popular prophet',
      action: {
        gtmEventName: 'click',
        journeyId: '2'
      },
      parentOrder: 2
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question4._key,
      label: 'A fake historical figure',
      action: {
        gtmEventName: 'click',
        journeyId: '2'
      },
      parentOrder: 3
    }
  ])
}
