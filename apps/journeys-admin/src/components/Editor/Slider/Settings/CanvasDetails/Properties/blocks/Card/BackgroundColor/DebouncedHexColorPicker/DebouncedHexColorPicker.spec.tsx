import { fireEvent, render, waitFor } from '@testing-library/react'

import { DebouncedHexColorPicker } from './DebouncedHexColorPicker'

describe('DebouncedHexColorPicker', () => {
  it('should handle change when moving the hue', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <DebouncedHexColorPicker color="#C62828" onChange={onChange} />
    )

    const hue = container.querySelector(
      '.react-colorful__hue .react-colorful__interactive'
    )
    fireEvent.touchStart(hue as Element, { touches: [{ pageX: 0, pageY: 0 }] })

    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })

  it('should handle change when moving the saturation', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <DebouncedHexColorPicker color="#C62828" onChange={onChange} />
    )

    const saturation = container.querySelector(
      '.react-colorful__saturation .react-colorful__interactive'
    )

    fireEvent.touchStart(saturation as Element, {
      touches: [{ pageX: 0, pageY: 0 }]
    })

    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
