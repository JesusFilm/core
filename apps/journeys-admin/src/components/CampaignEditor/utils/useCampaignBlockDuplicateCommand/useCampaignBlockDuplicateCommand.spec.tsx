import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_DUPLICATE } from '../../../../libs/useCampaignBlockDuplicateMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BottomBar } from '../../BottomBar'
import { campaign } from '../../data'
import { BlocksProbe, QueriedEditor, SelectionProbe } from '../../testing'

import { duplicateBlocks, subtreeOf } from './useCampaignBlockDuplicateCommand'

vi.mock('uuid', () => ({ v4: vi.fn() }))

const hero = campaign.blocks.find((block) => block.id === 'heroId')!

function copyIds(): () => string {
  const ids = ['heroCopyId', 'heroButtonCopyId']
  return () => ids.shift() ?? 'unexpectedId'
}

const expected = duplicateBlocks(campaign.blocks, hero, copyIds())

const duplicateMock = {
  delay: 200,
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
  delay: 200,
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
  delay: 200,
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

function renderEditor(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'heroId' }}
      mocks={[duplicateMock, deleteMock, restoreMock]}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <SelectionProbe />
      <BlocksProbe />
      <BottomBar onSettingsClick={vi.fn()} />
    </QueriedEditor>
  )
}

describe('useCampaignBlockDuplicateCommand', () => {
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
      title: 'Share the story of Christmas'
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

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroCopyId'
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-heroCopyId')).toHaveTextContent(
        'CampaignHeroBlock||1||||center|'
      )
    )
    expect(screen.getByTestId('Block-heroButtonCopyId')).toHaveTextContent(
      'CampaignButtonBlock|heroCopyId|0|below||"Choose your region"|null|CampaignScrollToBlockAction'
    )
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||2|'
    )
    expect(duplicateMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(duplicateMock.result).toHaveBeenCalled())
  })

  it('undoes by deleting the copy and reselecting the original; redo restores it', async () => {
    renderEditor()
    expect(await screen.findByTestId('Block-heroId')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    await waitFor(() => expect(duplicateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    await waitFor(() =>
      expect(screen.queryByTestId('Block-heroCopyId')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||1|'
    )
    expect(deleteMock.result).not.toHaveBeenCalled()
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroCopyId'
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-heroCopyId')).toHaveTextContent(
        'CampaignHeroBlock||1|'
      )
    )
    expect(screen.getByTestId('Block-landingSwitcherId')).toHaveTextContent(
      'CampaignRegionSwitcherBlock||2|'
    )
    await waitFor(() => expect(restoreMock.result).toHaveBeenCalled())
  })
})
