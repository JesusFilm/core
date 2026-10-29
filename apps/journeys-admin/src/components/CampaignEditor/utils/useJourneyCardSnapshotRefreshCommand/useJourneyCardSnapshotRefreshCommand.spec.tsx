import Button from '@mui/material/Button'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { IdType, JourneyStatus } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_JOURNEY_BLOCK_SNAPSHOT_REFRESH } from '../../../../libs/useCampaignJourneyBlockSnapshotRefreshMutation'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../../libs/useCampaignJourneyByLinkLazyQuery'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { blockUpdateMock } from '../../styleTesting'
import { CommandProbe, QueriedEditor, SelectionProbe } from '../../testing'

import {
  JourneyCardBlock,
  matchesJourney,
  snapshotOf,
  useJourneyCardSnapshotRefreshCommand
} from './useJourneyCardSnapshotRefreshCommand'

const CARD_ID = 'landingJourneyId'
const JOURNEY_ID = 'landingJourneyId-journeyId'

const card = campaign.blocks.find(
  (block) => block.id === CARD_ID
) as JourneyCardBlock

/** The seeded campaign with the author having edited the card's snapshot by hand. */
const editedCampaign = {
  ...campaign,
  blocks: campaign.blocks.map((block) =>
    block.id === CARD_ID ? { ...block, snapshotEdited: true } : block
  )
}

function journeyMock(
  journey: Record<string, unknown> | null
): Record<string, unknown> {
  return {
    request: {
      query: GET_CAMPAIGN_JOURNEY_BY_LINK,
      variables: { id: JOURNEY_ID, idType: IdType.databaseId }
    },
    result: vi.fn(() => ({ data: { journey } }))
  }
}

const liveJourney = {
  __typename: 'Journey',
  id: JOURNEY_ID,
  title: 'Outreach, straight from the journey',
  description: 'What the journey says now.',
  slug: 'outreach-story',
  status: JourneyStatus.published
}

const sameJourney = {
  ...liveJourney,
  title: card.title,
  description: card.description
}

const refreshMock = {
  request: {
    query: CAMPAIGN_JOURNEY_BLOCK_SNAPSHOT_REFRESH,
    variables: { id: CARD_ID }
  },
  result: vi.fn(() => ({
    data: {
      campaignJourneyBlockSnapshotRefresh: {
        __typename: 'CampaignJourneyBlock',
        id: CARD_ID,
        title: liveJourney.title,
        description: liveJourney.description,
        snapshotEdited: false
      }
    }
  }))
}

const restoreMock = blockUpdateMock(card, {
  title: card.title,
  description: card.description,
  snapshotEdited: true
})

const restoreUneditedMock = blockUpdateMock(card, {
  title: card.title,
  description: card.description,
  snapshotEdited: false
})

function Harness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { refreshSnapshot, confirmDialog } =
    useJourneyCardSnapshotRefreshCommand()
  const currentCard = current.blocks.find(
    (block) => block.id === CARD_ID
  ) as JourneyCardBlock
  return (
    <>
      <Button
        onClick={() => {
          void refreshSnapshot(currentCard)
        }}
      >
        Refresh
      </Button>
      <span data-testid="CardText">
        {[currentCard.title, currentCard.description].join('|')}
      </span>
      {confirmDialog}
    </>
  )
}

async function renderHarness(
  journeyResponse: ReturnType<typeof journeyMock>,
  extraMocks: Array<Record<string, unknown>> = [],
  campaignProp = editedCampaign
): Promise<void> {
  render(
    <SnackbarProvider>
      <QueriedEditor
        mocks={[journeyResponse, ...extraMocks]}
        campaignProp={campaignProp}
        initialState={{ selectedBlockId: CARD_ID }}
      >
        <CommandUndoItem variant="button" />
        <CommandProbe />
        <SelectionProbe />
        <Harness />
      </QueriedEditor>
    </SnackbarProvider>
  )
  await screen.findByTestId('CardText')
}

describe('matchesJourney', () => {
  it('is true while the card reads as the journey, treating empty and missing descriptions alike', () => {
    expect(
      matchesJourney(
        { title: 'Title', description: null },
        { title: 'Title', description: '' }
      )
    ).toBe(true)
    expect(
      matchesJourney(
        { title: 'Title', description: 'Text' },
        { title: 'Title', description: 'Text' }
      )
    ).toBe(true)
  })

  it('is false when the title or the description differs', () => {
    expect(
      matchesJourney(
        { title: 'Mine', description: 'Text' },
        { title: 'Title', description: 'Text' }
      )
    ).toBe(false)
    expect(
      matchesJourney(
        { title: 'Title', description: 'Mine' },
        { title: 'Title', description: null }
      )
    ).toBe(false)
  })
})

describe('snapshotOf', () => {
  it('cuts a journey’s text to the caps the API snapshots to', () => {
    expect(
      snapshotOf({ title: 'x'.repeat(250), description: 'y'.repeat(1200) })
    ).toEqual({ title: 'x'.repeat(200), description: 'y'.repeat(1000) })
    expect(snapshotOf({ title: 'Title' })).toEqual({
      title: 'Title',
      description: null
    })
  })
})

describe('useJourneyCardSnapshotRefreshCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('confirms when the author edited the snapshot, then replaces both values as one Command', async () => {
    const lookup = journeyMock(liveJourney)
    await renderHarness(lookup, [refreshMock, restoreMock])
    expect(screen.getByTestId('CardText')).toHaveTextContent(
      'The outreach story|A short journey through the story.'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    const dialog = await screen.findByTestId(
      'CampaignJourneyCardSnapshotRefreshDialog'
    )
    expect(dialog).toHaveTextContent('differs from the journey’s')
    expect(dialog).toHaveTextContent('You can undo this afterwards.')
    expect(refreshMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Refresh' }))

    // Optimistic: the journey's text shows before the request returns.
    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'Outreach, straight from the journey|What the journey says now.'
      )
    )
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(CARD_ID)

    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignJourneyCardSnapshotRefreshDialog')
      ).not.toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'The outreach story|A short journey through the story.'
      )
    )
    await waitFor(() => expect(restoreMock.result).toHaveBeenCalled())
  })

  it('does nothing when the confirmation is cancelled', async () => {
    await renderHarness(journeyMock(liveJourney), [refreshMock])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    const dialog = await screen.findByTestId(
      'CampaignJourneyCardSnapshotRefreshDialog'
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignJourneyCardSnapshotRefreshDialog')
      ).not.toBeInTheDocument()
    )
    expect(refreshMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    expect(screen.getByTestId('CardText')).toHaveTextContent(
      'The outreach story|A short journey through the story.'
    )
  })

  it('refreshes without asking when the author never edited the snapshot, even if the journey has changed since', async () => {
    await renderHarness(
      journeyMock(liveJourney),
      [refreshMock, restoreUneditedMock],
      campaign
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(
      screen.queryByTestId('CampaignJourneyCardSnapshotRefreshDialog')
    ).not.toBeInTheDocument()
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CardText')).toHaveTextContent(
      'Outreach, straight from the journey|What the journey says now.'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restoreUneditedMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'The outreach story|A short journey through the story.'
      )
    )
  })

  it('does not ask, or write, when an unedited card already matches the journey', async () => {
    await renderHarness(journeyMock(sameJourney), [refreshMock], campaign)

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(await screen.findByText('Already matches the journey')).toBeVisible()
    expect(
      screen.queryByTestId('CampaignJourneyCardSnapshotRefreshDialog')
    ).not.toBeInTheDocument()
    expect(refreshMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('says it already matches, and clears the flag, when an edited card was undone back to the journey’s text', async () => {
    const clearFlagMock = {
      ...refreshMock,
      result: vi.fn(() => ({
        data: {
          campaignJourneyBlockSnapshotRefresh: {
            __typename: 'CampaignJourneyBlock',
            id: CARD_ID,
            title: card.title,
            description: card.description,
            snapshotEdited: false
          }
        }
      }))
    }
    await renderHarness(journeyMock(sameJourney), [clearFlagMock])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(await screen.findByText('Already matches the journey')).toBeVisible()
    expect(
      screen.queryByTestId('CampaignJourneyCardSnapshotRefreshDialog')
    ).not.toBeInTheDocument()
    await waitFor(() => expect(clearFlagMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('says so when the journey is no longer published', async () => {
    await renderHarness(journeyMock(null), [refreshMock])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeVisible()
    expect(
      screen.queryByTestId('CampaignJourneyCardSnapshotRefreshDialog')
    ).not.toBeInTheDocument()
    expect(refreshMock.result).not.toHaveBeenCalled()
  })

  it('shows the API’s message and rolls the card back when the refresh fails', async () => {
    const failing = {
      request: refreshMock.request,
      result: vi.fn(() => ({
        errors: [
          new GraphQLError('Journey not found or not published', {
            extensions: { code: 'BAD_USER_INPUT', field: 'id' }
          })
        ]
      }))
    }
    await renderHarness(journeyMock(liveJourney), [failing])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    const dialog = await screen.findByTestId(
      'CampaignJourneyCardSnapshotRefreshDialog'
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Refresh' }))

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeVisible()
    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'The outreach story|A short journey through the story.'
      )
    )
  })
})
