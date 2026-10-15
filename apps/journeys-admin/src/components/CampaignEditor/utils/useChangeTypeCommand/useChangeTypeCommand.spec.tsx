import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import { CAMPAIGN_HERO_BLOCK_CREATE } from '../../../../libs/useCampaignSectionCreateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { campaignWithColumns } from '../../data'
import { Inspector } from '../../Inspector'
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

const refusal = { errors: [{ message: 'The request was refused' }] }

const deleteOldMock = deleteMock('slotRichTextId')
const deleteOldAgainMock = deleteMock('slotRichTextId')
const deleteNewMock = deleteMock('newId')
const restoreOldMock = restoreMock('slotRichTextId', slotRichText)
const restoreNewMock = restoreMock('newId', newHero)

function renderEditor(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaignData={campaignWithColumns}
      initialState={{
        selectedBlockId: 'slotRichTextId',
        inspectorTab: 'settings'
      }}
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
      <Inspector isManager={false} />
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

  it('restores the old section when the create is refused, so the column is not left empty', async () => {
    const failingCreate = { ...createMock, error: new Error('refused') }
    render(
      <QueriedEditor
        campaignData={campaignWithColumns}
        initialState={{
          selectedBlockId: 'slotRichTextId',
          inspectorTab: 'settings'
        }}
        mocks={[deleteOldMock, failingCreate, restoreOldMock]}
      >
        <BlocksProbe />
        <Inspector isManager={false} />
      </QueriedEditor>
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

    await waitFor(() => expect(restoreOldMock.result).toHaveBeenCalled())
    expect(calls).toEqual(['delete slotRichTextId', 'restore slotRichTextId'])
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-slotRichTextId']))
  })

  it('raises the API message when the delete is refused, and creates nothing', async () => {
    render(
      <QueriedEditor
        campaignData={campaignWithColumns}
        initialState={{
          selectedBlockId: 'slotRichTextId',
          inspectorTab: 'settings'
        }}
        mocks={[{ ...deleteOldMock, result: refusal }, createMock]}
      >
        <BlocksProbe />
        <Inspector isManager={false} />
      </QueriedEditor>
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
    expect(createMock.result).not.toHaveBeenCalled()
  })

  it('raises the API message when the create is refused, and still restores the old section', async () => {
    render(
      <QueriedEditor
        campaignData={campaignWithColumns}
        initialState={{
          selectedBlockId: 'slotRichTextId',
          inspectorTab: 'settings'
        }}
        mocks={[
          deleteOldMock,
          { ...createMock, result: refusal },
          restoreOldMock
        ]}
      >
        <BlocksProbe />
        <Inspector isManager={false} />
      </QueriedEditor>
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
    await waitFor(() => expect(restoreOldMock.result).toHaveBeenCalled())
  })

  it('stays quiet when an undo finds the never-created section missing, but raises a refused restore', async () => {
    const failingCreate = { ...createMock, error: new Error('refused') }
    render(
      <QueriedEditor
        campaignData={campaignWithColumns}
        initialState={{
          selectedBlockId: 'slotRichTextId',
          inspectorTab: 'settings'
        }}
        mocks={[
          deleteOldMock,
          failingCreate,
          restoreOldMock,
          { ...deleteNewMock, error: new Error('NOT_FOUND') },
          {
            ...restoreMock('slotRichTextId', slotRichText),
            result: { errors: [{ message: 'Restore refused' }] }
          }
        ]}
      >
        <CommandUndoItem variant="button" />
        <BlocksProbe />
        <Inspector isManager={false} />
      </QueriedEditor>
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))
    await waitFor(() => expect(restoreOldMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(await screen.findByText('Restore refused')).toBeInTheDocument()
    expect(screen.queryByText('NOT_FOUND')).not.toBeInTheDocument()
  })

  it('runs the whole change again on redo when the create was refused, instead of restoring the section it never made', async () => {
    const failingCreate = { ...createMock, error: new Error('refused') }
    const deleteMissingNew = {
      ...deleteNewMock,
      error: new Error('NOT_FOUND')
    }
    const restoreOldOnUndo = restoreMock('slotRichTextId', slotRichText)
    render(
      <QueriedEditor
        campaignData={campaignWithColumns}
        initialState={{
          selectedBlockId: 'slotRichTextId',
          inspectorTab: 'settings'
        }}
        mocks={[
          deleteOldMock,
          failingCreate,
          restoreOldMock,
          deleteMissingNew,
          restoreOldOnUndo,
          deleteOldAgainMock,
          createMock
        ]}
      >
        <CommandUndoItem variant="button" />
        <CommandRedoItem variant="button" />
        <BlocksProbe />
        <Inspector isManager={false} />
      </QueriedEditor>
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))
    await waitFor(() => expect(restoreOldMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(restoreOldOnUndo.result).toHaveBeenCalled())
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-slotRichTextId']))
    calls.length = 0

    fireEvent.click(await screen.findByRole('button', { name: 'Redo' }))

    await waitFor(() =>
      expect(calls).toEqual(['delete slotRichTextId', 'create newId'])
    )
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-newId']))
    expect(screen.queryByText('NOT_FOUND')).not.toBeInTheDocument()
  })

  it('still restores the old section on undo when the new one was never created', async () => {
    const failingCreate = { ...createMock, error: new Error('refused') }
    const deleteMissingNew = {
      ...deleteNewMock,
      error: new Error('NOT_FOUND')
    }
    render(
      <QueriedEditor
        campaignData={campaignWithColumns}
        initialState={{
          selectedBlockId: 'slotRichTextId',
          inspectorTab: 'settings'
        }}
        mocks={[
          deleteOldMock,
          failingCreate,
          restoreOldMock,
          deleteMissingNew,
          restoreMock('slotRichTextId', slotRichText)
        ]}
      >
        <CommandUndoItem variant="button" />
        <BlocksProbe />
        <Inspector isManager={false} />
      </QueriedEditor>
    )
    await waitFor(() =>
      expect(screen.getByTestId('Block-slotRichTextId')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))
    await waitFor(() => expect(restoreOldMock.result).toHaveBeenCalled())
    calls.length = 0

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(calls).toEqual(['restore slotRichTextId']))
    await waitFor(() => expect(slotBlocks()).toEqual(['Block-slotRichTextId']))
  })
})
