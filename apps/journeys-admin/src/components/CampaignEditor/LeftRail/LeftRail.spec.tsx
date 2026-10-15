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

function Harness({ isManager = true }: { isManager?: boolean }): ReactElement {
  const [view, setView] = useState<CanvasView>('desktop')
  return (
    <SnackbarProvider>
      <StaticEditor campaignProp={campaign}>
        <AddCommandButton />
        <CommandProbe />
        <PanelProbe />
        <span data-testid="View">{view}</span>
        <LeftRail view={view} onViewChange={setView} isManager={isManager} />
      </StaticEditor>
    </SnackbarProvider>
  )
}

describe('LeftRail', () => {
  it('links back to the campaigns list', () => {
    render(<Harness />)

    expect(
      screen.getByRole('link', { name: 'Back to campaigns' })
    ).toHaveAttribute('href', '/campaigns')
  })

  it('toggles the Pages, Add and Localize panels, one open at a time', () => {
    render(<Harness />)
    const pages = screen.getByRole('button', { name: 'Pages' })
    const localize = screen.getByRole('button', { name: 'Localize' })
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('none')

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
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('none')
  })

  it('lists the panel toggles as Pages, Navigator, Add, Localize', () => {
    render(<Harness />)

    const panels = ['Pages', 'Navigator', 'Add', 'Localize']
    const toggles = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? '')
      .filter((label) => panels.includes(label))

    expect(toggles).toEqual(['Pages', 'Navigator', 'Add', 'Localize'])
  })

  it('toggles the Navigator panel', () => {
    render(<Harness />)
    const navigator = screen.getByRole('button', { name: 'Navigator' })

    fireEvent.click(navigator)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('navigator')
    expect(navigator).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(navigator)
    expect(screen.getByTestId('OpenPanel')).toHaveTextContent('none')
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
