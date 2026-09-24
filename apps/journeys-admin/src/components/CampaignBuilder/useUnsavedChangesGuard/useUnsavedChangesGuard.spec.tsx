import { renderHook } from '@testing-library/react'

import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

const routerEvents = vi.hoisted(() => ({
  handlers: new Map<string, (url: string) => void>(),
  emit: vi.fn()
}))
vi.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/campaigns/campaign-1',
    events: {
      on: (event: string, handler: (url: string) => void) =>
        routerEvents.handlers.set(event, handler),
      off: (event: string) => routerEvents.handlers.delete(event),
      emit: routerEvents.emit
    }
  })
}))

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    routerEvents.handlers.clear()
    routerEvents.emit.mockReset()
  })

  it('does nothing while the form is clean', () => {
    renderHook(() => useUnsavedChangesGuard(false))
    expect(routerEvents.handlers.has('routeChangeStart')).toBe(false)
  })

  it('blocks navigation when the user declines and allows it when they confirm', () => {
    const confirm = vi.spyOn(window, 'confirm')
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true))
    const handler = routerEvents.handlers.get('routeChangeStart')
    expect(handler).toBeDefined()

    confirm.mockReturnValue(false)
    expect(() => handler?.('/campaigns')).toThrow()
    expect(routerEvents.emit).toHaveBeenCalledWith('routeChangeError')

    confirm.mockReturnValue(true)
    expect(() => handler?.('/campaigns')).not.toThrow()

    unmount()
    expect(routerEvents.handlers.has('routeChangeStart')).toBe(false)
    confirm.mockRestore()
  })
})
