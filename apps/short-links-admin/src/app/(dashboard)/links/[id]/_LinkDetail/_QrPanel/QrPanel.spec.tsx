import { render, screen } from '@testing-library/react'

import { QrPanel, buildQrImageUrl } from './QrPanel'

describe('buildQrImageUrl', () => {
  it('builds a base-path /api/qr url that encodes the qr url', () => {
    const url = buildQrImageUrl({
      url: 'https://jesus.film/s/abc123?qr=1',
      format: 'svg',
      size: 1024,
      errorCorrectionLevel: 'H',
      quietZone: false,
      dark: '#000000',
      light: '#ffffff'
    })

    const [path, query] = url.split('?')
    expect(path).toBe('/s/dashboard/api/qr')
    expect(Object.fromEntries(new URLSearchParams(query))).toEqual({
      url: 'https://jesus.film/s/abc123?qr=1',
      format: 'svg',
      size: '1024',
      ec: 'H',
      margin: '0',
      dark: '#000000',
      light: '#ffffff'
    })
  })
})

describe('QrPanel', () => {
  it('points the preview and the download at the base-path route', () => {
    render(
      <QrPanel
        qrUrl="https://jesus.film/s/abc123?qr=1"
        pathname="abc123"
        assetClass="standard"
      />
    )

    expect(
      screen.getByRole('img', {
        name: 'QR code for https://jesus.film/s/abc123?qr=1'
      })
    ).toHaveAttribute(
      'src',
      expect.stringMatching(/^\/s\/dashboard\/api\/qr\?/)
    )
    expect(screen.getByRole('link', { name: 'Download PNG' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/s\/dashboard\/api\/qr\?/)
    )
  })
})
