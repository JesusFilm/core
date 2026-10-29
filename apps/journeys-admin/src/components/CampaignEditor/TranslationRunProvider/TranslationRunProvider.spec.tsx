import { ApolloLink, InMemoryCache, gql } from '@apollo/client'
import { MockLink, MockSubscriptionLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { CampaignAiTranslateVariables } from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { useCampaignQuery } from '../../../libs/useCampaignQuery'
import { CAMPAIGN_UPDATE } from '../../../libs/useCampaignUpdateMutation'
import {
  SpyMock,
  campaignCache,
  emitSubscription,
  getCampaignMock,
  holdRequests,
  landRequests
} from '../testing'

import { TranslationRunProvider, useTranslationRun } from '.'

const variables: CampaignAiTranslateVariables = {
  campaignId: 'campaignId',
  languageId: '496',
  mode: 'missing'
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

const defaultLanguageChanged = vi.fn()

function Probe(): ReactElement {
  const { run, error, start, cancel } = useTranslationRun()
  return (
    <>
      <button onClick={() => start(variables, 'Français')}>Start</button>
      <button
        onClick={() =>
          start(variables, 'Français', {
            thenSwapDefaultLanguage: true,
            onDefaultLanguageChanged: defaultLanguageChanged
          })
        }
      >
        Start then swap
      </button>
      <button
        onClick={() => start({ ...variables, languageId: '21028' }, 'Español')}
      >
        Start Spanish
      </button>
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

/** Watches `GetCampaign` as the editor does, so a refetch of it reaches the link. */
function CampaignReader(): ReactElement {
  const { data } = useCampaignQuery({ id: 'campaignId' })
  return <span data-testid="Campaign">{data?.campaign?.id}</span>
}

function renderProvider(
  link: ApolloLink,
  extra?: ReactNode
): ReturnType<typeof render> {
  return render(
    <MockedProvider link={link} cache={campaignCache()}>
      <SnackbarProvider>
        <TranslationRunProvider>
          <Probe />
          {extra}
        </TranslationRunProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

/** The run's subscription on `subscriptionLink`; every other operation on `mocks`. */
function renderWithMocks(
  subscriptionLink: MockSubscriptionLink,
  mocks: MockLink.MockedResponse[],
  extra?: ReactNode
): ReturnType<typeof render> {
  const link = ApolloLink.split(
    (operation) =>
      operation.operationName === 'CampaignAiTranslateSubscription',
    subscriptionLink,
    new MockLink(mocks)
  )
  return renderProvider(link, extra)
}

function conflict(
  message: string,
  extensions: Record<string, unknown>
): {
  result: { errors: GraphQLError[] }
} {
  return { result: { errors: [new GraphQLError(message, { extensions })] } }
}

const swapped = vi.fn(() => ({
  data: {
    campaignUpdate: {
      __typename: 'Campaign',
      id: 'campaignId',
      title: 'Outreach 2026',
      slug: 'outreach-2026'
    }
  }
}))

const swapMock = {
  request: {
    query: CAMPAIGN_UPDATE,
    variables: { id: 'campaignId', input: { defaultLanguageId: '496' } }
  },
  result: swapped
}

describe('TranslationRunProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('is idle until a run starts', async () => {
    renderProvider(new MockSubscriptionLink())

    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('reports the run starting, then its progress', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByTestId('Run')).toHaveTextContent('Français 0 0')

    await emitSubscription(link, report(55, 'Translated 2 of 4 parts', 6))
    expect(screen.getByTestId('Run')).toHaveTextContent(
      'Français 55 Translated 2 of 4 parts 6'
    )
    expect(link.operation?.variables).toEqual(variables)
  })

  it('says how many strings a finished run translated, and is idle again', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await emitSubscription(
      link,
      report(100, 'Translation completed!', 12, true),
      true
    )

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
    await emitSubscription(link, report(55, 'Translated 2 of 4 parts', 6))

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

    await emitSubscription(link, { error: new Error('Translation failed') })

    expect(screen.getByTestId('Error')).toHaveTextContent('Translation failed')
    expect(screen.getAllByText('Translation failed')).toHaveLength(2)
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
    expect(screen.queryByText(/Translated/)).not.toBeInTheDocument()
  })

  it('clears an earlier error when a new run starts', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await emitSubscription(link, { error: new Error('Translation failed') })

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByTestId('Error')).toBeEmptyDOMElement()
  })

  it('ignores a second Start while a run is in flight, keeping the first run', async () => {
    const link = new MockSubscriptionLink()
    const setup = vi.fn()
    const unsubscribed = vi.fn()
    link.onSetup(setup)
    link.onUnsubscribe(unsubscribed)
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await emitSubscription(link, report(55, 'Translated 2 of 4 parts', 6))

    fireEvent.click(screen.getByRole('button', { name: 'Start Spanish' }))

    expect(screen.getByTestId('Run')).toHaveTextContent(
      'Français 55 Translated 2 of 4 parts 6'
    )
    expect(setup).toHaveBeenCalledTimes(1)
    expect(unsubscribed).not.toHaveBeenCalled()
    expect(link.operation?.variables).toEqual(variables)
  })

  it.each([
    {
      outcome: 'finished',
      end: async (link: MockSubscriptionLink): Promise<void> =>
        await emitSubscription(
          link,
          report(100, 'Translation completed!', 12, true),
          true
        )
    },
    {
      outcome: 'errored',
      end: async (link: MockSubscriptionLink): Promise<void> =>
        await emitSubscription(link, { error: new Error('Translation failed') })
    },
    {
      outcome: 'cancelled',
      end: async (): Promise<void> =>
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        })
    }
  ])('reads the campaign again once a run has $outcome', async ({ end }) => {
    const subscriptionLink = new MockSubscriptionLink()
    const campaignRead: SpyMock = {
      ...getCampaignMock,
      result: vi.fn(() => getCampaignMock.result),
      maxUsageCount: 2
    }
    renderWithMocks(subscriptionLink, [campaignRead], <CampaignReader />)
    expect(await screen.findByTestId('Campaign')).toHaveTextContent(
      'campaignId'
    )
    expect(campaignRead.result).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await emitSubscription(
      subscriptionLink,
      report(55, 'Translated 2 of 4 parts', 6)
    )
    expect(campaignRead.result).toHaveBeenCalledTimes(1)

    await end(subscriptionLink)

    await waitFor(() => expect(campaignRead.result).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
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

  it('shows the editor’s own copy when the language is already being translated', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await emitSubscription(
      link,
      conflict('A translation of this campaign into 496 is running', {
        code: 'CONFLICT',
        field: 'languageId'
      })
    )

    const copy =
      'Français is already being translated. Try again when it has finished.'
    expect(screen.getByTestId('Error')).toHaveTextContent(copy)
    expect(screen.getAllByText(copy)).toHaveLength(2)
    expect(
      screen.queryByText('A translation of this campaign into 496 is running')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('shows the server’s message for any other refused run', async () => {
    const link = new MockSubscriptionLink()
    renderProvider(link)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await emitSubscription(
      link,
      conflict('campaign not found', { code: 'NOT_FOUND', field: 'campaignId' })
    )

    expect(screen.getByTestId('Error')).toHaveTextContent('campaign not found')
    expect(
      screen.queryByText(/already being translated/)
    ).not.toBeInTheDocument()
  })

  describe('thenSwapDefaultLanguage', () => {
    it('makes the language the default once the run completes, then says so', async () => {
      const subscriptionLink = new MockSubscriptionLink()
      renderWithMocks(subscriptionLink, [swapMock, getCampaignMock])
      fireEvent.click(screen.getByRole('button', { name: 'Start then swap' }))
      await emitSubscription(
        subscriptionLink,
        report(55, 'Translated 2 of 4 parts', 6)
      )
      expect(swapped).not.toHaveBeenCalled()

      await emitSubscription(
        subscriptionLink,
        report(100, 'Translation completed!', 12, true),
        true
      )

      await waitFor(() => expect(defaultLanguageChanged).toHaveBeenCalled())
      expect(swapped).toHaveBeenCalledTimes(1)
    })

    it('leaves the default alone when the run fails', async () => {
      const subscriptionLink = new MockSubscriptionLink()
      renderWithMocks(subscriptionLink, [swapMock, getCampaignMock])
      fireEvent.click(screen.getByRole('button', { name: 'Start then swap' }))

      await emitSubscription(subscriptionLink, {
        error: new Error('Translation failed')
      })

      expect(swapped).not.toHaveBeenCalled()
      expect(defaultLanguageChanged).not.toHaveBeenCalled()
    })

    it('leaves the default alone when the run is cancelled', async () => {
      const subscriptionLink = new MockSubscriptionLink()
      renderWithMocks(subscriptionLink, [swapMock, getCampaignMock])
      fireEvent.click(screen.getByRole('button', { name: 'Start then swap' }))
      await emitSubscription(
        subscriptionLink,
        report(55, 'Translated 2 of 4 parts', 6)
      )

      // Lets a swap the provider might have fired reach the link.
      await holdRequests(() =>
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      )
      await landRequests()

      expect(screen.getByTestId('Run')).toHaveTextContent('idle')
      expect(swapped).not.toHaveBeenCalled()
      expect(defaultLanguageChanged).not.toHaveBeenCalled()
    })

    it('shows the API’s message when the swap is refused for another reason', async () => {
      const subscriptionLink = new MockSubscriptionLink()
      renderWithMocks(subscriptionLink, [
        {
          ...swapMock,
          result: conflict('campaign not found', { code: 'NOT_FOUND' }).result
        }
      ])
      fireEvent.click(screen.getByRole('button', { name: 'Start then swap' }))

      await emitSubscription(
        subscriptionLink,
        report(100, 'Translation completed!', 12, true),
        true
      )

      expect(await screen.findByText('campaign not found')).toBeInTheDocument()
      expect(defaultLanguageChanged).not.toHaveBeenCalled()
    })
  })
})
