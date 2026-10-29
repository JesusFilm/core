import { ApolloLink, InMemoryCache } from '@apollo/client'
import { MockLink, MockSubscriptionLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { CAMPAIGN_UPDATE } from '../../../../libs/useCampaignUpdateMutation'
import { campaign } from '../../data'
import {
  emitSubscription,
  getCampaignMock,
  holdRequests,
  landRequests
} from '../../testing'
import {
  TranslationRunProvider,
  useTranslationRun
} from '../../TranslationRunProvider'

import { DefaultLanguageDialog } from './DefaultLanguageDialog'

const FRENCH = '496'

function swapResult(): Record<string, unknown> {
  return {
    data: {
      campaignUpdate: {
        __typename: 'Campaign',
        id: 'campaignId',
        title: 'Outreach 2026',
        slug: 'outreach-2026'
      }
    }
  }
}

function missingTexts(count: number): Record<string, unknown> {
  return {
    errors: [
      new GraphQLError(`${count} texts have no translation`, {
        extensions: { code: 'CONFLICT', field: 'defaultLanguageId', count }
      })
    ]
  }
}

function swapMock(
  result: () => Record<string, unknown>
): MockLink.MockedResponse {
  return {
    request: {
      query: CAMPAIGN_UPDATE,
      variables: { id: 'campaignId', input: { defaultLanguageId: FRENCH } }
    },
    result
  }
}

function completed(): MockSubscriptionLink.Result {
  return {
    result: {
      data: {
        campaignAiTranslateSubscription: {
          __typename: 'CampaignAiTranslateProgress',
          progress: 100,
          message: 'Translation completed!',
          translatedCount: 3,
          campaign: {
            __typename: 'Campaign',
            id: 'campaignId',
            titleTranslations: []
          }
        }
      }
    }
  }
}

/** The provider's run, and its Cancel, as the rest of the editor sees them. */
function RunProbe(): ReactElement {
  const { run, cancel } = useTranslationRun()
  return (
    <>
      <span data-testid="Run">
        {run == null ? 'idle' : `${run.languageName} ${run.mode}`}
      </span>
      <button onClick={cancel}>Cancel run</button>
    </>
  )
}

/** The dialog opened on French, as Settings opens it, closing as Settings does. */
function Harness({ onChanged }: { onChanged: () => void }): ReactElement {
  const [languageId, setLanguageId] = useState<string | undefined>(FRENCH)
  return (
    <>
      <RunProbe />
      <DefaultLanguageDialog
        campaign={campaign}
        languageId={languageId}
        onClose={() => setLanguageId(undefined)}
        onChanged={() => {
          setLanguageId(undefined)
          onChanged()
        }}
      />
    </>
  )
}

function renderDialog(mocks: MockLink.MockedResponse[]): {
  subscriptionLink: MockSubscriptionLink
  onChanged: ReturnType<typeof vi.fn>
} {
  const subscriptionLink = new MockSubscriptionLink()
  const onChanged = vi.fn()
  const link = ApolloLink.split(
    (operation) =>
      operation.operationName === 'CampaignAiTranslateSubscription',
    subscriptionLink,
    new MockLink(mocks)
  )
  render(
    <MockedProvider link={link} cache={new InMemoryCache()}>
      <SnackbarProvider>
        <TranslationRunProvider>
          <Harness onChanged={onChanged} />
        </TranslationRunProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
  return { subscriptionLink, onChanged }
}

/** Change, refused for 3 missing texts, then "Machine-translate missing", which closes the dialog. */
async function startSweep(): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: 'Change' }))
  const conflict = await screen.findByTestId('CampaignDefaultLanguageConflict')
  expect(
    within(conflict).getByText(
      '3 texts have no translation in Français yet, so it cannot become the default.'
    )
  ).toBeInTheDocument()
  fireEvent.click(
    within(conflict).getByRole('button', {
      name: 'Machine-translate missing into Français'
    })
  )
  await waitFor(() =>
    expect(
      screen.queryByTestId('CampaignDefaultLanguageDialog')
    ).not.toBeInTheDocument()
  )
}

describe('DefaultLanguageDialog', () => {
  it('changes the default straight away when no text is missing', async () => {
    const swapped = vi.fn(swapResult)
    const refetched = vi.fn(() => getCampaignMock.result)
    const { onChanged } = renderDialog([
      swapMock(swapped),
      { ...getCampaignMock, result: refetched }
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))

    await waitFor(() => expect(onChanged).toHaveBeenCalled())
    expect(swapped).toHaveBeenCalledTimes(1)
    expect(refetched).toHaveBeenCalled()
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('hands the sweep to the editor’s run and closes', async () => {
    const { subscriptionLink, onChanged } = renderDialog([
      swapMock(() => missingTexts(3))
    ])

    await startSweep()

    expect(screen.getByTestId('Run')).toHaveTextContent('Français missing')
    expect(subscriptionLink.operation?.variables).toEqual({
      campaignId: 'campaignId',
      languageId: FRENCH,
      mode: 'missing'
    })
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('changes the default once the run completes, telling the editor', async () => {
    const swapped = vi.fn(swapResult)
    const { subscriptionLink, onChanged } = renderDialog([
      swapMock(() => missingTexts(3)),
      swapMock(swapped),
      getCampaignMock
    ])
    await startSweep()

    await emitSubscription(subscriptionLink, completed(), true)

    await waitFor(() => expect(onChanged).toHaveBeenCalled())
    expect(swapped).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
  })

  it('leaves the default unchanged when the run is cancelled', async () => {
    const swapped = vi.fn(swapResult)
    const { onChanged } = renderDialog([
      swapMock(() => missingTexts(3)),
      swapMock(swapped)
    ])
    await startSweep()

    // Lets a swap the provider might have fired reach the link.
    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Cancel run' }))
    )
    await landRequests()

    expect(screen.getByTestId('Run')).toHaveTextContent('idle')
    expect(
      screen.getByText('Translation into Français cancelled. 0 strings kept.')
    ).toBeInTheDocument()
    expect(swapped).not.toHaveBeenCalled()
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('leaves the default unchanged when the run fails', async () => {
    const swapped = vi.fn(swapResult)
    const { subscriptionLink, onChanged } = renderDialog([
      swapMock(() => missingTexts(3)),
      swapMock(swapped)
    ])
    await startSweep()

    await emitSubscription(subscriptionLink, {
      error: new Error('Translation failed')
    })

    expect(screen.getAllByText('Translation failed')).not.toHaveLength(0)
    expect(swapped).not.toHaveBeenCalled()
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('says why when the change is refused again after the run, keeping the default and the dialog closed', async () => {
    const { subscriptionLink, onChanged } = renderDialog([
      swapMock(() => missingTexts(3)),
      swapMock(() => missingTexts(2))
    ])
    await startSweep()

    await emitSubscription(subscriptionLink, completed(), true)

    expect(
      await screen.findByText(
        '2 texts still have no translation in Français, so it cannot become the default.'
      )
    ).toBeInTheDocument()
    expect(onChanged).not.toHaveBeenCalled()
    expect(
      screen.queryByTestId('CampaignDefaultLanguageDialog')
    ).not.toBeInTheDocument()
  })
})
