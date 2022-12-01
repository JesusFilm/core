import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetVideo_video as Video } from '../../../__generated__/GetVideo'
import { videos } from '../Videos/testData'
import { SubtitleDialog } from './SubtitleDialog'

const onClose = jest.fn()

const video: Video = {
  ...videos[0],
  variant: {
    __typename: 'VideoVariant',
    duration: videos[0].variant?.duration ?? 0,
    hls: 'https://arc.gt/4jz75',
    language: { __typename: 'Language', id: '529', bcp47: 'en' },
    subtitle: [
      {
        __typename: 'Translation',
        language: {
          __typename: 'Language',
          bcp47: 'ar',
          id: '22658',
          iso3: 'arb',
          name: [
            { __typename: 'Translation', value: ' اللغة العربية' },
            { __typename: 'Translation', value: 'Arabic, Modern Standard' }
          ]
        },
        primary: false,
        value:
          'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
      }
    ]
  },
  description: videos[0].snippet,
  studyQuestions: [],
  episodes: [],
  variantLanguages: []
}
let playerRef
function updateSubtitle({ label, id, url, language }): void {
  playerRef?.current?.addRemoteTextTrack(
    {
      id: id,
      src: url,
      kind: 'subtitles',
      language: language,
      label: label,
      mode: 'showing',
      default: true
    },
    true
  )

  const tracks = playerRef?.current?.textTracks() ?? []

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]

    if (track.id === id) {
      track.mode = 'showing'
    } else {
      track.mode = 'disabled'
    }
  }
}

describe('SubtitleDialog', () => {
  it('closes the modal on cancel icon click', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <SubtitleDialog
          video={video}
          open
          onClose={onClose}
          updateSubtitle={updateSubtitle}
        />
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })
})
