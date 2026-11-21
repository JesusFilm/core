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
afterEach(() => vi.unstubAllGlobals())

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
