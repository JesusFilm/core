import { render } from '@testing-library/react'
import { Video } from '.'

describe('BlockRendererVideo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Video />)

    expect(baseElement).toBeTruthy()
  })
})
