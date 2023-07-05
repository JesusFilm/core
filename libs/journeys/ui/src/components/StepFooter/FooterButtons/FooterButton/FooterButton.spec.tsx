import Typography from '@mui/material/Typography'
import { fireEvent, render } from '@testing-library/react'
import { FooterButton } from '.'

describe('FooterButton', () => {
  it('should handle click', () => {
    const handleClick = jest.fn()

    const { getByRole } = render(
      <FooterButton onClick={handleClick}>
        <Typography>Test</Typography>
      </FooterButton>
    )

    fireEvent.click(getByRole('button', { name: 'Test' }))
    expect(handleClick).toHaveBeenCalled()
  })
})
