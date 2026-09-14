import { render, screen, waitFor } from '@testing-library/react'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { JourneyLocaleProvider } from './JourneyLocaleProvider'

// Stand-in for the canvas strings that resolve from the canvas i18n instance
// and so follow the journey's locale (NES-1551): the libs-journeys-ui block
// fallbacks (`Submit`/`Button`), the poll's `Add Option` affordance, and the
// apps-journeys-admin inline-edit placeholder. All must render in the journey
// locale, not fall back to English.
function CanvasStrings(): ReactElement {
  const { t: tUi } = useTranslation('libs-journeys-ui')
  const { t: tAdmin } = useTranslation('apps-journeys-admin')
  return (
    <>
      <span data-testid="submit">{tUi('Submit')}</span>
      <span data-testid="button">{tUi('Button')}</span>
      <span data-testid="add-option">{tUi('Add Option')}</span>
      <span data-testid="placeholder">{tAdmin('Add your text here...')}</span>
    </>
  )
}

describe('JourneyLocaleProvider integration', () => {
  it('renders canvas strings in the journey locale (fr)', async () => {
    render(
      <JourneyLocaleProvider locale="fr">
        <CanvasStrings />
      </JourneyLocaleProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('submit')).toHaveTextContent('Soumettre')
    )
    expect(screen.getByTestId('button')).toHaveTextContent('Bouton')
    expect(screen.getByTestId('add-option')).toHaveTextContent(
      'Ajouter une option'
    )
    expect(screen.getByTestId('placeholder')).toHaveTextContent(
      'Ajoute ton texte ici...'
    )
  })

  // Both ends of this switch are non-English on purpose. Keys in this repo are
  // the English source strings, so an English assertion also passes when no
  // bundle loaded at all and `t` returned the key — it could not tell a working
  // locale switch from a broken one.
  it('re-renders in the new locale when the journey locale changes', async () => {
    const { rerender } = render(
      <JourneyLocaleProvider locale="fr">
        <CanvasStrings />
      </JourneyLocaleProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('submit')).toHaveTextContent('Soumettre')
    )

    rerender(
      <JourneyLocaleProvider locale="de">
        <CanvasStrings />
      </JourneyLocaleProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('submit')).toHaveTextContent('einreichen')
    )
    expect(screen.getByTestId('placeholder')).toHaveTextContent(
      'Füge deinen Text hier ein...'
    )
  })

  it('falls back to English when the journey locale has no translation folder', async () => {
    render(
      <JourneyLocaleProvider locale="en">
        <CanvasStrings />
      </JourneyLocaleProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('submit')).toHaveTextContent('Submit')
    )
    expect(screen.getByTestId('button')).toHaveTextContent('Button')
    expect(screen.getByTestId('add-option')).toHaveTextContent('Add Option')
    expect(screen.getByTestId('placeholder')).toHaveTextContent(
      'Add your text here...'
    )
  })
})
