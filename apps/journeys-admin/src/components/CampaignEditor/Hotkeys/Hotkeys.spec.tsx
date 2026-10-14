import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { StaticEditor } from '../testing'

import { Hotkeys } from './Hotkeys'

function StateProbe(): ReactElement {
  const {
    state: { panel, inspectorTab }
  } = useCampaignEditor()
  return (
    <>
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

function frameDocument(): Document {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  return iframe.contentDocument as Document
}

function pressInFrame(frame: Document, target: Element, key: string): void {
  const FrameKeyboardEvent = (frame.defaultView as Window & typeof globalThis)
    .KeyboardEvent
  act(() => {
    target.dispatchEvent(
      new FrameKeyboardEvent('keydown', {
        key,
        code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
        bubbles: true
      })
    )
  })
}

describe('Hotkeys', () => {
  describe('inside the canvas frame', () => {
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

    it('blurs the focused frame element, then closes the panel on Escape', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const input = frame.createElement('input')
      frame.body.appendChild(input)
      input.focus()

      pressInFrame(frame, input, 'Escape')

      expect(frame.activeElement).not.toBe(input)
      expect(screen.getByTestId('Panel')).toHaveTextContent('none')
    })

    it('ignores the letters from inside a select', () => {
      const frame = frameDocument()
      render(<FrameHotkeys frame={frame} />)
      const select = frame.createElement('div')
      select.setAttribute('role', 'combobox')
      frame.body.appendChild(select)

      pressInFrame(frame, select, 'd')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('style')

      pressInFrame(frame, frame.body, 'd')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('settings')
    })
  })

  describe('in the editor shell', () => {
    it('ignores the letters while a select is focused or its listbox is open', async () => {
      render(
        <StaticEditor>
          <Hotkeys />
          <StateProbe />
          <div role="combobox" tabIndex={0} aria-label="Language" />
          <ul role="listbox" tabIndex={0} aria-label="Languages" />
        </StaticEditor>
      )

      screen.getByRole('combobox', { name: 'Language' }).focus()
      await userEvent.keyboard('dp')
      screen.getByRole('listbox', { name: 'Languages' }).focus()
      await userEvent.keyboard('dp')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('style')
      expect(screen.getByTestId('Panel')).toHaveTextContent('none')
      ;(document.activeElement as HTMLElement).blur()
      await userEvent.keyboard('d')
      expect(screen.getByTestId('InspectorTab')).toHaveTextContent('settings')
    })
  })
})
