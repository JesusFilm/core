// @vitest-environment node
import { NextRequest } from 'next/server'
import { getTokens } from 'next-firebase-auth-edge'
import QRCode from 'qrcode'
import { Mock } from 'vitest'

import { GET, parseQrParams } from './route'

vi.mock('next-firebase-auth-edge', () => ({
  getTokens: vi.fn()
}))

vi.mock('qrcode', () => ({
  default: {
    toString: vi.fn(),
    toBuffer: vi.fn()
  }
}))

const mockGetTokens = vi.mocked(getTokens)
const mockToString = QRCode.toString as unknown as Mock<
  (text: string, options?: unknown) => Promise<string>
>
const mockToBuffer = QRCode.toBuffer as unknown as Mock<
  (text: string, options?: unknown) => Promise<Buffer>
>

function makeRequest(query: string): NextRequest {
  return new NextRequest(`https://short-links-admin.example.com/api/qr${query}`)
}

describe('parseQrParams', () => {
  it('applies defaults', () => {
    const parsed = parseQrParams(
      new URLSearchParams({ url: 'https://nxstp.is/abc123?qr=1' })
    )

    expect(parsed).toEqual({
      params: {
        url: 'https://nxstp.is/abc123?qr=1',
        format: 'png',
        size: 512,
        errorCorrectionLevel: 'M',
        margin: 4,
        dark: '#000000',
        light: '#ffffff',
        filename: 'abc123.png'
      }
    })
  })

  it('rejects non-https and relative urls', () => {
    expect(
      parseQrParams(new URLSearchParams({ url: 'http://nxstp.is/abc' }))
    ).toEqual({ error: 'url must be an absolute https URL' })
    expect(parseQrParams(new URLSearchParams({ url: '/abc' }))).toEqual({
      error: 'url must be an absolute https URL'
    })
    expect(parseQrParams(new URLSearchParams({}))).toEqual({
      error: 'url is required'
    })
  })

  it('validates size, ec, margin, format and colours', () => {
    const base = { url: 'https://nxstp.is/abc' }
    expect(parseQrParams(new URLSearchParams({ ...base, size: '32' }))).toEqual(
      { error: 'size must be between 64 and 2048' }
    )
    expect(
      parseQrParams(new URLSearchParams({ ...base, size: '4096' }))
    ).toEqual({ error: 'size must be between 64 and 2048' })
    expect(parseQrParams(new URLSearchParams({ ...base, ec: 'X' }))).toEqual({
      error: 'ec must be one of L, M, Q, H'
    })
    expect(
      parseQrParams(new URLSearchParams({ ...base, margin: '-1' }))
    ).toEqual({ error: 'margin must be between 0 and 20' })
    expect(
      parseQrParams(new URLSearchParams({ ...base, format: 'jpg' }))
    ).toEqual({ error: 'format must be png or svg' })
    expect(
      parseQrParams(new URLSearchParams({ ...base, dark: 'black' }))
    ).toEqual({ error: 'dark and light must be hex colours' })
  })

  it('allows a zero margin and lower-case ec', () => {
    const parsed = parseQrParams(
      new URLSearchParams({
        url: 'https://nxstp.is/abc',
        margin: '0',
        ec: 'h',
        format: 'svg',
        dark: '#123',
        light: 'FFF'
      })
    )

    expect(parsed).toMatchObject({
      params: {
        margin: 0,
        errorCorrectionLevel: 'H',
        format: 'svg',
        dark: '#112233',
        light: '#ffffff',
        filename: 'abc.svg'
      }
    })
  })
})

describe('GET /api/qr', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTokens.mockResolvedValue({
      token: 'token',
      decodedToken: { uid: 'user' }
    } as unknown as Awaited<ReturnType<typeof getTokens>>)
    mockToString.mockResolvedValue('<svg/>')
    mockToBuffer.mockResolvedValue(Buffer.from('png-bytes'))
  })

  it('returns 401 without a session', async () => {
    mockGetTokens.mockResolvedValue(null)

    const response = await GET(makeRequest('?url=https://nxstp.is/abc'))

    expect(response.status).toBe(401)
    expect(mockToBuffer).not.toHaveBeenCalled()
  })

  it('returns 400 for a non-https url', async () => {
    const response = await GET(makeRequest('?url=http://nxstp.is/abc'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'url must be an absolute https URL'
    })
  })

  it('renders a png attachment by default', async () => {
    const response = await GET(
      makeRequest('?url=https://nxstp.is/abc123%3Fqr%3D1&size=256&ec=H')
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="abc123.png"'
    )
    expect(mockToBuffer).toHaveBeenCalledWith('https://nxstp.is/abc123?qr=1', {
      type: 'png',
      width: 256,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#ffffff' }
    })
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe(
      'png-bytes'
    )
  })

  it('renders an svg attachment with custom colours and no quiet zone', async () => {
    const response = await GET(
      makeRequest(
        '?url=https://nxstp.is/abc123&format=svg&margin=0&dark=%23112233&light=%23eeeeee'
      )
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="abc123.svg"'
    )
    expect(mockToString).toHaveBeenCalledWith('https://nxstp.is/abc123', {
      type: 'svg',
      width: 512,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#112233', light: '#eeeeee' }
    })
    await expect(response.text()).resolves.toBe('<svg/>')
  })
})
