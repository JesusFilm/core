import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { DARK_PRESET, LIGHT_PRESET } from '@core/journeys/ui/Campaign'
import {
  BODY_FONT_OPTIONS,
  HEADER_FONT_OPTIONS,
  LABELS_FONT_OPTIONS
} from '@core/shared/ui/fontFamilies'

import {
  CampaignButtonRadius,
  CampaignRadius,
  ThemeMode
} from '../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { nextPalette } from '../PaletteColorPicker'
import { StyleMock, paletteMock, readTheme, themeMock } from '../styleTesting'
import { CommandProbe, QueriedEditor, campaignCache } from '../testing'

import { ThemePanel } from './ThemePanel'

const darkInput = { ...DARK_PRESET, themeMode: ThemeMode.dark }
const lightInput = { ...LIGHT_PRESET, themeMode: ThemeMode.light }

function renderPanel(
  mocks: StyleMock[],
  cache = campaignCache()
): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} cache={cache}>
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <SnackbarProvider>
        <ThemePanel />
      </SnackbarProvider>
    </QueriedEditor>
  )
}

async function pickHex(name: string, hex: string): Promise<void> {
  const input = screen.getByRole('textbox', { name })
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: hex } })
  fireEvent.blur(input)
}

function optionNames(): string[] {
  return screen.getAllByRole('option').map((option) => option.textContent ?? '')
}

describe('ThemePanel', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('presets', () => {
    it('derives Light from the nine values and marks that swatch pressed', async () => {
      renderPanel([])

      expect(
        await screen.findByTestId('CampaignThemePreset')
      ).toHaveTextContent('Light')
      expect(screen.getByTestId('CampaignThemePanel')).toHaveAttribute(
        'data-preset',
        'light'
      )
      expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    })

    it('applies Dark as one Command replacing the mode and the eight colours only; undo restores the nine values', async () => {
      const cache = campaignCache()
      const mocks = [themeMock(darkInput), themeMock(lightInput)]
      renderPanel(mocks, cache)

      fireEvent.click(await screen.findByRole('button', { name: 'Dark' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(readTheme(cache)).toEqual({
        __typename: 'CampaignTheme',
        ...darkInput,
        headerFont: null,
        bodyFont: null,
        labelFont: null,
        radius: 'rounded',
        buttonRadius: 'pill'
      })
      expect(screen.getByTestId('CampaignThemePreset')).toHaveTextContent(
        'Dark'
      )
      expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
      expect(readTheme(cache)).toMatchObject(lightInput)
      expect(screen.getByTestId('CampaignThemePreset')).toHaveTextContent(
        'Light'
      )
    })

    it('keeps the fonts and both radii a preset does not own', async () => {
      const cache = campaignCache()
      const mocks = [
        themeMock({ headerFont: 'Oswald' }),
        themeMock({ radius: CampaignRadius.square }, { headerFont: 'Oswald' }),
        themeMock(darkInput, {
          headerFont: 'Oswald',
          radius: CampaignRadius.square
        })
      ]
      renderPanel(mocks, cache)

      fireEvent.mouseDown(
        await screen.findByRole('combobox', { name: 'Header Text' })
      )
      fireEvent.click(screen.getByRole('option', { name: 'Oswald' }))
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Square' }))
      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
      await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())

      expect(readTheme(cache)).toMatchObject({
        ...darkInput,
        headerFont: 'Oswald',
        radius: 'square',
        buttonRadius: 'pill'
      })
      expect(screen.getByTestId('CampaignThemePreset')).toHaveTextContent(
        'Dark'
      )
    })

    it('shows Custom once any of the nine values differs, with neither swatch pressed, and records nothing', async () => {
      const cache = campaignCache()
      const mocks = [themeMock({ accentColor: '#123456' })]
      renderPanel(mocks, cache)

      fireEvent.click(await screen.findByTestId('ThemeColour-accentColor'))
      await pickHex('Accent hex', '#123456')

      await waitFor(() =>
        expect(screen.getByTestId('CampaignThemePreset')).toHaveTextContent(
          'Custom'
        )
      )
      expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
      expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(Object.keys(readTheme(cache) ?? {})).not.toContain('preset')
    })

    it('does nothing when the active preset is clicked again', async () => {
      renderPanel([])

      fireEvent.click(await screen.findByRole('button', { name: 'Light' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })

    it('does not reset the Palette', async () => {
      const cache = campaignCache()
      const palette = paletteMock(nextPalette(campaign.palette, '#123456'))
      const mocks = [themeMock(darkInput), palette]
      renderPanel(mocks, cache)

      fireEvent.click(await screen.findByRole('button', { name: 'Dark' }))
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

      expect(palette.result).not.toHaveBeenCalled()
      const slots = within(
        screen.getByTestId('ThemeColourPicker-palette')
      ).getAllByRole('button')
      expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(
        campaign.palette.map((hex) => `Use ${hex}`)
      )
    })
  })

  describe('colours', () => {
    it('lists the six base colours and the two contrast colours as swatch plus hex', async () => {
      renderPanel([])

      const list = await screen.findByRole('list', { name: 'Theme colours' })
      const items = within(list).getAllByRole('button')
      expect(items.map((item) => item.textContent)).toEqual([
        'Primary#C52D3A',
        'Accent#F2B544',
        'Background#FBF7F1',
        'Surface#FFFFFF',
        'Text#26262E',
        'Muted#6D6F81',
        'Contrast background#26262E',
        'Contrast text#FFFFFF'
      ])
    })

    it('commits a colour on picker blur as one Command with an optimistic response; undo writes the previous hex back', async () => {
      const cache = campaignCache()
      const mocks = [
        { ...themeMock({ contrastTextColor: '#123456' }), delay: 200 },
        themeMock({ contrastTextColor: '#FFFFFF' }),
        paletteMock(nextPalette(campaign.palette, '#123456'))
      ]
      renderPanel(mocks, cache)

      fireEvent.click(
        await screen.findByTestId('ThemeColour-contrastTextColor')
      )
      await pickHex('Contrast text hex', '#123456')

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() =>
        expect(readTheme(cache)?.contrastTextColor).toBe('#123456')
      )
      expect(mocks[0].result).not.toHaveBeenCalled()
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
      expect(readTheme(cache)?.contrastTextColor).toBe('#FFFFFF')
    })

    it('pre-validates only the hex format and writes nothing for a bad value', async () => {
      renderPanel([])

      await screen.findByTestId('ThemeColour-primaryColor')
      await pickHex('Primary hex', 'crimson')

      expect(
        screen.getByText('Enter a hex colour like #RRGGBB')
      ).toBeInTheDocument()
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })

    it('surfaces the API message verbatim when a save fails', async () => {
      const failing: StyleMock = {
        ...themeMock({ primaryColor: '#123456' }),
        result: vi.fn(() => ({
          errors: [
            { message: 'primaryColor must be a hex colour like #RRGGBB' }
          ]
        }))
      }
      renderPanel([failing])

      await screen.findByTestId('ThemeColour-primaryColor')
      await pickHex('Primary hex', '#123456')

      expect(
        await screen.findByText('primaryColor must be a hex colour like #RRGGBB')
      ).toBeInTheDocument()
    })
  })

  describe('fonts', () => {
    it('offers the curated lists per role (10 header, 7 body, 7 label) plus Default, and no free text', async () => {
      renderPanel([])

      fireEvent.mouseDown(
        await screen.findByRole('combobox', { name: 'Header Text' })
      )
      expect(optionNames()).toEqual([
        'Default',
        ...[...HEADER_FONT_OPTIONS].sort()
      ])
      expect(HEADER_FONT_OPTIONS).toHaveLength(10)
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })

      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Body Text' }))
      expect(optionNames()).toEqual([
        'Default',
        ...[...BODY_FONT_OPTIONS].sort()
      ])
      expect(BODY_FONT_OPTIONS).toHaveLength(7)
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })

      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label Text' }))
      expect(optionNames()).toEqual([
        'Default',
        ...[...LABELS_FONT_OPTIONS].sort()
      ])
      expect(LABELS_FONT_OPTIONS).toHaveLength(7)

      expect(screen.queryByRole('textbox', { name: /font/i })).toBeNull()
    })

    it('writes a chosen font as one Command and Default writes null', async () => {
      const cache = campaignCache()
      const mocks = [
        themeMock({ bodyFont: 'Nunito' }),
        themeMock({ bodyFont: null }, { bodyFont: 'Nunito' })
      ]
      renderPanel(mocks, cache)

      fireEvent.mouseDown(
        await screen.findByRole('combobox', { name: 'Body Text' })
      )
      fireEvent.click(screen.getByRole('option', { name: 'Nunito' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(readTheme(cache)?.bodyFont).toBe('Nunito')

      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Body Text' }))
      fireEvent.click(screen.getByRole('option', { name: 'Default' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
      expect(readTheme(cache)?.bodyFont).toBeNull()
    })
  })

  describe('shape', () => {
    it('offers four corner radii and two button shapes, each change one Command', async () => {
      const cache = campaignCache()
      const mocks = [
        themeMock({ radius: CampaignRadius.veryRounded }),
        themeMock(
          { buttonRadius: CampaignButtonRadius.rounded },
          { radius: CampaignRadius.veryRounded }
        )
      ]
      renderPanel(mocks, cache)

      const radii = within(
        await screen.findByRole('group', { name: 'Corner radius' })
      ).getAllByRole('button')
      expect(radii.map((button) => button.textContent)).toEqual([
        'Square',
        'Slight',
        'Rounded',
        'Very rounded'
      ])
      expect(radii[2]).toHaveAttribute('aria-pressed', 'true')
      const shapes = within(
        screen.getByRole('group', { name: 'Button shape' })
      ).getAllByRole('button')
      expect(shapes.map((button) => button.textContent)).toEqual([
        'Rounded',
        'Pill'
      ])
      expect(shapes[1]).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(radii[3])
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(readTheme(cache)?.radius).toBe('veryRounded')

      fireEvent.click(shapes[0])
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
      expect(readTheme(cache)?.buttonRadius).toBe('rounded')
    })

    it('does nothing when the current radius is clicked again', async () => {
      renderPanel([])

      fireEvent.click(await screen.findByRole('button', { name: 'Pill' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })
  })

  it('closes through the close button', async () => {
    const onClose = vi.fn()
    render(
      <QueriedEditor>
        <ThemePanel onClose={onClose} />
      </QueriedEditor>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
