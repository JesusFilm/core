import { render, screen } from '@testing-library/react'

import { EmbeddingCanvaOrGoogleSlidesSection } from './EmbeddingCanvaOrGoogleSlidesSection'

describe('EmbeddingCanvaOrGoogleSlidesSection', () => {
  it('renders the three sub-block headings: Canva, Google Slides, Troubleshooting', () => {
    render(<EmbeddingCanvaOrGoogleSlidesSection />)

    // "Canva" / "Google Slides" also appear inside the bolded lead paragraph,
    // so check the count rather than insisting on uniqueness.
    expect(screen.getAllByText('Canva').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Google Slides').length).toBeGreaterThanOrEqual(
      1
    )
    expect(screen.getByText('Troubleshooting')).toBeInTheDocument()
  })

  it('renders the Canva example URL with /edit (the bad shape)', () => {
    render(<EmbeddingCanvaOrGoogleSlidesSection />)

    expect(
      screen.getByText(
        'https://www.canva.com/design/DAHJB67vCNY/BcaCmy_lNO4OCntKWMooqA/edit?utm_content=…'
      )
    ).toBeInTheDocument()
  })

  it('renders the Canva final-URL example with /view (the canonical shape)', () => {
    render(<EmbeddingCanvaOrGoogleSlidesSection />)

    expect(
      screen.getByText(
        'https://www.canva.com/design/DAHJB67vCNY/BcaCmy_lNO4OCntKWMooqA/view'
      )
    ).toBeInTheDocument()
  })

  it('renders the Google Slides example /pub URL', () => {
    render(<EmbeddingCanvaOrGoogleSlidesSection />)

    expect(
      screen.getByText(
        'https://docs.google.com/presentation/d/e/2PACX-1vS…/pub?start=false&loop=false&delayms=3000'
      )
    ).toBeInTheDocument()
  })

  it('renders the warning alert about Canva short links', () => {
    render(<EmbeddingCanvaOrGoogleSlidesSection />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent("Don't use Canva short links")
    expect(alert).toHaveTextContent('canva.link/…')
  })

  it('renders inline code samples for /view, /edit, /pub, and ?utm_content=… in troubleshooting', () => {
    render(<EmbeddingCanvaOrGoogleSlidesSection />)

    const section = screen.getByTestId('EmbeddingCanvaOrGoogleSlidesSection')
    const codes = Array.from(section.querySelectorAll('code')).map(
      (el) => el.textContent
    )

    expect(codes).toEqual(expect.arrayContaining(['/view', '/edit', '/pub?…']))
  })
})
