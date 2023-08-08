import { fireEvent, render } from '@testing-library/react'

import { FilterDrawer } from './FilterDrawer'

const props = {
  chatStarted: false,
  withPollAnswers: false,
  withSubmittedText: false,
  withIcon: false,
  hideInteractive: false,
  handleClearAll: jest.fn(),
  handleChange: jest.fn((e) => e.target.value)
}

describe('FilterDrawer', () => {
  it('calls handleClearAll when the clear all button is clicked', async () => {
    const { getByText } = render(<FilterDrawer {...props} />)

    fireEvent.click(getByText('Clear all'))
    expect(props.handleClearAll).toHaveBeenCalled()
  })

  it('calls handleChange when checkboxes and radio buttons are selected', async () => {
    const { handleChange } = props
    const { getByText, getByRole } = render(<FilterDrawer {...props} />)

    fireEvent.click(getByText('Chat Started'))
    expect(handleChange).toHaveReturnedWith('Chat Started')
    fireEvent.click(getByText('With Poll Answers'))
    expect(handleChange).toHaveReturnedWith('With Poll Answers')
    fireEvent.click(getByText('With Submitted Text'))
    expect(handleChange).toHaveReturnedWith('With Submitted Text')
    fireEvent.click(getByText('With Icon'))
    expect(handleChange).toHaveReturnedWith('With Icon')
    fireEvent.click(getByText('Hide Inactive'))
    expect(handleChange).toHaveReturnedWith('Hide Inactive')
    fireEvent.click(getByText('Duration'))
    expect(handleChange).toHaveReturnedWith('duration')
    expect(getByRole('radio', { name: 'Date' })).not.toBeChecked()
    fireEvent.click(getByText('Date'))
    expect(handleChange).toHaveReturnedWith('date')
    expect(getByRole('radio', { name: 'Duration' })).not.toBeChecked()
  })
})
