import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BottomBar } from '../../BottomBar'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { BlocksProbe, QueriedEditor, SelectionProbe } from '../../testing'

import {
  currentSiblings,
  reorderedSiblings,
  useCampaignBlockOrderCommand
} from './useCampaignBlockOrderCommand'

const hero = campaign.blocks.find((block) => block.id === 'heroId')!
const switcher = campaign.blocks.find(
  (block) => block.id === 'landingSwitcherId'
)!
const footerPrivacy = campaign.blocks.find(
  (block) => block.id === 'footerPrivacyId'
)!

function sectionRows(order: string[]): Array<Record<string, unknown>> {
  return order.map((id, parentOrder) => ({
    __typename: campaign.blocks.find((block) => block.id === id)!.__typename,
    id,
    parentOrder
  }))
}

const moveUpMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'landingSwitcherId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: sectionRows([
        'landingSwitcherId',
        'heroId',
        'carouselId',
        'landingJourneyListId',
        'landingAnalyticsId'
      ])
    }
  }))
}

const moveBackMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'landingSwitcherId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: sectionRows([
        'heroId',
        'landingSwitcherId',
        'carouselId',
        'landingJourneyListId',
        'landingAnalyticsId'
      ])
    }
  }))
}

const crossBodyMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'footerPrivacyId', parentOrder: 0, placement: 'above' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerPrivacyId',
          parentOrder: 0,
          placement: 'above'
        },
        {
          __typename: 'CampaignTypographyBlock',
          id: 'footerCopyrightId',
          parentOrder: 1,
          placement: 'below'
        },
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerTermsId',
          parentOrder: 2,
          placement: 'below'
        }
      ]
    }
  }))
}

function CrossBodyHarness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const privacy = current.blocks.find(
    (block) => block.id === 'footerPrivacyId'
  )!
  return (
    <Button
      onClick={() => addBlockOrder(privacy, 0, CampaignChildPlacement.above)}
    >
      Move above
    </Button>
  )
}

function renderEditor(children?: ReactElement): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'landingSwitcherId' }}
      mocks={[moveUpMock, moveBackMock, crossBodyMock]}
    >
      <CommandUndoItem variant="button" />
      <SelectionProbe />
      <BlocksProbe />
      <BottomBar onSettingsClick={vi.fn()} onThemeClick={vi.fn()} />
      {children}
    </QueriedEditor>
  )
}

describe('useCampaignBlockOrderCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('reorderedSiblings', () => {
    it('places the block at the position and renumbers the page’s sections', () => {
      expect(
        reorderedSiblings(campaign.blocks, hero, 2).map((row) => [
          row.id,
          row.parentOrder
        ])
      ).toEqual([
        ['landingSwitcherId', 0],
        ['carouselId', 1],
        ['heroId', 2],
        ['landingJourneyListId', 3],
        ['landingAnalyticsId', 4]
      ])
    })

    it('clamps a position past the end and carries an Extra’s new placement', () => {
      const rows = reorderedSiblings(
        campaign.blocks,
        footerPrivacy,
        9,
        CampaignChildPlacement.above
      )

      expect(rows.map((row) => [row.id, row.parentOrder])).toEqual([
        ['footerCopyrightId', 0],
        ['footerTermsId', 1],
        ['footerPrivacyId', 2]
      ])
      expect(rows[2]).toMatchObject({ placement: 'above' })
      expect(rows[0]).toMatchObject({ placement: 'below' })
    })
  })

  it('lists the current order, the block included, for undo', () => {
    expect(
      currentSiblings(campaign.blocks, switcher).map((row) => [
        row.id,
        row.parentOrder
      ])
    ).toEqual([
      ['heroId', 0],
      ['landingSwitcherId', 1],
      ['carouselId', 2],
      ['landingJourneyListId', 3],
      ['landingAnalyticsId', 4]
    ])
  })

  it('moves a section with the bar’s arrow as one Command, renumbering at once, and undoes it', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-heroId')).toHaveTextContent(
      'CampaignHeroBlock||0|'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingSwitcherId'
    )
    // Optimistic: renumbered before the request returns.
    await waitFor(() =>
      expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
        'CampaignRegionSwitcherBlock||0|'
      )
    )
    expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
      'CampaignHeroBlock||1|'
    )
    expect(moveUpMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(moveUpMock.result).toHaveBeenCalled())
    // Now first on the page, Move up is spent.
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
        'CampaignRegionSwitcherBlock||1|'
      )
    )
    expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
      'CampaignHeroBlock||0|'
    )
    expect(moveBackMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(moveBackMock.result).toHaveBeenCalled())
  })

  it('moves an Extra across the Section Body with its placement in the same Command', async () => {
    renderEditor(<CrossBodyHarness />)
    expect(
      await screen.findByTestId('Block-footerPrivacyId')
    ).toHaveTextContent('CampaignButtonBlock|footerId|2|below|')

    fireEvent.click(screen.getByRole('button', { name: 'Move above' }))

    await waitFor(() =>
      expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
        'CampaignButtonBlock|footerId|0|above|'
      )
    )
    expect(screen.getByTestId('Block-footerCopyrightId')).toHaveTextContent(
      'CampaignTypographyBlock|footerId|1|below|'
    )
    await waitFor(() => expect(crossBodyMock.result).toHaveBeenCalled())
  })
})
