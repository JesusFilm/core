import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'
import { type MockedFunction } from 'vitest'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { useCampaignEditor } from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import { campaign } from '../data'
import { CommandProbe, StaticEditor } from '../testing'
import {
  TranslationRun,
  TranslationRunContext
} from '../TranslationRunProvider'

import { LeftRail } from './LeftRail'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

const run: TranslationRun = {
  campaignId: 'campaignId',
  languageId: '496',
  mode: 'missing',
  languageName: 'Français',
  progress: 40,
  translatedCount: 4
}

function PanelProbe(): ReactElement {
  const {
    state: { panel }
  } = useCampaignEditor()
  return <span data-testid="OpenPanel">{panel}</span>
}

function AddCommandButton(): ReactElement {
  const { add } = useCommand()
  return (
    <button
      onClick={() =>
        add({
          parameters: { execute: undefined, undo: undefined },
          execute: () => undefined
        })
      }
    >
      Add command
    </button>
  )
}

function Harness(): ReactElement {
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <SnackbarProvider>
      <StaticEditor campaign={campaign}>
        <AddCommandButton />
        <CommandProbe />
        <PanelProbe />
        <span data-testid="View">{view}</span>
        <LeftRail view={view} onViewChange={setView} />
      </StaticEditor>
    </SnackbarProvider>
  )
}

/** The rail with a machine-translation run in flight. */
function RunningHarness(): ReactElement {
  return (
    <SnackbarProvider>
      <StaticEditor campaign={campaign}>
        <TranslationRunContext.Provider
          value={{ run, start: vi.fn(), cancel: vi.fn() }}
        >
          <LeftRail view="desktop" onViewChange={() => undefined} />
        </TranslationRunContext.Provider>
      </StaticEditor>
    </SnackbarProvider>
  )
}

describe('LeftRail', () => {
  const push = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
  })

  it('links back to the campaigns list', () => {
    render(<Harness />)

    expect(
      screen.getByRole('link', { name: 'Back to campaigns' })
    ).toHaveAttribute('href', '/?type=campaigns')
  })

  it('goes back straight away while no run is in flight', () => {
    render(<Harness />)

    const notPrevented = fireEvent.click(
      screen.getByRole('link', { name: 'Back to campaigns' })
    )

    expect(notPrevented).toBe(true)
    expect(screen.queryByTestId('CampaignLeaveDialog')).not.toBeInTheDocument()
  })

  describe('while a run is in flight', () => {
    function clickBack(): boolean {
      return fireEvent.click(
        screen.getByRole('link', { name: 'Back to campaigns' })
      )
    }

    it('asks before leaving, naming the language whose translation stops', () => {
      render(<RunningHarness />)

      expect(clickBack()).toBe(false)

      const dialog = screen.getByTestId('CampaignLeaveDialog')
      expect(within(dialog).getByText('Leave the editor?')).toBeInTheDocument()
      expect(
        within(dialog).getByText('The translation into Français stops.')
      ).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })

    it('stays in the editor on Stay', async () => {
      render(<RunningHarness />)
      clickBack()

      fireEvent.click(screen.getByRole('button', { name: 'Stay' }))

      await waitFor(() =>
        expect(
          screen.queryByTestId('CampaignLeaveDialog')
        ).not.toBeInTheDocument()
      )
      expect(push).not.toHaveBeenCalled()
      expect(screen.getByTestId('CampaignLeftRail')).toBeInTheDocument()
    })

    it('goes back to the campaigns list on Leave', () => {
      render(<RunningHarness />)
      clickBack()

      fireEvent.click(screen.getByRole('button', { name: 'Leave' }))

      expect(push).toHaveBeenCalledWith('/?type=campaigns')
    })
  })

  it('switches between the Pages, Add and Localize panels, one open at a time, starting on Add', () => {
    render(<Harness />)
    const pages = screen.getByRole('button', { name: 'Pages' })
    const localize = screen.getByRole('button', { name: 'Localize' })
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('add')
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(pages)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('pages')
    expect(pages).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('add')
    expect(pages).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(localize)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('localize')
    expect(pages).toHaveAttribute('aria-pressed', 'false')
    expect(localize).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(localize)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('localize')
    expect(localize).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps the Navigator panel open when its toggle is pressed again', () => {
    render(<Harness />)
    const navigator = screen.getByRole('button', { name: 'Navigator' })

    fireEvent.click(navigator)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('navigator')
    expect(navigator).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(navigator)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('navigator')
    expect(navigator).toHaveAttribute('aria-pressed', 'true')
  })

  it('undoes and redoes through the one Command history', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Add command' }))
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled()
  })

  it('toggles Desktop and Phone as a view, not a Command', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Phone' }))

    expect(screen.getByTestId('View')).toHaveTextContent('phone')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('holds the Publish button with the draft dot', () => {
    render(<Harness />)

    expect(screen.getByTestId('PublishStatusDot')).toHaveAttribute(
      'data-status',
      'draft'
    )
  })
})
