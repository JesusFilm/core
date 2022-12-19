import { act, cleanup, fireEvent, render } from '@testing-library/react'
import videojs from 'video.js'
import { VideoProvider } from '../../libs/videoContext'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { videos } from '../Videos/testData'
import { SubtitleDialog } from './SubtitleDialog'

const onClose = jest.fn()
const video: VideoContentFields = videos[0]

describe('SubtitleDialog', () => {
  let player
  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      autoplay: false,
      controls: true,
      userActions: {
        hotkeys: true,
        doubleClick: true
      },
      controlBar: {
        playToggle: true,
        remainingTimeDisplay: true,
        progressControl: {
          seekBar: true
        },
        fullscreenToggle: true,
        volumePanel: {
          inline: false
        }
      },
      responsive: true
    })
    act(() => {
      player.duration(250)
    })
  })
  afterEach(() => {
    cleanup()
  })

  it('closes the modal on cancel icon click', () => {
    const { getByTestId } = render(
      <VideoProvider value={{ content: video }}>
        <SubtitleDialog
          onClose={onClose}
          open
          player={player}
          subtitles={video.variant?.subtitle}
        />
      </VideoProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('it offers subtitles if they exist', () => {
    const { getByRole, queryAllByRole } = render(
      <VideoProvider value={{ content: video }}>
        <SubtitleDialog
          onClose={onClose}
          open
          player={player}
          subtitles={video.variant?.subtitle}
        />
      </VideoProvider>
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent(
      'Arabic, Modern Standard اللغة العربية'
    )
  })

  it('selecting a subtitle results in the player using it', () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: video }}>
        <SubtitleDialog
          onClose={onClose}
          open
          player={player}
          subtitles={video.variant?.subtitle}
        />
      </VideoProvider>
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    fireEvent.click(
      getByRole('option', { name: 'Arabic, Modern Standard اللغة العربية' })
    )
    const tracks = player.textTracks() ?? []
    const ArabicId = '22658'
    const track = tracks[0]
    expect(track.id).toEqual(ArabicId)
    expect(track.mode).toEqual('showing')
  })
})
