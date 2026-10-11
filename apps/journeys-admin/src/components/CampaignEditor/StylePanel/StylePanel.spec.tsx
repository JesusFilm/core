import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { CampaignBackgroundKind } from '../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { nextPalette } from '../PaletteColorPicker'
import {
  StyleMock,
  WithBlock,
  blockOf,
  paletteMock,
  sectionStyleMock
} from '../styleTesting'
import { CommandProbe, QueriedEditor } from '../testing'

import { StylePanel } from './StylePanel'

const hero = blockOf<'CampaignHeroBlock'>('heroId')

function renderPanel(mocks: StyleMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} initialState={{ selectedBlockId: 'heroId' }}>
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <WithBlock blockId="heroId" typename="CampaignHeroBlock">
        {(block) => <StylePanel block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

async function pickHex(name: string, hex: string): Promise<void> {
  const input = screen.getByRole('textbox', { name })
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: hex } })
  fireEvent.blur(input)
}

describe('StylePanel', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('Background', () => {
    it('writes a chosen kind as one Command with an optimistic response', async () => {
      const mocks = [
        {
          ...sectionStyleMock(hero, {
            backgroundKind: CampaignBackgroundKind.surface
          }),
          delay: 200
        }
      ]
      renderPanel(mocks)
      const none = await screen.findByRole('button', { name: 'None' })
      expect(none).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(screen.getByRole('button', { name: 'Surface' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      // The optimistic response flips the selection before the request returns.
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Surface' })).toHaveAttribute(
          'aria-pressed',
          'true'
        )
      )
      expect(mocks[0].result).not.toHaveBeenCalled()
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    })

    it('does not offer the image kind yet', async () => {
      renderPanel([])
      await screen.findByRole('button', { name: 'None' })

      expect(screen.queryByRole('button', { name: 'Image' })).toBeNull()
    })

    it('commits the custom colour on picker blur, and undo restores the previous colour and kind', async () => {
      const mocks = [
        sectionStyleMock(hero, {
          backgroundKind: CampaignBackgroundKind.custom
        }),
        sectionStyleMock(
          hero,
          { backgroundColor: '#123456' },
          { backgroundKind: CampaignBackgroundKind.custom }
        ),
        paletteMock(nextPalette(campaign.palette, '#123456')),
        sectionStyleMock(
          hero,
          { backgroundColor: null },
          { backgroundKind: CampaignBackgroundKind.custom }
        ),
        sectionStyleMock(hero, { backgroundKind: hero.backgroundKind })
      ]
      renderPanel(mocks)

      fireEvent.click(await screen.findByRole('button', { name: 'Custom' }))
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

      await pickHex('Custom colour hex', '#123456')

      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
      await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
      // The palette save is outside undo: still two Commands.
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(mocks[3].result).toHaveBeenCalled())
      expect(
        screen.getByRole('textbox', { name: 'Custom colour hex' })
      ).toHaveValue(campaign.theme.backgroundColor)

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(mocks[4].result).toHaveBeenCalled())
      expect(screen.getByRole('button', { name: 'None' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })
  })

  describe('Colours', () => {
    it('writes each override as one Command and clears it with null', async () => {
      const mocks = [
        sectionStyleMock(hero, { textColor: '#ABCDEF' }),
        paletteMock(nextPalette(campaign.palette, '#ABCDEF')),
        sectionStyleMock(hero, { textColor: null }, { textColor: '#ABCDEF' })
      ]
      renderPanel(mocks)
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      fireEvent.click(screen.getByTestId('StyleOverride-textColor'))
      const input = screen.getByRole('textbox', { name: 'Text hex' })
      fireEvent.change(input, { target: { value: 'abcdef' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() =>
        expect(
          within(screen.getByTestId('StyleOverride-textColor')).getByText(
            '#ABCDEF'
          )
        ).toBeInTheDocument()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Inherit' }))

      await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
      await waitFor(() =>
        expect(
          within(screen.getByTestId('StyleOverride-textColor')).getByText(
            'Inherited'
          )
        ).toBeInTheDocument()
      )
    })

    it('lists the five overrides', async () => {
      renderPanel([])
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      const list = screen.getByRole('list', { name: 'Colour overrides' })
      expect(
        within(list)
          .getAllByRole('button')
          .map((row) => row.textContent)
      ).toEqual([
        'HeadingInherited',
        'TextInherited',
        'ButtonInherited',
        'Button textInherited',
        'AccentInherited'
      ])
    })
  })

  describe('validation', () => {
    it('pre-validates only the hex format and writes nothing for a bad value', async () => {
      renderPanel([])
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      await pickHex('Heading hex', 'blue')

      expect(
        screen.getByText('Enter a hex colour like #RRGGBB')
      ).toBeInTheDocument()
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })

    it('shows the API’s message verbatim when it refuses a value', async () => {
      const failing: StyleMock = {
        ...sectionStyleMock(hero, { headingColor: '#AABBCC' }),
        result: vi.fn(() => ({
          errors: [{ message: 'headingColor is not allowed on this band' }]
        }))
      }
      renderPanel([
        failing,
        paletteMock(nextPalette(campaign.palette, '#AABBCC'))
      ])
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      await pickHex('Heading hex', '#abc')

      expect(
        await screen.findByText('headingColor is not allowed on this band')
      ).toBeInTheDocument()
    })
  })
})
