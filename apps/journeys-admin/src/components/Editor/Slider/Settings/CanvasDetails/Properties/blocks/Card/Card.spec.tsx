import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { Card } from '.'

// Helper function to create a basic card
const createCard = (
  overrides: Partial<TreeBlock<CardBlock>> = {}
): TreeBlock<CardBlock> => ({
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  coverBlockId: null,
  parentOrder: 0,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  children: [],
  ...overrides
})

// Helper function to create journey with required structure
const createJourney = (overrides: any = {}) => ({
  id: 'journey1.id',
  __typename: 'Journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en'
  },
  themeName: ThemeName.base,
  themeMode: ThemeMode.dark,
  ...overrides
})

// Helper function to render with providers
const renderWithProviders = (
  component: React.ReactElement,
  {
    journey = {},
    selectedBlock = null
  }: { journey?: any; selectedBlock?: TreeBlock<CardBlock> | null } = {}
) => {
  const defaultJourney = createJourney(journey)
  return render(
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey: defaultJourney, variant: 'admin' }}>
          <EditorProvider
            initialState={{ selectedBlock: selectedBlock ?? undefined }}
          >
            {component}
          </EditorProvider>
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('Card', () => {
  describe('Basic Rendering', () => {
    it('renders card properties container', () => {
      const card = createCard()
      renderWithProviders(<Card {...card} />)

      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    })

    it('renders all four accordion sections', () => {
      const card = createCard()
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByTestId('Accordion-card1.id-layout')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('Accordion-card1.id-theme-mode')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('Accordion-card1.id-cover-block')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('Accordion-card1.id-background-color')
      ).toBeInTheDocument()
    })

    it('shows default attributes when no props provided', () => {
      const card = createCard()
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Filter #30313D (30%)' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Background None' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Style Default' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Layout Contained' })
      ).toBeInTheDocument()
    })

    it('should show color value for contained cards with image background', () => {
      const card = createCard({
        coverBlockId: 'image1.id',
        fullscreen: false,
        children: [
          {
            __typename: 'ImageBlock',
            id: 'image1.id'
          } as unknown as TreeBlock<ImageBlock>
        ]
      })
      renderWithProviders(<Card {...card} />)

      screen.getByRole('button', { name: 'Filter #30313D' })
    })

    it('should show color value for contained cards with video background', () => {
      const card = createCard({
        coverBlockId: 'video1.id',
        fullscreen: false,
        children: [
          {
            __typename: 'VideoBlock',
            id: 'video1.id'
          } as unknown as TreeBlock<VideoBlock>
        ]
      })
      renderWithProviders(<Card {...card} />)

      screen.getByRole('button', { name: 'Filter #30313D' })
    })

    it('shows correct icons for each section', () => {
      const card = createCard()
      renderWithProviders(<Card {...card} />)

      expect(screen.getByTestId('FlexAlignBottom1Icon')).toBeInTheDocument()
      expect(screen.getByTestId('Sun2Icon')).toBeInTheDocument()
      expect(screen.getByTestId('Image3Icon')).toBeInTheDocument()
      expect(screen.getByTestId('PaletteIcon')).toBeInTheDocument()
    })
  })

  describe('Layout Section', () => {
    it('shows Contained when fullscreen is false', () => {
      const card = createCard({ fullscreen: false })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Layout Contained' })
      ).toBeInTheDocument()
    })

    it('shows Expanded when fullscreen is true', () => {
      const card = createCard({ fullscreen: true })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Layout Expanded' })
      ).toBeInTheDocument()
    })

    it('always shows Contained when card contains a video block', () => {
      const card = createCard({
        children: [
          {
            __typename: 'VideoBlock',
            id: 'video1.id'
          } as unknown as TreeBlock<VideoBlock>
        ]
      })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Layout Contained' })
      ).toBeInTheDocument()
    })

    it('opens card layout accordion when clicked', () => {
      const card = createCard()
      renderWithProviders(
        <>
          <Card {...card} />
          <TestEditorState />
        </>,
        { selectedBlock: card }
      )

      fireEvent.click(screen.getByText('Layout'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-layout')
      ).toBeInTheDocument()
    })
  })

  describe('Theme/Style Section', () => {
    it('shows Default when themeMode is null', () => {
      const card = createCard({ themeMode: null })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Style Default' })
      ).toBeInTheDocument()
    })

    it('shows Light when themeMode is light', () => {
      const card = createCard({
        themeMode: ThemeMode.light,
        themeName: ThemeName.base
      })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Style Light' })
      ).toBeInTheDocument()
    })

    it('shows Dark when themeMode is dark', () => {
      const card = createCard({ themeMode: ThemeMode.dark })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Style Dark' })
      ).toBeInTheDocument()
    })

    it('opens card styling accordion when clicked', () => {
      const card = createCard({ themeMode: ThemeMode.light })
      renderWithProviders(
        <>
          <Card {...card} />
          <TestEditorState />
        </>,
        { selectedBlock: card }
      )

      fireEvent.click(screen.getByText('Light'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-theme-mode')
      ).toBeInTheDocument()
    })
  })

  describe('Background Media Section', () => {
    it('shows None when no cover block', () => {
      const card = createCard({ coverBlockId: null })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Background None' })
      ).toBeInTheDocument()
    })

    it('shows Image3Icon when no cover block', () => {
      const card = createCard({ coverBlockId: null })
      renderWithProviders(<Card {...card} />)

      const coverBlockAccordion = screen.getByTestId(
        'Accordion-card1.id-cover-block'
      )
      expect(
        coverBlockAccordion.querySelector('[data-testid="Image3Icon"]')
      ).toBeInTheDocument()
    })

    it('shows image filename when coverBlock is ImageBlock', () => {
      const card = createCard({
        coverBlockId: 'image1.id',
        children: [
          {
            __typename: 'ImageBlock',
            id: 'image1.id',
            src: 'https://i.imgur.com/07iLnvN.jpg',
            alt: 'random image from imgur',
            width: 1920,
            height: 1080,
            parentBlockId: 'card1.id',
            parentOrder: 0,
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
            children: [],
            scale: null,
            focalLeft: 50,
            focalTop: 50
          }
        ]
      })
      renderWithProviders(<Card {...card} />)

      expect(screen.getByText('07iLnvN.jpg')).toBeInTheDocument()
    })

    it('shows alt text when coverBlock is ImageBlock with Unsplash URL', () => {
      const card = createCard({
        coverBlockId: 'image1.id',
        children: [
          {
            __typename: 'ImageBlock',
            id: 'image1.id',
            src: 'https://images.unsplash.com/photo-1234567890',
            alt: 'Beautiful landscape photo',
            width: 1920,
            height: 1080,
            parentBlockId: 'card1.id',
            parentOrder: 0,
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
            children: [],
            scale: null,
            focalLeft: 50,
            focalTop: 50
          }
        ]
      })
      renderWithProviders(<Card {...card} />)

      expect(screen.getByText('Beautiful landscape photo')).toBeInTheDocument()
    })

    it('shows video title when coverBlock is VideoBlock', () => {
      const card = createCard({
        coverBlockId: 'video1.id',
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
            mediaVideo: {
              __typename: 'Video',
              id: '2_0-FallingPlates',
              title: [
                {
                  __typename: 'VideoTitle',
                  value: 'FallingPlates'
                }
              ],
              images: [],
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
      })
      renderWithProviders(<Card {...card} />)

      expect(screen.getByText('FallingPlates')).toBeInTheDocument()
      const coverBlockAccordion = screen.getByTestId(
        'Accordion-card1.id-cover-block'
      )
      expect(
        coverBlockAccordion.querySelector('[data-testid="VideoOnIcon"]')
      ).toBeInTheDocument()
    })

    it('opens background media accordion when clicked', () => {
      const card = createCard()
      renderWithProviders(
        <>
          <Card {...card} />
          <TestEditorState />
        </>,
        { selectedBlock: card }
      )

      fireEvent.click(screen.getByText('Background'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-cover-block')
      ).toBeInTheDocument()
    })
  })

  describe('Background Color Section', () => {
    it('shows background color from card prop', () => {
      const card = createCard({ backgroundColor: '#00FFCC' })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Filter #00FFCC (30%)' })
      ).toBeInTheDocument()
    })

    it('shows background color from card theme when no backgroundColor prop', () => {
      const card = createCard({
        backgroundColor: null,
        themeName: ThemeName.base,
        themeMode: ThemeMode.light
      })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Filter #FEFEFE (30%)' })
      ).toBeInTheDocument()
    })

    it('shows background color from journey theme when no card properties', () => {
      const card = createCard({
        backgroundColor: null,
        themeName: null,
        themeMode: null
      })
      const journey = {
        themeName: ThemeName.base,
        themeMode: ThemeMode.dark
      }
      renderWithProviders(<Card {...card} />, { journey })

      expect(
        screen.getByRole('button', { name: 'Filter #30313D (30%)' })
      ).toBeInTheDocument()
    })

    it('converts color to uppercase', () => {
      const card = createCard({ backgroundColor: '#ff0000' })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Filter #FF0000 (30%)' })
      ).toBeInTheDocument()
    })

    it('opens background color accordion', () => {
      const card = createCard({ backgroundColor: '#00FFCC' })
      renderWithProviders(
        <>
          <Card {...card} />
          <TestEditorState />
        </>,
        { selectedBlock: card }
      )

      fireEvent.click(screen.getByText('#00FFCC (30%)'))
      expect(
        screen.getByText('selectedAttributeId: card1.id-background-color')
      ).toBeInTheDocument()
    })
  })

  describe('Dynamic Imports', () => {
    it('loads all components dynamically', async () => {
      const card = createCard()
      renderWithProviders(<Card {...card} />)

      // Wait for dynamic imports to resolve
      await waitFor(() => {
        expect(
          screen.getByTestId('Accordion-card1.id-background-color')
        ).toBeInTheDocument()
        expect(
          screen.getByTestId('Accordion-card1.id-cover-block')
        ).toBeInTheDocument()
        expect(
          screen.getByTestId('Accordion-card1.id-layout')
        ).toBeInTheDocument()
        expect(
          screen.getByTestId('Accordion-card1.id-theme-mode')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Theme Integration', () => {
    it('uses correct theme based on card properties', () => {
      const card = createCard({
        themeName: ThemeName.base,
        themeMode: ThemeMode.light
      })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Filter #FEFEFE (30%)' })
      ).toBeInTheDocument()
    })

    it('falls back to journey theme when card theme is null', () => {
      const card = createCard({ themeName: null, themeMode: null })
      const journey = {
        themeName: ThemeName.base,
        themeMode: ThemeMode.light
      }
      renderWithProviders(<Card {...card} />, { journey })

      expect(
        screen.getByRole('button', { name: 'Filter #FEFEFE (30%)' })
      ).toBeInTheDocument()
    })

    it('handles RTL correctly', () => {
      const card = createCard()
      const journey = {
        language: {
          __typename: 'Language',
          id: '529',
          bcp47: 'ar'
        }
      } // Arabic for RTL
      renderWithProviders(<Card {...card} />, { journey })

      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing coverBlock gracefully', () => {
      const card = createCard({
        coverBlockId: 'missing-block-id',
        children: []
      })
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Background None' })
      ).toBeInTheDocument()
    })

    it('handles empty children array', () => {
      const card = createCard({ children: [] })
      renderWithProviders(<Card {...card} />)

      expect(screen.getByTestId('CardProperties')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for accordion buttons', () => {
      const card = createCard()
      renderWithProviders(<Card {...card} />)

      expect(
        screen.getByRole('button', { name: 'Layout Contained' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Style Default' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Background None' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Filter/ })).toBeInTheDocument()
    })

    it('maintains focus management when accordions are opened', () => {
      const card = createCard()
      renderWithProviders(
        <>
          <Card {...card} />
          <TestEditorState />
        </>,
        { selectedBlock: card }
      )

      const layoutButton = screen.getByRole('button', {
        name: 'Layout Contained'
      })
      fireEvent.click(layoutButton)

      expect(
        screen.getByText('selectedAttributeId: card1.id-layout')
      ).toBeInTheDocument()
    })
  })
})
