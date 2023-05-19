import { fireEvent, render } from '@testing-library/react'

import { MockedProvider } from '@apollo/client/testing'
import { FilterDrawer } from './FilterDrawer'

const defaultProps = {
  sortSetting: 'date',
  chatStarted: false,
  withPollAnswers: false,
  withSubmittedText: false,
  withIcon: false,
  hideInteractive: false,
  handleClearAll: jest.fn(),
  handleChange: jest.fn()
}

describe('FilterDrawer', () => {
  it('calls handleClearAll when the clear all button is clicked', async () => {
    const { getByText } = render(
      <MockedProvider>
        <FilterDrawer {...defaultProps} />
      </MockedProvider>
    )

    // Simulate a click event on the close icon
    fireEvent.click(getByText('Clear All'))

    // Assert that the handleClose prop has been called
    expect(defaultProps.handleClearAll).toHaveBeenCalledTimes(1)
  })
})
