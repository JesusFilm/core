import { fireEvent, render, waitFor } from '@testing-library/react'
import { VideoBlockEditorSource } from './VideoBlockEditorSource'

const video = {
  __typename: 'VideoBlock',
  autoplay: true,
  endAt: null,
  muted: true,
  parentBlockId: 'card.id',
  posterBlockId: null,
  startAt: 0,
  title: '123.mp4',
  videoContent: { src: 'https://example.com/123.mp4' }
}

describe('VideoBlockEditorSource', () => {
  it('displays validation message', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <VideoBlockEditorSource
        selectedBlock={null}
        onChange={onChange}
        parentOrder={0}
        parentBlockId="card.id"
      />
    )
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: '' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
    fireEvent.change(textBox, {
      target: { value: 'example.com/123' }
    })
    fireEvent.blur(textBox)
    await waitFor(() =>
      expect(getByText('Please enter a valid url')).toBeInTheDocument()
    )
    expect(onChange).not.toBeCalled()
  })

  it('calls onChange with new block', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <VideoBlockEditorSource
        selectedBlock={null}
        onChange={onChange}
        parentOrder={0}
        parentBlockId="card.id"
      />
    )
    const textBox = getByRole('textbox')
    fireEvent.focus(textBox)
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/123.mp4' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(video))
  })
})
