import { fireEvent, render, screen } from '@testing-library/react'

import {
  CampaignFocalPointPicker,
  focalPointOf
} from './CampaignFocalPointPicker'

const rect = { left: 0, top: 0, width: 200, height: 100 } as DOMRect

function renderPicker(onChange = vi.fn()): ReturnType<typeof vi.fn> {
  render(
    <CampaignFocalPointPicker
      src="https://imagedelivery.net/accountHash/cover/public"
      alt="Cover"
      width={1600}
      height={800}
      value={{ focalLeft: 50, focalTop: 50 }}
      onChange={onChange}
    />
  )
  screen.getByTestId('FocalPointFrame').getBoundingClientRect = () => rect
  return onChange
}

describe('focalPointOf', () => {
  it('reads the pointer as whole percentages of the frame, clamped to it', () => {
    expect(focalPointOf({ clientX: 50, clientY: 75 }, rect)).toEqual({
      focalLeft: 25,
      focalTop: 75
    })
    expect(focalPointOf({ clientX: -20, clientY: 500 }, rect)).toEqual({
      focalLeft: 0,
      focalTop: 100
    })
    expect(
      focalPointOf({ clientX: 10, clientY: 10 }, { ...rect, width: 0 })
    ).toEqual({ focalLeft: 50, focalTop: 50 })
  })
})

describe('FocalPointPicker', () => {
  it('shows the picture with the dot on the stored point', () => {
    renderPicker()
    expect(screen.getByRole('img', { name: 'Cover' })).toBeInTheDocument()
    expect(screen.getByTestId('FocalPointDot')).toHaveStyle({
      top: '50%',
      left: '50%'
    })
  })

  it('moves the dot to a click and reports the point once', () => {
    const onChange = renderPicker()

    fireEvent.click(screen.getByTestId('FocalPointFrame'), {
      clientX: 50,
      clientY: 75
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ focalLeft: 25, focalTop: 75 })
    expect(screen.getByTestId('FocalPointDot')).toHaveStyle({
      top: '75%',
      left: '25%'
    })
  })

  it('follows a drag of the dot and reports the point where it is released', () => {
    const onChange = renderPicker()
    const dot = screen.getByTestId('FocalPointDot')

    fireEvent.mouseDown(dot)
    fireEvent.mouseMove(window, { clientX: 100, clientY: 20 })
    expect(onChange).not.toHaveBeenCalled()
    expect(dot).toHaveStyle({ top: '20%', left: '50%' })

    fireEvent.mouseUp(window, { clientX: 150, clientY: 25 })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ focalLeft: 75, focalTop: 25 })
  })
})
