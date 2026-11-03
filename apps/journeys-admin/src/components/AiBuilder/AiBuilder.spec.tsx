import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { AiBuilder } from './AiBuilder'
import type { AiBuilderDraft } from './libs/aiBuilderDraft'
import { DRAFTS_STORAGE_KEY } from './libs/useAiBuilderDrafts'
import { useAiBuilderRun } from './libs/useAiBuilderRun'

vi.mock('./libs/useAiBuilderRun', () => ({
  useAiBuilderRun: vi.fn()
}))

vi.mock('./AiBuilderPreview', () => ({
  AiBuilderPreview: () => <div data-testid="AiBuilderPreview" />
}))

const mockUseAiBuilderRun = vi.mocked(useAiBuilderRun)

function mockRun(running: boolean): {
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
} {
  const start = vi.fn()
  const stop = vi.fn()
  mockUseAiBuilderRun.mockReturnValue({ running, status: null, start, stop })
  return { start, stop }
}

function storedDrafts(): AiBuilderDraft[] {
  return JSON.parse(window.localStorage.getItem(DRAFTS_STORAGE_KEY) ?? '[]')
}

function send(text: string): void {
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), {
    target: { value: text }
  })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
}

const storedDraft: AiBuilderDraft = {
  id: 'd1',
  title: 'Prayer check-in',
  createdAt: '2026-10-09T00:00:00Z',
  updatedAt: '2026-10-09T00:00:00Z',
  messages: [{ id: 'm1', role: 'user', content: 'A prayer journey' }],
  summary: '',
  summarisedCount: 0,
  journey: null,
  blocks: [],
  pendingPlan: null,
  warnings: []
}

describe('AiBuilder', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('creates a draft for the first message, stores it and starts a run', async () => {
    const { start } = mockRun(false)
    render(<AiBuilder />)

    send('An Easter journey for teens')

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'An Easter journey for teens',
        messages: [
          expect.objectContaining({ content: 'An Easter journey for teens' })
        ]
      })
    )
    await waitFor(() =>
      expect(storedDrafts()).toEqual([
        expect.objectContaining({ title: 'An Easter journey for teens' })
      ])
    )
  })

  it('makes a message sent during a run wait, and lets it be removed', () => {
    const { start } = mockRun(true)
    render(<AiBuilder />)

    send('Make it shorter')

    expect(start).not.toHaveBeenCalled()
    expect(screen.getByText('Waiting')).toBeInTheDocument()
    fireEvent.click(
      screen
        .getByRole('button', { name: 'Remove waiting message' })
        .querySelector('svg') as Element
    )
    expect(screen.queryByText('Waiting')).not.toBeInTheDocument()
  })

  it('starts the waiting message once the run ends', async () => {
    window.localStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify([storedDraft])
    )
    const { start } = mockRun(true)
    const { rerender } = render(<AiBuilder />)
    await screen.findByText('Prayer check-in')
    send('Make it shorter')

    const { start: nextStart } = mockRun(false)
    rerender(<AiBuilder />)

    expect(start).not.toHaveBeenCalled()
    expect(nextStart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'd1',
        messages: [
          expect.objectContaining({ content: 'A prayer journey' }),
          expect.objectContaining({ content: 'Make it shorter' })
        ]
      })
    )
  })

  it('shows the stop button during a run', () => {
    const { stop } = mockRun(true)
    render(<AiBuilder />)

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))

    expect(stop).toHaveBeenCalled()
  })

  it('loads stored drafts and lists them', async () => {
    window.localStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify([storedDraft])
    )
    mockRun(false)

    render(<AiBuilder />)

    expect(await screen.findByText('Prayer check-in')).toBeInTheDocument()
    expect(screen.getByText('A prayer journey')).toBeInTheDocument()
  })
})
