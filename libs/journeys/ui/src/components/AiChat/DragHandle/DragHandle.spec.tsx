import { fireEvent, render } from '@testing-library/react'
import { type Mock } from 'vitest'

import { DragHandle } from './DragHandle'

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

function renderHandle(props: {
  collapsed?: boolean
  onCollapse?: Mock
  onExpand?: Mock
}) {
  const onCollapse = props.onCollapse ?? vi.fn()
  const onExpand = props.onExpand ?? vi.fn()
  const utils = render(
    <DragHandle
      collapsed={props.collapsed ?? false}
      onCollapse={onCollapse}
      onExpand={onExpand}
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

  it('collapses when tapped while expanded', () => {
    const { getByTestId, onCollapse, onExpand } = renderHandle({})
    fireEvent.click(getByTestId('ChatDragHandle'))
    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onExpand).not.toHaveBeenCalled()
  })

  it('expands when tapped while collapsed', () => {
    const { getByTestId, onCollapse, onExpand } = renderHandle({
      collapsed: true
    })
    fireEvent.click(getByTestId('ChatDragHandle'))
    expect(onExpand).toHaveBeenCalledTimes(1)
    expect(onCollapse).not.toHaveBeenCalled()
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
