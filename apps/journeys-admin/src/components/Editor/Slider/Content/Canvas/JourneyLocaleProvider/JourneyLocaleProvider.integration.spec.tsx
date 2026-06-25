import { render, screen, waitFor } from '@testing-library/react'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { JourneyLocaleProvider } from './JourneyLocaleProvider'

// Stand-in for the libs-journeys-ui blocks (SignUp/Button) whose empty-label
// fallback renders t('Submit') / t('Button') from the libs-journeys-ui
// namespace. These resolve from the canvas i18n instance, so they must follow
// the journey's locale — not fall back to English (NES-1551).
function FallbackLabels(): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  return (
    <>
      <span data-testid="submit">{t('Submit')}</span>
      <span data-testid="button">{t('Button')}</span>
    </>
  )
}

describe('JourneyLocaleProvider integration', () => {
  it('renders libs-journeys-ui fallback labels in the journey locale (fr)', async () => {
    render(
      <JourneyLocaleProvider locale="fr">
        <FallbackLabels />
      </JourneyLocaleProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('submit')).toHaveTextContent('Soumettre')
    )
    expect(screen.getByTestId('button')).toHaveTextContent('Bouton')
  })

  it('falls back to English when the journey locale has no translation folder', async () => {
    render(
      <JourneyLocaleProvider locale="en">
        <FallbackLabels />
      </JourneyLocaleProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('submit')).toHaveTextContent('Submit')
    )
    expect(screen.getByTestId('button')).toHaveTextContent('Button')
  })
})
