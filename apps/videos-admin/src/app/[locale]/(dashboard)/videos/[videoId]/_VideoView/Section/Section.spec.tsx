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

  it('should render contained variant by default', () => {
    render(
      <Section title="Section title">
        <Typography>Section content</Typography>
      </Section>
    )

    expect(
      screen.getByTestId('Section title-title-section')
    ).toBeInTheDocument()
    expect(screen.getByTestId('Section title-title-section')).toHaveStyle({
      'border-bottom': '1px solid',
      'border-color': 'rgba(0, 0, 0, 0.12)',
      'background-color': 'rgb(255, 255, 255)'
    })
  })

  it('should render outlined variant by default', () => {
    render(
      <Section title="Section title" variant="outlined">
        <Typography>Section content</Typography>
      </Section>
    )

    expect(
      screen.getByTestId('Section title-title-section')
    ).toBeInTheDocument()
    expect(screen.getByTestId('Section title-title-section')).toHaveStyle({
      'border-bottom': '0px',
      'border-color': 'transparent',
      'background-color': 'none'
    })
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
