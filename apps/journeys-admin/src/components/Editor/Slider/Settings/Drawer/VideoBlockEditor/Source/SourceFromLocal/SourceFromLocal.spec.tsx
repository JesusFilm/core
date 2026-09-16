import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { GET_VIDEO_VARIANT_LANGUAGES, SourceFromLocal } from './SourceFromLocal'

const selectedBlock: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  description: 'A local video',
  duration: 120,
  endAt: 120,
  fullsize: true,
  image: 'https://example.com/image.jpg',
  muted: false,
  autoplay: true,
  startAt: 0,
  title: 'Local Video Title',
  videoId: 'videoId',
  videoVariantLanguageId: '529',
  action: null,
  source: VideoBlockSource.internal,
  mediaVideo: {
    __typename: 'Video',
    id: 'videoId',
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: 'https://example.com/thumbnail.jpg'
      }
    ],
    title: [{ __typename: 'VideoTitle', value: 'Local Video Title' }],
    variant: null,
    variantLanguages: []
  },
  objectFit: null,
  subtitleLanguage: null,
  showGeneratedSubtitles: false,
  eventLabel: null,
  endEventLabel: null,
  posterBlockId: null,
  customizable: null,
  notes: null,
  children: []
}

// A long language name is the reported failure case. The component composes
// "<localName> (<nativeName>)", so both names are supplied here to produce
// the full-length string the card has to truncate.
const getLongVariantLanguagesMock = {
  request: {
    query: GET_VIDEO_VARIANT_LANGUAGES,
    variables: {
      id: 'videoId'
    }
  },
  result: {
    data: {
      video: {
        id: 'videoId',
        variant: {
          id: 'variantA'
        },
        variantLanguages: [
          {
            id: '529',
            name: [
              {
                value: 'العربية العامية',
                primary: true
              },
              {
                value: 'Arabic, Egyptian Colloquial',
                primary: false
              }
            ]
          }
        ]
      }
    }
  }
}

describe('SourceFromLocal', () => {
  it('should render the composed language name', async () => {
    render(
      <MockedProvider mocks={[getLongVariantLanguagesMock]}>
        <SourceFromLocal selectedBlock={selectedBlock} />
      </MockedProvider>
    )
    expect(
      await screen.findByText(/Arabic, Egyptian Colloquial/)
    ).toBeInTheDocument()
  })

  it('should truncate a long language name rather than overflow the card', async () => {
    render(
      <MockedProvider mocks={[getLongVariantLanguagesMock]}>
        <SourceFromLocal selectedBlock={selectedBlock} />
      </MockedProvider>
    )
    const language = await screen.findByText(/Arabic, Egyptian Colloquial/)
    // MUI renders variant="caption" as a <span>, and overflow / text-overflow
    // have no effect on an inline element. Without an explicit block display
    // the ellipsis rules alongside it are inert and the name spills outside
    // the card.
    //
    // Only display and overflow are asserted: jsdom's computed style does not
    // implement text-overflow or white-space, so asserting those would fail
    // regardless of the component. Real truncation is verified visually in
    // Storybook.
    expect(language).toHaveStyle({
      display: 'block',
      overflow: 'hidden'
    })
  })
})
