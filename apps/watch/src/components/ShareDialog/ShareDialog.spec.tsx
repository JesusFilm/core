import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetVideo_video as Video } from '../../../__generated__/GetVideo'
import { VideoType } from '../../../__generated__/globalTypes'
import { videos } from '../Videos/testData'
import { ShareDialog } from './ShareDialog'

const onClose = jest.fn()
const originalEnv = process.env
const routes = ['the-story-of-jesus-for-children']

const video: Video = {
  ...videos[0],
  variant: {
    __typename: 'VideoVariant',
    duration: videos[0].variant?.duration ?? 0,
    hls: 'https://arc.gt/4jz75'
  },
  description: videos[0].snippet,
  episodes: [],
  variantLanguages: []
}

describe('ShareDialog', () => {
  it('closes the modal on cancel icon click', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <ShareDialog video={video} open routes={routes} onClose={onClose} />
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('only shows share link on playlist video', () => {
    const { getByRole, queryAllByRole } = render(
      <SnackbarProvider>
        <ShareDialog
          video={{ ...video, type: VideoType.playlist }}
          routes={routes}
          open
          onClose={onClose}
        />
      </SnackbarProvider>
    )

    const link =
      'https://watch-jesusfilm.vercel.app/the-story-of-jesus-for-children'
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
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${
        process.env.NEXT_PUBLIC_WATCH_URL as string
      }/the-story-of-jesus-for-children`

      const { getByRole } = render(
        <SnackbarProvider>
          <ShareDialog video={video} routes={routes} open onClose={onClose} />
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
      const facebookUrl = `https://twitter.com/intent/tweet?url=${
        process.env.NEXT_PUBLIC_WATCH_URL as string
      }/the-story-of-jesus-for-children`

      const { getByRole } = render(
        <SnackbarProvider>
          <ShareDialog video={video} routes={routes} open onClose={onClose} />
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
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://watch-jesusfilm.vercel.app/the-story-of-jesus-for-children`

      const { getByRole } = render(
        <SnackbarProvider>
          <ShareDialog video={video} routes={routes} open onClose={onClose} />
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
      const facebookUrl = `https://twitter.com/intent/tweet?url=https://watch-jesusfilm.vercel.app/the-story-of-jesus-for-children`

      const { getByRole } = render(
        <SnackbarProvider>
          <ShareDialog video={video} routes={routes} open onClose={onClose} />
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
      jest.resetModules()
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_WATCH_URL: undefined
      }

      const link =
        'https://watch-jesusfilm.vercel.app/the-story-of-jesus-for-children'
      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <ShareDialog video={video} routes={routes} open onClose={onClose} />
        </SnackbarProvider>
      )
      expect(getByRole('textbox')).toHaveValue(link)

      fireEvent.click(getByRole('button', { name: 'Copy Link' }))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
      await waitFor(() => expect(getByText('Link Copied')).toBeInTheDocument())

      process.env = originalEnv
    })

    it('should copy embed code', async () => {
      const code = `<div class="arc-cont"><iframe src="https://api.arclight.org/videoPlayerUrl?refId=1_529-cl-0-0&playerStyle=default" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><style>.arc-cont{position:relative;display:block;margin:10px auto;width:100%}.arc-cont:after{padding-top:59%;display:block;content:""}.arc-cont>iframe{position:absolute;top:0;bottom:0;right:0;left:0;width:98%;height:98%;border:0}</style></div>`

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <ShareDialog video={video} routes={routes} open onClose={onClose} />
        </SnackbarProvider>
      )

      fireEvent.click(getByRole('tab', { name: 'Embed Code' }))
      fireEvent.click(getByRole('button', { name: 'Copy Embed Code' }))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code)
      await waitFor(() => expect(getByText('Code Copied')).toBeInTheDocument())
    })
  })
})
