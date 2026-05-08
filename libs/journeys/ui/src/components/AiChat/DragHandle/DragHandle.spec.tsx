import { fireEvent, render } from '@testing-library/react'

import { DragHandle } from './DragHandle'

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

interface RenderHandleArgs {
  collapsed?: boolean
  onCollapse?: jest.Mock
  onExpand?: jest.Mock
  onDragStart?: jest.Mock
  onDrag?: jest.Mock
  onDragEnd?: jest.Mock
}

function renderHandle(props: RenderHandleArgs = {}) {
  const onCollapse = props.onCollapse ?? jest.fn()
  const onExpand = props.onExpand ?? jest.fn()
  const utils = render(
    <DragHandle
      collapsed={props.collapsed ?? false}
      onCollapse={onCollapse}
      onExpand={onExpand}
      onDragStart={props.onDragStart}
      onDrag={props.onDrag}
      onDragEnd={props.onDragEnd}
    />
  )
  return { ...utils, onCollapse, onExpand }
}

describe('DragHandle', () => {
  it('exposes the right aria-label for each state', () => {
    const { getByTestId, rerender } = renderHandle({ collapsed: false })
    expect(getByTestId('ChatDragHandle')).toHaveAttribute(
      'aria-label',
      'Collapse chat'
    )
    rerender(
      <DragHandle
        collapsed
        onCollapse={() => undefined}
        onExpand={() => undefined}
      />
    )
    expect(getByTestId('ChatDragHandle')).toHaveAttribute(
      'aria-label',
      'Expand chat'
    )
  })

  describe('uncontrolled (no parent drag handlers)', () => {
    it('calls onCollapse when dragged down past the threshold', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({})
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 200 })
      fireEvent.mouseUp(window)
      expect(onCollapse).toHaveBeenCalledTimes(1)
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('calls onExpand when dragged up past the threshold', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({
        collapsed: true
      })
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 200 })
      fireEvent.mouseMove(window, { clientY: 100 })
      fireEvent.mouseUp(window)
      expect(onExpand).toHaveBeenCalledTimes(1)
      expect(onCollapse).not.toHaveBeenCalled()
    })

    it('does not treat sub-threshold movement as a drag', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({})
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 110 })
      fireEvent.mouseUp(window)
      expect(onCollapse).not.toHaveBeenCalled()
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('toggles via tap when no movement occurs', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({})
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      fireEvent.mouseUp(window)
      expect(onCollapse).toHaveBeenCalledTimes(1)
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('toggles via tap from the collapsed state', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({
        collapsed: true
      })
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 200 })
      fireEvent.mouseUp(window)
      expect(onExpand).toHaveBeenCalledTimes(1)
      expect(onCollapse).not.toHaveBeenCalled()
    })

    it('does not treat a drag-then-return gesture as a tap', () => {
      // Regression: movedRef tracked the final delta, so dragging far
      // and returning to ~0 left moved < tap threshold and a synthetic
      // tap toggled the sheet. Now max abs displacement is tracked.
      const { getByTestId, onCollapse, onExpand } = renderHandle({})
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 200 })
      fireEvent.mouseMove(window, { clientY: 100 })
      fireEvent.mouseUp(window)
      // Final delta is 0 (back to start) and max abs displacement is
      // 100px — the gesture must NOT fire a tap-toggle.
      expect(onCollapse).not.toHaveBeenCalled()
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('toggles via Enter key', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({})
      fireEvent.keyDown(getByTestId('ChatDragHandle'), { key: 'Enter' })
      expect(onCollapse).toHaveBeenCalledTimes(1)
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('toggles via Space key when collapsed', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({
        collapsed: true
      })
      fireEvent.keyDown(getByTestId('ChatDragHandle'), { key: ' ' })
      expect(onExpand).toHaveBeenCalledTimes(1)
      expect(onCollapse).not.toHaveBeenCalled()
    })
  })

  describe('controlled (parent owns snap)', () => {
    it('forwards live drag deltas through onDrag', () => {
      const onDrag = jest.fn()
      const onDragStart = jest.fn()
      const onDragEnd = jest.fn()
      const { getByTestId } = renderHandle({ onDragStart, onDrag, onDragEnd })
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      expect(onDragStart).toHaveBeenCalledTimes(1)
      fireEvent.mouseMove(window, { clientY: 130 })
      fireEvent.mouseMove(window, { clientY: 160 })
      fireEvent.mouseUp(window)
      expect(onDrag).toHaveBeenCalledWith(30)
      expect(onDrag).toHaveBeenCalledWith(60)
      expect(onDragEnd).toHaveBeenCalledWith(60)
    })

    it('does not fire onCollapse on drag-end when controlled', () => {
      const onDragEnd = jest.fn()
      const { getByTestId, onCollapse, onExpand } = renderHandle({
        onDragEnd
      })
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      fireEvent.mouseMove(window, { clientY: 200 })
      fireEvent.mouseUp(window)
      expect(onDragEnd).toHaveBeenCalledWith(100)
      // Parent owns the snap — handle must not also toggle.
      expect(onCollapse).not.toHaveBeenCalled()
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('still collapses on tap from the expanded state', () => {
      const { getByTestId, onCollapse, onExpand } = renderHandle({
        onDragStart: jest.fn(),
        onDrag: jest.fn(),
        onDragEnd: jest.fn()
      })
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 100 })
      fireEvent.mouseUp(window)
      expect(onCollapse).toHaveBeenCalledTimes(1)
      expect(onExpand).not.toHaveBeenCalled()
    })

    it('does not expand on tap from the collapsed state — drag only', () => {
      // Collapsed bar is a thin strip; we don't want a stray pointer tap
      // to accidentally pop the sheet open. Expanding requires drag.
      const { getByTestId, onCollapse, onExpand } = renderHandle({
        collapsed: true,
        onDragStart: jest.fn(),
        onDrag: jest.fn(),
        onDragEnd: jest.fn()
      })
      const handle = getByTestId('ChatDragHandle')
      fireEvent.mouseDown(handle, { clientY: 200 })
      fireEvent.mouseUp(window)
      expect(onExpand).not.toHaveBeenCalled()
      expect(onCollapse).not.toHaveBeenCalled()
    })

    it('still expands via keyboard Enter when collapsed', () => {
      const { getByTestId, onExpand } = renderHandle({
        collapsed: true,
        onDragStart: jest.fn(),
        onDrag: jest.fn(),
        onDragEnd: jest.fn()
      })
      fireEvent.keyDown(getByTestId('ChatDragHandle'), { key: 'Enter' })
      expect(onExpand).toHaveBeenCalledTimes(1)
    })
  })
})
