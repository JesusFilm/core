import { webcrypto } from 'node:crypto'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { McpImageUpload } from './McpImageUpload'

vi.mock('../../libs/auth', () => ({
  useAuth: () => ({
    user: {
      id: 'alice',
      token: 'controlled-firebase-token',
      isAnonymous: false
    }
  })
}))
const endpoint =
  'https://media.synthetic.example/mcp/uploads/12345678-1234-1234-1234-123456789abc'
const job = {
  jobId: '12345678-1234-1234-1234-123456789abc',
  journeyId: 'synthetic-draft',
  clientId: 'synthetic-client',
  state: 'waiting_for_file',
  transferDeadline: '2026-11-21T06:00:00Z',
  receivedBytes: 0
}

describe('McpImageUpload', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([3, 1048579])(
    'stops at an unacknowledged chunk and immediately retries the same %s-byte file',
    async (size) => {
      vi.stubGlobal('crypto', webcrypto)
      const offsets: string[] = []
      const actions: string[] = []
      let receivedBytes = 0
      let pending = true
      vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
        const headers = init.headers as Record<string, string>
        const action = headers['X-Upload-Action']
        if (action) actions.push(action)
        if (init.method === 'PUT') {
          offsets.push(headers['X-Upload-Offset'])
          if (!pending) receivedBytes += (init.body as ArrayBuffer).byteLength
        }
        return Response.json({
          data: {
            ...job,
            state: action === 'resume' ? 'ready' : 'transferring',
            receivedBytes
          }
        })
      })
      const { container } = render(<McpImageUpload endpoint={endpoint} />)
      await screen.findByText(/synthetic-client/)
      const bytes = new Uint8Array(size)
      const file = new File([bytes], 'fixture.png', { type: 'image/png' })
      Object.defineProperty(file, 'arrayBuffer', {
        value: async () => bytes.buffer
      })
      const input =
        container.querySelector<HTMLInputElement>('input[type=file]')!
      Object.defineProperty(input, 'value', {
        configurable: true,
        writable: true,
        value: 'fixture.png'
      })
      fireEvent.change(input, { target: { files: [file] } })
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Your original job and deadline are preserved'
      )
      expect(offsets).toEqual(['0'])
      expect(actions).not.toContain('resume')
      expect(input.value).toBe('')
      pending = false
      fireEvent.change(input, { target: { files: [file] } })
      expect(
        await screen.findByText(/Ready in your media library/)
      ).toBeInTheDocument()
      expect(offsets).toEqual(
        size > 1048576 ? ['0', '0', '1048576'] : ['0', '0']
      )
      expect(actions.filter((action) => action === 'resume')).toHaveLength(1)
      expect(receivedBytes).toBe(size)
    }
  )

  it('shows the originating client and deadline and streams the same image separately from attachment', async () => {
    vi.stubGlobal('crypto', webcrypto)
    const calls: Array<{ url: string; init: RequestInit }> = []
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      const action = (init.headers as Record<string, string>)['X-Upload-Action']
      if (action === 'bind')
        return Response.json({
          data: {
            ...job,
            file: { name: 'fixture.png', size: 3 },
            receivedBytes: 0
          }
        })
      if (init.method === 'PUT')
        return Response.json({
          data: { ...job, state: 'validating', receivedBytes: 3 }
        })
      return Response.json({
        data: { ...job, ...(action === 'resume' ? { state: 'ready' } : {}) }
      })
    })
    const { container } = render(<McpImageUpload endpoint={endpoint} />)
    expect(await screen.findByText(/synthetic-client/)).toBeInTheDocument()
    expect(screen.getByText(/2026-11-21T06:00:00Z/)).toBeInTheDocument()
    const file = new File(['abc'], 'fixture.png', { type: 'image/png' })
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => new TextEncoder().encode('abc').buffer
    })
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [file] }
    })
    expect(
      await screen.findByText(/Ready in your media library/)
    ).toBeInTheDocument()
    const put = calls.find((call) => call.init.method === 'PUT')!
    expect(put.url).toBe(endpoint)
    expect(put.init.headers).toMatchObject({
      Authorization: 'JWT controlled-firebase-token',
      'X-Upload-Offset': '0',
      'X-Upload-Sha256':
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    })
    expect(calls.some((call) => call.url.includes('journey_edit'))).toBe(false)
    expect(calls.every((call) => call.init.credentials === 'omit')).toBe(true)
  })

  it.each(['validating', 'dispatch_pending'])(
    'resumes the same completed transfer after refresh in %s',
    async (state) => {
      const calls: RequestInit[] = []
      vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
        calls.push(init)
        const action = (init.headers as Record<string, string>)[
          'X-Upload-Action'
        ]
        return Response.json({
          data: {
            ...job,
            state: action === 'resume' ? 'ready' : state,
            receivedBytes: 3
          }
        })
      })
      const { container } = render(<McpImageUpload endpoint={endpoint} />)
      fireEvent.click(
        await screen.findByRole('button', { name: 'Resume image processing' })
      )
      expect(
        await screen.findByText(/Ready in your media library/)
      ).toBeInTheDocument()
      expect(screen.getByText(/2026-11-21T06:00:00Z/)).toBeInTheDocument()
      expect(container.querySelector('input[type=file]')).toBeNull()
      expect(calls.filter((call) => call.method === 'POST')).toHaveLength(1)
      expect(calls[1].headers).toMatchObject({
        Authorization: 'JWT controlled-firebase-token',
        'X-Upload-Action': 'resume'
      })
    }
  )

  it('recovers a lost final-chunk response through status and a same-job resume, without sending the file again', async () => {
    vi.stubGlobal('crypto', webcrypto)
    let transferred = false
    const calls: RequestInit[] = []
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      calls.push(init)
      const action = (init.headers as Record<string, string>)['X-Upload-Action']
      if (init.method === 'PUT') {
        transferred = true
        throw new Error('Controlled lost final response')
      }
      return Response.json({
        data: {
          ...job,
          receivedBytes: transferred ? 3 : 0,
          state:
            action === 'resume'
              ? 'ready'
              : transferred
                ? 'validating'
                : 'waiting_for_file'
        }
      })
    })
    const { container, unmount } = render(
      <McpImageUpload endpoint={endpoint} />
    )
    await screen.findByText(/synthetic-client/)
    const file = new File(['abc'], 'fixture.png', { type: 'image/png' })
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => new TextEncoder().encode('abc').buffer
    })
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [file] }
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your original job and deadline are preserved'
    )
    unmount()
    render(<McpImageUpload endpoint={endpoint} />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Resume image processing' })
    )
    expect(
      await screen.findByText(/Ready in your media library/)
    ).toBeInTheDocument()
    expect(calls.filter((call) => call.method === 'PUT')).toHaveLength(1)
    expect(
      calls.filter(
        (call) =>
          (call.headers as Record<string, string>)['X-Upload-Action'] === 'bind'
      )
    ).toHaveLength(1)
  })

  it('keeps a denied resume available on the original job', async () => {
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) =>
      init.method === 'POST'
        ? new Response('{}', { status: 403 })
        : Response.json({ data: { ...job, state: 'validating' } })
    )
    render(<McpImageUpload endpoint={endpoint} />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Resume image processing' })
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your original job and deadline are preserved'
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Resume image processing' })
      ).toBeEnabled()
    )
  })

  it('shows origin-grant denial without starting another upload', async () => {
    const fetch = vi.fn(async () => new Response('{}', { status: 403 }))
    vi.stubGlobal('fetch', fetch)
    render(<McpImageUpload endpoint={endpoint} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your original job and deadline are preserved'
    )
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(
      screen.queryByText('Choose the same image to upload or resume')
    ).not.toBeInTheDocument()
  })
})
