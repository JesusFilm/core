import { copyToClipboard } from './copyToClipboard'

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard
  const originalExecCommand = (
    document as Document & { execCommand?: () => boolean }
  ).execCommand

  beforeEach(() => {
    // jsdom does not implement document.execCommand. Stub a default so
    // jest.spyOn has something to wrap; tests override the impl.
    Object.defineProperty(document, 'execCommand', {
      value: () => false,
      configurable: true,
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true
    })
    Object.defineProperty(document, 'execCommand', {
      value: originalExecCommand,
      configurable: true,
      writable: true
    })
  })

  it('uses navigator.clipboard.writeText when available and resolved', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    await expect(copyToClipboard('hello')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('falls back to a copy-event listener when navigator.clipboard.writeText rejects', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('blocked'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    // Stub execCommand so it dispatches a synthetic copy event with a
    // fake ClipboardData implementation our handler can write to.
    const setData = jest.fn()
    const fakeClipboardData = { setData } as unknown as DataTransfer
    const execCommandSpy = jest
      .spyOn(document, 'execCommand')
      .mockImplementation(() => {
        const event = new Event('copy', {
          bubbles: true,
          cancelable: true
        }) as ClipboardEvent
        Object.defineProperty(event, 'clipboardData', {
          value: fakeClipboardData,
          configurable: true
        })
        document.dispatchEvent(event)
        return true
      })

    await expect(copyToClipboard('hi')).resolves.toBe(true)
    expect(setData).toHaveBeenCalledWith('text/plain', 'hi')
    expect(execCommandSpy).toHaveBeenCalledWith('copy')
    execCommandSpy.mockRestore()
  })

  it('returns false when execCommand throws', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('blocked'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const execCommandSpy = jest
      .spyOn(document, 'execCommand')
      .mockImplementation(() => {
        throw new Error('execCommand crashed')
      })

    await expect(copyToClipboard('x')).resolves.toBe(false)
    execCommandSpy.mockRestore()
  })

  it('returns false when execCommand reports success but no copy event fires', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('blocked'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    // Some browsers return true from execCommand without actually
    // dispatching the event when the document has no selection / focus
    // trap stole it. The fallback should report false in that case.
    const execCommandSpy = jest
      .spyOn(document, 'execCommand')
      .mockImplementation(() => true)

    await expect(copyToClipboard('x')).resolves.toBe(false)
    execCommandSpy.mockRestore()
  })
})
