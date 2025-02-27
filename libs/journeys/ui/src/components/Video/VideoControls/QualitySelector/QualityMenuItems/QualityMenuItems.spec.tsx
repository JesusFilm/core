import { fireEvent, render, screen } from '@testing-library/react'
import { useTranslation } from 'next-i18next'

import { QualityMenuItems, QualityMenuItemsProps } from '.'

// Mock the useTranslation hook
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('QualityMenuItems', () => {
  const defaultProps: QualityMenuItemsProps = {
    qualities: [
      {
        height: 1080,
        bitrate: 5000000,
        label: '1080p',
        selected: false
      },
      {
        height: 720,
        bitrate: 2500000,
        label: '720p',
        selected: false
      },
      {
        height: 480,
        bitrate: 1000000,
        label: '480p',
        selected: true
      }
    ],
    currentQuality: '480p',
    autoMode: false,
    onQualityChange: jest.fn()
  }

  it('should render all quality options', () => {
    render(<QualityMenuItems {...defaultProps} />)

    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('1080p')).toBeInTheDocument()
    expect(screen.getByText('720p')).toBeInTheDocument()
    expect(screen.getByText('480p')).toBeInTheDocument()
  })

  it('should show check icon for selected quality in manual mode', () => {
    render(<QualityMenuItems {...defaultProps} />)

    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems[3]).toHaveTextContent('480p')
    expect(menuItems[3].querySelector('svg')).toBeInTheDocument() // Check icon
  })

  it('should show check icon for auto when in auto mode', () => {
    render(
      <QualityMenuItems {...defaultProps} autoMode currentQuality="480p" />
    )

    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems[0]).toHaveTextContent('Auto')
    expect(menuItems[0].querySelector('svg')).toBeInTheDocument() // Check icon
  })

  it('should call onQualityChange when a quality is selected', () => {
    const onQualityChange = jest.fn()
    render(
      <QualityMenuItems {...defaultProps} onQualityChange={onQualityChange} />
    )

    fireEvent.click(screen.getByText('1080p'))
    expect(onQualityChange).toHaveBeenCalledWith(1080)
  })

  it('should call onQualityChange with "auto" when Auto is selected', () => {
    const onQualityChange = jest.fn()
    render(
      <QualityMenuItems {...defaultProps} onQualityChange={onQualityChange} />
    )

    fireEvent.click(screen.getByText('Auto'))
    expect(onQualityChange).toHaveBeenCalledWith('auto')
  })
})
