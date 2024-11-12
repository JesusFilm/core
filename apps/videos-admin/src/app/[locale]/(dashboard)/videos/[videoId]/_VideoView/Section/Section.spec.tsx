import { fireEvent, render, screen } from '@testing-library/react'
import { Section } from './Section'
import { Typography } from '@mui/material'
import Plus2 from '@core/shared/ui/icons/Plus2'

describe('Section', () => {
  it('should render without action', () => {
    render(
      <Section title="Section title">
        <Typography>Section content</Typography>
      </Section>
    )

    expect(screen.getByText('Section title')).toBeInTheDocument()
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('should render with action', () => {
    const handleClick = jest.fn()

    render(
      <Section
        title="Section title"
        action={{
          label: 'Section button',
          onClick: handleClick,
          startIcon: <Plus2 />
        }}
      >
        <Typography>Section content</Typography>
      </Section>
    )

    const button = screen.getByRole('button', { name: 'Section button' })

    expect(button).toBeInTheDocument()
    expect(screen.getByTestId('Plus2Icon')).toBeInTheDocument()

    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalled()
  })
})
