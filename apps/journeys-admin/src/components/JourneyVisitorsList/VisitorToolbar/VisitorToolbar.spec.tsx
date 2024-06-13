import { fireEvent, render } from '@testing-library/react'

import FilterIcon from '@core/shared/ui/icons/Filter'

describe('Visitor Toolbar', () => {
  const handleOpen = jest.fn()

  it('should open drawer on click', () => {
    const { getByTestId } = render(<FilterIcon onClick={handleOpen} />)

    fireEvent.click(getByTestId('FilterIcon'))
    expect(handleOpen).toHaveBeenCalled()
  })
})
