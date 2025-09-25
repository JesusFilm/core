import { fireEvent, render, screen } from '@testing-library/react'

import { SectionCreativeShowcase } from './SectionCreativeShowcase'

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe('SectionCreativeShowcase', () => {
  it('renders the default English animated preview', () => {
    render(<SectionCreativeShowcase />)

    const styleVideo = screen.getByTestId('style-video') as HTMLVideoElement

    expect(styleVideo).toHaveAttribute(
      'src',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    )
  })

  it('updates the preview when a new style is selected', () => {
    render(<SectionCreativeShowcase />)

    fireEvent.click(screen.getByRole('button', { name: 'Cinematic' }))

    const styleVideo = screen.getByTestId('style-video') as HTMLVideoElement

    expect(styleVideo).toHaveAttribute(
      'src',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    )
  })

  it('switches to the selected language cut', async () => {
    render(<SectionCreativeShowcase />)

    const trigger = screen.getByRole('combobox', {
      name: 'Choose a language'
    })

    fireEvent.click(trigger)
    const spanishOption = await screen.findByText('Spanish')
    fireEvent.click(spanishOption)

    const styleVideo = screen.getByTestId('style-video') as HTMLVideoElement

    expect(styleVideo).toHaveAttribute(
      'src',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    )
  })
})
