import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { useCampaignEditor } from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import { campaign } from '../data'
import { CommandProbe, StaticEditor } from '../testing'

import { LeftRail } from './LeftRail'

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
      <StaticEditor campaignProp={campaign}>
        <AddCommandButton />
        <CommandProbe />
        <PanelProbe />
        <span data-testid="View">{view}</span>
        <LeftRail view={view} onViewChange={setView} />
      </StaticEditor>
    </SnackbarProvider>
  )
}

describe('LeftRail', () => {
  it('links back to the campaigns list', () => {
    render(<Harness />)

    expect(
      screen.getByRole('link', { name: 'Back to campaigns' })
    ).toHaveAttribute('href', '/?type=campaigns')
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

  it('lists the panel toggles as Add, Pages, Navigator, Localize', () => {
    render(<Harness />)

    const panels = ['Add', 'Pages', 'Navigator', 'Localize']
    const toggles = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? '')
      .filter((label) => panels.includes(label))

    expect(toggles).toEqual(['Add', 'Pages', 'Navigator', 'Localize'])
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
