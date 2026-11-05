import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { DARK_PRESET, LIGHT_PRESET } from '@core/journeys/ui/Campaign'

import {
  CampaignRadius,
  ThemeMode
} from '../../../../../__generated__/globalTypes'
import { readTheme, themeMock } from '../../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  SpyMock,
  UndoRedo,
  campaignCache
} from '../../testing'

import { useCampaignThemeCommand } from './useCampaignThemeCommand'

const darkInput = {
  ...DARK_PRESET,
  themeMode: ThemeMode.dark,
  buttonRadius: CampaignRadius.veryRounded
}
const lightInput = {
  ...LIGHT_PRESET,
  themeMode: ThemeMode.light,
  buttonRadius: CampaignRadius.veryRounded
}

function Controls(): ReactElement {
  const { addTheme } = useCampaignThemeCommand()
  return (
    <>
      <button onClick={() => addTheme({ primaryColor: '#123456' })}>
        Primary
      </button>
      <button onClick={() => addTheme({ headerFont: 'Oswald' })}>Font</button>
      <button onClick={() => addTheme({ radius: CampaignRadius.square })}>
        Square
      </button>
      <button onClick={() => addTheme(darkInput)}>Dark</button>
    </>
  )
}

function ClosablePanel(): ReactElement {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={() => setOpen(false)}>Close</button>
      {open && <Controls />}
    </>
  )
}

function renderControls(
  mocks: SpyMock[],
  cache = campaignCache()
): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} cache={cache}>
      <UndoRedo />
      <CommandProbe />
      <SnackbarProvider>
        <Controls />
      </SnackbarProvider>
    </QueriedEditor>
  )
}

describe('useCampaignThemeCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes a colour as one Command through campaignThemeUpdate, optimistically', async () => {
    const cache = campaignCache()
    const mocks = [{ ...themeMock({ primaryColor: '#123456' }), delay: 200 }]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Primary' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(readTheme(cache)?.primaryColor).toBe('#123456'))
    expect(mocks[0].result).not.toHaveBeenCalled()
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
  })

  it('undoes a colour by writing the previous value back through the same mutation, and redoes it', async () => {
    const cache = campaignCache()
    const mocks = [
      { ...themeMock({ primaryColor: '#123456' }), maxUsageCount: 2 },
      themeMock({ primaryColor: '#C52D3A' })
    ]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Primary' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(readTheme(cache)?.primaryColor).toBe('#C52D3A')

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalledTimes(2))
    expect(readTheme(cache)?.primaryColor).toBe('#123456')
  })

  it('undoes a font to the null it had', async () => {
    const cache = campaignCache()
    const mocks = [
      themeMock({ headerFont: 'Oswald' }),
      themeMock({ headerFont: null })
    ]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Font' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(readTheme(cache)?.headerFont).toBe('Oswald')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(readTheme(cache)?.headerFont).toBeNull()
  })

  it('writes a radius as one Command', async () => {
    const cache = campaignCache()
    const mocks = [themeMock({ radius: CampaignRadius.square })]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Square' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(readTheme(cache)?.radius).toBe('square')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('applies a preset as one Command over the nine values and undo restores all nine, leaving fonts and radii alone', async () => {
    const cache = campaignCache()
    const mocks = [themeMock(darkInput), themeMock(lightInput)]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Dark' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(readTheme(cache)).toMatchObject({
      ...darkInput,
      headerFont: null,
      radius: 'rounded',
      buttonRadius: 'veryRounded'
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(readTheme(cache)).toMatchObject({
      ...lightInput,
      headerFont: null,
      radius: 'rounded',
      buttonRadius: 'veryRounded'
    })
  })

  it('surfaces the API message verbatim when a save fails', async () => {
    const failing: SpyMock = {
      ...themeMock({ primaryColor: '#123456' }),
      result: vi.fn(() => ({
        errors: [{ message: 'primaryColor must be a hex colour like #RRGGBB' }]
      }))
    }
    renderControls([failing])

    fireEvent.click(await screen.findByRole('button', { name: 'Primary' }))

    expect(
      await screen.findByText('primaryColor must be a hex colour like #RRGGBB')
    ).toBeInTheDocument()
  })

  it('surfaces a failed undo after the panel that owned the hook has unmounted', async () => {
    const failingUndo: SpyMock = {
      ...themeMock({ primaryColor: '#C52D3A' }),
      result: vi.fn(() => ({
        errors: [{ message: 'primaryColor must be a hex colour like #RRGGBB' }]
      }))
    }
    render(
      <QueriedEditor
        mocks={[themeMock({ primaryColor: '#123456' }), failingUndo]}
      >
        <UndoRedo />
        <SnackbarProvider>
          <ClosablePanel />
        </SnackbarProvider>
      </QueriedEditor>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Primary' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('button', { name: 'Primary' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(
      await screen.findByText('primaryColor must be a hex colour like #RRGGBB')
    ).toBeInTheDocument()
  })
})
