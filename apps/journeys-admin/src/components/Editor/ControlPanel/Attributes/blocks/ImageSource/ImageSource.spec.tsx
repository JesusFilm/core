import { render, fireEvent } from '@testing-library/react'
import { ImageSource } from './ImageSource'

describe('ImageSource', () => {
  it('should call onClick when pressed', () => {
    const onClick = jest.fn()
    const { getByTestId } = render(<ImageSource onClick={onClick} />)
    fireEvent.click(getByTestId('card click area'))
    expect(onClick).toHaveBeenCalled()
  })
})
