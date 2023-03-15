import { fireEvent, render } from '@testing-library/react'
import { AppHeader } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))
describe('AppHeader', () => {
  it('should call onClick', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <AppHeader
        onClick={onClick}
        toolbarStyle={{ variant: 'dense', height: 12 }}
      />
    )

    fireEvent.click(getByRole('button', { name: 'open drawer' }))
    expect(onClick).toHaveBeenCalled()
  })
})
