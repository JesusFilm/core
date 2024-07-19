import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../__generated__/BlockFields'
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
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Card {...card} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Color #FEFEFE' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Background None' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Style Light' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Layout Contained' })
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
      const { getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} backgroundColor="#00FFCC" />
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(getByRole('button', { name: 'Color #00FFCC' })).toBeInTheDocument()
    })

    it('shows background color from card theme', () => {
      const { getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card
              {...card}
              themeName={ThemeName.base}
              themeMode={ThemeMode.light}
            />
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(getByRole('button', { name: 'Color #FEFEFE' })).toBeInTheDocument()
    })

    it('shows background color from journey theme', () => {
      const { getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} />
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(getByRole('button', { name: 'Color #30313D' })).toBeInTheDocument()
    })

    it('opens background color accordion', () => {
      const { getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider>
              <Card {...card} backgroundColor="#00FFCC" />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('#00FFCC'))
      expect(
        getByText('selectedAttributeId: card1.id-background-color')
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
      const { getByText, getByTestId } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} />
          </SnackbarProvider>
        </MockedProvider>
      )

      const coverBlockAccordion = getByTestId('Accordion-card1.id-cover-block')
      const coverBlockAccordionIcon = coverBlockAccordion.querySelector(
        '[data-testid="Image3Icon"]'
      )
      expect(coverBlockAccordionIcon).toBeInTheDocument()
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
      const { getByText, getByTestId } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} />
          </SnackbarProvider>
        </MockedProvider>
      )
      const coverBlockAccordion = getByTestId('Accordion-card1.id-cover-block')
      const coverBlockAccordionIcon = coverBlockAccordion.querySelector(
        '[data-testid="VideoOnIcon"]'
      )
      expect(coverBlockAccordionIcon).toBeInTheDocument()
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
      const { getByText } = render(
        <MockedProvider>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <SnackbarProvider>
              <Card {...card} />
              <TestEditorState />
            </SnackbarProvider>
          </EditorProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('FallingPlates'))
      expect(
        getByText('selectedAttributeId: card1.id-cover-block')
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
      const { getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} />
          </SnackbarProvider>
        </MockedProvider>
      )
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
      const { getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} />
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(getByText('Dark')).toBeInTheDocument()
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
      const { getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider>
              <Card {...card} />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('Light'))
      expect(
        getByText('selectedAttributeId: card1.id-theme-mode')
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
      const { getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <Card {...card} />
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(getByText('Expanded')).toBeInTheDocument()
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
      const { getByText } = render(
        <MockedProvider>
          <SnackbarProvider>
            <EditorProvider>
              <Card {...card} />
              <TestEditorState />
            </EditorProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(getByText('Layout'))
      expect(
        getByText('selectedAttributeId: card1.id-layout')
      ).toBeInTheDocument()
    })
  })
})
