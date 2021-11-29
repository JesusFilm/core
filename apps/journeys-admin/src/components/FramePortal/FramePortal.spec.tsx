import { render, waitFor } from '@testing-library/react'
import { FramePortal } from '.'

describe('FramePortal', () => {
  it('should render children in iframe', async () => {
    const { baseElement } = render(<FramePortal>hello world</FramePortal>)
    const iframe = baseElement.getElementsByTagName('iframe')[0]
    expect(iframe).toBeInTheDocument()
    await waitFor(() =>
      expect(iframe.contentDocument?.body.textContent).toEqual('hello world')
    )
  })
})
