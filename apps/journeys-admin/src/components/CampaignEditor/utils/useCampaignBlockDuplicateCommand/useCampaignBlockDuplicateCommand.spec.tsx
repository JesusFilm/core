import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_DUPLICATE } from '../../../../libs/useCampaignBlockDuplicateMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { campaign } from '../../data'
import { Inspector } from '../../Inspector'
import {
  BlocksProbe,
  PendingTextSave,
  QueriedEditor,
  SelectionProbe,
  UndoRedo,
  campaignCache,
  debounceSpyLink,
  holdRequests,
  landRequests
} from '../../testing'
import { subtreeOf } from '../subtreeOf'

import { duplicateBlocks } from './useCampaignBlockDuplicateCommand'

vi.mock('uuid', () => ({ v4: vi.fn() }))

const hero = campaign.blocks.find((block) => block.id === 'heroId')!

function copyIds(): () => string {
  const ids = ['heroCopyId', 'heroButtonCopyId']
  return () => ids.shift() ?? 'unexpectedId'
}

const expected = duplicateBlocks(campaign.blocks, hero, copyIds())

const duplicateMock = {
  request: {
    query: CAMPAIGN_BLOCK_DUPLICATE,
    variables: { id: 'heroId', idMap: expected.idMap }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockDuplicate: [
        ...expected.siblingsAfter,
        ...expected.copies.slice(1)
      ]
    }
  }))
}

const deleteMock = {
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'heroCopyId' } },
  result: vi.fn(() => ({
    data: {
      campaignBlockDelete: [
        'heroId',
        'landingSwitcherId',
        'carouselId',
        'landingJourneyListId',
        'landingAnalyticsId'
      ].map((id, parentOrder) => ({
        __typename: campaign.blocks.find((block) => block.id === id)!
          .__typename,
        id,
        parentOrder
      }))
    }
  }))
}

const restoreMock = {
  request: { query: CAMPAIGN_BLOCK_RESTORE, variables: { id: 'heroCopyId' } },
  result: vi.fn(() => ({
    data: {
      campaignBlockRestore: [
        ...expected.siblingsAfter,
        ...expected.copies.slice(1)
      ]
    }
  }))
}

const refusal = { errors: [{ message: 'The request was refused' }] }

function renderEditor(
  mocks: MockLink.MockedResponse[] = [duplicateMock, deleteMock, restoreMock]
): ReturnType<typeof render> {
  return render(
    <QueriedEditor initialState={{ selectedBlockId: 'heroId' }} mocks={mocks}>
      <UndoRedo />
      <SelectionProbe />
      <BlocksProbe />
      <Inspector role="member" />
    </QueriedEditor>
  )
}

function renderWithPendingText(
  requests: string[],
  pendingBlock: { __typename: string; id: string } = hero
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      link={debounceSpyLink(requests, [duplicateMock])}
      cache={campaignCache()}
      initialState={{ selectedBlockId: 'heroId' }}
    >
      <PendingTextSave block={pendingBlock} />
      <BlocksProbe />
      <Inspector role="member" />
    </QueriedEditor>
  )
}

describe('useCampaignBlockDuplicateCommand', () => {
  afterEach(() => vi.useRealTimers())

  beforeEach(() => {
    vi.clearAllMocks()
    const nextId = copyIds()
    vi.mocked(uuidv4).mockImplementation(nextId)
  })

  it('collects a block with its children, parents first', () => {
    expect(
      subtreeOf(campaign.blocks, 'heroId').map((block) => block.id)
    ).toEqual(['heroId', 'heroButtonId'])
  })

  it('builds the copy under new ids with references remapped, right after the original', () => {
    const [copy, buttonCopy] = expected.copies

    expect(copy).toMatchObject({
      __typename: 'CampaignHeroBlock',
      id: 'heroCopyId',
      parentBlockId: null,
      parentOrder: 1,
      title: 'Share the story of Outreach'
    })
    expect(buttonCopy).toMatchObject({
      __typename: 'CampaignButtonBlock',
      id: 'heroButtonCopyId',
      parentBlockId: 'heroCopyId',
      parentOrder: 0,
      label: 'Choose your region',
      action: {
        __typename: 'CampaignScrollToBlockAction',
        parentBlockId: 'heroButtonCopyId',
        // The target sits outside the copy, so it is kept.
        blockId: 'landingSwitcherId'
      }
    })
    expect(expected.idMap).toEqual([
      { oldId: 'heroId', newId: 'heroCopyId' },
      { oldId: 'heroButtonId', newId: 'heroButtonCopyId' }
    ])
    expect(
      expected.siblingsAfter.map((block) => [block.id, block.parentOrder])
    ).toEqual([
      ['heroId', 0],
      ['heroCopyId', 1],
      ['landingSwitcherId', 2],
      ['carouselId', 3],
      ['landingJourneyListId', 4],
      ['landingAnalyticsId', 5]
    ])
  })

  it('remaps an action target that points inside the copy', () => {
    const selfLinked = campaign.blocks.map((block) =>
      block.id === 'heroButtonId' && block.__typename === 'CampaignButtonBlock'
        ? {
            ...block,
            action: {
              __typename: 'CampaignScrollToBlockAction' as const,
              parentBlockId: 'heroButtonId',
              blockId: 'heroId'
            }
          }
        : block
    )

    const { copies } = duplicateBlocks(selfLinked, hero, copyIds())

    expect(copies[1]).toMatchObject({
      action: { blockId: 'heroCopyId', parentBlockId: 'heroButtonCopyId' }
    })
  })

  it('duplicates as one Command, showing the copy with its children at once, and selects it', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    )

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroCopyId'
    )
    expect(screen.getByTestId('Block-heroCopyId')).toHaveTextContent(
      'CampaignHeroBlock||1||||center|'
    )
    expect(screen.getByTestId('Block-heroButtonCopyId')).toHaveTextContent(
      'CampaignButtonBlock|heroCopyId|0|below||"Choose your region"|null|CampaignScrollToBlockAction'
    )
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||2|'
    )
    expect(duplicateMock.result).not.toHaveBeenCalled()
    await landRequests()
    expect(duplicateMock.result).toHaveBeenCalled()
  })

  it('sends a text edit still waiting on its debounce before the duplicate, so the copy is not made from stale text', async () => {
    const requests: string[] = []
    renderWithPendingText(requests)
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Queue text save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    await waitFor(() =>
      expect(requests).toEqual(['PendingTextSave', 'CampaignBlockDuplicate'])
    )
  })

  it('sends a text edit of one of its Extras still waiting on its debounce before the duplicate, so the copy keeps the new text', async () => {
    const requests: string[] = []
    renderWithPendingText(requests, {
      __typename: 'CampaignButtonBlock',
      id: 'heroButtonId'
    })
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Queue text save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    await waitFor(() =>
      expect(requests).toEqual(['PendingTextSave', 'CampaignBlockDuplicate'])
    )
  })

  it('raises the API message in the error snackbar when the duplicate is refused', async () => {
    renderEditor([{ ...duplicateMock, result: refusal }])
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('sends no delete on undo, and duplicates again on redo, when the duplicate was refused', async () => {
    renderEditor([
      { ...duplicateMock, result: refusal },
      duplicateMock,
      deleteMock,
      restoreMock
    ])
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(duplicateMock.result).toHaveBeenCalledTimes(1))
    expect(deleteMock.result).not.toHaveBeenCalled()
    expect(restoreMock.result).not.toHaveBeenCalled()
    expect(
      screen.queryByText(/No more mocked responses/)
    ).not.toBeInTheDocument()
  })

  it('raises the API message when the undo delete or the redo restore is refused', async () => {
    renderEditor([
      duplicateMock,
      { ...deleteMock, result: refusal },
      { ...restoreMock, result: { errors: [{ message: 'Restore refused' }] } }
    ])
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    await waitFor(() => expect(duplicateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    expect(await screen.findByText('Restore refused')).toBeInTheDocument()
  })

  it('undoes by deleting the copy and reselecting the original; redo restores it', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    await waitFor(() => expect(duplicateMock.result).toHaveBeenCalled())

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    )

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    expect(screen.queryByTestId('Block-heroCopyId')).not.toBeInTheDocument()
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||1|'
    )
    expect(deleteMock.result).not.toHaveBeenCalled()
    await landRequests()
    expect(deleteMock.result).toHaveBeenCalled()

    await holdRequests(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    )

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroCopyId'
    )
    expect(screen.getByTestId('Block-heroCopyId')).toHaveTextContent(
      'CampaignHeroBlock||1|'
    )
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||2|'
    )
    expect(restoreMock.result).not.toHaveBeenCalled()
    await landRequests()
    expect(restoreMock.result).toHaveBeenCalled()
  })
})
