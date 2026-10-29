import { ApolloLink } from '@apollo/client'
import { MockLink, MockSubscriptionLink } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { CAMPAIGN_TRANSLATIONS } from '../../../libs/useCampaignTranslationsQuery'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { LeftRail } from '../LeftRail'
import { StaticEditor } from '../testing'

import { LocalizePanel } from './LocalizePanel'
import type { LocalizeTab } from './LocalizePanel'

/** Sets the Preview Language to Spanish, as the Pages panel's select would. */
function PreviewSpanishButton(): ReactElement {
  const { dispatch } = useCampaignEditor()
  return (
    <button
      onClick={() =>
        dispatch({
          type: 'SetPreviewLanguageAction',
          previewLanguageId: '21028'
        })
      }
    >
      Preview Spanish
    </button>
  )
}

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

  it('follows the Preview Language chosen on the canvas chip while on Translations', async () => {
    const spanish = {
      ...campaign.languages[1],
      id: 'campaignLanguageEsId',
      languageId: '21028',
      order: 2,
      language: {
        ...campaign.languages[1].language,
        id: '21028',
        bcp47: 'es',
        name: [
          {
            __typename: 'LanguageName' as const,
            value: 'Español',
            primary: true
          }
        ]
      }
    }
    const spanishTranslationsMock = {
      ...translationsMock,
      request: {
        ...translationsMock.request,
        variables: {
          ...translationsMock.request.variables,
          languageId: '21028'
        }
      }
    }
    render(
      <StaticEditor
        campaign={{
          ...campaign,
          languages: [...campaign.languages, spanish]
        }}
        mocks={[languagesMock, translationsMock, spanishTranslationsMock]}
      >
        <LocalizePanel
          tab="translations"
          onTabChange={() => undefined}
          promotionNotice={false}
          onPromotionNoticeClose={() => undefined}
        />
        <PreviewSpanishButton />
      </StaticEditor>
    )
    expect(
      await screen.findByRole('combobox', { name: 'Language' })
    ).toHaveTextContent('Français')

    fireEvent.click(screen.getByRole('button', { name: 'Preview Spanish' }))

    expect(
      await screen.findByRole('combobox', { name: 'Language' })
    ).toHaveTextContent('Español')
  })
})

describe('LocalizePanel machine translation run', () => {
  function report(
    progress: number,
    message: string,
    translatedCount: number,
    finished = false
  ): { result: { data: Record<string, unknown> } } {
    return {
      result: {
        data: {
          campaignAiTranslateSubscription: {
            __typename: 'CampaignAiTranslateProgress',
            progress,
            message,
            translatedCount,
            campaign: finished
              ? {
                  __typename: 'Campaign',
                  id: 'campaignId',
                  titleTranslations: []
                }
              : null
          }
        }
      }
    }
  }

  async function emit(
    link: MockSubscriptionLink,
    result: MockSubscriptionLink.Result,
    complete = false
  ): Promise<void> {
    await act(async () => {
      link.simulateResult(result, complete)
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }

  /** The rail and a closable Localize panel on Translations, as the editor lays them out. */
  function PanelHarness({ link }: { link: ApolloLink }): ReactElement {
    const [open, setOpen] = useState(true)
    const [tab, setTab] = useState<LocalizeTab>('translations')
    return (
      <StaticEditor link={link}>
        <LeftRail view="desktop" onViewChange={() => undefined} />
        <button onClick={() => setOpen(!open)}>Toggle panel</button>
        {open && (
          <LocalizePanel
            tab={tab}
            onTabChange={setTab}
            promotionNotice={false}
            onPromotionNoticeClose={() => undefined}
          />
        )}
      </StaticEditor>
    )
  }

  function renderRunning(): MockSubscriptionLink {
    const subscriptionLink = new MockSubscriptionLink()
    const link = ApolloLink.split(
      (operation) =>
        operation.operationName === 'CampaignAiTranslateSubscription',
      subscriptionLink,
      new MockLink([
        languagesMock,
        translationsMock,
        translationsMock,
        translationsMock
      ])
    )
    render(<PanelHarness link={link} />)
    return subscriptionLink
  }

  async function startRun(link: MockSubscriptionLink): Promise<void> {
    fireEvent.click(
      await screen.findByRole('button', { name: 'Machine-translate missing' })
    )
    await emit(link, report(40, 'Translated 2 of 5 parts', 7))
  }

  it('keeps the run and its progress through a tab switch and a closed panel, on the rail button and in the Translations tab', async () => {
    const link = renderRunning()
    await startRun(link)
    expect(screen.getByTestId('TranslationsProgress')).toHaveTextContent(
      'Translated 2 of 5 parts'
    )
    expect(screen.getByTestId('localizeProgress')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Languages' }))
    expect(screen.getByTestId('CampaignLanguageSweep')).toHaveTextContent(
      'Translated 2 of 5 parts'
    )
    expect(screen.getByTestId('localizeProgress')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Toggle panel' }))
    expect(screen.queryByTestId('CampaignLocalizePanel')).toBeNull()
    expect(screen.getByTestId('localizeProgress')).toBeInTheDocument()
    await emit(link, report(70, 'Translated 3 of 5 parts', 9))

    fireEvent.click(screen.getByRole('button', { name: 'Toggle panel' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Translations' }))
    expect(screen.getByTestId('TranslationsProgress')).toHaveTextContent(
      'Translated 3 of 5 parts'
    )
  })

  it('stops the run on Cancel and says how many strings were kept', async () => {
    const link = renderRunning()
    const unsubscribed = vi.fn()
    link.onUnsubscribe(unsubscribed)
    await startRun(link)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(unsubscribed).toHaveBeenCalled())
    expect(screen.queryByTestId('TranslationsProgress')).toBeNull()
    expect(screen.queryByTestId('localizeProgress')).toBeNull()
    expect(
      screen.getByText('Translation into Français cancelled. 7 strings kept.')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Machine-translate missing' })
    ).toBeEnabled()
  })

  it('says the run finished, with the number of strings, when it completes', async () => {
    const link = renderRunning()
    await startRun(link)

    await emit(link, report(100, 'Translation completed!', 12, true), true)

    expect(
      screen.getByText('Translated 12 strings into Français')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('TranslationsProgress')).toBeNull()
    expect(screen.queryByTestId('localizeProgress')).toBeNull()
  })
})
