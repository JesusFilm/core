import { render, screen } from '@testing-library/react'

import { QrPanel, buildQrImageUrl } from './QrPanel'

describe('buildQrImageUrl', () => {
  it('builds an /api/qr url that encodes the qr url', () => {
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
    expect(path).toBe('/api/qr')
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
  it('points the preview at the qr route', () => {
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
    ).toHaveAttribute('src', expect.stringMatching(/^\/api\/qr\?/))
  })

  it.each(['svg', 'png'])(
    'offers a %s download with no format picker',
    (format) => {
      render(
        <QrPanel
          qrUrl="https://jesus.film/s/abc123?qr=1"
          pathname="abc123"
          assetClass="standard"
        />
      )

      const link = screen.getByRole('link', {
        name: `Download ${format.toUpperCase()}`
      })
      const href = link.getAttribute('href') ?? ''
      expect(href).toMatch(/^\/api\/qr\?/)
      expect(new URLSearchParams(href.split('?')[1]).get('format')).toBe(format)
      expect(link).toHaveAttribute('download', `abc123.${format}`)
      expect(screen.queryByLabelText('Format')).not.toBeInTheDocument()
    }
  )
})
