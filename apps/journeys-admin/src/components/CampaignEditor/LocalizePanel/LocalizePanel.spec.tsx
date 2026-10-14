import { fireEvent, render, screen } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { CAMPAIGN_TRANSLATIONS } from '../../../libs/useCampaignTranslationsQuery'
import { StaticEditor } from '../testing'

import { LocalizePanel } from './LocalizePanel'
import type { LocalizeTab } from './LocalizePanel'

const languagesMock = {
  request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
  result: { data: { languages: [] } }
}

const translationsMock = {
  request: {
    query: CAMPAIGN_TRANSLATIONS,
    variables: { campaignId: 'campaignId', languageId: '496', filter: 'all' }
  },
  result: { data: { campaignTranslations: [] } }
}

interface HarnessProps {
  initialTab?: LocalizeTab
  initialPromotionNotice?: boolean
}

function Harness({
  initialTab = 'languages',
  initialPromotionNotice = false
}: HarnessProps): ReactElement {
  const [tab, setTab] = useState<LocalizeTab>(initialTab)
  const [promotionNotice, setPromotionNotice] = useState(initialPromotionNotice)
  return (
    <StaticEditor mocks={[languagesMock, translationsMock]}>
      <LocalizePanel
        tab={tab}
        onTabChange={setTab}
        promotionNotice={promotionNotice}
        onPromotionNoticeClose={() => setPromotionNotice(false)}
      />
    </StaticEditor>
  )
}

describe('LocalizePanel', () => {
  it('opens on the Languages tab with the campaign’s languages', () => {
    render(<Harness />)

    expect(screen.getByRole('tab', { name: 'Languages' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('CampaignLanguagesPanel')).toBeInTheDocument()
    expect(screen.queryByTestId('TranslationsView')).not.toBeInTheDocument()
  })

  it('switches to the Translations tab and back', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: 'Translations' }))
    expect(await screen.findByTestId('TranslationsView')).toBeInTheDocument()
    expect(
      screen.queryByTestId('CampaignLanguagesPanel')
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Languages' }))
    expect(screen.getByTestId('CampaignLanguagesPanel')).toBeInTheDocument()
  })

  it('shows the promotion notice on Translations and dismisses it', async () => {
    render(<Harness initialTab="translations" initialPromotionNotice />)

    expect(
      await screen.findByTestId('TranslationsPromotionNotice')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(
      screen.queryByTestId('TranslationsPromotionNotice')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('TranslationsView')).toBeInTheDocument()
  })
})
