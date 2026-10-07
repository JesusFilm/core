import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import type { Mock } from 'vitest'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { ThemeMode } from '../../../../__generated__/globalTypes'
import { GET_CAMPAIGN } from '../../../libs/useCampaignQuery'
import { campaign } from '../data'
import { paletteMock } from '../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  StaticEditor,
  campaignCache
} from '../testing'

import {
  PALETTE_SIZE,
  PaletteColorPicker,
  nextPalette,
  normalizeHex
} from './PaletteColorPicker'

const eight = [
  '#111111',
  '#222222',
  '#333333',
  '#444444',
  '#555555',
  '#666666',
  '#777777',
  '#888888'
]

function slots(): string[] {
  return within(screen.getByTestId('PaletteColorPicker-palette'))
    .getAllByRole('button')
    .map((slot) =>
      slot.getAttribute('data-testid')?.replace('PaletteSlot-', '')
    )
    .filter((hex): hex is string => hex != null)
}

function renderPicker(
  options: {
    palette?: string[]
    value?: string | null
    mocks?: Array<ReturnType<typeof paletteMock>>
    onCommit?: Mock<(hex: string) => void>
    theme?: Partial<Campaign['theme']>
  } = {}
): ReturnType<typeof render> & { onCommit: Mock<(hex: string) => void> } {
  const onCommit = options.onCommit ?? vi.fn<(hex: string) => void>()
  const campaignProp: Campaign = {
    ...campaign,
    palette: options.palette ?? eight,
    theme: { ...campaign.theme, ...options.theme }
  }
  // Seed the cache so the provider reads the campaign (and its palette) from
  // it, and the optimistic palette save flows back into the slots.
  const cache = campaignCache()
  cache.writeQuery({
    query: GET_CAMPAIGN,
    variables: { id: campaign.id },
    data: { campaign: campaignProp }
  })
  const rendered = render(
    <QueriedEditor cache={cache} mocks={options.mocks ?? []}>
      <CommandProbe />
      <PaletteColorPicker
        label="Heading"
        value={options.value ?? null}
        fallback="#000000"
        onCommit={onCommit}
      />
    </QueriedEditor>
  )
  return { ...rendered, onCommit }
}

describe('nextPalette', () => {
  it('puts a new colour in slot 1 and drops the oldest past eight', () => {
    expect(nextPalette(eight, '#999999')).toEqual([
      '#999999',
      ...eight.slice(0, 7)
    ])
    expect(nextPalette(eight, '#999999')).toHaveLength(PALETTE_SIZE)
  })

  it('moves an existing colour to slot 1 without duplicating it', () => {
    expect(nextPalette(eight, '#444444')).toEqual([
      '#444444',
      '#111111',
      '#222222',
      '#333333',
      '#555555',
      '#666666',
      '#777777',
      '#888888'
    ])
  })

  it('normalises to uppercase six-digit hex before comparing', () => {
    expect(nextPalette(['#AABBCC', '#111111'], ' #abc ')).toEqual([
      '#AABBCC',
      '#111111'
    ])
    expect(nextPalette(['#aabbcc'], '#AABBCC')).toEqual(['#AABBCC'])
  })

  it('leaves the list alone for a value that is not a colour', () => {
    expect(nextPalette(eight, 'red')).toEqual(eight)
  })
})

describe('normalizeHex', () => {
  it('accepts #RGB and #RRGGBB in any case, with or without the hash, and nothing else', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC')
    expect(normalizeHex('a1b2c3')).toBe('#A1B2C3')
    expect(normalizeHex(' #A1B2C3 ')).toBe('#A1B2C3')
    for (const bad of ['', 'red', 'rgb(1,2,3)', '#AABBCCDD', '#ab'])
      expect(normalizeHex(bad)).toBeNull()
  })
})

describe('PaletteColorPicker', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows eight slots newest first from the campaign’s palette', async () => {
    renderPicker()

    await screen.findByTestId('PaletteColorPicker-palette')
    expect(slots()).toEqual(eight)
    expect(screen.queryAllByTestId('PaletteSlotEmpty')).toHaveLength(0)
  })

  it('pads a shorter palette with empty slots up to eight', async () => {
    renderPicker({ palette: ['#111111', '#222222'] })

    await screen.findByTestId('PaletteColorPicker-palette')
    expect(slots()).toEqual(['#111111', '#222222'])
    expect(screen.getAllByTestId('PaletteSlotEmpty')).toHaveLength(6)
  })

  it('commits a typed colour on blur through campaignUpdate, normalised, outside undo', async () => {
    const mock = paletteMock(['#AABBCC', ...eight.slice(0, 7)])
    const { onCommit } = renderPicker({ mocks: [mock] })
    const input = await screen.findByRole('textbox', { name: 'Heading hex' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onCommit).not.toHaveBeenCalled()
    expect(mock.result).not.toHaveBeenCalled()

    fireEvent.blur(input)

    expect(onCommit).toHaveBeenCalledWith('#AABBCC')
    expect(onCommit).toHaveBeenCalledTimes(1)
    // The optimistic response puts the new colour in slot 1 and drops the oldest.
    await waitFor(() =>
      expect(slots()).toEqual(['#AABBCC', ...eight.slice(0, 7)])
    )
    await waitFor(() => expect(mock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('moves a chosen swatch to slot 1 and commits it at once', async () => {
    const mock = paletteMock([
      '#444444',
      '#111111',
      '#222222',
      '#333333',
      '#555555',
      '#666666',
      '#777777',
      '#888888'
    ])
    const { onCommit } = renderPicker({ mocks: [mock] })

    fireEvent.click(await screen.findByRole('button', { name: 'Use #444444' }))

    expect(onCommit).toHaveBeenCalledWith('#444444')
    await waitFor(() => expect(slots()[0]).toBe('#444444'))
    expect(slots()).toHaveLength(PALETTE_SIZE)
    await waitFor(() => expect(mock.result).toHaveBeenCalled())
  })

  it('does not commit an unchanged value, nor a value that is not a colour', async () => {
    const { onCommit } = renderPicker({ value: '#111111' })
    const input = await screen.findByRole('textbox', { name: 'Heading hex' })

    fireEvent.blur(input)
    expect(onCommit).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: 'nope' } })
    fireEvent.blur(input)

    expect(onCommit).not.toHaveBeenCalled()
    expect(
      screen.getByText('Enter a hex colour like #RRGGBB')
    ).toBeInTheDocument()
  })

  it('survives a preset change: the slots come from the palette, not the theme', () => {
    const light: Campaign = { ...campaign, palette: eight }
    const picker = (
      <>
        <CommandProbe />
        <PaletteColorPicker
          label="Heading"
          value={null}
          fallback="#000000"
          onCommit={vi.fn()}
        />
      </>
    )
    const { rerender } = render(
      <StaticEditor campaignProp={light}>{picker}</StaticEditor>
    )
    expect(slots()).toEqual(eight)

    const dark: Campaign = {
      ...campaign,
      palette: eight,
      theme: {
        ...campaign.theme,
        themeMode: ThemeMode.dark,
        primaryColor: '#000000',
        backgroundColor: '#101010'
      }
    }
    rerender(<StaticEditor campaignProp={dark}>{picker}</StaticEditor>)

    expect(slots()).toEqual(eight)
  })
})
