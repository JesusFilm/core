import Typography from '@mui/material/Typography'
import { fireEvent, render } from '@testing-library/react'
import { StyledFooterButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('StyledFooterButton', () => {
  it('should handle click', () => {
    const handleClick = jest.fn()

    const { getAllByRole } = render(
      <StyledFooterButton onClick={handleClick}>
        <Typography>Test</Typography>
      </StyledFooterButton>
    )

    fireEvent.click(getAllByRole('button', { name: 'Test' })[0])
    expect(handleClick).toHaveBeenCalled()
  })
})
