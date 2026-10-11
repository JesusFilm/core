import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { CAMPAIGN_BUTTON_BLOCK_UPDATE_STYLE } from '../../../libs/useCampaignButtonBlockUpdateMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { nextPalette } from '../PaletteColorPicker'
import { StyleMock, WithBlock, blockOf, paletteMock } from '../styleTesting'
import { CommandProbe, QueriedEditor } from '../testing'
import { buttonStyleRow } from '../utils/useCampaignExtraStyleCommand'

import { ButtonControls } from './ButtonControls'

const button = blockOf<'CampaignButtonBlock'>('heroButtonId')

function buttonMock(
  input: Record<string, unknown>,
  current: Partial<typeof button> = {}
): StyleMock {
  return {
    request: {
      query: CAMPAIGN_BUTTON_BLOCK_UPDATE_STYLE,
      variables: { id: button.id, input }
    },
    result: vi.fn(() => ({
      data: {
        campaignButtonBlockUpdate: buttonStyleRow(
          { ...button, ...current },
          input
        )
      }
    }))
  }
}

function renderControls(mocks: StyleMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} initialState={{ selectedBlockId: button.id }}>
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <WithBlock blockId={button.id} typename="CampaignButtonBlock">
        {(block) => <ButtonControls block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

describe('ButtonControls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets the variant (text, contained, outlined) as one Command', async () => {
    const mocks = [buttonMock({ variant: 'outlined' })]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Variant' }))
    const menu = screen.getByTestId('ButtonVariantMenu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual(['Contained', 'Outlined', 'Text'])
    expect(
      within(menu).getByRole('menuitem', { name: 'Contained' })
    ).toHaveClass('Mui-selected')

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Outlined' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('sets the size (small, medium, large) as one Command and undoes it', async () => {
    const mocks = [
      buttonMock({ size: 'large' }),
      buttonMock({ size: null }, { size: 'large' as never })
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Size' }))
    const menu = screen.getByTestId('ButtonSizeMenu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual(['Small', 'Medium', 'Large'])

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Large' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
  })

  it('sets color and labelColor through the palette pickers, one Command each, and clears them', async () => {
    const mocks = [
      buttonMock({ color: '#112233' }),
      paletteMock(nextPalette(campaign.palette, '#112233')),
      buttonMock({ labelColor: '#445566' }, { color: '#112233' }),
      paletteMock(
        nextPalette(nextPalette(campaign.palette, '#112233'), '#445566')
      ),
      buttonMock({ color: null }, { color: '#112233', labelColor: '#445566' })
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Colours' }))
    const fill = screen.getByRole('textbox', { name: 'Button colour hex' })
    fireEvent.change(fill, { target: { value: '#112233' } })
    fireEvent.keyDown(fill, { key: 'Enter' })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())

    const label = screen.getByRole('textbox', {
      name: 'Button text colour hex'
    })
    fireEvent.change(label, { target: { value: '#445566' } })
    fireEvent.keyDown(label, { key: 'Enter' })
    await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')

    const picker = screen.getByTestId('ButtonColour')
    const follow = within(picker).getByRole('button', {
      name: 'Follow section'
    })
    await waitFor(() => expect(follow).toBeEnabled())
    fireEvent.click(follow)
    await waitFor(() => expect(mocks[4].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('3')
  })
})
