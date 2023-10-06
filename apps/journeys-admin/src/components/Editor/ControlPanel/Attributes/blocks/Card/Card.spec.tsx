import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey as Journey
} from '../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { Drawer } from '../../../../Drawer'

import { Card } from '.'

describe('Card', () => {
  it('shows default attributes', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      fullscreen: false,
      children: []
    }
    const { getByRole } = render(<Card {...card} />)

    expect(getByRole('button', { name: 'Color #FEFEFE' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Layout Contained' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Background None' })).toBeInTheDocument()
  })

  describe('backgroundColor', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }

    const journey: Journey = {
      __typename: 'Journey',
      id: 'journeyId',
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark,
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
      userJourneys: [],
      template: null,
      seoTitle: null,
      seoDescription: null,
      chatButtons: [],
      host: null,
      team: null,
      tags: []
    }

    it('shows background color from prop', () => {
      const { getByRole } = render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <Card {...card} backgroundColor="#00FFCC" />
        </JourneyProvider>
      )

      expect(getByRole('button', { name: 'Color #00FFCC' })).toBeInTheDocument()
    })

    it('shows background color from card theme', () => {
      const { getByRole } = render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <Card
            {...card}
            themeName={ThemeName.base}
            themeMode={ThemeMode.light}
          />
        </JourneyProvider>
      )

      expect(getByRole('button', { name: 'Color #FEFEFE' })).toBeInTheDocument()
    })

    it('shows background color from journey theme', () => {
      const { getByRole } = render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <Card {...card} />
        </JourneyProvider>
      )

      expect(getByRole('button', { name: 'Color #30313D' })).toBeInTheDocument()
    })

    it('shows background color drawer', () => {
      const { getByText } = render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider>
                <Drawer />
                <Card {...card} backgroundColor="#00FFCC" />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('#00FFCC'))
      expect(getByText('Background Color Properties')).toBeInTheDocument()
    })
  })

  describe('backgroundMedia', () => {
    it('shows coverBlock when image', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        parentOrder: 0,
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        children: [
          {
            __typename: 'ImageBlock',
            id: 'image1.id',
            src: 'https://i.imgur.com/07iLnvN.jpg',
            alt: 'random image from unsplash',
            width: 1920,
            height: 1080,
            parentBlockId: 'card1.id',
            parentOrder: 0,
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
            children: []
          }
        ]
      }
      const { getByText } = render(
        <MockedProvider>
          <ThemeProvider>
            <EditorProvider>
              <Drawer />
              <Card {...card} />
            </EditorProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Background Image')).toBeInTheDocument()
      expect(getByText('07iLnvN.jpg')).toBeInTheDocument()
    })

    it('shows coverBlock when video', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'video1.id',
        parentOrder: 0,
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        children: [
          {
            id: 'video1.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            videoId: '2_0-FallingPlates',
            videoVariantLanguageId: '529',
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            duration: null,
            image: null,
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
            posterBlockId: null,
            muted: true,
            autoplay: true,
            startAt: null,
            endAt: null,
            fullsize: null,
            action: null,
            objectFit: null,
            children: []
          }
        ]
      }
      const { getByText } = render(
        <MockedProvider>
          <ThemeProvider>
            <EditorProvider>
              <Drawer />
              <Card {...card} />
            </EditorProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Background Video')).toBeInTheDocument()
      expect(getByText('FallingPlates')).toBeInTheDocument()
    })

    it('shows background media drawer', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'video1.id',
        parentOrder: 0,
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        children: [
          {
            id: 'video1.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            videoId: '2_0-FallingPlates',
            videoVariantLanguageId: '529',
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            duration: null,
            image: null,
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
            posterBlockId: null,
            muted: true,
            autoplay: true,
            startAt: null,
            endAt: null,
            fullsize: null,
            action: null,
            objectFit: null,
            children: []
          }
        ]
      }
      const { getByText } = render(
        <MockedProvider>
          <ThemeProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <SnackbarProvider>
                <Drawer />
                <Card {...card} />
              </SnackbarProvider>
            </EditorProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('FallingPlates'))
      expect(getByText('Background Media Properties')).toBeInTheDocument()
    })
  })

  describe('cardStyling', () => {
    it('shows Light when theme mode is light', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(<Card {...card} />)
      expect(getByText('Light')).toBeInTheDocument()
    })

    it('shows Dark when theme mode is dark', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.dark,
        themeName: null,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(<Card {...card} />)
      expect(getByText('Dark')).toBeInTheDocument()
    })

    it('shows card styling drawer', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(
        <MockedProvider>
          <ThemeProvider>
            <EditorProvider>
              <Drawer />
              <Card {...card} />
            </EditorProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('Light'))
      expect(getByText('Card Style Property')).toBeInTheDocument()
    })
  })

  describe('contentAppearance', () => {
    it('shows Expanded when fullscreen', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: true,
        children: []
      }
      const { getByText } = render(<Card {...card} />)
      expect(getByText('Expanded')).toBeInTheDocument()
    })

    it('shows card layout drawer', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(
        <MockedProvider>
          <ThemeProvider>
            <EditorProvider>
              <Drawer />
              <Card {...card} />
            </EditorProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('Contained'))
      expect(getByText('Card Layout Property')).toBeInTheDocument()
    })
  })
})
