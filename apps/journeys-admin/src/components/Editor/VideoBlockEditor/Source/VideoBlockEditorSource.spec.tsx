import { fireEvent, render, waitFor } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { VideoBlockEditorSource } from './VideoBlockEditorSource'

const video: TreeBlock = {
  __typename: 'VideoBlock',
  id: 'videoBlockId',
  parentOrder: 0,
  fullsize: true,
  autoplay: true,
  endAt: null,
  muted: true,
  parentBlockId: 'card.id',
  posterBlockId: null,
  startAt: 0,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    variant: {
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  children: []
}

describe('VideoBlockEditorSource', () => {
  it('calls onChange when videoId textbox changes', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <VideoBlockEditorSource
        selectedBlock={video}
        onChange={onChange}
        parentOrder={0}
        parentBlockId="card.id"
      />
    )
    const textbox = getByRole('textbox', { name: 'Video ID' })
    expect(textbox).toHaveValue('2_0-FallingPlates')
    fireEvent.focus(textbox)
    fireEvent.change(textbox, {
      target: { value: '5_0-NUA0201-0-0' }
    })
    fireEvent.blur(textbox)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        videoId: '5_0-NUA0201-0-0',
        videoVariantLanguageId: '529'
      })
    )
  })

  it('calls onChange when videoVariantLanguageId textbox changes', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <VideoBlockEditorSource
        selectedBlock={video}
        onChange={onChange}
        parentOrder={0}
        parentBlockId="card.id"
      />
    )
    const textbox = getByRole('textbox', { name: 'Video Variant Language ID' })
    expect(textbox).toHaveValue('529')
    fireEvent.focus(textbox)
    fireEvent.change(textbox, {
      target: { value: '100' }
    })
    fireEvent.blur(textbox)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        videoId: '2_0-FallingPlates',
        videoVariantLanguageId: '100'
      })
    )
  })
})
