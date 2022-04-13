import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../../libs/context'
import { BackgroundMedia } from './BackgroundMedia'

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  seoTitle: null,
  seoDescription: null
}

describe('BackgroundMedia', () => {
  it('shows Video selected on null cover', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <SnackbarProvider>
                <BackgroundMedia />
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByTestId('bgvideo-video-tab').attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
  })

  it('shows Video selected ', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: false,
      autoplay: true,
      fullsize: false,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        }
      },
      posterBlockId: 'poster1.id',
      children: []
    }
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [videoBlock]
    }
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <SnackbarProvider>
                <BackgroundMedia />
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByTestId('bgvideo-video-tab').attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
  })

  it('shows Image selected', () => {
    const image: TreeBlock<ImageBlock> = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: '3',
      parentOrder: 0,
      src: 'https://source.unsplash.com/random/1920x1080',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      blurhash: '',
      children: []
    }
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.dark,
      themeName: null,
      fullscreen: true,
      children: [image]
    }
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      locked: false,
      nextBlockId: null,
      parentOrder: 0,
      children: [card]
    }
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock: step }}>
              <SnackbarProvider>
                <BackgroundMedia />
              </SnackbarProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByTestId('bgvideo-image-tab').attributes.getNamedItem('aria-pressed')
    ).toBeTruthy()
  })
})
