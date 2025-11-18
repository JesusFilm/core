import { render, screen } from '@testing-library/react'

import { TextFormatter } from '.'

describe('TextFormatter', () => {
  it('should render description text correctly', () => {
    render(
      <TextFormatter>This text should appear in the description</TextFormatter>
    )
    expect(
      screen.getByText('This text should appear in the description')
    ).toBeInTheDocument()
  })

  it('should render link correctly', () => {
    render(
      <TextFormatter>
        This text should appear with website https://www.fallingplates.com/ in
        the description
      </TextFormatter>
    )
    expect(
      screen.getByRole('link', { name: 'fallingplates.com' })
    ).toHaveAttribute('href', 'https://www.fallingplates.com/')
  })

  it('should append protocol to link href attribute', () => {
    render(
      <TextFormatter>
        This text should appear with website www.fallingplates.com in the
        description
      </TextFormatter>
    )
    expect(
      screen.getByRole('link', { name: 'fallingplates.com' })
    ).toHaveAttribute('href', 'https://www.fallingplates.com')
  })

  it('should render email correctly', () => {
    render(
      <TextFormatter>
        This text should appear with email help@jesusfilm.org in the description
      </TextFormatter>
    )
    expect(
      screen.getByRole('link', { name: 'help@jesusfilm.org' })
    ).toHaveAttribute('href', 'mailto:help@jesusfilm.org')
  })

  it('should render multiple paragraphs', () => {
    render(<TextFormatter>{'paragraph 1\n\nparagraph 2'}</TextFormatter>)
    expect(screen.getByText('paragraph 1')).toBeInTheDocument()
    expect(screen.getByText('paragraph 2')).toBeInTheDocument()
  })

  it('should render components unchanged', () => {
    render(
      <TextFormatter>
        <span>unchanged https://www.fallingplates.com/</span>
        <div>unchanged help@jesusfilm.org</div>
      </TextFormatter>
    )
    expect(
      screen.getByText('unchanged https://www.fallingplates.com/')
    ).toBeInTheDocument()
    expect(screen.getByText('unchanged help@jesusfilm.org')).toBeInTheDocument()
  })
})
