import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { CAMPAIGN_HERO_BLOCK_CREATE } from '../../../../libs/useCampaignSectionCreateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { BottomBar } from '../../BottomBar'
import { campaignWithColumns } from '../../data'
import { newSectionBlock } from '../../sectionTypes'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  SelectionProbe
} from '../../testing'

vi.mock('uuid', () => ({ v4: () => 'newId' }))

const slotRichText = campaignWithColumns.blocks.find(
  (block) => block.id === 'slotRichTextId'
)!
const newHero = newSectionBlock('CampaignHeroBlock', {
  id: 'newId',
  campaignId: 'campaignId',
  pageId: 'landingPageId',
  parentBlockId: 'slotLeftId',
  parentOrder: 0
})

/** The order the requests reach the API in. */
const calls: string[] = []

function deleteMock(id: string): Record<string, unknown> {
  return {
    delay: 50,
    request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id } },
    result: vi.fn(() => {
      calls.push(`delete ${id}`)
      return { data: { campaignBlockDelete: [] } }
    })
  }
}

function restoreMock(id: string, block: unknown): Record<string, unknown> {
  return {
    delay: 50,
    request: { query: CAMPAIGN_BLOCK_RESTORE, variables: { id } },
    result: vi.fn(() => {
      calls.push(`restore ${id}`)
      return { data: { campaignBlockRestore: [block] } }
    })
  }
}

const createMock = {
  delay: 50,
  request: {
    query: CAMPAIGN_HERO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: 'slotLeftId',
        parentOrder: 0
      }
    }
  },
  result: vi.fn(() => {
    calls.push('create newId')
    return { data: { campaignHeroBlockCreate: newHero } }
  })
}

const deleteOldMock = deleteMock('slotRichTextId')
const deleteOldAgainMock = deleteMock('slotRichTextId')
const deleteNewMock = deleteMock('newId')
const restoreOldMock = restoreMock('slotRichTextId', slotRichText)
const restoreNewMock = restoreMock('newId', newHero)

function renderEditor(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaignData={campaignWithColumns}
      initialState={{ selectedBlockId: 'slotRichTextId' }}
      mocks={[
        deleteOldMock,
        createMock,
        deleteNewMock,
        restoreOldMock,
        deleteOldAgainMock,
        restoreNewMock
      ]}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <BlocksProbe />
      <BottomBar onSettingsClick={vi.fn()} />
    </QueriedEditor>
  )
}

function slotBlocks(): string[] {
  return screen
    .getAllByTestId(/^Block-/)
    .filter((item) => item.textContent?.includes('|slotLeftId|'))
    .map((item) => item.getAttribute('data-testid') as string)
}

describe('useChangeTypeCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    calls.length = 0
  })

  it('deletes the slot’s section, then creates the chosen type in the same slot, as one Command', async () => {
    renderEditor()
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )
    expect(slotBlocks()).toEqual(['Block-slotRichTextId'])

    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    // The old section leaves at once.
    await waitFor(() =>
      expect(
        screen.queryByTestId('Block-slotRichTextId')
      ).not.toBeInTheDocument()
    )
    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    // A slot holds one section: the create waited for the delete.
    expect(calls).toEqual(['delete slotRichTextId', 'create newId'])
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-newId']))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('column')
  })

  it('undoes by deleting the new section and restoring the old one, and redoes the other way', async () => {
    renderEditor()
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))
    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-newId']))
    calls.length = 0

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotRichTextId'
    )
    await waitFor(() => expect(restoreOldMock.result).toHaveBeenCalled())
    expect(calls).toEqual(['delete newId', 'restore slotRichTextId'])
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-slotRichTextId']))

    calls.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(restoreNewMock.result).toHaveBeenCalled())
    expect(calls).toEqual(['delete slotRichTextId', 'restore newId'])
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-newId']))
  })
})
