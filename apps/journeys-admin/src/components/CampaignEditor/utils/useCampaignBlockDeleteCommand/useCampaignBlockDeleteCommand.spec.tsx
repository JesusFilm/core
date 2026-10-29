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
import { campaign } from '../../data'
import { Inspector } from '../../Inspector'
import { BlocksProbe, QueriedEditor, SelectionProbe } from '../../testing'

const footerTerms = campaign.blocks.find(
  (block) => block.id === 'footerTermsId'
)!

const deleteMock = {
  delay: 1000,
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
  delay: 1000,
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

const refusal = { errors: [{ message: 'The request was refused' }] }

function renderEditor(
  mocks: Array<Record<string, unknown>> = [deleteMock, restoreMock]
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'footerTermsId' }}
      mocks={mocks}
    >
      <CommandUndoItem variant="button" />
      <SelectionProbe />
      <BlocksProbe />
      <Inspector role="member" />
    </QueriedEditor>
  )
}

describe('useCampaignBlockDeleteCommand', () => {
  beforeEach(() => vi.clearAllMocks())

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

  it('raises the API message in the error snackbar when the delete is refused', async () => {
    renderEditor([{ ...deleteMock, result: refusal }])
    expect(await screen.findByTestId('Block-footerTermsId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('raises the API message when the undo restore is refused', async () => {
    renderEditor([deleteMock, { ...restoreMock, result: refusal }])
    expect(await screen.findByTestId('Block-footerTermsId')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
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
      delay: 1000,
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
      delay: 1000,
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
          <Inspector role="member" />
        </QueriedEditor>
      )
    }

    it('asks for confirmation, deletes on confirm, renumbers the page at once and selects the campaign', async () => {
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

    it('drops the section’s children with it, and the undo shows them again before the restore lands', async () => {
      renderSectionEditor()
      expect(
        await screen.findByTestId('Block-heroButtonId')
      ).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
      fireEvent.click(
        within(screen.getByTestId('CampaignSectionDeleteDialog')).getByRole(
          'button',
          { name: 'Delete' }
        )
      )

      await waitFor(() =>
        expect(
          screen.queryByTestId('Block-heroButtonId')
        ).not.toBeInTheDocument()
      )
      await waitFor(() => expect(sectionDeleteMock.result).toHaveBeenCalled())
      expect(screen.queryByTestId('Block-heroButtonId')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      expect(await screen.findByTestId('Block-heroButtonId')).toHaveTextContent(
        'CampaignButtonBlock|heroId|0|'
      )
      expect(sectionRestoreMock.result).not.toHaveBeenCalled()
      await waitFor(() => expect(sectionRestoreMock.result).toHaveBeenCalled())
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
