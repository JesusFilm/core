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
    expect(
      iframe.contentDocument?.body.getElementsByTagName('p')[0]
    ).toHaveStyle('font-family: sans-serif')
    expect(iframe.contentDocument?.body).toHaveStyle(
      'background-color: rgba(0, 0, 0, 0)'
    )
  })
})
