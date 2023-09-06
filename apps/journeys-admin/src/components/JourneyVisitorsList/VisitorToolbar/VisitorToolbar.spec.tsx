import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded' // icon-replace: add filter
import { fireEvent, render } from '@testing-library/react'

describe('Visitor Toolbar', () => {
  const handleOpen = jest.fn()

  it('should open drawer on click', () => {
    const { getByTestId } = render(
      <FilterListRoundedIcon onClick={handleOpen} />
    )

    fireEvent.click(getByTestId('FilterListRoundedIcon'))
    expect(handleOpen).toHaveBeenCalled()
  })
})
