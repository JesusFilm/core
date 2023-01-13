import { waitFor, fireEvent, render } from '@testing-library/react'
import { VideoJsPlayer } from 'video.js'
import { MockedProvider } from '@apollo/client/testing'
import { VideoProvider } from '../../libs/videoContext'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { videos } from '../Videos/__generated__/testData'
import { SubtitleDialog } from './SubtitleDialog'
import { getSubtitleMock } from './testData'

const onClose = jest.fn()
const video: VideoContentFields = videos[0]

describe('SubtitleDialog', () => {
  const player = {
    addRemoteTextTrack: (textTrack: TextTrack) => textTracks.push(textTrack),
    textTracks: () => textTracks
  } as unknown as VideoJsPlayer
  let textTracks: TextTrack[] = []

  beforeEach(() => {
    textTracks = []
  })

  it('closes the modal on cancel icon click', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[getSubtitleMock]}>
        <VideoProvider value={{ content: video }}>
          <SubtitleDialog onClose={onClose} open player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })

  it('it offers subtitles if they exist', async () => {
    const { getByRole, queryAllByRole } = render(
      <MockedProvider mocks={[getSubtitleMock]}>
        <VideoProvider value={{ content: video }}>
          <SubtitleDialog onClose={onClose} open player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(queryAllByRole('option')[0]).toHaveTextContent(
        'Arabic, Modern Standard اللغة العربية'
      )
    )
  })

  it('selecting a subtitle results in the player using it', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getSubtitleMock]}>
        <VideoProvider value={{ content: video }}>
          <SubtitleDialog onClose={onClose} open player={player} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() =>
      fireEvent.click(
        getByRole('option', { name: 'Arabic, Modern Standard اللغة العربية' })
      )
    )
    const tracks = player.textTracks()
    const ArabicId = '22658'
    const track = tracks[0]
    expect(track.id).toEqual(ArabicId)
    expect(track.mode).toEqual('showing')
  })
})
