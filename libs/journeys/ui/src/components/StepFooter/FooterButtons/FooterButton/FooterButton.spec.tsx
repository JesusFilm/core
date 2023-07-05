import Typography from '@mui/material/Typography'
import { fireEvent, render } from '@testing-library/react'
import { FooterButton } from '.'

describe('FooterButton', () => {
  it('should handle click', () => {
    const handleClick = jest.fn()

    const { getAllByRole } = render(
      <FooterButton onClick={handleClick}>
        <Typography>Test</Typography>
      </FooterButton>
    )

    fireEvent.click(getAllByRole('button', { name: 'Test' })[0])
    expect(handleClick).toHaveBeenCalled()
  })
})
