import { fireEvent, render } from '@testing-library/react'
import { ImageSelectionDialog } from '.'

describe('ImageSelectionDialog', () => {
  it('shoudl switch tabs', () => {
    const { getByRole } = render(
      <ImageSelectionDialog open onClose={jest.fn()} />
    )
    fireEvent.click(getByRole('tab', { name: 'Link' }))
    const textBox = getByRole('textbox')
    expect(textBox).toHaveValue('')
  })
})
