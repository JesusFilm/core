import { fireEvent, render } from '@testing-library/react'
import { FilterDrawer } from './FilterDrawer'

const props = {
  sortSetting: '',
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

    fireEvent.click(getByText('Clear All'))
    expect(props.handleClearAll).toHaveBeenCalled()
  })
  it('calls handleChange when checkboxes and radio buttons are selected', async () => {
    const { handleChange } = props
    const { getByText } = render(<FilterDrawer {...props} />)

    fireEvent.click(getByText('Chat Started'))
    expect(handleChange).toReturnWith('Chat Started')
    fireEvent.click(getByText('With Poll Answers'))
    expect(handleChange).toReturnWith('With Poll Answers')
    fireEvent.click(getByText('With Submitted Text'))
    expect(handleChange).toReturnWith('With Submitted Text')
    fireEvent.click(getByText('With Icon'))
    expect(handleChange).toReturnWith('With Icon')
    fireEvent.click(getByText('Hide Inactive'))
    expect(handleChange).toReturnWith('Hide Inactive')
    fireEvent.click(getByText('Duration'))
    expect(handleChange).toReturnWith('duration')
    fireEvent.click(getByText('Date'))
    expect(handleChange).toReturnWith('date')
  })
})
