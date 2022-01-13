import { TreeBlock } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { ThemeMode } from '../../../../../../../__generated__/globalTypes'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { EditorProvider } from '../../../../Context'
import { Drawer } from '../../../../Drawer'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { Card } from '.'

describe('Card', () => {
  it('shows default messages', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      journeyId: 'journey1',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByText } = render(<Card {...card} />)
    expect(getByText('Default')).toBeInTheDocument()
    expect(getByText('Contained')).toBeInTheDocument()
    expect(getByText('Background')).toBeInTheDocument()
  })

  describe('backgroundColor', () => {
    it('shows backgroundColor', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: null,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(<Card {...card} />)
      expect(getByText('#00FFCC')).toBeInTheDocument()
    })

    it('shows background color drawer', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        journeyId: 'journey1',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        backgroundColor: '#00ffcc',
        themeMode: null,
        themeName: null,
        fullscreen: true,
        children: []
      }
      const { getByText } = render(
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <Card {...card} />
          </EditorProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText('#00FFCC'))
      expect(getByText('Background Color Properties')).toBeInTheDocument()
      expect(getByText('Theme')).toBeInTheDocument()
    })
  })

  describe('backgroundMedia', () => {
    it('shows coverBlock when image', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: null,
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
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
            children: []
          }
        ]
      }
      const { getByText } = render(<Card {...card} />)
      expect(getByText('Background Image')).toBeInTheDocument()
      expect(getByText('07iLnvN.jpg')).toBeInTheDocument()
    })

    it('shows coverBlock when video', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: 'video1.id',
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'video1.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card1.id',
            videoContent: {
              __typename: 'VideoArclight',
              src: 'https://arc.gt/hls/2_0-FallingPlates/529'
            },
            title: '#FallingPlates',
            posterBlockId: null,
            muted: true,
            autoplay: true,
            startAt: null,
            endAt: null,
            children: []
          }
        ]
      }
      const { getByText } = render(<Card {...card} />)
      expect(getByText('Background Video')).toBeInTheDocument()
      expect(getByText('#FallingPlates')).toBeInTheDocument()
    })

    it('shows background media drawer', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: 'video1.id',
        backgroundColor: '#00ffcc',
        themeMode: ThemeMode.light,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'video1.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card1.id',
            videoContent: {
              __typename: 'VideoArclight',
              src: 'https://arc.gt/hls/2_0-FallingPlates/529'
            },
            title: '#FallingPlates',
            posterBlockId: null,
            muted: true,
            autoplay: true,
            startAt: null,
            endAt: null,
            children: []
          }
        ]
      }
      const { getByText } = render(
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <Card {...card} />
          </EditorProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText('#FallingPlates'))
      expect(getByText('Background Media Properties')).toBeInTheDocument()
      expect(getByText('Source')).toBeInTheDocument()
    })
  })

  describe('cardStyling', () => {
    it('shows Light when theme mode is light', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        backgroundColor: null,
        themeMode: ThemeMode.light,
        themeName: null,
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
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: null,
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
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <Card {...card} />
          </EditorProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText('Default'))
      expect(getByText('Card Style Property')).toBeInTheDocument()
    })
  })

  describe('contentAppearance', () => {
    it('shows Expanded when fullscreen', () => {
      const card: TreeBlock<CardBlock> = {
        id: 'card1.id',
        __typename: 'CardBlock',
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
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
        journeyId: 'journey1',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
      const { getByText } = render(
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <Card {...card} />
          </EditorProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText('Contained'))
      expect(getByText('Card Layout Property')).toBeInTheDocument()
    })
  })
})
