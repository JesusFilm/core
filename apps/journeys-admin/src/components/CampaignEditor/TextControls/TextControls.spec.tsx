import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { nextPalette } from '../CampaignPaletteColorPicker'
import { campaign } from '../data'
import {
  WithBlock,
  blockOf,
  blockUpdateMock,
  paletteMock
} from '../styleTesting'
import { CommandProbe, QueriedEditor, SpyMock, UndoRedo } from '../testing'

import { TextControls } from './TextControls'

const note = blockOf<'CampaignTypographyBlock'>('journeyListNoteId')

function textMock(
  input: Record<string, unknown>,
  current: Partial<typeof note> = {}
): SpyMock {
  return blockUpdateMock(note, input, current)
}

function renderControls(mocks: SpyMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      mocks={mocks}
      initialState={{ selectedBlockId: 'journeyListNoteId' }}
    >
      <UndoRedo />
      <CommandProbe />
      <WithBlock blockId="journeyListNoteId" typename="CampaignTypographyBlock">
        {(block) => <TextControls block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

describe('TextControls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Size, Align and Colour as inline rows', async () => {
    renderControls([])

    expect(await screen.findByRole('combobox', { name: 'Size' })).toBeVisible()
    expect(screen.getByRole('group', { name: 'Align' })).toBeVisible()
    expect(screen.getByRole('list', { name: 'Colour' })).toBeVisible()
  })

  it('sets the typography variant from Size, one Command per choice', async () => {
    const mocks = [textMock({ variant: 'h2' })]
    renderControls(mocks)

    const size = await screen.findByRole('combobox', { name: 'Size' })
    expect(size).toHaveValue('overline')

    fireEvent.change(size, { target: { value: 'h2' } })

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(size).toHaveValue('h2')
  })

  it('undoes a size change by writing the previous variant back', async () => {
    const mocks = [
      textMock({ variant: 'h2' }),
      textMock({ variant: note.typographyVariant }, { typographyVariant: null })
    ]
    renderControls(mocks)

    fireEvent.change(await screen.findByRole('combobox', { name: 'Size' }), {
      target: { value: 'h2' }
    })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
  })

  it('sets align left, center or right, and Reset follows the section again', async () => {
    const mocks = [
      textMock({ align: 'center' }),
      textMock({ align: null }, { align: TypographyAlign.center })
    ]
    renderControls(mocks)

    const align = await screen.findByTestId('StyleRow-Align')
    expect(
      within(align)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Reset', 'Left', 'Center', 'Right'])
    expect(within(align).getByTestId('ValueIndicator')).toHaveAttribute(
      'data-source',
      'inherited'
    )
    expect(
      within(align).getByRole('button', { name: 'Reset Align' })
    ).toBeDisabled()

    fireEvent.click(within(align).getByRole('button', { name: 'Center' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() =>
      expect(within(align).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'set'
      )
    )
    expect(
      within(align).getByRole('button', { name: 'Center' })
    ).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(within(align).getByRole('button', { name: 'Reset Align' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
    await waitFor(() =>
      expect(within(align).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'inherited'
      )
    )
  })

  it('commits a palette pick at once as one Command, without clicking away', async () => {
    const mocks = [
      textMock({ color: '#F2B544' }),
      paletteMock(nextPalette(campaign.palette, '#F2B544'))
    ]
    renderControls(mocks)

    fireEvent.click(await screen.findByRole('button', { name: 'Use #F2B544' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('sets a hex colour through the palette picker and Reset returns it to the section colour', async () => {
    const mocks = [
      textMock({ color: '#112233' }),
      paletteMock(nextPalette(campaign.palette, '#112233')),
      textMock({ color: null }, { color: '#112233' })
    ]
    renderControls(mocks)

    const row = await screen.findByTestId('TextColourRow-color')
    expect(within(row).getByTestId('ValueIndicator')).toHaveAttribute(
      'data-source',
      'inherited'
    )
    const input = screen.getByRole('textbox', { name: 'Text colour hex' })
    fireEvent.change(input, { target: { value: '#112233' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() =>
      expect(within(row).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'set'
      )
    )

    const reset = screen.getByRole('button', { name: 'Reset' })
    await waitFor(() => expect(reset).toBeEnabled())
    fireEvent.click(reset)

    await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
    await waitFor(() =>
      expect(within(row).getByTestId('ValueIndicator')).toHaveAttribute(
        'data-source',
        'inherited'
      )
    )
  })
})
