import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { BackgroundMedia } from './BackgroundMedia'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  strategySlug: null,
  featuredAt: null,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: []
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
          <JourneyProvider value={{ journey, variant: 'admin' }}>
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

  it('shows Video selected', () => {
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
      action: null,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        title: [
          {
            __typename: 'Translation',
            value: 'FallingPlates'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
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
          <JourneyProvider value={{ journey, variant: 'admin' }}>
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
          <JourneyProvider value={{ journey, variant: 'admin' }}>
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

  it('updates the url parameters', async () => {
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider initialState={{ selectedBlock: undefined }}>
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

    fireEvent.click(getByTestId('bgvideo-image-tab'))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'background-image' },
        push,
        events: {
          on
        }
      })
    })

    fireEvent.click(getByTestId('bgvideo-video-tab'))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'background-video' },
        push,
        events: {
          on
        }
      })
    })
  })
})
