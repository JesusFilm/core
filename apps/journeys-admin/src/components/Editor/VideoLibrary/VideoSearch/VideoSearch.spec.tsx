import { fireEvent, render } from '@testing-library/react'
import { VideoSearch } from './VideoSearch'

describe('VideoSearch', () => {
  it('calls setTitle on change', () => {
    const setTitle = jest.fn()
    const { getByRole } = render(<VideoSearch title="" setTitle={setTitle} />)
    const textBox = getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'Jesus' }
    })
    expect(setTitle).toHaveBeenCalledWith('Jesus')
  })
})
