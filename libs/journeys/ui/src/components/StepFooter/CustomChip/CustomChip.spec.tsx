import Typography from '@mui/material/Typography'
import { fireEvent, render } from '@testing-library/react'
import { CustomChip } from '.'

describe('CustomChip', () => {
  it('should handle click', () => {
    const handleClick = jest.fn()

    const { getByRole } = render(
      <CustomChip handleClick={handleClick}>
        <Typography>Test</Typography>
      </CustomChip>
    )

    fireEvent.click(getByRole('button', { name: 'Test' }))
    expect(handleClick).toHaveBeenCalled()
  })
})
