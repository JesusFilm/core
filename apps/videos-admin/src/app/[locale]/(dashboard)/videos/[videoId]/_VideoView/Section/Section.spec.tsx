import Typography from '@mui/material/Typography'
import { fireEvent, render, screen } from '@testing-library/react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { Section } from './Section'

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

  it('should render fallback', () => {
    render(<Section.Fallback>Nothing to display</Section.Fallback>)

    expect(screen.getByText('Nothing to display')).toBeInTheDocument()
  })
})
