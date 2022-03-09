import { fireEvent, render, waitFor } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { VideoBlockEditorSettings } from './VideoBlockEditorSettings'

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  title: 'watch',
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  posterBlockId: null,
  children: []
}

describe('VideoBlockEditorSettings', () => {
  it('should update autoplay', () => {
    const onChange = jest.fn()
    const { getAllByRole } = render(
      <VideoBlockEditorSettings
        selectedBlock={video}
        posterBlock={null}
        parentOrder={0}
        onChange={onChange}
      />
    )
    const checkBoxes = getAllByRole('checkbox')
    fireEvent.click(checkBoxes[0])
    expect(onChange).toHaveBeenCalledWith({
      ...video,
      autoplay: false
    })
  })
  it('should update muted', () => {
    const onChange = jest.fn()
    const { getAllByRole } = render(
      <VideoBlockEditorSettings
        selectedBlock={video}
        posterBlock={null}
        parentOrder={0}
        onChange={onChange}
      />
    )
    const checkBoxes = getAllByRole('checkbox')
    fireEvent.click(checkBoxes[1])
    expect(onChange).toHaveBeenCalledWith({
      ...video,
      muted: false
    })
  })
  it('should update startAt', async () => {
    const onChange = jest.fn()
    const { getAllByRole } = render(
      <VideoBlockEditorSettings
        selectedBlock={video}
        posterBlock={null}
        parentOrder={0}
        onChange={onChange}
      />
    )
    const textbox = getAllByRole('textbox')[0]

    fireEvent.change(textbox, { target: { value: '00:00:11' } })
    fireEvent.blur(textbox)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        ...video,
        startAt: 11
      })
    )
  })
  it('should update endAt', async () => {
    const onChange = jest.fn()
    const { getAllByRole } = render(
      <VideoBlockEditorSettings
        selectedBlock={video}
        posterBlock={null}
        parentOrder={0}
        onChange={onChange}
      />
    )
    const textbox = getAllByRole('textbox')[1]

    fireEvent.change(textbox, { target: { value: '00:00:11' } })
    fireEvent.blur(textbox)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        ...video,
        endAt: 11
      })
    )
  })
})
