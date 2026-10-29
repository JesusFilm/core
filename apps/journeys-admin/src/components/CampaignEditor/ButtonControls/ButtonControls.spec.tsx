import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import {
  ButtonSize,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { nextPalette } from '../CampaignPaletteColorPicker'
import { campaign } from '../data'
import {
  WithBlock,
  blockOf,
  blockUpdateMock,
  paletteMock
} from '../styleTesting'
import { CommandProbe, QueriedEditor, SpyMock, UndoRedo } from '../testing'

import { ButtonControls } from './ButtonControls'

const button = blockOf<'CampaignButtonBlock'>('heroButtonId')

function buttonMock(
  input: Record<string, unknown>,
  current: Partial<typeof button> = {}
): SpyMock {
  return blockUpdateMock(button, input, current)
}

function renderControls(mocks: SpyMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} initialState={{ selectedBlockId: button.id }}>
      <UndoRedo />
      <CommandProbe />
      <WithBlock blockId={button.id} typename="CampaignButtonBlock">
        {(block) => <ButtonControls block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

describe('ButtonControls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows variant, size, align and both colours as inline rows, with no menu or popover', async () => {
    renderControls([])

    expect(await screen.findByRole('group', { name: 'Variant' })).toBeVisible()
    expect(screen.getByRole('group', { name: 'Size' })).toBeVisible()
    expect(screen.getByRole('group', { name: 'Align' })).toBeVisible()
    expect(screen.getByTestId('ButtonColourRow-color')).toBeVisible()
    expect(screen.getByTestId('ButtonColourRow-labelColor')).toBeVisible()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
  })

  it('sets the variant (text, contained, outlined) as one Command', async () => {
    const mocks = [buttonMock({ variant: 'outlined' })]
    renderControls(mocks)

    const variant = await screen.findByTestId('ButtonControls')
    const group = within(variant).getByRole('group', { name: 'Variant' })
    expect(
      within(group)
        .getAllByRole('button')
        .map((item) => item.textContent)
    ).toEqual(['Contained', 'Outlined', 'Text'])
    expect(
      within(group).getByRole('button', { name: 'Contained' })
    ).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(within(group).getByRole('button', { name: 'Outlined' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('sets the size (small, medium, large) as one Command and undoes it', async () => {
    const mocks = [
      buttonMock({ size: 'large' }),
      buttonMock({ size: null }, { size: ButtonSize.large })
    ]
    renderControls(mocks)

    const group = await screen.findByRole('group', { name: 'Size' })
    expect(
      within(group)
        .getAllByRole('button')
        .map((item) => item.textContent)
    ).toEqual(['Small', 'Medium', 'Large'])

    fireEvent.click(within(group).getByRole('button', { name: 'Large' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
  })

  it('sets align as one Command and Reset follows the section again', async () => {
    const mocks = [
      buttonMock({ align: 'right' }),
      buttonMock({ align: null }, { align: TypographyAlign.right })
    ]
    renderControls(mocks)

    const align = await screen.findByTestId('StyleRow-Align')
    expect(within(align).getByTestId('ValueIndicator')).toHaveAttribute(
      'data-source',
      'inherited'
    )
    fireEvent.click(within(align).getByRole('button', { name: 'Right' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() =>
      expect(within(align).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'set'
      )
    )

    fireEvent.click(within(align).getByRole('button', { name: 'Reset Align' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
  })

  it('commits a palette pick at once as one Command, without clicking away', async () => {
    const mocks = [
      buttonMock({ color: '#F2B544' }),
      paletteMock(nextPalette(campaign.palette, '#F2B544'))
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Use #F2B544' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('sets color and labelColor through the palette pickers, one Command each, and Reset writes null', async () => {
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

    const fillRow = await screen.findByTestId('ButtonColourRow-color')
    const labelRow = screen.getByTestId('ButtonColourRow-labelColor')
    expect(within(fillRow).getByTestId('ValueIndicator')).toHaveAttribute(
      'data-source',
      'inherited'
    )
    const fill = screen.getByRole('textbox', { name: 'Button colour hex' })
    fireEvent.change(fill, { target: { value: '#112233' } })
    fireEvent.keyDown(fill, { key: 'Enter' })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    await waitFor(() =>
      expect(within(fillRow).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'set'
      )
    )

    fireEvent.click(labelRow)
    const label = screen.getByRole('textbox', {
      name: 'Button text colour hex'
    })
    fireEvent.change(label, { target: { value: '#445566' } })
    fireEvent.keyDown(label, { key: 'Enter' })
    await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
    await waitFor(() => expect(mocks[3].result).toHaveBeenCalled())

    fireEvent.click(fillRow)
    const reset = screen.getByRole('button', { name: 'Reset' })
    await waitFor(() => expect(reset).toBeEnabled())
    fireEvent.click(reset)
    await waitFor(() => expect(mocks[4].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('3')
    await waitFor(() =>
      expect(within(fillRow).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'inherited'
      )
    )
    expect(within(labelRow).getByTestId('ValueIndicator')).toHaveAttribute(
      'data-source',
      'set'
    )
  })
})
