import { aql } from 'arangojs'
import { ArangoDB } from '../db'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../src/app/__generated__/graphql'

const db = ArangoDB()

export async function nua2(): Promise<void> {
  const slug = 'what-about-the-resurrection'
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
    _key: '2',
    title: 'What About The Resurrection?',
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    slug,
    status: JourneyStatus.published,
    createdAt: new Date(),
    publishedAt: new Date(),
    featuredAt: new Date()
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
    videoId: '5_0-NUA0301-0-0',
    videoVariantLanguageId: '529',
    muted: true,
    autoplay: true,
    startAt: 11,
    title: 'What about the resurrection'
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
      content: 'The Resurection',
      variant: 'h6',
      color: 'primary',
      align: 'left',
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card1._key,
      content: 'What About It?',
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
        'Jesus’ tomb was found empty three days after his death-what could have happened to the body?',
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
    label: 'Find Out',
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
    journeyId: journey._key,
    __typename: 'IconBlock',
    parentBlockId: button1._key,
    name: 'PlayArrowRounded',
    size: 'lg',
    parentOrder: 0
  })
  const icon1b = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'IconBlock',
    parentBlockId: button1._key,
    name: null
  })
  await db
    .collection('blocks')
    .update(button1._key, { startIconId: icon1a._key, endIconId: icon1b._key })

  const videoCard = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step2._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: videoCard._key,
    videoId: '5_0-NUA0301-0-0',
    videoVariantLanguageId: '529',
    autoplay: true,
    title: 'What About The Ressurection?',
    fullsize: true,
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
    triggerStart: 108,
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
    src: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    alt: 'Where did his body go?',
    width: 1920,
    height: 1080,
    blurhash: 'LFC$sANy00xF_NWF8_af9[n,xtR-'
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
    label: 'Where did his body go?',
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
      label: 'Someone stole it from the tomb',
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
      label: "He didn't really die",
      action: {
        gtmEventName: 'click',
        blockId: step4._key
      },
      parentOrder: 2
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question2._key,
      label: 'He actually rose from the dead',
      action: {
        gtmEventName: 'click',
        blockId: step4._key
      },
      parentOrder: 3
    }
  ])

  const videoCard1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step4._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video1 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: videoCard1._key,
    videoId: '5_0-NUA0301-0-0',
    videoVariantLanguageId: '529',
    autoplay: true,
    title: 'What About The Ressurection?',
    startAt: 109,
    fullsize: true,
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
    triggerStart: 272,
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
        "...one of the soldiers pierced Jesus' side with a spear, bringing a sudden flow of blood and water.",
      variant: 'subtitle1',
      color: 'primary',
      align: 'left',
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'TypographyBlock',
      parentBlockId: card5._key,
      content: '- The Bible, John 19:34',
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
    src: 'https://images.unsplash.com/photo-1616977545092-f4a423c3f22e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=765&q=80',
    alt: 'quote',
    width: 1920,
    height: 1080,
    blurhash: 'L9Db$mOt008_}?oz58M{.8o#rqIU'
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

  const icon2a = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'IconBlock',
    parentBlockId: button2._key,
    name: 'ContactSupportRounded',
    size: 'md',
    parentOrder: 4
  })
  const icon2b = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'IconBlock',
    parentBlockId: button2._key,
    name: null
  })
  await db
    .collection('blocks')
    .update(button2._key, { startIconId: icon2a._key, endIconId: icon2b._key })

  const videoCard2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'CardBlock',
    parentBlockId: step6._key,
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    fullscreen: false,
    parentOrder: 0
  })

  const video2 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'VideoBlock',
    parentBlockId: videoCard2._key,
    videoId: '5_0-NUA0301-0-0',
    videoVariantLanguageId: '529',
    autoplay: true,
    title: 'What About The Ressurection?',
    startAt: 272,
    fullsize: true,
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
    triggerStart: 348,
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
    fullscreen: false,
    parentOrder: 0
  })

  const image3 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'ImageBlock',
    parentBlockId: card7._key,
    src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1136&q=80',
    alt: 'Who was this Jesus?',
    width: 1920,
    height: 1080,
    blurhash: 'L;KH$$-Rs-kA}ot4bZj@S3R,WWj@'
  })
  await db
    .collection('blocks')
    .update(card7._key, { coverBlockId: image3._key })

  await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'TypographyBlock',
    parentBlockId: card7._key,
    content: "IF IT'S TRUE...",
    variant: 'h6',
    color: 'primary',
    align: 'left',
    parentOrder: 0
  })

  const question5 = await db.collection('blocks').save({
    journeyId: journey._key,
    __typename: 'RadioQuestionBlock',
    parentBlockId: card7._key,
    label: 'What is Christianity to you?',
    action: {
      gtmEventName: 'click',
      journeyId: '3'
    },
    parentOrder: 1
  })

  await db.collection('blocks').saveAll([
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: 'One of many ways to God',
      action: {
        gtmEventName: 'click',
        journeyId: '3'
      },
      parentOrder: 0
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: 'One great lie...',
      action: {
        gtmEventName: 'click',
        journeyId: '3'
      },
      parentOrder: 1
    },
    {
      journeyId: journey._key,
      __typename: 'RadioOptionBlock',
      parentBlockId: question5._key,
      label: 'One true way to God',
      action: {
        gtmEventName: 'click',
        journeyId: '3'
      },
      parentOrder: 2
    }
  ])
}
