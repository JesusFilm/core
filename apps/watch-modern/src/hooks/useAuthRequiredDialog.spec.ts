import { act, renderHook } from '@testing-library/react'

import { useAuthRequiredDialog } from './useAuthRequiredDialog'

describe('useAuthRequiredDialog', () => {
  it('opens for limit prompts and closes after sign-in', async () => {
    const resumeAction = jest.fn()
    const onSignedIn = jest.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAuthRequiredDialog({
        onSignedIn
      })
    )

    act(() => {
      result.current.requestAuth({
        reason: 'limit',
        message: 'Daily limit reached',
        remaining: 0,
        resumeAction
      })
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.dialogState).toEqual({
      reason: 'limit',
      message: 'Daily limit reached',
      remaining: 0
    })

    await act(async () => {
      await result.current.onSignInSuccess()
    })

    expect(onSignedIn).toHaveBeenCalledTimes(1)
    expect(result.current.isOpen).toBe(false)
    expect(result.current.resumeRequested).toBe(true)

    await act(async () => {
      await result.current.runPendingAction()
    })

    expect(resumeAction).toHaveBeenCalledTimes(1)
    expect(result.current.resumeRequested).toBe(false)
  })

  it('clears pending action when dialog closes without signing in', () => {
    const resumeAction = jest.fn()
    const { result } = renderHook(() => useAuthRequiredDialog())

    act(() => {
      result.current.requestAuth({
        reason: 'attachment',
        message: 'Sign in to add images',
        resumeAction
      })
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.onOpenChange(false)
    })

    expect(result.current.isOpen).toBe(false)

    act(() => {
      void result.current.runPendingAction()
    })

    expect(resumeAction).not.toHaveBeenCalled()
  })
})
