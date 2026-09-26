import { NextRequest, NextResponse } from 'next/server'
import { getTokens } from 'next-firebase-auth-edge'
import QRCode from 'qrcode'

import { authConfig } from '../../../libs/auth'
import { normalizeHexColor } from '../../../libs/contrast'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIN_SIZE = 64
const MAX_SIZE = 2048
const DEFAULT_SIZE = 512
const DEFAULT_MARGIN = 4
const MAX_MARGIN = 20
const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const
type ErrorCorrectionLevel = (typeof ERROR_CORRECTION_LEVELS)[number]
type Format = 'png' | 'svg'

export interface QrParams {
  url: string
  format: Format
  size: number
  errorCorrectionLevel: ErrorCorrectionLevel
  margin: number
  dark: string
  light: string
  filename: string
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

function parseInteger(
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number | undefined {
  if (value == null || value === '') return fallback
  if (!/^\d+$/.test(value)) return undefined
  const parsed = Number(value)
  if (parsed < min || parsed > max) return undefined
  return parsed
}

function slugFromUrl(url: URL): string {
  const segment = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const slug = segment.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return slug === '' ? 'qr' : slug
}

export function parseQrParams(
  searchParams: URLSearchParams
): { params: QrParams } | { error: string } {
  const rawUrl = searchParams.get('url')
  if (rawUrl == null || rawUrl === '') return { error: 'url is required' }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return { error: 'url must be an absolute https URL' }
  }
  if (url.protocol !== 'https:')
    return { error: 'url must be an absolute https URL' }

  const format = searchParams.get('format') ?? 'png'
  if (format !== 'png' && format !== 'svg')
    return { error: 'format must be png or svg' }

  const size = parseInteger(
    searchParams.get('size'),
    DEFAULT_SIZE,
    MIN_SIZE,
    MAX_SIZE
  )
  if (size == null)
    return { error: `size must be between ${MIN_SIZE} and ${MAX_SIZE}` }

  const errorCorrectionLevel = (searchParams.get('ec') ?? 'M').toUpperCase()
  if (
    !ERROR_CORRECTION_LEVELS.includes(
      errorCorrectionLevel as ErrorCorrectionLevel
    )
  )
    return { error: 'ec must be one of L, M, Q, H' }

  const margin = parseInteger(
    searchParams.get('margin'),
    DEFAULT_MARGIN,
    0,
    MAX_MARGIN
  )
  if (margin == null)
    return { error: `margin must be between 0 and ${MAX_MARGIN}` }

  const dark = normalizeHexColor(searchParams.get('dark') ?? '#000000')
  const light = normalizeHexColor(searchParams.get('light') ?? '#ffffff')
  if (dark == null || light == null)
    return { error: 'dark and light must be hex colours' }

  return {
    params: {
      url: url.toString(),
      format,
      size,
      errorCorrectionLevel: errorCorrectionLevel as ErrorCorrectionLevel,
      margin,
      dark,
      light,
      filename: `${slugFromUrl(url)}.${format}`
    }
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokens = await getTokens(request.cookies, authConfig)
  if (tokens == null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = parseQrParams(request.nextUrl.searchParams)
  if ('error' in parsed) return badRequest(parsed.error)

  const { params } = parsed
  const options = {
    width: params.size,
    margin: params.margin,
    errorCorrectionLevel: params.errorCorrectionLevel,
    color: { dark: params.dark, light: params.light }
  }
  const headers = {
    'Content-Disposition': `attachment; filename="${params.filename}"`,
    'Cache-Control': 'private, no-store'
  }

  if (params.format === 'svg') {
    const svg = await QRCode.toString(params.url, { ...options, type: 'svg' })
    return new NextResponse(svg, {
      status: 200,
      headers: { ...headers, 'Content-Type': 'image/svg+xml' }
    })
  }

  const png = await QRCode.toBuffer(params.url, { ...options, type: 'png' })
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'image/png' }
  })
}
