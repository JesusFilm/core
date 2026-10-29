import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { campaign } from '../../data'
import {
  BlocksProbe,
  PendingTextSave,
  QueriedEditor,
  campaignCache,
  debounceSpyLink
} from '../../testing'
import { siblingRows, siblingsOf } from '../siblingsOf'
import { campaignFlushContext } from '../useCampaignCommand'

import { useCampaignBlockSoftDelete } from './useCampaignBlockSoftDelete'

const footerTerms = campaign.blocks.find(
  (block) => block.id === 'footerTermsId'
)!
const siblingsBefore = siblingsOf(campaign.blocks, footerTerms)
const siblingsAfter = siblingRows(siblingsBefore)

const deleteMock = {
  delay: 1000,
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'footerTermsId' } },
  result: vi.fn(() => ({ data: { campaignBlockDelete: siblingsAfter } }))
}

const restoreMock = {
  delay: 1000,
  request: {
    query: CAMPAIGN_BLOCK_RESTORE,
    variables: { id: 'footerTermsId' }
  },
  result: vi.fn(() => ({
    data: { campaignBlockRestore: [footerTerms, ...siblingsBefore] }
  }))
}

function Harness(): ReactElement {
  const { softDelete, restore } = useCampaignBlockSoftDelete()
  return (
    <>
      <button
        onClick={() => {
          void softDelete(footerTerms, siblingsAfter, {
            flushContext: campaignFlushContext(campaign.blocks, footerTerms)
          })
        }}
      >
        Delete
      </button>
      <button
        onClick={() => {
          void restore(footerTerms, [footerTerms, ...siblingsBefore])
        }}
      >
        Restore
      </button>
    </>
  )
}

describe('useCampaignBlockSoftDelete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('soft-deletes a block, showing the renumbered siblings at once, and restores it in place', async () => {
    render(
      <QueriedEditor mocks={[deleteMock, restoreMock]}>
        <BlocksProbe />
        <Harness />
      </QueriedEditor>
    )
    expect(await screen.findByTestId('Block-footerTermsId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

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

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() =>
      expect(screen.getByTestId('Block-footerTermsId')).toBeInTheDocument()
    )
    expect(screen.getByTestId('Block-footerPrivacyId')).toHaveTextContent(
      'CampaignButtonBlock|footerId|2|'
    )
    expect(restoreMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(restoreMock.result).toHaveBeenCalled())
  })

  it('sends the block’s text edits still waiting on their debounce before the delete, given a step’s context', async () => {
    const requests: string[] = []
    render(
      <QueriedEditor
        link={debounceSpyLink(requests, [{ ...deleteMock, delay: 0 }])}
        cache={campaignCache()}
      >
        <PendingTextSave block={footerTerms} />
        <BlocksProbe />
        <Harness />
      </QueriedEditor>
    )
    expect(await screen.findByTestId('Block-footerTermsId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Queue text save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(requests).toEqual(['PendingTextSave', 'CampaignBlockDelete'])
    )
  })
})
