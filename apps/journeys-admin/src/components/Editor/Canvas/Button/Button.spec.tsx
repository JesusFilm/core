import { fireEvent, render, waitFor } from '@testing-library/react'

import { Button } from '.'

describe('Button', () => {
  it('should render button', () => {
    const { getByText } = render(<Button icon={<>test</>} value="value" />)
    expect(getByText('test')).toBeInTheDocument()
  })

  it('should call onclick on button press', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <Button icon={<>test</>} value="value" onClick={handleClick} />
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should display tooltip on mouse hover', async () => {
    const { getByRole, getByText } = render(
      <Button icon={<>test</>} value="value" onClick={jest.fn()} />
    )
    fireEvent.mouseOver(getByRole('button'))

    await waitFor(() => expect(getByText('Click to add')).toBeInTheDocument())
  })

  it('should display disabled button correctly', () => {
    const { getByRole } = render(
      <Button icon={<>test</>} value="value" onClick={jest.fn()} disabled />
    )
    expect(getByRole('button')).toBeDisabled()
  })
})
