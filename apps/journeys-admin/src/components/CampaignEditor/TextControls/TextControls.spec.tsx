import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_STYLE } from '../../../libs/useCampaignTypographyBlockUpdateMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { nextPalette } from '../PaletteColorPicker'
import { StyleMock, WithBlock, blockOf, paletteMock } from '../styleTesting'
import { CommandProbe, QueriedEditor } from '../testing'
import { textStyleRow } from '../utils/useCampaignExtraStyleCommand'

import { TEXT_SIZES, TextControls } from './TextControls'

const note = blockOf<'CampaignTypographyBlock'>('journeyListNoteId')

function textMock(
  input: Record<string, unknown>,
  current: Partial<typeof note> = {}
): StyleMock {
  return {
    request: {
      query: CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_STYLE,
      variables: { id: note.id, input }
    },
    result: vi.fn(() => ({
      data: {
        campaignTypographyBlockUpdate: textStyleRow(
          { ...note, ...current },
          input
        )
      }
    }))
  }
}

function renderControls(mocks: StyleMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      mocks={mocks}
      initialState={{ selectedBlockId: 'journeyListNoteId' }}
    >
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <WithBlock blockId="journeyListNoteId" typename="CampaignTypographyBlock">
        {(block) => <TextControls block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

describe('TextControls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('walks the twelve typography variants from Size, one Command per choice', async () => {
    const mocks = [textMock({ variant: 'h2' })]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Size' }))
    const menu = screen.getByTestId('TextSizeMenu')
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(12)
    expect(TEXT_SIZES).toHaveLength(12)
    expect(
      within(menu).getByRole('menuitem', { name: 'Overline' })
    ).toHaveClass('Mui-selected')

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Heading 2' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('undoes a size change by writing the previous variant back', async () => {
    const mocks = [
      textMock({ variant: 'h2' }),
      textMock({ variant: note.typographyVariant }, { typographyVariant: null })
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Size' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Heading 2' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
  })

  it('sets align left, center or right, or follows the section again', async () => {
    const mocks = [
      textMock({ align: 'center' }),
      textMock({ align: null }, { align: 'center' as never })
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Align' }))
    const menu = screen.getByTestId('TextAlignMenu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual(['Left', 'Center', 'Right', 'Follow section'])

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Center' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Align' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Follow section' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
  })

  it('sets a hex colour through the palette picker and clears it to follow the section', async () => {
    const mocks = [
      textMock({ color: '#112233' }),
      paletteMock(nextPalette(campaign.palette, '#112233')),
      textMock({ color: null }, { color: '#112233' })
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Colour' }))
    const input = screen.getByRole('textbox', { name: 'Text colour hex' })
    fireEvent.change(input, { target: { value: '#112233' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    const follow = await screen.findByRole('button', { name: 'Follow section' })
    await waitFor(() => expect(follow).toBeEnabled())
    fireEvent.click(follow)

    await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
  })
})
