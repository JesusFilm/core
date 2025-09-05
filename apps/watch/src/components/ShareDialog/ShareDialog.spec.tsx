import { fireEvent, render, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import { SnackbarProvider } from 'notistack'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { ShareDialog } from './ShareDialog'

const onClose = jest.fn()
const originalEnv = process.env

const video: VideoContentFields = {
  ...videos[0],
  variant: {
    __typename: 'VideoVariant',
    id: 'videoVariantId',
    duration: videos[0].variant?.duration ?? 0,
    downloadable: true,
    downloads: [],
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      name: [
        {
          __typename: 'LanguageName',
          value: 'en',
          primary: true
        }
      ]
    },
    hls: 'https://arc.gt/4jz75',
    slug: `${videos[0].slug}/english`,
    subtitleCount: 1
  },
  description: videos[0].description,
  studyQuestions: [],
  childrenCount: 0
}

describe('ShareDialog', () => {
  jest.resetModules()

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_WATCH_URL: 'http://localhost:4300'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('closes the modal on cancel icon click', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <ShareDialog open onClose={onClose} />
        </VideoProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('only shows share link on playlist video', () => {
    mockRouter.push(
      '/watch/the-story-of-jesus-for-children.html/english.html?r=0'
    )
    const { getByRole, queryAllByRole } = render(
      <SnackbarProvider>
        <VideoProvider
          value={{
            content: {
              ...video,
              variant: null
            }
          }}
        >
          <ShareDialog open onClose={onClose} />
        </VideoProvider>
      </SnackbarProvider>
    )
    const link = `${
      process.env.NEXT_PUBLIC_WATCH_URL
    }/the-story-of-jesus-for-children.html/english.html`
    expect(getByRole('textbox')).toHaveValue(link)
    expect(getByRole('button', { name: 'Copy Link' })).toBeInTheDocument()
    expect(queryAllByRole('tab')).toHaveLength(0)
  })

  describe('development', () => {
    jest.resetModules()

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_WATCH_URL: 'http://localhost:4300'
      }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should share video to facebook', () => {
      mockRouter.push(
        '/watch/the-story-of-jesus-for-children.html/english.html?r=0'
      )
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${
        process.env.NEXT_PUBLIC_WATCH_URL
      }/the-story-of-jesus-for-children.html/english.html`

      const { getByRole } = render(
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <ShareDialog open onClose={onClose} />
          </VideoProvider>
        </SnackbarProvider>
      )

      expect(getByRole('link', { name: 'Share to Facebook' })).toHaveAttribute(
        'href',
        facebookUrl
      )
      expect(getByRole('link', { name: 'Share to Facebook' })).toHaveAttribute(
        'target',
        '_blank'
      )
    })

    it('should share video to twitter', () => {
      mockRouter.push(
        '/watch/the-story-of-jesus-for-children.html/english.html?r=0'
      )
      const facebookUrl = `https://twitter.com/intent/tweet?url=${
        process.env.NEXT_PUBLIC_WATCH_URL
      }/the-story-of-jesus-for-children.html/english.html`

      const { getByRole } = render(
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <ShareDialog open onClose={onClose} />
          </VideoProvider>
        </SnackbarProvider>
      )

      expect(getByRole('link', { name: 'Share to Twitter' })).toHaveAttribute(
        'href',
        facebookUrl
      )
      expect(getByRole('link', { name: 'Share to Twitter' })).toHaveAttribute(
        'target',
        '_blank'
      )
    })
  })

  describe('production', () => {
    jest.resetModules()

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_WATCH_URL: undefined
      }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should share video to facebook', () => {
      mockRouter.push(
        '/watch/the-story-of-jesus-for-children.html/english.html?r=0'
      )
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://watch-jesusfilm.vercel.app/watch/the-story-of-jesus-for-children.html/english.html`

      const { getByRole } = render(
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <ShareDialog open onClose={onClose} />
          </VideoProvider>
        </SnackbarProvider>
      )

      expect(getByRole('link', { name: 'Share to Facebook' })).toHaveAttribute(
        'href',
        facebookUrl
      )
      expect(getByRole('link', { name: 'Share to Facebook' })).toHaveAttribute(
        'target',
        '_blank'
      )
    })

    it('should share video to twitter', () => {
      mockRouter.push(
        '/watch/the-story-of-jesus-for-children.html/english.html?r=0'
      )
      const facebookUrl = `https://twitter.com/intent/tweet?url=https://watch-jesusfilm.vercel.app/watch/the-story-of-jesus-for-children.html/english.html`

      const { getByRole } = render(
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <ShareDialog open onClose={onClose} />
          </VideoProvider>
        </SnackbarProvider>
      )

      expect(getByRole('link', { name: 'Share to Twitter' })).toHaveAttribute(
        'href',
        facebookUrl
      )
      expect(getByRole('link', { name: 'Share to Twitter' })).toHaveAttribute(
        'target',
        '_blank'
      )
    })
  })

  describe('copy to clipboard', () => {
    const originalNavigator = { ...global.navigator }

    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
      Object.assign(navigator, originalNavigator)
    })

    it('should copy share link', async () => {
      mockRouter.push(
        '/watch/the-story-of-jesus-for-children.html/english.html?r=0'
      )
      const link = `${
        process.env.NEXT_PUBLIC_WATCH_URL
      }/the-story-of-jesus-for-children.html/english.html`
      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <ShareDialog open onClose={onClose} />
          </VideoProvider>
        </SnackbarProvider>
      )
      expect(getByRole('textbox')).toHaveValue(link)

      fireEvent.click(getByRole('button', { name: 'Copy Link' }))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
      await waitFor(() => expect(getByText('Link Copied')).toBeInTheDocument())

      process.env = originalEnv
    })

    it('should copy embed code', async () => {
      const code = `<div class="arc-cont"><iframe src="https://api.arclight.org/videoPlayerUrl?refId=videoVariantId&playerStyle=default" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><style>.arc-cont{position:relative;display:block;margin:10px auto;width:100%}.arc-cont:after{padding-top:59%;display:block;content:""}.arc-cont>iframe{position:absolute;top:0;bottom:0;right:0;left:0;width:98%;height:98%;border:0}</style></div>`

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <ShareDialog open onClose={onClose} />
          </VideoProvider>
        </SnackbarProvider>
      )

      fireEvent.click(getByRole('tab', { name: 'Embed Code' }))
      fireEvent.click(getByRole('button', { name: 'Copy Code' }))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code)
      await waitFor(() => expect(getByText('Code Copied')).toBeInTheDocument())
    })
  })
})
