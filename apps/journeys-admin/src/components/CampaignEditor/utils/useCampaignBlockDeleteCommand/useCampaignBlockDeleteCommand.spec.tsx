import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BottomBar } from '../../BottomBar'
import { campaign } from '../../data'
import { BlocksProbe, QueriedEditor, SelectionProbe } from '../../testing'

import { siblingsOf } from './useCampaignBlockDeleteCommand'

const footerTerms = campaign.blocks.find(
  (block) => block.id === 'footerTermsId'
)!

const deleteMock = {
  delay: 200,
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'footerTermsId' } },
  result: vi.fn(() => ({
    data: {
      campaignBlockDelete: [
        {
          __typename: 'CampaignTypographyBlock',
          id: 'footerCopyrightId',
          parentOrder: 0
        },
        {
          __typename: 'CampaignButtonBlock',
          id: 'footerPrivacyId',
          parentOrder: 1
        }
      ]
    }
  }))
}

const restoreMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_RESTORE,
    variables: { id: 'footerTermsId' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockRestore: [
        campaign.blocks.find((block) => block.id === 'footerCopyrightId'),
        footerTerms,
        campaign.blocks.find((block) => block.id === 'footerPrivacyId')
      ]
    }
  }))
}

function renderEditor(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'footerTermsId' }}
      mocks={[deleteMock, restoreMock]}
    >
      <CommandUndoItem variant="button" />
      <SelectionProbe />
      <BlocksProbe />
      <BottomBar onSettingsClick={vi.fn()} onThemeClick={vi.fn()} />
    </QueriedEditor>
  )
}

describe('useCampaignBlockDeleteCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists a block’s live siblings in order, excluding itself', () => {
    expect(siblingsOf(campaign.blocks, footerTerms).map((b) => b.id)).toEqual([
      'footerCopyrightId',
      'footerPrivacyId'
    ])
  })

  it('deletes without confirmation, renumbers the siblings at once and selects the host', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-footerTermsId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('footerId')
    // Optimistic: gone and renumbered before the delete request returns.
    await waitFor(() =>
      expect(
        screen.queryByTestId('Block-footerTermsId')
      ).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
      'CampaignButtonBlock|footerId|1|'
    )
    expect(deleteMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
  })

  it('undoes through campaignBlockRestore, putting the block back in place and reselecting it', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-footerTermsId')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'footerTermsId'
    )
    // Optimistic: back in place before the restore request returns.
    await waitFor(() =>
      expect(screen.getByTestId('Block-footerTermsId')).toHaveTextContent(
        'CampaignButtonBlock|footerId|1|below||"Terms of Use"|null|CampaignLinkAction'
      )
    )
    expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
      'CampaignButtonBlock|footerId|2|'
    )
    expect(restoreMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(restoreMock.result).toHaveBeenCalled())
  })

  describe('sections', () => {
    const hero = campaign.blocks.find((block) => block.id === 'heroId')!
    const landingSections = [
      'heroId',
      'landingSwitcherId',
      'carouselId',
      'landingJourneyListId',
      'landingAnalyticsId'
    ]

    const sectionDeleteMock = {
      delay: 200,
      request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'heroId' } },
      result: vi.fn(() => ({
        data: {
          campaignBlockDelete: landingSections
            .slice(1)
            .map((id, parentOrder) => ({
              __typename: campaign.blocks.find((block) => block.id === id)!
                .__typename,
              id,
              parentOrder
            }))
        }
      }))
    }

    const sectionRestoreMock = {
      delay: 200,
      request: { query: CAMPAIGN_BLOCK_RESTORE, variables: { id: 'heroId' } },
      result: vi.fn(() => ({
        data: {
          campaignBlockRestore: [
            ...landingSections.map((id) =>
              campaign.blocks.find((block) => block.id === id)
            ),
            campaign.blocks.find((block) => block.id === 'heroButtonId')
          ]
        }
      }))
    }

    function renderSectionEditor(
      selectedBlockId = 'heroId',
      pageKind = CampaignPageKind.landing
    ): ReturnType<typeof render> {
      return render(
        <QueriedEditor
          initialState={{ selectedBlockId, pageKind }}
          mocks={[sectionDeleteMock, sectionRestoreMock]}
        >
          <CommandUndoItem variant="button" />
          <SelectionProbe />
          <BlocksProbe />
          <BottomBar onSettingsClick={vi.fn()} onThemeClick={vi.fn()} />
        </QueriedEditor>
      )
    }

    it('asks for confirmation, deletes on confirm, renumbers the page at once and selects the campaign row', async () => {
      renderSectionEditor()
      expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      const dialog = screen.getByTestId('CampaignSectionDeleteDialog')
      expect(dialog).toHaveTextContent('You can undo this afterwards.')
      expect(dialog).not.toHaveTextContent('from every region page')
      expect(screen.getByTestId('Block-heroId')).toBeInTheDocument()

      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
      await waitFor(() =>
        expect(screen.queryByTestId('Block-heroId')).not.toBeInTheDocument()
      )
      expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
        'CampaignRegionSwitcherBlock||0|'
      )
      expect(sectionDeleteMock.result).not.toHaveBeenCalled()
      await waitFor(() => expect(sectionDeleteMock.result).toHaveBeenCalled())
    })

    it('carries the "from every region page" warning on the Region Page', async () => {
      renderSectionEditor('regionHeaderId', CampaignPageKind.regionTemplate)
      expect(
        await screen.findByTestId('Block-regionHeaderId')
      ).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      const dialog = screen.getByTestId('CampaignSectionDeleteDialog')
      expect(dialog).toHaveTextContent(
        'This removes the section from every region page.'
      )
      expect(dialog).toHaveTextContent('You can undo this afterwards.')
    })

    it('restores the section with its children in place on undo', async () => {
      renderSectionEditor()
      expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
      fireEvent.click(
        within(screen.getByTestId('CampaignSectionDeleteDialog')).getByRole(
          'button',
          { name: 'Delete' }
        )
      )
      await waitFor(() => expect(sectionDeleteMock.result).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
      await waitFor(() =>
        expect(screen.getByTestId('Block-heroId')).toHaveTextContent(
          `CampaignHeroBlock||0||||${String(hero.__typename === 'CampaignHeroBlock' ? hero.align : '')}|`
        )
      )
      expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
        'CampaignRegionSwitcherBlock||1|'
      )
      expect(screen.getByTestId('Block-heroButtonId')).toHaveTextContent(
        'CampaignButtonBlock|heroId|0|'
      )
      expect(sectionRestoreMock.result).not.toHaveBeenCalled()
      await waitFor(() => expect(sectionRestoreMock.result).toHaveBeenCalled())
    })
  })
})
