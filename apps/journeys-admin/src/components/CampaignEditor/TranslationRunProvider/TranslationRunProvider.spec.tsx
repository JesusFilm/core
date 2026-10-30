import { InMemoryCache, gql } from '@apollo/client'
import { MockSubscriptionLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { CampaignAiTranslateVariables } from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { CampaignAiTranslateMode } from '../../../../__generated__/globalTypes'

import { TranslationRunProvider, useTranslationRun } from '.'

const variables: CampaignAiTranslateVariables = {
  campaignId: 'campaignId',
  languageId: '496',
  mode: CampaignAiTranslateMode.missing
}

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

/** Deliver a subscription result; the mock link does so on a timer. */
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

function Probe(): ReactElement {
  const { run, error, start, cancel } = useTranslationRun()
  return (
    <>
      <button onClick={() => start(variables, 'Français')}>Start</button>
      <button onClick={cancel}>Cancel</button>
      <span data-testid="Run">
        {run == null
          ? 'idle'
          : `${run.languageName} ${run.progress} ${run.message ?? ''} ${run.translatedCount}`}
      </span>
      <span data-testid="Error">{error}</span>
    </>
  )
}

function renderProvider(link: MockSubscriptionLink): ReturnType<typeof render> {
  return render(
    <MockedProvider link={link} cache={new InMemoryCache()}>
      <SnackbarProvider>
        <TranslationRunProvider>
          <Probe />
        </TranslationRunProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('TranslationRunProvider', () => {
  it('is idle until a run starts', async () => {
    renderProvider(new MockSubscriptionLink())

    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('reports the run starting, then its progress', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByTestId('Run')).toHaveTextContent('Français 0 0')

    await emit(link, report(55, 'Translated 2 of 4 parts', 6))
    expect(screen.getByTestId('Run')).toHaveTextContent(
      'Français 55 Translated 2 of 4 parts 6'
    )
    expect(link.operation?.variables).toEqual(variables)
  })

  it('says how many strings a finished run translated, and is idle again', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await emit(link, report(100, 'Translation completed!', 12, true), true)

    expect(
      screen.getByText('Translated 12 strings into Français')
    ).toBeInTheDocument()
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('stops the subscription on Cancel and says how many strings were kept', async () => {
    const link = new MockSubscriptionLink()
    const unsubscribed = vi.fn()
    link.onUnsubscribe(unsubscribed)
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await emit(link, report(55, 'Translated 2 of 4 parts', 6))

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(unsubscribed).toHaveBeenCalled())
    expect(
      screen.getByText('Translation into Français cancelled. 6 strings kept.')
    ).toBeInTheDocument()
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('ignores Cancel when nothing runs', async () => {
    renderProvider(new MockSubscriptionLink())

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText(/cancelled/)).not.toBeInTheDocument()
  })

  it('shows a failed run as an error and a snackbar, and is idle again', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await emit(link, { error: new Error('Translation failed') })

    expect(screen.getByTestId('Error')).toHaveTextContent('Translation failed')
    expect(screen.getAllByText('Translation failed')).toHaveLength(2)
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
    expect(screen.queryByText(/Translated/)).not.toBeInTheDocument()
  })

  it('clears an earlier error when a new run starts', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await emit(link, { error: new Error('Translation failed') })

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByTestId('Error')).toBeEmptyDOMElement()
  })

  it('drops the cached Translations rows when a run is cancelled, so kept strings are read', async () => {
    const link = new MockSubscriptionLink()
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: gql`
        query CancelledRunStaleRows {
          campaignTranslations(campaignId: "campaignId", languageId: "496") {
            group
          }
        }
      `,
      data: {
        campaignTranslations: [
          { __typename: 'CampaignTranslation', group: 'landing' }
        ]
      }
    })
    const hasRows = (): boolean =>
      Object.keys(cache.extract().ROOT_QUERY ?? {}).some((key) =>
        key.startsWith('campaignTranslations')
      )
    render(
      <MockedProvider link={link} cache={cache}>
        <SnackbarProvider>
          <TranslationRunProvider>
            <Probe />
          </TranslationRunProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(hasRows()).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(hasRows()).toBe(false)
  })
})
