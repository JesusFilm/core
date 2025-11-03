import { render, waitFor } from '@testing-library/react'

import { FontLoader } from './FontLoader'

const mockWebFontLoader = {
  load: jest.fn()
}

jest.mock('webfontloader', () => mockWebFontLoader)

describe('FontLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loads fonts using webfontloader', async () => {
    const fonts = ['Montserrat', 'Open Sans', 'El Messiri']

    render(<FontLoader fonts={fonts} />)

    await waitFor(() => {
      expect(mockWebFontLoader.load).toHaveBeenCalledWith({
        google: {
          families: [
            'El Messiri:400,500,600,700,800',
            'Montserrat:400,500,600,700,800',
            'Open Sans:400,500,600,700,800'
          ]
        }
      })
    })
  })

  it('loads only unique fonts', async () => {
    const fonts = ['Montserrat', 'Montserrat', 'Open Sans']
    render(<FontLoader fonts={fonts} />)

    await waitFor(() => {
      expect(mockWebFontLoader.load).toHaveBeenCalledWith({
        google: {
          families: [
            'Montserrat:400,500,600,700,800',
            'Open Sans:400,500,600,700,800'
          ]
        }
      })
    })
  })

  it('should not load fonts if there are no fonts', () => {
    render(<FontLoader fonts={[]} />)

    expect(mockWebFontLoader.load).not.toHaveBeenCalled()
  })
})
