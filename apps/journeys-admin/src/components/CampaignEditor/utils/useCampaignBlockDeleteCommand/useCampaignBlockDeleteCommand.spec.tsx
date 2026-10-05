import { fireEvent, render, screen, waitFor } from '@testing-library/react'

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
      <BottomBar onSettingsClick={vi.fn()} />
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
})
