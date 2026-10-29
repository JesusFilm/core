import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE } from '../../../../libs/useCampaignTypographyBlockCreateMutation'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BlocksProbe, CommandProbe, QueriedEditor } from '../../testing'

import { useCampaignAddCommand } from './useCampaignAddCommand'

vi.mock('uuid', () => ({ v4: () => 'newId' }))

/** A text Extra the journey list's note sits above, as the API creates it: last. */
const newText = {
  __typename: 'CampaignTypographyBlock',
  id: 'newId',
  campaignId: 'campaignId',
  pageId: 'landingPageId',
  regionId: null,
  parentBlockId: 'landingJourneyListId',
  parentOrder: 3,
  content: '',
  contentTranslations: [],
  typographyVariant: null,
  align: null,
  color: null,
  placement: 'above'
}

const createMock = {
  delay: 100,
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'landingJourneyListId',
        placement: 'above'
      }
    }
  },
  result: vi.fn(() => ({ data: { campaignTypographyBlockCreate: newText } }))
}

const orderMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'newId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignTypographyBlock',
          id: 'journeyListNoteId',
          parentOrder: 0,
          placement: 'above'
        },
        {
          __typename: 'CampaignTypographyBlock',
          id: 'newId',
          parentOrder: 1,
          placement: 'above'
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingJourneyId',
          parentOrder: 2
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingDraftJourneyId',
          parentOrder: 3
        }
      ]
    }
  }))
}

const deleteMock = {
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'newId' } },
  result: vi.fn(() => ({
    data: {
      campaignBlockDelete: [
        {
          __typename: 'CampaignTypographyBlock',
          id: 'journeyListNoteId',
          parentOrder: 0
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingJourneyId',
          parentOrder: 1
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingDraftJourneyId',
          parentOrder: 2
        }
      ]
    }
  }))
}

function AddText(): ReactElement {
  const { addExtra } = useCampaignAddCommand()
  return (
    <button onClick={() => addExtra('CampaignTypographyBlock')}>
      Add text
    </button>
  )
}

/** The block's `parentOrder` as `BlocksProbe` lists it. */
function parentOrderOf(id: string): string {
  return (screen.getByTestId(`Block-${id}`).textContent ?? '').split('|')[2]
}

describe('useCampaignAddCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds an Extra right after the selected Extra as one Command, ahead of its next sibling; one undo removes it', async () => {
    render(
      <QueriedEditor
        initialState={{ selectedBlockId: 'journeyListNoteId' }}
        mocks={[createMock, orderMock, deleteMock]}
      >
        <CommandUndoItem variant="button" />
        <CommandProbe />
        <BlocksProbe />
        <AddText />
      </QueriedEditor>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Add text' }))

    // Shown at once after the note, the note's next sibling shifted.
    await screen.findByTestId('Block-newId')
    expect(parentOrderOf('newId')).toBe('1')
    expect(parentOrderOf('landingJourneyId')).toBe('2')
    expect(parentOrderOf('landingDraftJourneyId')).toBe('3')
    expect(createMock.result).not.toHaveBeenCalled()

    // The create lands it last; the order mutation moves it after the note.
    await waitFor(() => expect(orderMock.result).toHaveBeenCalled())
    await waitFor(() => expect(parentOrderOf('newId')).toBe('1'))
    expect(parentOrderOf('journeyListNoteId')).toBe('0')
    expect(parentOrderOf('landingJourneyId')).toBe('2')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.queryByTestId('Block-newId')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    expect(parentOrderOf('landingJourneyId')).toBe('1')
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })
})
