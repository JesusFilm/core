import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { StaticEditor } from '../testing'

import { Hotkeys } from './Hotkeys'

function StateProbe(): ReactElement {
  const {
    state: { panel, inspectorTab, navigatorExpandRequest }
  } = useCampaignEditor()
  return (
    <>
      <span data-testid="NavigatorExpandRequest">{navigatorExpandRequest}</span>
      <span data-testid="Panel">{panel}</span>
      <span data-testid="InspectorTab">{inspectorTab}</span>
    </>
  )
}

function FrameHotkeys({ frame }: { frame: Document }): ReactElement {
  return (
    <StaticEditor initialState={{ panel: 'pages' }}>
      <Hotkeys document={frame} />
      <StateProbe />
    </StaticEditor>
  )
}

const undoCommand = vi.fn()
const redoCommand = vi.fn()

function AddCommand(): ReactElement {
  const { add } = useCommand()
  return (
    <button
      onClick={() =>
        add({
          parameters: { execute: undefined, undo: undefined },
          execute: () => undefined,
          undo: undoCommand,
          redo: redoCommand
        })
      }
    >
      Add command
    </button>
  )
}

const frames: HTMLIFrameElement[] = []

/** A frame document like the canvas's; removed again after each test. */
function frameDocument(): Document {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  frames.push(iframe)
  return iframe.contentDocument as Document
}

function pressInFrame(
  frame: Document,
  target: Element,
  key: string,
  modifiers: KeyboardEventInit = {}
): void {
  const FrameKeyboardEvent = (frame.defaultView as Window & typeof globalThis)
    .KeyboardEvent
  act(() => {
    target.dispatchEvent(
      new FrameKeyboardEvent('keydown', {
        key,
        code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
        bubbles: true,
        ...modifiers
      })
    )
  })
}

describe('Hotkeys', () => {
  afterEach(() => {
    frames.splice(0).forEach((iframe) => iframe.remove())
  })

  describe('inside the canvas frame', () => {
    beforeEach(() => vi.clearAllMocks())

    it('undoes on ⌘Z and redoes on ⇧⌘Z fired on the frame document, even from an input', () => {
      const frame = frameDocument()
      render(
        <StaticEditor>
          <Hotkeys document={frame} />
          <AddCommand />
        </StaticEditor>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Add command' }))
      const input = frame.createElement('input')
      frame.body.appendChild(input)
      input.focus()

      pressInFrame(frame, input, 'z', { metaKey: true })
      expect(undoCommand).toHaveBeenCalledTimes(1)
      expect(redoCommand).not.toHaveBeenCalled()

      pressInFrame(frame, input, 'z', { metaKey: true, shiftKey: true })
      expect(redoCommand).toHaveBeenCalledTimes(1)
      expect(undoCommand).toHaveBeenCalledTimes(1)
    })

    it('expands or collapses the Navigator tree on Option+Z, and Z alone opens the panel', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)

      pressInFrame(frame, frame.body, 'z', { altKey: true })
      expect(screen.getByTestId('NavigatorExpandRequest')).toHaveTextContent(
        '1'
      )
      expect(screen.getByTestId('Panel')).toHaveTextContent('pages')

      pressInFrame(frame, frame.body, 'z')
      expect(screen.getByTestId('NavigatorExpandRequest')).toHaveTextContent(
        '1'
      )
      expect(screen.getByTestId('Panel')).toHaveTextContent('navigator')
    })

    it('leaves Escape to a dialog portaled into the frame', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const dialog = frame.createElement('div')
      dialog.className = 'MuiModal-root'
      dialog.tabIndex = -1
      frame.body.appendChild(dialog)
      dialog.focus()

      pressInFrame(frame, dialog, 'Escape')

      expect(screen.getByTestId('Panel')).toHaveTextContent('pages')
      expect(frame.activeElement).toBe(dialog)
    })

    it('blurs the focused frame element on Escape and leaves the panel open', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const input = frame.createElement('input')
      frame.body.appendChild(input)
      input.focus()

      pressInFrame(frame, input, 'Escape')

      expect(frame.activeElement).not.toBe(input)
      expect(screen.getByTestId('Panel')).toHaveTextContent('pages')
    })

    it('ignores the letters from inside an open select', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const select = frame.createElement('div')
      select.setAttribute('role', 'combobox')
      select.setAttribute('aria-expanded', 'true')
      frame.body.appendChild(select)

      pressInFrame(frame, select, 'd')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('style')

      pressInFrame(frame, frame.body, 'd')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('settings')
    })

    it('keeps the letters working from a closed select trigger', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const select = frame.createElement('div')
      select.setAttribute('role', 'combobox')
      select.setAttribute('aria-expanded', 'false')
      frame.body.appendChild(select)

      pressInFrame(frame, select, 'd')

      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('settings')
    })

    it('ignores the letters from inside a dialog portaled into the frame', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const dialog = frame.createElement('div')
      dialog.className = 'MuiModal-root'
      const button = frame.createElement('button')
      dialog.appendChild(button)
      frame.body.appendChild(dialog)

      pressInFrame(frame, button, 'p')
      pressInFrame(frame, button, 'd')

      expect(screen.getByTestId('Panel')).toHaveTextContent('pages')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('style')
    })
  })

  describe('in the editor shell', () => {
    it('ignores the letters while a select is open', async () => {
      render(
        <StaticEditor>
          <Hotkeys />
          <StateProbe />
          <div
            role="combobox"
            aria-expanded="true"
            tabIndex={0}
            aria-label="Language"
          />
          <ul role="listbox" tabIndex={0} aria-label="Languages" />
        </StaticEditor>
      )

      screen.getByRole('combobox', { name: 'Language' }).focus()
      await userEvent.keyboard('dp')
      screen.getByRole('listbox', { name: 'Languages' }).focus()
      await userEvent.keyboard('dp')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('style')
      expect(screen.getByTestId('Panel')).toHaveTextContent('add')
    })

    it('keeps the letters working from a closed, focused select', async () => {
      render(
        <StaticEditor>
          <Hotkeys />
          <StateProbe />
          <div
            role="combobox"
            aria-expanded="false"
            tabIndex={0}
            aria-label="Language"
          />
        </StaticEditor>
      )

      screen.getByRole('combobox', { name: 'Language' }).focus()
      await userEvent.keyboard('dp')

      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('settings')
      expect(screen.getByTestId('Panel')).toHaveTextContent('pages')
    })

    it('ignores the letters while a dialog has focus', async () => {
      render(
        <StaticEditor>
          <Hotkeys />
          <StateProbe />
          <div className="MuiModal-root">
            <button type="button">Confirm</button>
          </div>
        </StaticEditor>
      )

      screen.getByRole('button', { name: 'Confirm' }).focus()
      await userEvent.keyboard('dp')

      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('style')
      expect(screen.getByTestId('Panel')).toHaveTextContent('add')
    })
  })
})
