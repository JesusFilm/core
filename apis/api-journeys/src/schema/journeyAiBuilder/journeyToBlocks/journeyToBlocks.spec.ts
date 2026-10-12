import { mediaJourney, typicalJourney } from '../journeySchema/examples'

import { journeyToBlocks } from './journeyToBlocks'

describe('journeyToBlocks', () => {
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
