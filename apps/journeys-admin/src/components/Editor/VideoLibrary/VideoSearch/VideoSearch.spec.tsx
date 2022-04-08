import { fireEvent, render, waitFor } from '@testing-library/react'
import { VideoSearch } from './VideoSearch'

describe('VideoSearch', () => {
  it('has value in textbox', () => {
    const { getByRole } = render(
      <VideoSearch value="Jesus" onChange={jest.fn()} />
    )
    expect(getByRole('textbox', { name: 'Search' })).toHaveValue('Jesus')
  })

  it('calls onChange on change', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(<VideoSearch onChange={onChange} />)
    const textbox = getByRole('textbox', { name: 'Search' })
    fireEvent.change(textbox, {
      target: { value: 'Jesus' }
    })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('Jesus'))
  })
})
