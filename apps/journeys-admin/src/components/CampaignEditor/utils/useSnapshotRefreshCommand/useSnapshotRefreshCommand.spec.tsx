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
import { CAMPAIGN_JOURNEY_BLOCK_UPDATE_TEXT } from '../../../../libs/useCampaignBlockTextMutation'
import { CAMPAIGN_JOURNEY_BLOCK_SNAPSHOT_REFRESH } from '../../../../libs/useCampaignJourneyBlockSnapshotRefreshMutation'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../../libs/useCampaignJourneyByLinkLazyQuery'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { CommandProbe, QueriedEditor, SelectionProbe } from '../../testing'

import {
  JourneyCardBlock,
  isSnapshotEdited,
  snapshotOf,
  useSnapshotRefreshCommand
} from './useSnapshotRefreshCommand'

const CARD_ID = 'landingJourneyId'
const JOURNEY_ID = 'landingJourneyId-journeyId'

const card = campaign.blocks.find(
  (block) => block.id === CARD_ID
) as JourneyCardBlock

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
  title: 'Christmas, straight from the journey',
  description: 'What the journey says now.',
  slug: 'christmas-story',
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
        description: liveJourney.description
      }
    }
  }))
}

const restoreMock = {
  request: {
    query: CAMPAIGN_JOURNEY_BLOCK_UPDATE_TEXT,
    variables: {
      id: CARD_ID,
      input: { title: card.title, description: card.description }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignJourneyBlockUpdate: {
        __typename: 'CampaignJourneyBlock',
        id: CARD_ID,
        title: card.title,
        description: card.description
      }
    }
  }))
}

function Harness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { refreshSnapshot, confirmDialog } = useSnapshotRefreshCommand()
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
  extraMocks: Array<Record<string, unknown>> = []
): Promise<void> {
  render(
    <SnackbarProvider>
      <QueriedEditor mocks={[journeyResponse, ...extraMocks]}>
        <CommandUndoItem variant="button" />
        <CommandProbe />
        <SelectionProbe />
        <Harness />
      </QueriedEditor>
    </SnackbarProvider>
  )
  await screen.findByTestId('CardText')
}

describe('isSnapshotEdited', () => {
  it('is false while the card matches the journey, treating empty and missing descriptions alike', () => {
    expect(
      isSnapshotEdited(
        { title: 'Title', description: null },
        { title: 'Title', description: '' }
      )
    ).toBe(false)
    expect(
      isSnapshotEdited(
        { title: 'Title', description: 'Text' },
        { title: 'Title', description: 'Text' }
      )
    ).toBe(false)
  })

  it('is true when the title or the description differs', () => {
    expect(
      isSnapshotEdited(
        { title: 'Mine', description: 'Text' },
        { title: 'Title', description: 'Text' }
      )
    ).toBe(true)
    expect(
      isSnapshotEdited(
        { title: 'Title', description: 'Mine' },
        { title: 'Title', description: null }
      )
    ).toBe(true)
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

describe('useSnapshotRefreshCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('confirms when the author edited the snapshot, then replaces both values as one Command', async () => {
    const lookup = journeyMock(liveJourney)
    await renderHarness(lookup, [refreshMock, restoreMock])
    expect(screen.getByTestId('CardText')).toHaveTextContent(
      'The Christmas story|A short journey through the nativity.'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    const dialog = await screen.findByTestId('CampaignSnapshotRefreshDialog')
    expect(dialog).toHaveTextContent('differs from the journey’s')
    expect(dialog).toHaveTextContent('You can undo this afterwards.')
    expect(refreshMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Refresh' }))

    // Optimistic: the journey's text shows before the request returns.
    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'Christmas, straight from the journey|What the journey says now.'
      )
    )
    await waitFor(() => expect(refreshMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(CARD_ID)

    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignSnapshotRefreshDialog')
      ).not.toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'The Christmas story|A short journey through the nativity.'
      )
    )
    await waitFor(() => expect(restoreMock.result).toHaveBeenCalled())
  })

  it('does nothing when the confirmation is cancelled', async () => {
    await renderHarness(journeyMock(liveJourney), [refreshMock])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    const dialog = await screen.findByTestId('CampaignSnapshotRefreshDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignSnapshotRefreshDialog')
      ).not.toBeInTheDocument()
    )
    expect(refreshMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    expect(screen.getByTestId('CardText')).toHaveTextContent(
      'The Christmas story|A short journey through the nativity.'
    )
  })

  it('does not ask, or write, when the card already matches the journey', async () => {
    await renderHarness(journeyMock(sameJourney), [refreshMock])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(await screen.findByText('Already matches the journey')).toBeVisible()
    expect(
      screen.queryByTestId('CampaignSnapshotRefreshDialog')
    ).not.toBeInTheDocument()
    expect(refreshMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('says so when the journey is no longer published', async () => {
    await renderHarness(journeyMock(null), [refreshMock])

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeVisible()
    expect(
      screen.queryByTestId('CampaignSnapshotRefreshDialog')
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
    const dialog = await screen.findByTestId('CampaignSnapshotRefreshDialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Refresh' }))

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeVisible()
    await waitFor(() =>
      expect(screen.getByTestId('CardText')).toHaveTextContent(
        'The Christmas story|A short journey through the nativity.'
      )
    )
  })
})
