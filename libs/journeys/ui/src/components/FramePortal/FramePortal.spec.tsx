import Typography from '@mui/material/Typography'
import { render, waitFor } from '@testing-library/react'

import { FramePortal } from '.'

describe('FramePortal', () => {
  it('should render children in iframe', async () => {
    const { baseElement } = render(
      <div>
        <FramePortal dir="ltr">
          <Typography sx={{ fontFamily: 'sans-serif' }}>hello world</Typography>
        </FramePortal>
      </div>
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.getElementsByTagName('p')[0].innerHTML
      ).toBe('hello world')
    )
    expect(iframe.contentDocument?.body).toHaveStyle(
      'background-color: rgba(0, 0, 0, 0)'
    )
  })

  it('should load Sarabun in the injected Google Fonts link when no author fonts are supplied', async () => {
    const { baseElement } = render(
      <div>
        <FramePortal dir="ltr">
          <Typography>hello world</Typography>
        </FramePortal>
      </div>
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() => {
      const link = iframe.contentDocument?.head.querySelector(
        'link[href*="fonts.googleapis.com"]'
      )
      expect(link?.getAttribute('href')).toContain('family=Sarabun')
    })
  })

  it('should load author fonts alongside Sarabun in the injected Google Fonts link', async () => {
    const { baseElement } = render(
      <div>
        <FramePortal
          dir="ltr"
          fontFamilies={{
            headerFont: 'Playfair Display',
            bodyFont: 'Lora',
            labelFont: 'Lora'
          }}
        >
          <Typography>hello world</Typography>
        </FramePortal>
      </div>
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() => {
      const href = iframe.contentDocument?.head
        .querySelector('link[href*="fonts.googleapis.com"]')
        ?.getAttribute('href')
      expect(href).toContain('family=Playfair+Display')
      expect(href).toContain('family=Sarabun')
      expect(href?.match(/family=Lora/g)).toHaveLength(1)
    })
  })
})
