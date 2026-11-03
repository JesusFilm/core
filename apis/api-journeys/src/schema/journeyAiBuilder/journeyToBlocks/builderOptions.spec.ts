import { checkJourney } from '../checkJourney'
import { resolveImages } from '../images/resolveImages'
import {
  journeyForModel,
  journeyInputSchema,
  journeySchema
} from '../journeySchema'
import { shortJourney } from '../journeySchema/examples'

import { journeyToBlocks } from './journeyToBlocks'

function draft(content: unknown[], card: Record<string, unknown> = {}) {
  return journeyInputSchema.parse({
    title: 'Options',
    description: '',
    fonts: { headerFont: 'Inter', bodyFont: 'Nunito', labelFont: 'Inter' },
    steps: [{ name: 'review', card: { name: 'review-card', ...card, content } }]
  })
}

const submit = {
  type: 'button',
  name: 'submit',
  label: 'Send',
  action: { none: true }
}
const photo = {
  search: 'green hills',
  alt: 'Hills',
  focalLeft: 25,
  focalTop: 70,
  scale: 150
}

describe('native builder option conversion', () => {
  it.each([
    ['en', 'next', 'ChevronRightRounded'],
    ['en', 'previous', 'ChevronLeftRounded'],
    ['ar', 'next', 'ChevronLeftRounded'],
    ['ar', 'previous', 'ChevronRightRounded'],
    ['he', 'next', 'ChevronLeftRounded'],
    ['fa', 'next', 'ChevronLeftRounded']
  ])(
    'resolves logical %s navigation icon %s as %s',
    (bcp47, endIcon, expected) => {
      const journey = journeyInputSchema.parse({
        title: 'Direction',
        description: '',
        language: { bcp47 },
        steps: [
          {
            name: 'card',
            card: { name: 'card-body', content: [{ ...submit, endIcon }] }
          }
        ]
      })
      const icon = journeyToBlocks(journey).find(
        (block) => block.id === 'submit:end-icon'
      )
      expect(icon).toMatchObject({ iconName: expected })
    }
  )

  it('renders explicit editor text sizes and colors without changing legacy styles', () => {
    const journey = draft([
      {
        type: 'text',
        name: 'title',
        content: 'Title',
        variant: 'h2',
        color: '#abcdef',
        align: 'center'
      },
      { type: 'text', name: 'normal', content: 'Body', variant: 'body2' },
      { type: 'text', name: 'legacy', content: 'Display', style: 'title' }
    ])
    const blocks = journeyToBlocks(journey)
    expect(blocks.find((block) => block.id === 'title')).toMatchObject({
      variant: 'h2',
      align: 'center',
      settings: { __typename: 'TypographyBlockSettings', color: '#abcdef' }
    })
    expect(blocks.find((block) => block.id === 'normal')).toMatchObject({
      variant: 'body2'
    })
    expect(blocks.find((block) => block.id === 'legacy')).toMatchObject({
      variant: 'h1'
    })
    expect(journeyForModel(journey).fonts).toEqual(journey.fonts)
  })

  it('keeps button variant, color, alignment and both colored icons independent', () => {
    const journey = draft([
      {
        type: 'button',
        name: 'action',
        label: 'Next',
        variant: 'text',
        color: 'secondary',
        size: 'small',
        alignment: 'right',
        icon: 'Home4',
        endIcon: 'ChevronLeftRounded',
        iconColor: 'action',
        endIconColor: 'error',
        eventLabel: 'custom1',
        action: { url: 'https://example.com', gtmEventName: 'visit' }
      }
    ])
    const blocks = journeyToBlocks(journey)
    expect(blocks.find((block) => block.id === 'action')).toMatchObject({
      buttonVariant: 'text',
      buttonColor: 'secondary',
      size: 'small',
      settings: { alignment: 'right' },
      startIconId: 'action:icon',
      endIconId: 'action:end-icon',
      eventLabel: 'custom1',
      action: { gtmEventName: 'visit' }
    })
    expect(blocks.find((block) => block.id === 'action:icon')).toMatchObject({
      iconName: 'Home4',
      iconColor: 'action',
      parentOrder: null
    })
    expect(
      blocks.find((block) => block.id === 'action:end-icon')
    ).toMatchObject({
      iconName: 'ChevronLeftRounded',
      iconColor: 'error',
      parentOrder: null
    })
  })

  it.each([
    [{ none: true }, null],
    [{ email: 'hello@example.com' }, 'EmailAction'],
    [{ chatUrl: 'https://wa.me/15555550100' }, 'ChatAction'],
    [
      { phone: '+15555550100', countryCode: 'US', contactAction: 'call' },
      'PhoneAction'
    ],
    [
      { phone: '+15555550100', countryCode: 'US', contactAction: 'text' },
      'PhoneAction'
    ],
    [{ url: 'https://example.com' }, 'LinkAction']
  ])('converts the native contact action %j', (action, typename) => {
    const blocks = journeyToBlocks(draft([{ ...submit, action }]))
    expect(blocks.find((block) => block.id === 'submit')?.action).toEqual(
      typename == null
        ? null
        : expect.objectContaining({ __typename: typename })
    )
  })

  it('converts image polls, phone response options, exact spacing and card appearance', () => {
    const journey = draft(
      [
        {
          type: 'poll',
          name: 'poll',
          gridView: true,
          options: [
            { name: 'choice', label: 'A', image: photo, action: { none: true } }
          ]
        },
        {
          type: 'textResponse',
          name: 'phone',
          label: 'Phone',
          kind: 'phone',
          hint: 'Include country code',
          minRows: 4,
          hideLabel: true,
          required: true,
          integrationId: 'existing-integration',
          routeId: 'existing-route'
        },
        { type: 'spacer', name: 'gap', spacing: 70 },
        submit
      ],
      {
        theme: 'default',
        backgroundColor: '#12345680',
        backdropBlur: 12,
        fullscreen: true,
        showAssistant: true,
        expandChatByDefault: true,
        eventLabel: 'custom2'
      }
    )
    expect(checkJourney(journey).errors).toEqual([])
    const blocks = journeyToBlocks(journey)
    expect(blocks.find((block) => block.id === 'review-card')).toMatchObject({
      themeMode: null,
      backgroundColor: '#12345680',
      backdropBlur: 12,
      showAssistant: true,
      expandChatByDefault: true,
      eventLabel: 'custom2'
    })
    expect(blocks.find((block) => block.id === 'choice')).toMatchObject({
      pollOptionImageBlockId: 'choice:image'
    })
    expect(blocks.find((block) => block.id === 'choice:image')).toMatchObject({
      parentBlockId: 'choice',
      focalLeft: 25,
      focalTop: 70,
      scale: 150,
      parentOrder: null
    })
    expect(blocks.find((block) => block.id === 'phone')).toMatchObject({
      type: 'phone',
      hint: 'Include country code',
      minRows: 4,
      hideLabel: true,
      integrationId: 'existing-integration',
      routeId: 'existing-route'
    })
    expect(blocks.find((block) => block.id === 'gap')).toMatchObject({
      spacing: 70
    })
    expect(blocks.find((block) => block.id === 'submit')).toMatchObject({
      submitEnabled: true,
      action: null
    })
  })

  it('converts native video behavior, cover images, subtitles, tracking and timed actions', () => {
    const journey = draft([
      {
        type: 'video',
        name: 'video',
        libraryVideo: 'fact-or-fiction',
        autoplay: false,
        muted: true,
        objectFit: 'fill',
        poster: photo,
        startAt: 10,
        endAt: 40,
        subtitleLanguageId: '529',
        subtitleLanguageBcp47: 'en',
        showGeneratedSubtitles: true,
        notes: 'Intro',
        eventLabel: 'specialVideoStart',
        endEventLabel: 'specialVideoComplete',
        action: { email: 'hello@example.com' },
        triggers: [
          {
            name: 'trigger',
            triggerStart: 30,
            action: { url: 'https://example.com' }
          }
        ]
      }
    ])
    const blocks = journeyToBlocks(journey, {
      'fact-or-fiction': {
        id: 'film',
        title: 'Film',
        variantId: 'english',
        duration: 330,
        hls: 'https://stream.example/film.m3u8',
        poster: null
      }
    })
    expect(blocks.find((block) => block.id === 'video')).toMatchObject({
      autoplay: false,
      muted: true,
      objectFit: 'fill',
      posterBlockId: 'video:poster',
      subtitleLanguage: { id: '529', bcp47: 'en' },
      showGeneratedSubtitles: true,
      notes: 'Intro',
      eventLabel: 'specialVideoStart',
      endEventLabel: 'specialVideoComplete',
      action: { __typename: 'EmailAction' },
      image: null
    })
    expect(blocks.find((block) => block.id === 'video:poster')).toMatchObject({
      parentBlockId: 'video',
      parentOrder: null,
      focalLeft: 25
    })
    expect(blocks.find((block) => block.id === 'trigger')).toMatchObject({
      parentBlockId: 'video',
      triggerStart: 30,
      triggerAction: { __typename: 'LinkAction' }
    })
  })

  it('resolves poll images and video posters and retains new framing when reusing a photo', async () => {
    const before = draft([
      {
        type: 'poll',
        name: 'poll',
        options: [{ name: 'choice', label: 'A', image: photo }]
      },
      {
        type: 'video',
        name: 'video',
        url: 'https://youtu.be/dQw4w9WgXcQ',
        poster: photo
      }
    ])
    const deps = {
      searchPhotos: vi.fn(async () => [
        {
          src: 'https://images.example/photo.jpg',
          width: 100,
          height: 50,
          blurhash: 'hash',
          description: 'Hills',
          downloadLocation: 'https://example.com/download'
        }
      ]),
      choosePhotos: vi.fn(async () => ({})),
      triggerDownload: vi.fn(async () => undefined)
    }
    await resolveImages(before, null, deps)
    const after = journeySchema.parse(journeyForModel(before))
    const poll = after.steps[0].card.content[0]
    if (poll.type !== 'poll' || poll.options[0].image == null)
      throw new Error('Expected poll image')
    poll.options[0].image.focalLeft = 80
    deps.searchPhotos.mockClear()
    await resolveImages(after, before, deps)
    expect(deps.searchPhotos).not.toHaveBeenCalled()
    expect(poll.options[0].image).toMatchObject({
      src: 'https://images.example/photo.jpg',
      focalLeft: 80
    })
    const model = journeyForModel(after)
    expect(JSON.stringify(model)).not.toContain('"src"')
    expect(JSON.stringify(model)).toContain('"focalLeft":80')
  })

  it('uses a supplied existing asset without replacing it with a stock photo', async () => {
    const journey = draft([
      {
        type: 'image',
        name: 'image',
        image: {
          assetUrl: 'https://images.example/upload.jpg',
          assetWidth: 640,
          assetHeight: 480,
          alt: 'Upload',
          scale: 120
        }
      }
    ])
    const deps = {
      searchPhotos: vi.fn(),
      choosePhotos: vi.fn(),
      triggerDownload: vi.fn()
    }
    expect(checkJourney(journey).errors).toEqual([])
    await resolveImages(journey, null, deps)
    expect(deps.searchPhotos).not.toHaveBeenCalled()
    expect(
      journeyToBlocks(journey).find((block) => block.id === 'image')
    ).toMatchObject({
      src: 'https://images.example/upload.jpg',
      width: 640,
      height: 480,
      scale: 120
    })
  })

  it('rejects unanswerable selection limits and routes without an integration', () => {
    const journey = draft([
      {
        type: 'multiselect',
        name: 'multi',
        min: 2,
        options: [{ name: 'choice', label: 'Only one' }]
      },
      {
        type: 'textResponse',
        name: 'response',
        label: 'Answer',
        kind: 'freeForm',
        routeId: 'route'
      },
      submit
    ])
    expect(checkJourney(journey).errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('min is more'),
        expect.stringContaining('integrationId')
      ])
    )
  })

  it('preserves all stored examples across the expanded input schema', () => {
    expect(journeyForModel(shortJourney)).toEqual(shortJourney)
  })
})
