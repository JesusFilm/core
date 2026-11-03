import {
  mediaJourney,
  shortJourney,
  typicalJourney
} from '../journeySchema/examples'

import { journeyToBlocks } from './journeyToBlocks'

describe('journeyToBlocks', () => {
  it.each(['fit', 'fill', 'zoomed', undefined] as const)(
    'preserves video fit %s for standalone and background videos',
    (objectFit) => {
      const journey = structuredClone(mediaJourney)
      const watch = journey.steps.find((step) => step.name === 'watch')!
      const video = {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        objectFit
      }
      watch.card.content = [{ type: 'video', name: 'watch-video', ...video }]
      journey.steps[0].card.backgroundVideo = video
      delete journey.steps[0].card.backgroundImage

      const blocks = journeyToBlocks(journey)
      for (const id of ['watch-video', `${journey.steps[0].card.name}:cover`]) {
        expect(blocks.find((block) => block.id === id)).toMatchObject({
          objectFit: objectFit ?? 'fill'
        })
      }
    }
  )

  it('defaults omitted card themes to dark and preserves an explicit light theme', () => {
    const journey = structuredClone(shortJourney)
    delete journey.steps[0].card.theme
    journey.steps[1].card.theme = 'light'
    const cards = journeyToBlocks(journey).filter(
      (block) => block.__typename === 'CardBlock'
    )
    expect(cards[0]).toMatchObject({ themeMode: 'dark', themeName: 'base' })
    expect(cards[1]).toMatchObject({ themeMode: 'light', themeName: 'base' })
  })

  it('makes a library background video the cover while preserving text and buttons', () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.backgroundVideo = {
      libraryVideo: 'fact-or-fiction',
      startAt: 11,
      endAt: 20
    }
    const blocks = journeyToBlocks(journey, {
      'fact-or-fiction': {
        id: '7_0-nfs0201',
        title: 'Fact or Fiction',
        duration: 330,
        variantId: 'english',
        hls: 'https://stream.example/video.m3u8',
        poster: null
      }
    })
    expect(blocks.find((b) => b.id === 'welcome-card')).toMatchObject({
      coverBlockId: 'welcome-card:cover'
    })
    expect(blocks.find((b) => b.id === 'welcome-card:cover')).toMatchObject({
      __typename: 'VideoBlock',
      parentOrder: null,
      videoId: '7_0-nfs0201',
      muted: true,
      autoplay: true,
      startAt: 11,
      endAt: 20,
      action: null
    })
    expect(blocks.find((b) => b.id === 'welcome-title')).toBeDefined()
    expect(blocks.find((b) => b.id === 'welcome-start')).toBeDefined()
  })

  it('converts a resolved library clip without losing its source or timestamps', () => {
    const journey = structuredClone(mediaJourney)
    const step = journey.steps.find((step) => step.name === 'watch')!
    step.card.content = [
      {
        type: 'video',
        name: 'watch-video',
        libraryVideo: 'fact-or-fiction',
        startAt: 20,
        endAt: 60
      }
    ]
    const blocks = journeyToBlocks(journey, {
      'fact-or-fiction': {
        id: '7_0-nfs0201',
        title: 'Fact or Fiction',
        duration: 330,
        variantId: 'english',
        hls: 'https://stream.example/video.m3u8',
        poster: 'https://images.example/poster.jpg'
      }
    })
    expect(blocks.find((block) => block.id === 'watch-video')).toMatchObject({
      source: 'internal',
      videoId: '7_0-nfs0201',
      videoVariantLanguageId: '529',
      startAt: 20,
      endAt: 60,
      duration: 330,
      mediaVideo: {
        __typename: 'Video',
        id: '7_0-nfs0201',
        variant: { id: 'english', hls: 'https://stream.example/video.m3u8' }
      },
      action: { __typename: 'NavigateToBlockAction', blockId: 'reflect' }
    })
  })

  it('gives every block a unique id whose parent exists', () => {
    const blocks = journeyToBlocks(typicalJourney)
    const ids = new Set(blocks.map((block) => block.id))

    expect(ids.size).toBe(blocks.length)
    blocks.forEach((block) => {
      if (block.parentBlockId != null)
        expect(ids.has(block.parentBlockId)).toBe(true)
    })
  })

  it('turns steps into ordered root step blocks, each with one card', () => {
    const blocks = journeyToBlocks(typicalJourney)
    const steps = blocks.filter((block) => block.__typename === 'StepBlock')

    expect(steps.map((step) => [step.id, step.parentOrder])).toEqual([
      ['intro', 0],
      ['how-often', 1],
      ['topics', 2],
      ['request', 3],
      ['thanks', 4]
    ])
    expect(
      blocks.filter(
        (block) =>
          block.__typename === 'CardBlock' && block.parentBlockId === 'intro'
      )
    ).toEqual([
      expect.objectContaining({
        id: 'intro-card',
        themeMode: 'dark',
        themeName: 'base',
        backgroundColor: '#1F2A44'
      })
    ])
  })

  it('maps simplified styles to block variants', () => {
    const blocks = journeyToBlocks(typicalJourney)

    expect(blocks.find((block) => block.id === 'intro-title')).toMatchObject({
      __typename: 'TypographyBlock',
      variant: 'h1',
      align: 'center',
      parentBlockId: 'intro-card',
      parentOrder: 0
    })
    expect(blocks.find((block) => block.id === 'intro-start')).toMatchObject({
      __typename: 'ButtonBlock',
      buttonVariant: 'contained',
      submitEnabled: false,
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'intro-start',
        blockId: 'how-often'
      }
    })
    expect(blocks.find((block) => block.id === 'topics-gap')).toMatchObject({
      __typename: 'SpacerBlock',
      spacing: 40
    })
  })

  it('turns on submit for the first button after an input only', () => {
    const blocks = journeyToBlocks(typicalJourney)

    expect(blocks.find((block) => block.id === 'request-send')).toMatchObject({
      submitEnabled: true,
      startIconId: 'request-send:icon'
    })

    const twoButtons = journeyToBlocks({
      title: 'Form',
      description: '',
      steps: [
        {
          name: 'form',
          card: {
            name: 'form-card',
            content: [
              {
                type: 'button',
                name: 'form-back',
                label: 'Back',
                style: 'secondary',
                action: { url: 'https://example.com' }
              },
              {
                type: 'textResponse',
                name: 'form-name',
                label: 'Name',
                kind: 'name'
              },
              {
                type: 'button',
                name: 'form-send',
                label: 'Send',
                style: 'primary',
                action: { url: 'https://example.com' }
              },
              {
                type: 'button',
                name: 'form-skip',
                label: 'Skip',
                style: 'secondary',
                action: { url: 'https://example.com' }
              }
            ]
          }
        }
      ]
    })
    expect(
      twoButtons
        .filter((block) => block.__typename === 'ButtonBlock')
        .map((block) => [block.id, block.submitEnabled])
    ).toEqual([
      ['form-back', false],
      ['form-send', true],
      ['form-skip', false]
    ])
    expect(
      blocks.find((block) => block.id === 'request-send:icon')
    ).toMatchObject({
      __typename: 'IconBlock',
      parentBlockId: 'request-send',
      iconName: 'SendRounded'
    })
  })

  it('nests poll and multiselect options under their question', () => {
    const blocks = journeyToBlocks(typicalJourney)

    expect(
      blocks
        .filter((block) => block.parentBlockId === 'how-often-poll')
        .map((block) => [block.__typename, block.id, block.parentOrder])
    ).toEqual([
      ['RadioOptionBlock', 'how-often-daily', 0],
      ['RadioOptionBlock', 'how-often-sometimes', 1],
      ['RadioOptionBlock', 'how-often-never', 2]
    ])
    expect(
      blocks.filter((block) => block.parentBlockId === 'topics-select')
    ).toHaveLength(4)
  })

  it('makes the background image the card cover', () => {
    const blocks = journeyToBlocks(mediaJourney)

    expect(blocks.find((block) => block.id === 'cover-card')).toMatchObject({
      coverBlockId: 'cover-card:cover',
      fullscreen: false
    })
    expect(
      blocks.find((block) => block.id === 'cover-card:cover')
    ).toMatchObject({
      __typename: 'ImageBlock',
      parentBlockId: 'cover-card',
      parentOrder: null,
      alt: 'A starry night sky over a quiet village'
    })
  })

  it('makes a YouTube video that moves on to the step next', () => {
    const blocks = journeyToBlocks(mediaJourney)

    expect(blocks.find((block) => block.id === 'watch')).toMatchObject({
      nextBlockId: 'reflect'
    })
    expect(blocks.find((block) => block.id === 'watch-video')).toMatchObject({
      __typename: 'VideoBlock',
      source: 'youTube',
      videoId: 'dQw4w9WgXcQ',
      startAt: 0,
      endAt: 120,
      mediaVideo: { __typename: 'YouTube', id: 'dQw4w9WgXcQ' },
      action: { __typename: 'NavigateToBlockAction', blockId: 'reflect' }
    })
  })
})
