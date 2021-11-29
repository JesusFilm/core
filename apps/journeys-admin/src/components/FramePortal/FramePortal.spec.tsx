import { Typography } from '@mui/material'
import { render, waitFor } from '@testing-library/react'
import { FramePortal } from '.'

describe('FramePortal', () => {
  it('should render children in iframe', async () => {
    const { baseElement } = render(
      <div>
        <FramePortal>
          <Typography>hello world</Typography>
        </FramePortal>
      </div>
    )
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    await waitFor(() =>
      expect(
        iframe.contentDocument?.body.getElementsByTagName('p')[0].innerHTML
      ).toEqual('hello world')
    )
    expect(
      iframe.contentDocument?.body.getElementsByTagName('p')[0]
    ).toHaveStyle('font-family: "Roboto","Helvetica","Arial",sans-serif')
  })
})
