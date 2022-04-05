import { fireEvent, render } from '@testing-library/react'
import { VideoSearch } from './VideoSearch'

describe('VideoSearch', () => {
  it('has value in textbox', () => {
    const { getByRole } = render(
      <VideoSearch value="Jesus" onChange={jest.fn()} />
    )
    expect(getByRole('textbox', { name: 'Search' })).toHaveValue('Jesus')
  })

  it('calls onChange on change', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<VideoSearch onChange={onChange} />)
    const textbox = getByRole('textbox', { name: 'Search' })
    fireEvent.change(textbox, {
      target: { value: 'Jesus' }
    })
    expect(onChange).toHaveBeenCalledWith('Jesus')
  })
})
