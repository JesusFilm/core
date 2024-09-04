import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

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
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <Card {...card} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Color #FEFEFE' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Background None' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Style Light' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Layout Contained' })
    ).toBeInTheDocument()
  })

  it('shows website attributes', () => {
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

    const journey = {
      __typename: 'Journey',
      id: 'journey1.id',
      website: true,
      language: {
        __typename: 'Language',
        id: 'language1.id',
        bcp47: 'en'
      }
    } as unknown as Journey

    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Card URL None' })
    ).toBeInTheDocument()
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

    it('shows background color from prop', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} backgroundColor="#00FFCC" />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Color #00FFCC' })
      ).toBeInTheDocument()
    })

    it('shows background color from card theme', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card
                {...card}
                themeName={ThemeName.base}
                themeMode={ThemeMode.light}
              />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Color #FEFEFE' })
      ).toBeInTheDocument()
    })

    it('shows background color from journey theme', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Color #30313D' })
      ).toBeInTheDocument()
    })

    it('opens background color accordion', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} backgroundColor="#00FFCC" />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByText('#00FFCC'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-background-color')
      ).toBeInTheDocument()
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const coverBlockAccordion = screen.getByTestId(
        'Accordion-card1.id-cover-block'
      )
      const coverBlockAccordionIcon = coverBlockAccordion.querySelector(
        '[data-testid="Image3Icon"]'
      )
      expect(coverBlockAccordionIcon).toBeInTheDocument()
      expect(screen.getByText('07iLnvN.jpg')).toBeInTheDocument()
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
                  __typename: 'VideoTitle',
                  value: 'FallingPlates'
                }
              ],
              image:
                'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
              variant: {
                __typename: 'VideoVariant',
                id: '2_0-FallingPlates-529',
                hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
              },
              variantLanguages: []
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      const coverBlockAccordion = screen.getByTestId(
        'Accordion-card1.id-cover-block'
      )
      const coverBlockAccordionIcon = coverBlockAccordion.querySelector(
        '[data-testid="VideoOnIcon"]'
      )
      expect(coverBlockAccordionIcon).toBeInTheDocument()
      expect(screen.getByText('FallingPlates')).toBeInTheDocument()
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
                  __typename: 'VideoTitle',
                  value: 'FallingPlates'
                }
              ],
              image:
                'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
              variant: {
                __typename: 'VideoVariant',
                id: '2_0-FallingPlates-529',
                hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
              },
              variantLanguages: []
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getAllByText('FallingPlates')[0])
      expect(
        screen.getByText('selectedAttributeId: card1.id-cover-block')
      ).toBeInTheDocument()
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Light')).toBeInTheDocument()
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    it('open card styling accordion', () => {
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByText('Light'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-theme-mode')
      ).toBeInTheDocument()
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Expanded')).toBeInTheDocument()
    })

    it('opens card layout accordion when clicked', () => {
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
      render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <Card {...card} />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByText('Layout'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-layout')
      ).toBeInTheDocument()
    })
  })

  describe('slug', () => {
    const selectedStep: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'journey1.id',
      parentOrder: 0,
      slug: 'step-slug',
      locked: false,
      nextBlockId: null,
      children: []
    }

    const selectedBlock: TreeBlock<CardBlock> = {
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

    const journey = {
      __typename: 'Journey',
      id: 'journey1.id',
      website: true,
      language: {
        __typename: 'Language',
        id: 'language1.id',
        bcp47: 'en'
      }
    } as unknown as Journey

    it('shows the step slug', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <EditorProvider initialState={{ selectedBlock, selectedStep }}>
                <Card {...selectedBlock} />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Card URL step-slug' })
      ).toBeInTheDocument()
    })

    it('opens the accordion when clicked', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <EditorProvider initialState={{ selectedBlock, selectedStep }}>
                <TestEditorState />
                <Card {...selectedBlock} />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByText('Card URL'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-slug')
      ).toBeInTheDocument()
    })
  })
})
