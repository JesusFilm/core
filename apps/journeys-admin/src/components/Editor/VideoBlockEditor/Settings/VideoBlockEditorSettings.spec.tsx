import { fireEvent, render, waitFor } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../../ThemeProvider'
import { VideoBlockEditorSettings } from './VideoBlockEditorSettings'

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    variant: {
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: null,
  children: []
}

describe('VideoBlockEditorSettings', () => {
  it('should update autoplay', () => {
    const onChange = jest.fn()
    const { getAllByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <VideoBlockEditorSettings
            selectedBlock={video}
            posterBlock={null}
            parentOrder={0}
            onChange={onChange}
          />
        </MockedProvider>
      </ThemeProvider>
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
      <ThemeProvider>
        <MockedProvider>
          <VideoBlockEditorSettings
            selectedBlock={video}
            posterBlock={null}
            parentOrder={0}
            onChange={onChange}
          />
        </MockedProvider>
      </ThemeProvider>
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
      <ThemeProvider>
        <MockedProvider>
          <VideoBlockEditorSettings
            selectedBlock={video}
            posterBlock={null}
            parentOrder={0}
            onChange={onChange}
          />
        </MockedProvider>
      </ThemeProvider>
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
      <ThemeProvider>
        <MockedProvider>
          <VideoBlockEditorSettings
            selectedBlock={video}
            posterBlock={null}
            parentOrder={0}
            onChange={onChange}
          />
        </MockedProvider>
      </ThemeProvider>
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
