import { fireEvent, render, screen, within } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithColumns } from '../../data'
import { SelectionProbe, StaticEditor } from '../../testing'
import type { CanvasBlock } from '../canvasBlock'
import { CanvasSection } from '../CanvasSection'

const columns = transformCampaignBlocks(campaignWithColumns.blocks).find(
  (block) => block.id === 'columnsId'
) as CanvasBlock

/** The Columns section once the left slot's Rich Text was changed for a new section of its own id. */
const changed = {
  ...columns,
  children: columns.children.map((slot) =>
    slot.id === 'slotLeftId'
      ? {
          ...slot,
          children: slot.children.map((section) => ({
            ...section,
            id: 'slotNewSectionId'
          }))
        }
      : slot
  )
}

/** The campaign holding both sections, so the editor can select the new one. */
const withNewSection: Campaign = {
  ...campaignWithColumns,
  blocks: [
    ...campaignWithColumns.blocks,
    ...campaignWithColumns.blocks
      .filter((block) => block.id === 'slotRichTextId')
      .map((block) => ({ ...block, id: 'slotNewSectionId' }))
  ]
}

/** Swaps the slot's section and selects the new one, as a Change type does. */
function ChangeTypeHarness(): ReactElement {
  const { selectBlock } = useCampaignEditor()
  const [block, setBlock] = useState(columns)
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setBlock(changed)
          selectBlock('slotNewSectionId')
        }}
      >
        Change type
      </button>
      <CanvasSection block={block} />
    </>
  )
}

describe('CanvasColumnSlot', () => {
  it('selects the section it holds on Enter', () => {
    render(
      <StaticEditor
        campaignProp={campaignWithColumns}
        initialState={{ previewLanguageId: '529' }}
      >
        <SelectionProbe />
        <CanvasSection block={columns} />
      </StaticEditor>
    )
    const slot = screen.getByTestId('CanvasColumnSlot-slotLeftId')
    expect(slot).toHaveAttribute('tabindex', '0')
    expect(slot).not.toHaveAttribute('role')

    fireEvent.keyDown(slot, { key: 'Enter' })

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotRichTextId'
    )
  })

  it('resets the field to focus when a Change type puts a new section in the slot', () => {
    render(
      <StaticEditor
        campaignProp={withNewSection}
        initialState={{ previewLanguageId: '529' }}
      >
        <SelectionProbe />
        <ChangeTypeHarness />
      </StaticEditor>
    )
    fireEvent.click(
      within(screen.getByTestId('CanvasColumnSlot-slotLeftId')).getByRole(
        'button',
        { name: 'Title' }
      )
    )
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: 'Change type' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'slotNewSectionId'
    )
    expect(screen.getByRole('textbox', { name: 'Title' })).not.toHaveFocus()
  })
})
