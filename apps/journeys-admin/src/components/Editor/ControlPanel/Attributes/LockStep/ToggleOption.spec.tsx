import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import Typography from '@mui/material/Typography'
import { render, fireEvent } from '@testing-library/react'
import { ToggleOption } from '.'

describe('LockStep', () => {
  const toggleOptionProps = {
    heading: 'Toggle Heading',
    description: 'Toggle Description',
    checked: false,
    handleChange: jest.fn(),
    children: <Typography>Children</Typography>
  }
  it('display the correct text', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider>
          <ToggleOption {...toggleOptionProps} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('Toggle Heading')).toBeInTheDocument()
    expect(getByText('Toggle Description')).toBeInTheDocument()
    expect(getByText('Children')).toBeInTheDocument()
  })

  it('toggles calls the handleChange event', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <ToggleOption {...toggleOptionProps} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(getByRole('checkbox'))
    expect(toggleOptionProps.handleChange).toHaveBeenCalled()
  })
})
